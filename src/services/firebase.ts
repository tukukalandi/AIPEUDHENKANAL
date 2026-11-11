import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocFromServer,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  BlogPost,
  OfficeBearer,
  HeroSlide,
  NewsSliderItem,
  AnnouncementItem,
  ImportantDocItem,
  NoticeCircularItem,
  UnionDocumentRuling,
  OrderRulingGuideItem,
  CustomPortalApp,
} from '../types';
import { OFFICE_BEARERS as DEFAULT_OFFICE_BEARERS, IMPORTANT_DOCUMENTS as DEFAULT_UNION_DOCUMENTS_AND_RULINGS } from '../data/unionInfo';
import { sortOfficeBearers } from '../utils/officeBearerSorting';
import {
  DEFAULT_HERO_SLIDES,
  DEFAULT_NEWS_ITEMS,
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_IMPORTANT_DOCUMENTS,
  DEFAULT_NOTICE_CIRCULARS,
} from '../data/dakshikshaData';
import fallbackPosts from '../data/posts.json';
import { DEFAULT_MY_APPS } from '../data/portalMenuData';

import { getAuth, Auth } from 'firebase/auth';

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp({
  projectId: firebaseConfig.projectId,
  appId: firebaseConfig.appId,
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
});

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);

// Initialize Firestore using the designated databaseId from config if present
const dbId = (firebaseConfig as Record<string, any>).firestoreDatabaseId;
export const db = dbId ? getFirestore(app, dbId) : getFirestore(app);

// Helper to get an isolated secondary Firebase app for admin creating member auth accounts
export function getSecondaryAdminAuth(): Auth {
  const secondaryAppName = 'aipeu-member-admin-provisioner';
  const existing = getApps().find((a) => a.name === secondaryAppName);
  const secApp = existing || initializeApp({
    projectId: firebaseConfig.projectId,
    appId: firebaseConfig.appId,
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
  }, secondaryAppName);
  return getAuth(secApp);
}

// Test connection on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, using local cache.');
    }
  }
}
testFirestoreConnection();

// ================= CHUNKED CLOUD FILE STORAGE =================
// Allows PDFs, documents, and images of any size (up to 15MB) to be
// safely stored in Cloud Firestore without exceeding the 1MB document limit.
const FILE_CHUNK_SIZE = 400000; // 400KB characters per chunk (~300KB binary)
const fileUrlCache = new Map<string, string>();

export async function uploadFileToFirestore(
  dataUri: string,
  fileName = 'document.pdf'
): Promise<string> {
  if (!dataUri || !dataUri.startsWith('data:')) {
    return dataUri || '';
  }

  // If under 450,000 characters (~330KB), it safely fits inside a standard Firestore document
  if (dataUri.length < 450000) {
    return dataUri;
  }

  // Large file: chunk into uploadedFiles/{fileId}/chunks
  const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const mimeMatch = dataUri.match(/^data:([^;]+);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'application/pdf';

  const totalLength = dataUri.length;
  const chunkCount = Math.ceil(totalLength / FILE_CHUNK_SIZE);

  // Write chunks in parallel
  const chunkPromises: Promise<any>[] = [];
  for (let i = 0; i < chunkCount; i++) {
    const chunkStr = dataUri.substring(i * FILE_CHUNK_SIZE, (i + 1) * FILE_CHUNK_SIZE);
    const chunkDocRef = doc(db, 'uploadedFiles', fileId, 'chunks', `chunk_${i}`);
    chunkPromises.push(
      setDoc(chunkDocRef, {
        index: i,
        data: chunkStr,
        createdAt: serverTimestamp(),
      })
    );
  }

  // Write manifest doc
  const manifestDocRef = doc(db, 'uploadedFiles', fileId);
  const manifestPromise = setDoc(manifestDocRef, {
    fileId,
    fileName,
    mimeType,
    chunkCount,
    totalLength,
    createdAt: serverTimestamp(),
  });

  await Promise.all([manifestPromise, ...chunkPromises]);

  const fileRefUrl = `firestore-file://${fileId}?mime=${encodeURIComponent(mimeType)}&name=${encodeURIComponent(fileName)}`;
  fileUrlCache.set(fileRefUrl, dataUri);
  return fileRefUrl;
}

export async function resolveFileUrl(fileRefUrl: string): Promise<string> {
  if (!fileRefUrl) return '';
  if (!fileRefUrl.startsWith('firestore-file://')) {
    return fileRefUrl;
  }

  // Check in-memory cache first for instant 0ms access
  if (fileUrlCache.has(fileRefUrl)) {
    return fileUrlCache.get(fileRefUrl)!;
  }

  try {
    const cleanId = fileRefUrl.replace('firestore-file://', '').split('?')[0].replace(/^\/+/, '');

    // Fetch manifest doc
    const manifestSnap = await getDoc(doc(db, 'uploadedFiles', cleanId));
    if (!manifestSnap.exists()) {
      return fileRefUrl;
    }
    const manifest = manifestSnap.data();
    const chunkCount = manifest.chunkCount || 1;
    const mimeType = manifest.mimeType || 'application/pdf';

    // Fetch all chunks in parallel
    const chunkPromises: Promise<any>[] = [];
    for (let i = 0; i < chunkCount; i++) {
      chunkPromises.push(getDoc(doc(db, 'uploadedFiles', cleanId, 'chunks', `chunk_${i}`)));
    }

    const chunkSnaps = await Promise.all(chunkPromises);
    const sortedChunks: string[] = [];
    chunkSnaps.forEach((s) => {
      if (s.exists()) {
        const cData = s.data();
        sortedChunks[cData.index] = cData.data;
      }
    });

    const fullDataUri = sortedChunks.join('');
    let result = fullDataUri;
    if (!fullDataUri.startsWith('data:')) {
      result = `data:${mimeType};base64,${fullDataUri}`;
    }
    fileUrlCache.set(fileRefUrl, result);
    return result;
  } catch (err) {
    console.error('Error resolving chunked file from Firestore:', err);
    return fileRefUrl;
  }
}


/**
 * Filter out legacy seed items so user gets a 100% fresh, clean start
 * for Announcements, Important Documents, Notices, Orders/Rulings/Guide, and Directory.
 */
export function isLegacySeedId(id?: string): boolean {
  if (!id) return false;
  if (/^ann-[0-9]+$/.test(id)) return true;
  if (/^doc-[0-9]+$/.test(id)) return true;
  if (/^nc-[0-9]+$/.test(id)) return true;
  if (id.startsWith('org-seed-')) return true;
  if (id.startsWith('bearer-') || id === 'exec-seed-1' || id === 'exec-seed-2') return true;
  return false;
}

// Names of pre-seeded sample office bearers that were originally shown on the demo site
export const LEGACY_SAMPLE_BEARER_NAMES = new Set([
  'com. suryakant sahoo',
  'com. prasanta kumar mohapatra',
  'com. ramesh chandra sahoo',
  'com. bijay kumar nayak',
  'com. satyabrata mishra',
  'com. chandra sekhar singh',
  'com. niranjan barik',
  'com. subash chandra rout',
  'com. minati samal',
]);

// ================= CIRCULARS & LATEST NEWS =================

export interface NewCircularInput {
  title: string;
  category: string;
  snippet: string;
  contentHtml?: string;
  fileLinks?: string[];
  imageUrls?: string[];
  author?: string;
  urgent?: boolean;
}

export async function addCircularToFirestore(input: NewCircularInput): Promise<string> {
  let docId = `circ-local-${Date.now()}`;
  const publishedDate = new Date().toISOString();

  try {
    const colRef = collection(db, 'circulars');
    const docRef = await addDoc(colRef, {
      title: input.title,
      category: input.category,
      snippet: input.snippet,
      contentHtml: input.contentHtml || `<p>${input.snippet}</p>`,
      driveLinks: input.fileLinks || [],
      images: input.imageUrls || [],
      published: publishedDate,
      updated: publishedDate,
      author: input.author || 'Divisional Secretary, AIPEU Dhenkanal',
      urgent: !!input.urgent,
      createdAt: serverTimestamp(),
    });
    docId = docRef.id;
  } catch (err) {
    console.warn('Firestore addDoc failed, persisting locally:', err);
  }

  // Always persist locally in aipeu_admin_circulars
  try {
    const newPost: BlogPost = {
      id: docId,
      title: input.title,
      published: publishedDate,
      updated: publishedDate,
      author: input.author || 'Divisional Secretary, AIPEU Dhenkanal',
      url: '',
      categories: [input.category],
      snippet: input.snippet,
      contentHtml: input.contentHtml || `<p>${input.snippet}</p>`,
      images: input.imageUrls || [],
      driveLinks: input.fileLinks || [],
      isSavedOffline: false,
    };
    const raw = localStorage.getItem('aipeu_admin_circulars');
    const currentList: BlogPost[] = raw ? JSON.parse(raw) : [];
    currentList.unshift(newPost);
    localStorage.setItem('aipeu_admin_circulars', JSON.stringify(currentList));
  } catch (e) {
    console.warn('LocalStorage save circular error:', e);
  }

  return docId;
}

export async function updateCircularInFirestore(id: string, input: Partial<NewCircularInput>): Promise<void> {
  try {
    const docRef = doc(db, 'circulars', id);
    const updateData: Record<string, any> = {
      updated: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    };
    if (input.title !== undefined) updateData.title = input.title;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.snippet !== undefined) {
      updateData.snippet = input.snippet;
      updateData.contentHtml = input.contentHtml || `<p>${input.snippet}</p>`;
    }
    if (input.fileLinks !== undefined) updateData.driveLinks = input.fileLinks;
    if (input.imageUrls !== undefined) updateData.images = input.imageUrls;
    if (input.author !== undefined) updateData.author = input.author;
    if (input.urgent !== undefined) updateData.urgent = input.urgent;

    await updateDoc(docRef, updateData);
  } catch (err) {
    console.warn('Firestore update failed:', err);
  }

  try {
    const raw = localStorage.getItem('aipeu_admin_circulars');
    const currentList: BlogPost[] = raw ? JSON.parse(raw) : [];
    const idx = currentList.findIndex((p) => p.id === id);
    if (idx >= 0) {
      currentList[idx] = {
        ...currentList[idx],
        title: input.title !== undefined ? input.title : currentList[idx].title,
        categories: input.category ? [input.category] : currentList[idx].categories,
        snippet: input.snippet !== undefined ? input.snippet : currentList[idx].snippet,
        contentHtml: input.contentHtml || (input.snippet ? `<p>${input.snippet}</p>` : currentList[idx].contentHtml),
        driveLinks: input.fileLinks !== undefined ? input.fileLinks : currentList[idx].driveLinks,
        images: input.imageUrls !== undefined ? input.imageUrls : currentList[idx].images,
        author: input.author || currentList[idx].author,
        updated: new Date().toISOString(),
      };
      localStorage.setItem('aipeu_admin_circulars', JSON.stringify(currentList));
    }
  } catch (e) {
    console.warn('LocalStorage update circular error:', e);
  }
}

export async function getCircularsFromFirestore(): Promise<BlogPost[]> {
  const deletedIds = new Set<string>();
  try {
    const rawDel = localStorage.getItem('aipeu_deleted_post_ids');
    if (rawDel) JSON.parse(rawDel).forEach((id: string) => deletedIds.add(id));
  } catch {}

  let firestorePosts: BlogPost[] = [];
  try {
    const colRef = collection(db, 'circulars');
    const q = query(colRef, orderBy('published', 'desc'));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      firestorePosts = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || '',
          published: data.published || new Date().toISOString(),
          updated: data.updated || data.published || '',
          author: data.author || 'Divisional Secretary, AIPEU Dhenkanal',
          url: data.url || '',
          categories: data.category ? [data.category] : ['UNION NEWS'],
          snippet: data.snippet || '',
          contentHtml: data.contentHtml || '',
          images: data.images || [],
          driveLinks: data.driveLinks || [],
          isSavedOffline: false,
        };
      });
    }
  } catch (err) {
    console.warn('Firestore fetch circulars error:', err);
  }

  // Also read local custom circulars saved by admin
  let localCustomPosts: BlogPost[] = [];
  try {
    const raw = localStorage.getItem('aipeu_admin_circulars');
    if (raw) localCustomPosts = JSON.parse(raw);
  } catch {}

  // Merge map: priority to localCustom, then firestore, then fallbackPosts
  const map = new Map<string, BlogPost>();
  (fallbackPosts as BlogPost[]).forEach((p) => {
    if (!deletedIds.has(p.id)) map.set(p.id, p);
  });
  firestorePosts.forEach((p) => {
    if (!deletedIds.has(p.id)) map.set(p.id, p);
  });
  localCustomPosts.forEach((p) => {
    if (!deletedIds.has(p.id)) map.set(p.id, p);
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.published || '').getTime() - new Date(a.published || '').getTime()
  );
}

export async function deleteCircularFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'circulars', id));
  } catch (err) {
    console.warn(`Could not delete document ${id} directly from circulars collection:`, err);
  }
  try {
    const raw = localStorage.getItem('aipeu_admin_circulars');
    if (raw) {
      const currentList: BlogPost[] = JSON.parse(raw);
      const filtered = currentList.filter((p) => p.id !== id);
      localStorage.setItem('aipeu_admin_circulars', JSON.stringify(filtered));
    }
    const rawDel = localStorage.getItem('aipeu_deleted_post_ids');
    const deletedList: string[] = rawDel ? JSON.parse(rawDel) : [];
    if (!deletedList.includes(id)) {
      deletedList.push(id);
      localStorage.setItem('aipeu_deleted_post_ids', JSON.stringify(deletedList));
    }
  } catch (e) {
    console.warn('LocalStorage delete circular error:', e);
  }
}

// ================= EXECUTIVE MEMBERS =================

export async function getExecutiveMembersFromFirestore(): Promise<OfficeBearer[]> {
  let firestoreList: (OfficeBearer & { id: string })[] = [];
  try {
    const colRef = collection(db, 'executiveMembers');
    const snapshot = await getDocs(colRef);

    if (!snapshot.empty) {
      firestoreList = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name || '',
          designation: data.designation || '',
          branch: data.branch || '',
          phone: data.phone || '',
          location: data.location || '',
          roleType: data.roleType || 'executive',
          photoUrl: data.photoUrl || '',
        } as OfficeBearer & { id: string };
      });
    }
  } catch (err) {
    console.warn('Firestore fetch executive members error:', err);
  }

  let localList: (OfficeBearer & { id: string })[] = [];
  try {
    const raw = localStorage.getItem('aipeu_office_bearers');
    if (raw) localList = JSON.parse(raw);
  } catch {}

  const deletedIds = new Set<string>();
  try {
    const rawDel = localStorage.getItem('aipeu_deleted_bearer_ids');
    if (rawDel) JSON.parse(rawDel).forEach((id: string) => deletedIds.add(id));
  } catch {}

  const map = new Map<string, OfficeBearer>();

  const isLegacyItem = (item: OfficeBearer & { id?: string }) => {
    if (item.id && (isLegacySeedId(item.id) || deletedIds.has(item.id))) return true;
    const normName = (item.name || '').trim().toLowerCase();
    if (LEGACY_SAMPLE_BEARER_NAMES.has(normName)) return true;
    return false;
  };

  DEFAULT_OFFICE_BEARERS.forEach((m, idx) => {
    const mid = m.id || `bearer-${idx}`;
    if (!isLegacyItem({ ...m, id: mid })) map.set(mid, { ...m, id: mid });
  });
  firestoreList.forEach((m) => {
    if (!isLegacyItem(m)) map.set(m.id, m);
  });
  localList.forEach((m) => {
    if (!isLegacyItem(m)) map.set(m.id, m);
  });

  const sorted = sortOfficeBearers(Array.from(map.values()));
  try {
    localStorage.setItem('aipeu_office_bearers', JSON.stringify(sorted));
  } catch {}

  return sorted;
}

export async function clearAllExecutiveMembersFromFirestore(): Promise<void> {
  try {
    const colRef = collection(db, 'executiveMembers');
    const snapshot = await getDocs(colRef);
    await Promise.all(snapshot.docs.map((d) => deleteDoc(doc(db, 'executiveMembers', d.id))));
  } catch (err) {
    console.warn('Error clearing executive members from Firestore:', err);
  }
  try {
    localStorage.setItem('aipeu_office_bearers', '[]');
  } catch {}
}

export async function saveExecutiveMemberToFirestore(
  member: OfficeBearer & { id?: string }
): Promise<string> {
  let savedId = member.id;
  const payload = {
    name: member.name || '',
    designation: member.designation || '',
    branch: member.branch || '',
    phone: member.phone || '',
    location: member.location || '',
    roleType: member.roleType || 'executive',
    photoUrl: member.photoUrl || '',
    updatedAt: serverTimestamp(),
  };

  try {
    const colRef = collection(db, 'executiveMembers');
    if (member.id && !member.id.startsWith('temp-') && !member.id.startsWith('exec-local-')) {
      const memberDoc = doc(db, 'executiveMembers', member.id);
      await updateDoc(memberDoc, payload);
      savedId = member.id;
    } else {
      const docRef = await addDoc(colRef, {
        ...payload,
        createdAt: serverTimestamp(),
      });
      savedId = docRef.id;
    }
  } catch (err) {
    console.warn('Firestore save executive member failed, persisting locally:', err);
    if (!savedId) savedId = `exec-local-${Date.now()}`;
  }

  const finalId = savedId || `exec-local-${Date.now()}`;

  try {
    const raw = localStorage.getItem('aipeu_office_bearers');
    const list: (OfficeBearer & { id: string })[] = raw ? JSON.parse(raw) : [...DEFAULT_OFFICE_BEARERS];
    const existingIdx = list.findIndex((m) => m.id === finalId);
    const newMember: OfficeBearer & { id: string } = {
      id: finalId,
      name: payload.name,
      designation: payload.designation,
      branch: payload.branch,
      phone: payload.phone,
      location: payload.location,
      roleType: payload.roleType as any,
      photoUrl: payload.photoUrl,
    };
    if (existingIdx >= 0) {
      list[existingIdx] = newMember;
    } else {
      list.push(newMember);
    }
    localStorage.setItem('aipeu_office_bearers', JSON.stringify(sortOfficeBearers(list)));
  } catch (e) {
    console.warn('LocalStorage save executive member error:', e);
  }

  return finalId;
}

export async function deleteExecutiveMemberFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'executiveMembers', id));
  } catch (err) {
    console.warn('Error deleting executive member from Firestore:', err);
  }
  try {
    const raw = localStorage.getItem('aipeu_office_bearers');
    if (raw) {
      const list: (OfficeBearer & { id: string })[] = JSON.parse(raw);
      localStorage.setItem('aipeu_office_bearers', JSON.stringify(list.filter((m) => m.id !== id)));
    }
    const rawDel = localStorage.getItem('aipeu_deleted_bearer_ids');
    const delList: string[] = rawDel ? JSON.parse(rawDel) : [];
    if (!delList.includes(id)) {
      delList.push(id);
      localStorage.setItem('aipeu_deleted_bearer_ids', JSON.stringify(delList));
    }
  } catch (e) {
    console.warn('LocalStorage delete executive member error:', e);
  }
}

// ================= HERO SLIDER (DAKSHIKSHA) =================

export async function getHeroSlidesFromFirestore(): Promise<HeroSlide[]> {
  const deletedIds = new Set<string>();
  try {
    const rawDel = localStorage.getItem('aipeu_deleted_slide_ids');
    if (rawDel) JSON.parse(rawDel).forEach((id: string) => deletedIds.add(id));
  } catch {}

  let firestoreSlides: HeroSlide[] = [];
  try {
    const colRef = collection(db, 'heroSlides');
    const snapshot = await getDocs(colRef);

    if (!snapshot.empty) {
      firestoreSlides = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || '',
          subtitle: data.subtitle || '',
          tag: data.tag || 'DAKSHIKSHA',
          imageUrl: data.imageUrl || '',
          ctaText: data.ctaText || 'Learn More',
          ctaLink: data.ctaLink || '#',
          gradient: data.gradient || 'from-[#0A2540] via-[#1E3A8A] to-[#B91C1C]',
          order: data.order ?? 0,
          active: data.active !== false,
          targetPage: data.targetPage || 'home',
        };
      });
    }
  } catch (err) {
    console.warn('Firestore fetch hero slides error:', err);
  }

  let localSlides: HeroSlide[] = [];
  try {
    const raw = localStorage.getItem('aipeu_hero_slides');
    if (raw) localSlides = JSON.parse(raw);
  } catch {}

  const map = new Map<string, HeroSlide>();
  DEFAULT_HERO_SLIDES.forEach((s) => {
    if (!deletedIds.has(s.id)) map.set(s.id, s);
  });
  firestoreSlides.forEach((s) => {
    if (!deletedIds.has(s.id)) map.set(s.id, s);
  });
  localSlides.forEach((s) => {
    if (!deletedIds.has(s.id)) map.set(s.id, s);
  });

  const result = Array.from(map.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
  try {
    localStorage.setItem('aipeu_hero_slides', JSON.stringify(result));
  } catch {}

  return result;
}

export async function saveHeroSlideToFirestore(
  slide: Partial<HeroSlide> & { id?: string }
): Promise<string> {
  let savedId = slide.id;
  const slideData = {
    title: slide.title || '',
    subtitle: slide.subtitle || '',
    tag: slide.tag || 'DAKSHIKSHA',
    imageUrl: slide.imageUrl || '',
    ctaText: slide.ctaText || 'Learn More',
    ctaLink: slide.ctaLink || '#',
    gradient: slide.gradient || 'from-[#0A2540] via-[#1E3A8A] to-[#B91C1C]',
    order: slide.order ?? 0,
    active: slide.active !== false,
    targetPage: slide.targetPage || 'home',
    updatedAt: serverTimestamp(),
  };

  try {
    const colRef = collection(db, 'heroSlides');
    if (slide.id && !slide.id.startsWith('slide-') && !slide.id.startsWith('temp-') && !slide.id.startsWith('feed-slide-') && !slide.id.startsWith('slide-local-')) {
      const slideDoc = doc(db, 'heroSlides', slide.id);
      await updateDoc(slideDoc, slideData);
      savedId = slide.id;
    } else {
      const docRef = await addDoc(colRef, {
        ...slideData,
        createdAt: serverTimestamp(),
      });
      savedId = docRef.id;
    }
  } catch (err) {
    console.warn('Firestore save hero slide failed, persisting locally:', err);
    if (!savedId) savedId = `slide-local-${Date.now()}`;
  }

  const finalId = savedId || `slide-local-${Date.now()}`;

  try {
    const raw = localStorage.getItem('aipeu_hero_slides');
    const list: HeroSlide[] = raw ? JSON.parse(raw) : [...DEFAULT_HERO_SLIDES];
    const existingIdx = list.findIndex((s) => s.id === finalId);
    const newSlide: HeroSlide = {
      id: finalId,
      title: slideData.title,
      subtitle: slideData.subtitle,
      tag: slideData.tag,
      imageUrl: slideData.imageUrl,
      ctaText: slideData.ctaText,
      ctaLink: slideData.ctaLink,
      gradient: slideData.gradient,
      order: slideData.order,
      active: slideData.active,
      targetPage: slideData.targetPage,
    };
    if (existingIdx >= 0) {
      list[existingIdx] = newSlide;
    } else {
      list.push(newSlide);
    }
    localStorage.setItem('aipeu_hero_slides', JSON.stringify(list));

    const rawDel = localStorage.getItem('aipeu_deleted_slide_ids');
    if (rawDel) {
      const delList: string[] = JSON.parse(rawDel);
      localStorage.setItem('aipeu_deleted_slide_ids', JSON.stringify(delList.filter((x) => x !== finalId)));
    }
  } catch (e) {
    console.warn('LocalStorage save hero slide error:', e);
  }

  return finalId;
}

export async function deleteHeroSlideFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'heroSlides', id));
  } catch (err) {
    console.warn('Error deleting hero slide from Firestore:', err);
  }
  try {
    const raw = localStorage.getItem('aipeu_hero_slides');
    if (raw) {
      const list: HeroSlide[] = JSON.parse(raw);
      localStorage.setItem('aipeu_hero_slides', JSON.stringify(list.filter((s) => s.id !== id)));
    }
    const rawDel = localStorage.getItem('aipeu_deleted_slide_ids');
    const delList: string[] = rawDel ? JSON.parse(rawDel) : [];
    if (!delList.includes(id)) {
      delList.push(id);
      localStorage.setItem('aipeu_deleted_slide_ids', JSON.stringify(delList));
    }
  } catch (e) {
    console.warn('LocalStorage delete hero slide error:', e);
  }
}

// ================= MOVING NEWS SLIDER & TICKER =================

export async function getNewsItemsFromFirestore(): Promise<NewsSliderItem[]> {
  const deletedIds = new Set<string>();
  try {
    const rawDel = localStorage.getItem('aipeu_deleted_news_ids');
    if (rawDel) JSON.parse(rawDel).forEach((id: string) => deletedIds.add(id));
  } catch {}

  let firestoreItems: NewsSliderItem[] = [];
  try {
    const colRef = collection(db, 'newsSliderItems');
    const snapshot = await getDocs(colRef);

    if (!snapshot.empty) {
      firestoreItems = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || '',
          category: data.category || 'LATEST NEWS',
          link: data.link || '',
          isUrgent: !!data.isUrgent,
          published: data.published || '',
          order: data.order ?? 0,
        };
      });
    }
  } catch (err) {
    console.warn('Firestore fetch news items error:', err);
  }

  let localItems: NewsSliderItem[] = [];
  try {
    const raw = localStorage.getItem('aipeu_news_items');
    if (raw) localItems = JSON.parse(raw);
  } catch {}

  const map = new Map<string, NewsSliderItem>();
  DEFAULT_NEWS_ITEMS.forEach((item) => {
    if (!deletedIds.has(item.id)) map.set(item.id, item);
  });
  firestoreItems.forEach((item) => {
    if (!deletedIds.has(item.id)) map.set(item.id, item);
  });
  localItems.forEach((item) => {
    if (!deletedIds.has(item.id)) map.set(item.id, item);
  });

  const result = Array.from(map.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
  try {
    localStorage.setItem('aipeu_news_items', JSON.stringify(result));
  } catch {}

  return result;
}

export async function saveNewsItemToFirestore(
  item: Partial<NewsSliderItem> & { id?: string }
): Promise<string> {
  let savedId = item.id;
  const itemData = {
    title: item.title || '',
    category: item.category || 'LATEST NEWS',
    link: item.link || '',
    isUrgent: !!item.isUrgent,
    published: item.published || new Date().toISOString(),
    order: item.order ?? 0,
    updatedAt: serverTimestamp(),
  };

  try {
    const colRef = collection(db, 'newsSliderItems');
    if (item.id && !item.id.startsWith('news-') && !item.id.startsWith('temp-') && !item.id.startsWith('news-local-')) {
      const itemDoc = doc(db, 'newsSliderItems', item.id);
      await updateDoc(itemDoc, itemData);
      savedId = item.id;
    } else {
      const docRef = await addDoc(colRef, {
        ...itemData,
        createdAt: serverTimestamp(),
      });
      savedId = docRef.id;
    }
  } catch (err) {
    console.warn('Firestore save news item failed, persisting locally:', err);
    if (!savedId) savedId = `news-local-${Date.now()}`;
  }

  const finalId = savedId || `news-local-${Date.now()}`;

  try {
    const raw = localStorage.getItem('aipeu_news_items');
    const list: NewsSliderItem[] = raw ? JSON.parse(raw) : [...DEFAULT_NEWS_ITEMS];
    const existingIdx = list.findIndex((n) => n.id === finalId);
    const newItem: NewsSliderItem = {
      id: finalId,
      title: itemData.title,
      category: itemData.category,
      link: itemData.link,
      isUrgent: itemData.isUrgent,
      published: itemData.published,
      order: itemData.order,
    };
    if (existingIdx >= 0) {
      list[existingIdx] = newItem;
    } else {
      list.push(newItem);
    }
    localStorage.setItem('aipeu_news_items', JSON.stringify(list));

    const rawDel = localStorage.getItem('aipeu_deleted_news_ids');
    if (rawDel) {
      const delList: string[] = JSON.parse(rawDel);
      localStorage.setItem('aipeu_deleted_news_ids', JSON.stringify(delList.filter((x) => x !== finalId)));
    }
  } catch (e) {
    console.warn('LocalStorage save news item error:', e);
  }

  return finalId;
}

export async function deleteNewsItemFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'newsSliderItems', id));
  } catch (err) {
    console.warn('Error deleting news item from Firestore:', err);
  }
  try {
    const raw = localStorage.getItem('aipeu_news_items');
    if (raw) {
      const list: NewsSliderItem[] = JSON.parse(raw);
      localStorage.setItem('aipeu_news_items', JSON.stringify(list.filter((n) => n.id !== id)));
    }
    const rawDel = localStorage.getItem('aipeu_deleted_news_ids');
    const delList: string[] = rawDel ? JSON.parse(rawDel) : [];
    if (!delList.includes(id)) {
      delList.push(id);
      localStorage.setItem('aipeu_deleted_news_ids', JSON.stringify(delList));
    }
  } catch (e) {
    console.warn('LocalStorage delete news item error:', e);
  }
}

// ================= ANNOUNCEMENTS =================

export async function getAnnouncementsFromFirestore(): Promise<AnnouncementItem[]> {
  const deletedIds = new Set<string>();
  try {
    const rawDel = localStorage.getItem('aipeu_deleted_announcement_ids');
    if (rawDel) JSON.parse(rawDel).forEach((id: string) => deletedIds.add(id));
  } catch {}

  let firestoreItems: AnnouncementItem[] = [];
  try {
    const colRef = collection(db, 'announcements');
    const snapshot = await getDocs(colRef);

    if (!snapshot.empty) {
      firestoreItems = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || '',
          link: data.link || '',
          published: data.published || '',
          order: data.order ?? 0,
          active: data.active !== false,
        };
      });
    }
  } catch (err) {
    console.warn('Firestore fetch announcements failed, using local/defaults:', err);
  }

  // Load from local storage
  let localItems: AnnouncementItem[] = [];
  try {
    const raw = localStorage.getItem('aipeu_announcements');
    if (raw) localItems = JSON.parse(raw);
  } catch {}

  // Merge map: firestore -> local (excluding any old legacy demo seed items)
  const map = new Map<string, AnnouncementItem>();
  DEFAULT_ANNOUNCEMENTS.forEach((a) => {
    if (!deletedIds.has(a.id) && !isLegacySeedId(a.id)) map.set(a.id, a);
  });
  firestoreItems.forEach((a) => {
    if (!deletedIds.has(a.id) && !isLegacySeedId(a.id)) map.set(a.id, a);
  });
  localItems.forEach((a) => {
    if (!deletedIds.has(a.id) && !isLegacySeedId(a.id)) map.set(a.id, a);
  });

  const result = Array.from(map.values()).sort((a, b) => (a.order || 0) - (b.order || 0));

  // Sync back to local storage
  try {
    localStorage.setItem('aipeu_announcements', JSON.stringify(result));
  } catch {}

  return result;
}

export async function saveAnnouncementToFirestore(
  ann: Partial<AnnouncementItem> & { id?: string }
): Promise<string> {
  let savedId = ann.id;
  let resolvedLink = ann.link || '';
  if (resolvedLink.startsWith('data:')) {
    try {
      resolvedLink = await uploadFileToFirestore(resolvedLink, ann.title || 'announcement.pdf');
    } catch (e) {
      console.warn('Chunk upload failed for announcement file, fallback to raw link:', e);
    }
  }

  const annData = {
    title: ann.title || '',
    link: resolvedLink,
    published: ann.published || new Date().toISOString(),
    order: ann.order ?? 0,
    active: ann.active !== false,
    updatedAt: serverTimestamp(),
  };

  try {
    const colRef = collection(db, 'announcements');
    if (ann.id && !ann.id.startsWith('ann-') && !ann.id.startsWith('temp-') && !ann.id.startsWith('ann-local-')) {
      const annDoc = doc(db, 'announcements', ann.id);
      await setDoc(annDoc, annData, { merge: true });
      savedId = ann.id;
    } else {
      const docRef = await addDoc(colRef, {
        ...annData,
        createdAt: serverTimestamp(),
      });
      savedId = docRef.id;
    }
  } catch (err) {
    console.warn('Firestore save announcement failed, persisting locally:', err);
    if (!savedId) savedId = `ann-local-${Date.now()}`;
  }

  const finalId = savedId || `ann-local-${Date.now()}`;

  // Always update local cache
  try {
    const raw = localStorage.getItem('aipeu_announcements');
    const list: AnnouncementItem[] = raw ? JSON.parse(raw) : [...DEFAULT_ANNOUNCEMENTS];
    const existingIdx = list.findIndex((a) => a.id === finalId);
    const newItem: AnnouncementItem = {
      id: finalId,
      title: annData.title,
      link: annData.link,
      published: annData.published,
      order: annData.order,
      active: annData.active,
    };
    if (existingIdx >= 0) {
      list[existingIdx] = newItem;
    } else {
      list.push(newItem);
    }
    localStorage.setItem('aipeu_announcements', JSON.stringify(list));

    // Remove from deleted list if re-added
    const rawDel = localStorage.getItem('aipeu_deleted_announcement_ids');
    if (rawDel) {
      const delList: string[] = JSON.parse(rawDel);
      localStorage.setItem('aipeu_deleted_announcement_ids', JSON.stringify(delList.filter((x) => x !== finalId)));
    }
  } catch (e) {
    console.warn('LocalStorage save announcement error:', e);
  }

  return finalId;
}

export async function deleteAnnouncementFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'announcements', id));
  } catch (err) {
    console.warn('Error deleting announcement from Firestore:', err);
  }
  try {
    const raw = localStorage.getItem('aipeu_announcements');
    if (raw) {
      const list: AnnouncementItem[] = JSON.parse(raw);
      localStorage.setItem('aipeu_announcements', JSON.stringify(list.filter((a) => a.id !== id)));
    }
    const rawDel = localStorage.getItem('aipeu_deleted_announcement_ids');
    const delList: string[] = rawDel ? JSON.parse(rawDel) : [];
    if (!delList.includes(id)) {
      delList.push(id);
      localStorage.setItem('aipeu_deleted_announcement_ids', JSON.stringify(delList));
    }
  } catch (e) {
    console.warn('LocalStorage delete announcement error:', e);
  }
}

// ================= IMPORTANT DOCUMENTS =================

export async function getImportantDocumentsFromFirestore(): Promise<ImportantDocItem[]> {
  const deletedIds = new Set<string>();
  try {
    const rawDel = localStorage.getItem('aipeu_deleted_doc_ids');
    if (rawDel) JSON.parse(rawDel).forEach((id: string) => deletedIds.add(id));
  } catch {}

  let firestoreItems: ImportantDocItem[] = [];
  try {
    const colRef = collection(db, 'importantDocuments');
    const snapshot = await getDocs(colRef);

    if (!snapshot.empty) {
      firestoreItems = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || '',
          url: data.url || '',
          category: data.category || 'General',
          order: data.order ?? 0,
          published: data.published || '',
        };
      });
    }
  } catch (err) {
    console.warn('Firestore fetch important documents failed, using local/defaults:', err);
  }

  // Load from local storage
  let localItems: ImportantDocItem[] = [];
  try {
    const raw = localStorage.getItem('aipeu_important_documents');
    if (raw) localItems = JSON.parse(raw);
  } catch {}

  // Merge map: firestore -> local (excluding any legacy demo items)
  const map = new Map<string, ImportantDocItem>();
  DEFAULT_IMPORTANT_DOCUMENTS.forEach((d) => {
    if (!deletedIds.has(d.id) && !isLegacySeedId(d.id)) map.set(d.id, d);
  });
  firestoreItems.forEach((d) => {
    if (!deletedIds.has(d.id) && !isLegacySeedId(d.id)) map.set(d.id, d);
  });
  localItems.forEach((d) => {
    if (!deletedIds.has(d.id) && !isLegacySeedId(d.id)) map.set(d.id, d);
  });

  const result = Array.from(map.values()).sort((a, b) => (a.order || 0) - (b.order || 0));

  // Sync back to local storage
  try {
    localStorage.setItem('aipeu_important_documents', JSON.stringify(result));
  } catch {}

  return result;
}

export async function saveImportantDocumentToFirestore(
  docItem: Partial<ImportantDocItem> & { id?: string }
): Promise<string> {
  let savedId = docItem.id;
  let resolvedUrl = docItem.url || '';
  if (resolvedUrl.startsWith('data:')) {
    try {
      resolvedUrl = await uploadFileToFirestore(resolvedUrl, docItem.title || 'document.pdf');
    } catch (e) {
      console.warn('Chunk upload failed for important document file, fallback to raw url:', e);
    }
  }

  const docData = {
    title: docItem.title || '',
    url: resolvedUrl,
    category: docItem.category || 'General',
    order: docItem.order ?? 0,
    published: docItem.published || new Date().toISOString(),
    updatedAt: serverTimestamp(),
  };

  try {
    const colRef = collection(db, 'importantDocuments');
    if (docItem.id && !docItem.id.startsWith('doc-') && !docItem.id.startsWith('temp-') && !docItem.id.startsWith('doc-local-')) {
      const docRef = doc(db, 'importantDocuments', docItem.id);
      await setDoc(docRef, docData, { merge: true });
      savedId = docItem.id;
    } else {
      const docRef = await addDoc(colRef, {
        ...docData,
        createdAt: serverTimestamp(),
      });
      savedId = docRef.id;
    }
  } catch (err) {
    console.warn('Firestore save important document failed, persisting locally:', err);
    if (!savedId) savedId = `doc-local-${Date.now()}`;
  }

  const finalId = savedId || `doc-local-${Date.now()}`;

  // Always update local cache
  try {
    const raw = localStorage.getItem('aipeu_important_documents');
    const list: ImportantDocItem[] = raw ? JSON.parse(raw) : [...DEFAULT_IMPORTANT_DOCUMENTS];
    const existingIdx = list.findIndex((d) => d.id === finalId);
    const newItem: ImportantDocItem = {
      id: finalId,
      title: docData.title,
      url: docData.url,
      category: docData.category,
      order: docData.order,
      published: docData.published,
    };
    if (existingIdx >= 0) {
      list[existingIdx] = newItem;
    } else {
      list.push(newItem);
    }
    localStorage.setItem('aipeu_important_documents', JSON.stringify(list));

    const rawDel = localStorage.getItem('aipeu_deleted_doc_ids');
    if (rawDel) {
      const delList: string[] = JSON.parse(rawDel);
      localStorage.setItem('aipeu_deleted_doc_ids', JSON.stringify(delList.filter((x) => x !== finalId)));
    }
  } catch (e) {
    console.warn('LocalStorage save important document error:', e);
  }

  return finalId;
}

export async function deleteImportantDocumentFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'importantDocuments', id));
  } catch (err) {
    console.warn('Error deleting important document from Firestore:', err);
  }
  try {
    const raw = localStorage.getItem('aipeu_important_documents');
    if (raw) {
      const list: ImportantDocItem[] = JSON.parse(raw);
      localStorage.setItem('aipeu_important_documents', JSON.stringify(list.filter((d) => d.id !== id)));
    }
    const rawDel = localStorage.getItem('aipeu_deleted_doc_ids');
    const delList: string[] = rawDel ? JSON.parse(rawDel) : [];
    if (!delList.includes(id)) {
      delList.push(id);
      localStorage.setItem('aipeu_deleted_doc_ids', JSON.stringify(delList));
    }
  } catch (e) {
    console.warn('LocalStorage delete important doc error:', e);
  }
}

// ================= NOTICE / CIRCULARS =================

export async function getNoticeCircularsFromFirestore(): Promise<NoticeCircularItem[]> {
  const deletedIds = new Set<string>();
  try {
    const rawDel = localStorage.getItem('aipeu_deleted_notice_ids');
    if (rawDel) JSON.parse(rawDel).forEach((id: string) => deletedIds.add(id));
  } catch {}

  let firestoreItems: NoticeCircularItem[] = [];
  try {
    const colRef = collection(db, 'noticeCirculars');
    const snapshot = await getDocs(colRef);

    if (!snapshot.empty) {
      firestoreItems = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || '',
          category: data.category || 'NOTICE',
          published: data.published || '',
          url: data.url || '',
          order: data.order ?? 0,
        };
      });
    }
  } catch (err) {
    console.warn('Firestore fetch notice circulars failed, using local/defaults:', err);
  }

  // Load from local storage
  let localItems: NoticeCircularItem[] = [];
  try {
    const raw = localStorage.getItem('aipeu_notice_circulars');
    if (raw) localItems = JSON.parse(raw);
  } catch {}

  // Merge map: firestore -> local (excluding any legacy demo items)
  const map = new Map<string, NoticeCircularItem>();
  DEFAULT_NOTICE_CIRCULARS.forEach((nc) => {
    if (!deletedIds.has(nc.id) && !isLegacySeedId(nc.id)) map.set(nc.id, nc);
  });
  firestoreItems.forEach((nc) => {
    if (!deletedIds.has(nc.id) && !isLegacySeedId(nc.id)) map.set(nc.id, nc);
  });
  localItems.forEach((nc) => {
    if (!deletedIds.has(nc.id) && !isLegacySeedId(nc.id)) map.set(nc.id, nc);
  });

  const result = Array.from(map.values()).sort((a, b) => (a.order || 0) - (b.order || 0));

  // Sync back to local storage
  try {
    localStorage.setItem('aipeu_notice_circulars', JSON.stringify(result));
  } catch {}

  return result;
}

export async function saveNoticeCircularToFirestore(
  nc: Partial<NoticeCircularItem> & { id?: string }
): Promise<string> {
  let savedId = nc.id;
  let resolvedUrl = nc.url || '';
  if (resolvedUrl.startsWith('data:')) {
    try {
      resolvedUrl = await uploadFileToFirestore(resolvedUrl, nc.title || 'notice.pdf');
    } catch (e) {
      console.warn('Chunk upload failed for notice circular file, fallback to raw url:', e);
    }
  }

  const ncData = {
    title: nc.title || '',
    category: nc.category || 'NOTICE',
    published: nc.published || new Date().toISOString().split('T')[0],
    url: resolvedUrl,
    order: nc.order ?? 0,
    updatedAt: serverTimestamp(),
  };

  try {
    const colRef = collection(db, 'noticeCirculars');
    if (nc.id && !nc.id.startsWith('nc-') && !nc.id.startsWith('temp-') && !nc.id.startsWith('nc-local-')) {
      const ncDoc = doc(db, 'noticeCirculars', nc.id);
      await setDoc(ncDoc, ncData, { merge: true });
      savedId = nc.id;
    } else {
      const docRef = await addDoc(colRef, {
        ...ncData,
        createdAt: serverTimestamp(),
      });
      savedId = docRef.id;
    }
  } catch (err) {
    console.warn('Firestore save notice circular failed, persisting locally:', err);
    if (!savedId) savedId = `nc-local-${Date.now()}`;
  }

  const finalId = savedId || `nc-local-${Date.now()}`;

  // Always update local cache
  try {
    const raw = localStorage.getItem('aipeu_notice_circulars');
    const list: NoticeCircularItem[] = raw ? JSON.parse(raw) : [...DEFAULT_NOTICE_CIRCULARS];
    const existingIdx = list.findIndex((n) => n.id === finalId);
    const newItem: NoticeCircularItem = {
      id: finalId,
      title: ncData.title,
      category: ncData.category,
      published: ncData.published,
      url: ncData.url,
      order: ncData.order,
    };
    if (existingIdx >= 0) {
      list[existingIdx] = newItem;
    } else {
      list.push(newItem);
    }
    localStorage.setItem('aipeu_notice_circulars', JSON.stringify(list));

    const rawDel = localStorage.getItem('aipeu_deleted_notice_ids');
    if (rawDel) {
      const delList: string[] = JSON.parse(rawDel);
      localStorage.setItem('aipeu_deleted_notice_ids', JSON.stringify(delList.filter((x) => x !== finalId)));
    }
  } catch (e) {
    console.warn('LocalStorage save notice circular error:', e);
  }

  return finalId;
}

export async function deleteNoticeCircularFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'noticeCirculars', id));
  } catch (err) {
    console.warn('Error deleting notice circular from Firestore:', err);
  }
  try {
    const raw = localStorage.getItem('aipeu_notice_circulars');
    if (raw) {
      const list: NoticeCircularItem[] = JSON.parse(raw);
      localStorage.setItem('aipeu_notice_circulars', JSON.stringify(list.filter((n) => n.id !== id)));
    }
    const rawDel = localStorage.getItem('aipeu_deleted_notice_ids');
    const delList: string[] = rawDel ? JSON.parse(rawDel) : [];
    if (!delList.includes(id)) {
      delList.push(id);
      localStorage.setItem('aipeu_deleted_notice_ids', JSON.stringify(delList));
    }
  } catch (e) {
    console.warn('LocalStorage delete notice circular error:', e);
  }
}

// ================= UNION DOCUMENTS & RULINGS (EXECUTIVE BODY) =================

export async function getUnionDocumentsAndRulingsFromFirestore(): Promise<UnionDocumentRuling[]> {
  const deletedIds = new Set<string>();
  try {
    const rawDel = localStorage.getItem('aipeu_deleted_ruling_ids');
    if (rawDel) JSON.parse(rawDel).forEach((id: string) => deletedIds.add(id));
  } catch {}

  let firestoreItems: UnionDocumentRuling[] = [];
  try {
    const colRef = collection(db, 'unionDocumentsAndRulings');
    const snapshot = await getDocs(colRef);

    if (!snapshot.empty) {
      firestoreItems = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || '',
          desc: data.desc || '',
          link: data.link || '',
          type: data.type || 'Legal',
          order: data.order ?? 0,
          published: data.published || '',
        };
      });
    }
  } catch (err) {
    console.warn('Firestore fetch union documents error:', err);
  }

  let localItems: UnionDocumentRuling[] = [];
  try {
    const raw = localStorage.getItem('aipeu_union_documents_rulings');
    if (raw) localItems = JSON.parse(raw);
  } catch {}

  const map = new Map<string, UnionDocumentRuling>();
  DEFAULT_UNION_DOCUMENTS_AND_RULINGS.forEach((item) => {
    if (!deletedIds.has(item.id)) map.set(item.id, item);
  });
  firestoreItems.forEach((item) => {
    if (!deletedIds.has(item.id)) map.set(item.id, item);
  });
  localItems.forEach((item) => {
    if (!deletedIds.has(item.id)) map.set(item.id, item);
  });

  const result = Array.from(map.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
  try {
    localStorage.setItem('aipeu_union_documents_rulings', JSON.stringify(result));
  } catch {}

  return result;
}

export async function saveUnionDocumentRulingToFirestore(
  item: Partial<UnionDocumentRuling> & { id?: string }
): Promise<string> {
  let savedId = item.id;
  const docData = {
    title: item.title || '',
    desc: item.desc || '',
    link: item.link || '',
    type: item.type || 'Legal',
    order: item.order ?? 0,
    published: item.published || new Date().toISOString().split('T')[0],
    updatedAt: serverTimestamp(),
  };

  try {
    const colRef = collection(db, 'unionDocumentsAndRulings');
    if (item.id && !item.id.startsWith('doc-ruling-') && !item.id.startsWith('temp-') && !item.id.startsWith('ruling-local-')) {
      const docItem = doc(db, 'unionDocumentsAndRulings', item.id);
      await updateDoc(docItem, docData);
      savedId = item.id;
    } else {
      const docRef = await addDoc(colRef, {
        ...docData,
        createdAt: serverTimestamp(),
      });
      savedId = docRef.id;
    }
  } catch (err) {
    console.warn('Firestore save union document failed, persisting locally:', err);
    if (!savedId) savedId = `ruling-local-${Date.now()}`;
  }

  const finalId = savedId || `ruling-local-${Date.now()}`;

  try {
    const raw = localStorage.getItem('aipeu_union_documents_rulings');
    const list: UnionDocumentRuling[] = raw ? JSON.parse(raw) : [...DEFAULT_UNION_DOCUMENTS_AND_RULINGS];
    const existingIdx = list.findIndex((r) => r.id === finalId);
    const newItem: UnionDocumentRuling = {
      id: finalId,
      title: docData.title,
      desc: docData.desc,
      link: docData.link,
      type: docData.type,
      order: docData.order,
      published: docData.published,
    };
    if (existingIdx >= 0) {
      list[existingIdx] = newItem;
    } else {
      list.push(newItem);
    }
    localStorage.setItem('aipeu_union_documents_rulings', JSON.stringify(list));

    const rawDel = localStorage.getItem('aipeu_deleted_ruling_ids');
    if (rawDel) {
      const delList: string[] = JSON.parse(rawDel);
      localStorage.setItem('aipeu_deleted_ruling_ids', JSON.stringify(delList.filter((x) => x !== finalId)));
    }
  } catch (e) {
    console.warn('LocalStorage save union document error:', e);
  }

  return finalId;
}

export async function deleteUnionDocumentRulingFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'unionDocumentsAndRulings', id));
  } catch (err) {
    console.warn('Error deleting union document from Firestore:', err);
  }
  try {
    const raw = localStorage.getItem('aipeu_union_documents_rulings');
    if (raw) {
      const list: UnionDocumentRuling[] = JSON.parse(raw);
      localStorage.setItem('aipeu_union_documents_rulings', JSON.stringify(list.filter((r) => r.id !== id)));
    }
    const rawDel = localStorage.getItem('aipeu_deleted_ruling_ids');
    const delList: string[] = rawDel ? JSON.parse(rawDel) : [];
    if (!delList.includes(id)) {
      delList.push(id);
      localStorage.setItem('aipeu_deleted_ruling_ids', JSON.stringify(delList));
    }
  } catch (e) {
    console.warn('LocalStorage delete union document error:', e);
  }
}

// ================= ORDERS / RULINGS / GUIDE =================

export const DEFAULT_ORDERS_RULINGS_GUIDES: OrderRulingGuideItem[] = [];

export async function getOrdersRulingsGuidesFromFirestore(): Promise<OrderRulingGuideItem[]> {
  const deletedIds = new Set<string>();
  try {
    const rawDel = localStorage.getItem('aipeu_deleted_org_ids');
    if (rawDel) JSON.parse(rawDel).forEach((id: string) => deletedIds.add(id));
  } catch {}

  let firestoreItems: OrderRulingGuideItem[] = [];
  try {
    const colRef = collection(db, 'ordersRulingsGuides');
    const snapshot = await getDocs(colRef);

    if (!snapshot.empty) {
      firestoreItems = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          fileName: data.fileName || '',
          folderName: data.folderName || 'General',
          category: data.category || 'Orders',
          documentUrl: data.documentUrl || '',
          published: data.published || '',
          order: data.order ?? 0,
          notes: data.notes || '',
        };
      });
    }
  } catch (err) {
    console.warn('Error fetching orders, rulings & guides from Firestore:', err);
  }

  // Merge with local storage cache so newly added items are always visible
  try {
    const localItems: OrderRulingGuideItem[] = JSON.parse(
      localStorage.getItem('aipeu_orders_rulings_guides') || '[]'
    );
    const mergedMap = new Map<string, OrderRulingGuideItem>();

    firestoreItems.forEach((item) => {
      if (!deletedIds.has(item.id) && !isLegacySeedId(item.id)) mergedMap.set(item.id, item);
    });
    localItems.forEach((item) => {
      if (!deletedIds.has(item.id) && !isLegacySeedId(item.id)) mergedMap.set(item.id, item);
    });

    const result = Array.from(mergedMap.values());
    const sorted = result.sort((a, b) => {
      if ((a.order ?? 0) !== (b.order ?? 0)) return (a.order ?? 0) - (b.order ?? 0);
      return (b.published || '').localeCompare(a.published || '');
    });
    try {
      localStorage.setItem('aipeu_orders_rulings_guides', JSON.stringify(sorted));
    } catch {}
    return sorted;
  } catch (e) {
    return firestoreItems.filter((i) => !isLegacySeedId(i.id));
  }
}

// ================= BATCH PURGE / CLEAR ALL HELPERS =================
export async function clearAllAnnouncementsFromFirestore(): Promise<void> {
  try {
    const colRef = collection(db, 'announcements');
    const snapshot = await getDocs(colRef);
    await Promise.all(snapshot.docs.map((d) => deleteDoc(doc(db, 'announcements', d.id))));
  } catch (err) {
    console.warn('Error clearing announcements from Firestore:', err);
  }
  try {
    localStorage.setItem('aipeu_announcements', '[]');
  } catch {}
}

export async function clearAllImportantDocsFromFirestore(): Promise<void> {
  try {
    const colRef = collection(db, 'importantDocuments');
    const snapshot = await getDocs(colRef);
    await Promise.all(snapshot.docs.map((d) => deleteDoc(doc(db, 'importantDocuments', d.id))));
  } catch (err) {
    console.warn('Error clearing important docs from Firestore:', err);
  }
  try {
    localStorage.setItem('aipeu_important_documents', '[]');
  } catch {}
}

export async function clearAllNoticeCircularsFromFirestore(): Promise<void> {
  try {
    const colRef = collection(db, 'noticeCirculars');
    const snapshot = await getDocs(colRef);
    await Promise.all(snapshot.docs.map((d) => deleteDoc(doc(db, 'noticeCirculars', d.id))));
  } catch (err) {
    console.warn('Error clearing notice circulars from Firestore:', err);
  }
  try {
    localStorage.setItem('aipeu_notice_circulars', '[]');
  } catch {}
}

export async function clearAllOrdersRulingsGuidesFromFirestore(): Promise<void> {
  try {
    const colRef = collection(db, 'ordersRulingsGuides');
    const snapshot = await getDocs(colRef);
    await Promise.all(snapshot.docs.map((d) => deleteDoc(doc(db, 'ordersRulingsGuides', d.id))));
  } catch (err) {
    console.warn('Error clearing orders rulings guides from Firestore:', err);
  }
  try {
    localStorage.setItem('aipeu_orders_rulings_guides', '[]');
  } catch {}
}


export async function saveOrderRulingGuideToFirestore(
  item: Partial<OrderRulingGuideItem> & { id?: string }
): Promise<string> {
  const colRef = collection(db, 'ordersRulingsGuides');
  let resolvedDocUrl = item.documentUrl || '';
  if (resolvedDocUrl.startsWith('data:')) {
    try {
      resolvedDocUrl = await uploadFileToFirestore(resolvedDocUrl, item.fileName || 'order.pdf');
    } catch (e) {
      console.warn('Chunk upload failed for order ruling guide file, fallback to raw url:', e);
    }
  }

  const docData = {
    fileName: item.fileName || '',
    folderName: item.folderName || 'General',
    category: item.category || 'Orders',
    documentUrl: resolvedDocUrl,
    published: item.published || new Date().toISOString().split('T')[0],
    order: item.order ?? 0,
    notes: item.notes || '',
    updatedAt: serverTimestamp(),
  };

  let savedId = item.id;

  try {
    if (item.id && !item.id.startsWith('org-seed-') && !item.id.startsWith('temp-') && !item.id.startsWith('org-local-')) {
      const docItem = doc(db, 'ordersRulingsGuides', item.id);
      await setDoc(docItem, docData, { merge: true });
      savedId = item.id;
    } else {
      const docRef = await addDoc(colRef, {
        ...docData,
        createdAt: serverTimestamp(),
      });
      savedId = docRef.id;
    }
  } catch (firestoreErr) {
    console.error('Firestore save failed, persisting locally:', firestoreErr);
    if (!savedId) {
      savedId = `org-local-${Date.now()}`;
    }
  }

  // Always update local cache so the item is instantly visible and persistent
  try {
    const finalId = savedId || `org-local-${Date.now()}`;
    const localList: OrderRulingGuideItem[] = JSON.parse(
      localStorage.getItem('aipeu_orders_rulings_guides') || '[]'
    );
    const existingIdx = localList.findIndex((x) => x.id === finalId);
    const newItem: OrderRulingGuideItem = {
      id: finalId,
      fileName: docData.fileName,
      folderName: docData.folderName,
      category: docData.category,
      documentUrl: docData.documentUrl,
      published: docData.published,
      order: docData.order,
      notes: docData.notes,
    };
    if (existingIdx >= 0) {
      localList[existingIdx] = newItem;
    } else {
      localList.unshift(newItem);
    }
    localStorage.setItem('aipeu_orders_rulings_guides', JSON.stringify(localList));
  } catch (e) {
    console.warn('LocalStorage sync error:', e);
  }

  return savedId || `org-local-${Date.now()}`;
}

export async function deleteOrderRulingGuideFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'ordersRulingsGuides', id));
  } catch (err) {
    console.warn('Error deleting document from Firestore:', err);
  }
  try {
    const localList: OrderRulingGuideItem[] = JSON.parse(
      localStorage.getItem('aipeu_orders_rulings_guides') || '[]'
    );
    const updated = localList.filter((x) => x.id !== id);
    localStorage.setItem('aipeu_orders_rulings_guides', JSON.stringify(updated));
    const rawDel = localStorage.getItem('aipeu_deleted_org_ids');
    const delList: string[] = rawDel ? JSON.parse(rawDel) : [];
    if (!delList.includes(id)) {
      delList.push(id);
      localStorage.setItem('aipeu_deleted_org_ids', JSON.stringify(delList));
    }
  } catch (e) {
    console.warn('LocalStorage delete error:', e);
  }
}

// ================= REAL-TIME FIRESTORE SUBSCRIPTIONS (CROSS-DEVICE SYNC) =================
// These onSnapshot listeners ensure that changes uploaded on Vercel, Netlify, mobile,
// or local environments stream immediately (sub-second) to all open browser windows,
// the AI Studio tool link, and public user portals.

export function subscribeToAnnouncements(
  callback: (items: AnnouncementItem[]) => void
): () => void {
  const colRef = collection(db, 'announcements');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: AnnouncementItem[] = [];
      snapshot.forEach((d) => {
        if (!isLegacySeedId(d.id)) {
          const data = d.data();
          items.push({
            id: d.id,
            title: data.title || '',
            link: data.link || '',
            published: data.published || '',
            order: data.order ?? 0,
            active: data.active !== false,
          });
        }
      });
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      try {
        localStorage.setItem('aipeu_announcements', JSON.stringify(items));
      } catch {}
      callback(items);
    },
    (err) => {
      console.warn('Realtime announcements sync notice:', err);
    }
  );
}

export function subscribeToImportantDocuments(
  callback: (items: ImportantDocItem[]) => void
): () => void {
  const colRef = collection(db, 'importantDocuments');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: ImportantDocItem[] = [];
      snapshot.forEach((d) => {
        if (!isLegacySeedId(d.id)) {
          const data = d.data();
          items.push({
            id: d.id,
            title: data.title || '',
            url: data.url || '',
            category: data.category || 'General',
            order: data.order ?? 0,
            published: data.published || '',
          });
        }
      });
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      try {
        localStorage.setItem('aipeu_important_documents', JSON.stringify(items));
      } catch {}
      callback(items);
    },
    (err) => {
      console.warn('Realtime important documents sync notice:', err);
    }
  );
}

export function subscribeToNoticeCirculars(
  callback: (items: NoticeCircularItem[]) => void
): () => void {
  const colRef = collection(db, 'noticeCirculars');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: NoticeCircularItem[] = [];
      snapshot.forEach((d) => {
        if (!isLegacySeedId(d.id)) {
          const data = d.data();
          items.push({
            id: d.id,
            title: data.title || '',
            category: data.category || 'NOTICE',
            published: data.published || '',
            url: data.url || '',
            order: data.order ?? 0,
          });
        }
      });
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      try {
        localStorage.setItem('aipeu_notice_circulars', JSON.stringify(items));
      } catch {}
      callback(items);
    },
    (err) => {
      console.warn('Realtime notice circulars sync notice:', err);
    }
  );
}

export function subscribeToOrdersRulingsGuides(
  callback: (items: OrderRulingGuideItem[]) => void
): () => void {
  const colRef = collection(db, 'ordersRulingsGuides');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: OrderRulingGuideItem[] = [];
      snapshot.forEach((d) => {
        if (!isLegacySeedId(d.id)) {
          const data = d.data();
          items.push({
            id: d.id,
            fileName: data.fileName || '',
            folderName: data.folderName || 'General',
            category: data.category || 'Orders',
            documentUrl: data.documentUrl || '',
            published: data.published || '',
            order: data.order ?? 0,
            notes: data.notes || '',
          });
        }
      });
      items.sort((a, b) => {
        if ((a.order ?? 0) !== (b.order ?? 0)) return (a.order ?? 0) - (b.order ?? 0);
        return (b.published || '').localeCompare(a.published || '');
      });
      try {
        localStorage.setItem('aipeu_orders_rulings_guides', JSON.stringify(items));
      } catch {}
      callback(items);
    },
    (err) => {
      console.warn('Realtime orders/rulings/guides sync notice:', err);
    }
  );
}

export function subscribeToNewsItems(
  callback: (items: NewsSliderItem[]) => void
): () => void {
  const colRef = collection(db, 'newsSliderItems');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: NewsSliderItem[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          title: data.title || '',
          category: data.category || 'LATEST NEWS',
          link: data.link || '',
          isUrgent: !!data.isUrgent,
          published: data.published || '',
          order: data.order ?? 0,
        });
      });
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      try {
        localStorage.setItem('aipeu_news_items', JSON.stringify(items));
      } catch {}
      callback(items);
    },
    (err) => {
      console.warn('Realtime news items sync notice:', err);
    }
  );
}

export function subscribeToHeroSlides(
  callback: (slides: HeroSlide[]) => void
): () => void {
  const colRef = collection(db, 'heroSlides');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const slides: HeroSlide[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        slides.push({
          id: d.id,
          title: data.title || '',
          subtitle: data.subtitle || '',
          tag: data.tag || 'DAKSHIKSHA',
          imageUrl: data.imageUrl || '',
          ctaText: data.ctaText || 'Learn More',
          ctaLink: data.ctaLink || '#',
          gradient: data.gradient || 'from-[#0A2540] via-[#1E3A8A] to-[#B91C1C]',
          order: data.order ?? 0,
          active: data.active !== false,
          targetPage: data.targetPage || 'home',
        });
      });
      slides.sort((a, b) => (a.order || 0) - (b.order || 0));
      try {
        localStorage.setItem('aipeu_hero_slides', JSON.stringify(slides));
      } catch {}
      callback(slides);
    },
    (err) => {
      console.warn('Realtime hero slides sync notice:', err);
    }
  );
}

export function subscribeToExecutiveMembers(
  callback: (members: OfficeBearer[]) => void
): () => void {
  const colRef = collection(db, 'executiveMembers');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: (OfficeBearer & { id: string })[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        const normName = (data.name || '').trim().toLowerCase();
        if (!isLegacySeedId(d.id) && !LEGACY_SAMPLE_BEARER_NAMES.has(normName)) {
          list.push({
            id: d.id,
            name: data.name || '',
            designation: data.designation || '',
            branch: data.branch || '',
            phone: data.phone || '',
            location: data.location || '',
            roleType: data.roleType || 'executive',
            photoUrl: data.photoUrl || '',
          } as OfficeBearer & { id: string });
        }
      });
      const sorted = sortOfficeBearers(list);
      try {
        localStorage.setItem('aipeu_office_bearers', JSON.stringify(sorted));
      } catch {}
      callback(sorted);
    },
    (err) => {
      console.warn('Realtime executive members sync notice:', err);
    }
  );
}

export function subscribeToCirculars(
  callback: (posts: BlogPost[]) => void
): () => void {
  const colRef = collection(db, 'circulars');
  const q = query(colRef, orderBy('published', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const posts: BlogPost[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || '',
          published: data.published || new Date().toISOString(),
          updated: data.updated || data.published || '',
          author: data.author || 'Divisional Secretary, AIPEU Dhenkanal',
          url: data.url || '',
          categories: data.category ? [data.category] : ['UNION NEWS'],
          snippet: data.snippet || '',
          contentHtml: data.contentHtml || '',
          images: data.images || [],
          driveLinks: data.driveLinks || [],
          isSavedOffline: false,
        };
      });
      callback(posts);
    },
    (err) => {
      console.warn('Realtime circulars sync notice:', err);
    }
  );
}

// ================= MY APPS & ONLINE PORTALS FIRESTORE SYNC =================
export async function getMyAppsFromFirestore(): Promise<CustomPortalApp[]> {
  const deletedIds = new Set<string>();
  try {
    const rawDel = localStorage.getItem('aipeu_deleted_app_ids');
    if (rawDel) JSON.parse(rawDel).forEach((id: string) => deletedIds.add(id));
  } catch {}

  let firestoreApps: CustomPortalApp[] = [];
  try {
    const colRef = collection(db, 'customPortalApps');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      firestoreApps = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name || '',
          category: data.category || 'Others',
          sourceType: data.sourceType || 'code',
          codeSnippet: data.codeSnippet,
          url: data.url,
          description: data.description || '',
          fileSize: data.fileSize,
          createdAt: data.createdAt || '',
        } as CustomPortalApp;
      });
    }
  } catch (err) {
    console.warn('Firestore fetch myApps error:', err);
  }

  // Merge with local storage & default apps
  let localApps: CustomPortalApp[] = [];
  try {
    const raw = localStorage.getItem('aipeu_admin_apps');
    if (raw) localApps = JSON.parse(raw);
  } catch {}

  const map = new Map<string, CustomPortalApp>();
  DEFAULT_MY_APPS.forEach((a) => {
    if (!deletedIds.has(a.id)) map.set(a.id, a);
  });
  localApps.forEach((a) => {
    if (!deletedIds.has(a.id)) map.set(a.id, a);
  });
  firestoreApps.forEach((a) => {
    if (!deletedIds.has(a.id)) map.set(a.id, a);
  });

  const merged = Array.from(map.values());
  try {
    localStorage.setItem('aipeu_admin_apps', JSON.stringify(merged));
  } catch {}

  return merged;
}

export async function saveMyAppToFirestore(app: CustomPortalApp): Promise<string> {
  const colRef = collection(db, 'customPortalApps');
  const targetId = app.id && !app.id.startsWith('temp-') ? app.id : `app-${Date.now()}`;

  let codeSnippet = app.codeSnippet;
  // If codeSnippet is data URI and large, use chunking
  if (codeSnippet && codeSnippet.startsWith('data:') && codeSnippet.length > 450000) {
    try {
      codeSnippet = await uploadFileToFirestore(codeSnippet, `${app.name}.html`);
    } catch (e) {
      console.warn('Chunk upload failed for app snippet:', e);
    }
  }

  const appData = {
    name: app.name || '',
    category: app.category || 'Others',
    sourceType: app.sourceType || 'code',
    ...(codeSnippet !== undefined ? { codeSnippet } : {}),
    ...(app.url !== undefined ? { url: app.url } : {}),
    description: app.description || '',
    fileSize: app.fileSize || '',
    createdAt: app.createdAt || new Date().toISOString().split('T')[0],
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(colRef, targetId), appData, { merge: true });
  } catch (err) {
    console.warn('Firestore save myApp failed, persisting locally:', err);
  }

  // Update local storage
  try {
    const raw = localStorage.getItem('aipeu_admin_apps');
    const list: CustomPortalApp[] = raw ? JSON.parse(raw) : [...DEFAULT_MY_APPS];
    const idx = list.findIndex((a) => a.id === targetId);
    const updatedApp: CustomPortalApp = {
      id: targetId,
      name: appData.name,
      category: appData.category,
      sourceType: appData.sourceType as any,
      codeSnippet: appData.codeSnippet,
      url: appData.url,
      description: appData.description,
      fileSize: appData.fileSize,
      createdAt: appData.createdAt,
    };
    if (idx >= 0) {
      list[idx] = updatedApp;
    } else {
      list.unshift(updatedApp);
    }
    localStorage.setItem('aipeu_admin_apps', JSON.stringify(list));

    const rawDel = localStorage.getItem('aipeu_deleted_app_ids');
    if (rawDel) {
      const delList: string[] = JSON.parse(rawDel);
      localStorage.setItem('aipeu_deleted_app_ids', JSON.stringify(delList.filter((x) => x !== targetId)));
    }
  } catch (e) {
    console.warn('LocalStorage save myApp error:', e);
  }

  window.dispatchEvent(new CustomEvent('my-apps-updated'));
  return targetId;
}

export async function deleteMyAppFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'customPortalApps', id));
  } catch (err) {
    console.warn('Error deleting app from Firestore:', err);
  }

  try {
    const raw = localStorage.getItem('aipeu_admin_apps');
    if (raw) {
      const list: CustomPortalApp[] = JSON.parse(raw);
      localStorage.setItem('aipeu_admin_apps', JSON.stringify(list.filter((a) => a.id !== id)));
    }
    const rawDel = localStorage.getItem('aipeu_deleted_app_ids');
    const delList: string[] = rawDel ? JSON.parse(rawDel) : [];
    if (!delList.includes(id)) {
      delList.push(id);
      localStorage.setItem('aipeu_deleted_app_ids', JSON.stringify(delList));
    }
  } catch (e) {
    console.warn('LocalStorage delete myApp error:', e);
  }

  window.dispatchEvent(new CustomEvent('my-apps-updated'));
}

export function subscribeToMyApps(
  callback: (apps: CustomPortalApp[]) => void
): () => void {
  const colRef = collection(db, 'customPortalApps');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const deletedIds = new Set<string>();
      try {
        const rawDel = localStorage.getItem('aipeu_deleted_app_ids');
        if (rawDel) JSON.parse(rawDel).forEach((id: string) => deletedIds.add(id));
      } catch {}

      const firestoreApps: CustomPortalApp[] = [];
      snapshot.forEach((d) => {
        if (!deletedIds.has(d.id)) {
          const data = d.data();
          firestoreApps.push({
            id: d.id,
            name: data.name || '',
            category: data.category || 'Others',
            sourceType: data.sourceType || 'code',
            codeSnippet: data.codeSnippet,
            url: data.url,
            description: data.description || '',
            fileSize: data.fileSize,
            createdAt: data.createdAt || '',
          });
        }
      });

      // Merge with default apps so ACG-17 etc. remain available
      const map = new Map<string, CustomPortalApp>();
      DEFAULT_MY_APPS.forEach((a) => {
        if (!deletedIds.has(a.id)) map.set(a.id, a);
      });
      firestoreApps.forEach((a) => {
        if (!deletedIds.has(a.id)) map.set(a.id, a);
      });

      const merged = Array.from(map.values());
      try {
        localStorage.setItem('aipeu_admin_apps', JSON.stringify(merged));
      } catch {}
      callback(merged);
    },
    (err) => {
      console.warn('Realtime myApps sync notice:', err);
    }
  );
}



