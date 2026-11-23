import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  getDocFromServer,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
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
  GalleryPhoto,
  DownloadableForm,
  EmployeeResource,
} from '../types';
import {
  OFFICE_BEARERS as DEFAULT_OFFICE_BEARERS,
  IMPORTANT_DOCUMENTS as DEFAULT_UNION_DOCUMENTS_AND_RULINGS,
} from '../data/unionInfo';
import { sortOfficeBearers } from '../utils/officeBearerSorting';
import {
  DEFAULT_HERO_SLIDES,
  DEFAULT_NEWS_ITEMS,
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_IMPORTANT_DOCUMENTS,
  DEFAULT_NOTICE_CIRCULARS,
} from '../data/dakshikshaData';
import fallbackPosts from '../data/posts.json';
import {
  DEFAULT_MY_APPS,
  DEFAULT_GALLERY,
  DEFAULT_FORMS_LIST,
  DEFAULT_EMPLOYEE_RESOURCES,
} from '../data/portalMenuData';

// ================= FIREBASE INITIALIZATION =================
export const app =
  getApps().length > 0
    ? getApp()
    : initializeApp({
        projectId: firebaseConfig.projectId,
        appId: firebaseConfig.appId,
        apiKey: firebaseConfig.apiKey,
        authDomain: firebaseConfig.authDomain,
        storageBucket: firebaseConfig.storageBucket,
        messagingSenderId: firebaseConfig.messagingSenderId,
      });

export const auth: Auth = getAuth(app);

// Initialize Firestore using the designated databaseId from config
const dbId = (firebaseConfig as Record<string, any>).firestoreDatabaseId;
export const db = dbId ? getFirestore(app, dbId) : getFirestore(app);

// Secondary isolated auth instance for optional member Auth provisioning
export function getSecondaryAdminAuth(): Auth {
  const secondaryAppName = 'aipeu-member-admin-provisioner';
  const existing = getApps().find((a) => a.name === secondaryAppName);
  const secApp =
    existing ||
    initializeApp(
      {
        projectId: firebaseConfig.projectId,
        appId: firebaseConfig.appId,
        apiKey: firebaseConfig.apiKey,
        authDomain: firebaseConfig.authDomain,
        storageBucket: firebaseConfig.storageBucket,
        messagingSenderId: firebaseConfig.messagingSenderId,
      },
      secondaryAppName
    );
  return getAuth(secApp);
}

// ================= SINGLE-ADMIN GOOGLE AUTHENTICATION =================
export const AUTHORIZED_ADMIN_EMAIL = 'tukukalandi@gmail.com';
export const DEFAULT_TOOL_ADMIN_AUTHOR = 'Tool Administrator (AIPEU Dhenkanal)';

export function isAuthorizedAdminUser(user: User | null | undefined): boolean {
  if (!user || !user.email) return false;
  return (
    user.email.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL &&
    user.emailVerified === true
  );
}

export async function signInAdminWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  const signedInUser = result.user;

  if (!isAuthorizedAdminUser(signedInUser)) {
    const attemptedEmail = signedInUser?.email || 'unknown account';
    await signOut(auth).catch(() => {});
    throw new Error(
      `Access Denied: "${attemptedEmail}" is not authorized for the Admin Portal. Only the Tool Administrator account (${AUTHORIZED_ADMIN_EMAIL}) can sign in.`
    );
  }
  return signedInUser;
}

export async function signOutAdmin(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAdminAuth(
  callback: (adminUser: User | null, authReady: boolean) => void
): () => void {
  return onAuthStateChanged(auth, (user) => {
    if (isAuthorizedAdminUser(user)) {
      callback(user, true);
    } else {
      callback(null, true);
    }
  });
}

// ================= STRUCTURED FIRESTORE ERROR HANDLER =================
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export function formatReadableFirestoreError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const lower = raw.toLowerCase();
  if (lower.includes('permission-denied') || lower.includes('missing or insufficient permissions')) {
    return `Permission Denied by Firebase. Please sign in with the authorized Tool Administrator Google account (${AUTHORIZED_ADMIN_EMAIL}) and try again.`;
  }
  if (lower.includes('quota exceeded') || lower.includes('resource-exhausted')) {
    return 'Firebase daily quota exceeded. Please check Firebase billing or retry after quota resets.';
  }
  if (lower.includes('exceeds the maximum allowed size')) {
    return 'File is too large for a single Firestore document. Please retry or use a smaller file (under 15MB).';
  }
  return raw;
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(formatReadableFirestoreError(error));
}

function logSnapshotError(error: unknown, path: string): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType: OperationType.LIST,
    path,
  };
  console.error('Firestore Realtime Listener Error: ', JSON.stringify(errInfo));
}

function sanitizeFirestoreId(rawId: string | undefined, prefix: string): string {
  const cleaned = (rawId || '').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
  if (cleaned.length > 0) return cleaned;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// Test connection on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration. Firestore client is offline.');
    }
  }
}
testFirestoreConnection();

// ================= CHUNKED CLOUD FILE STORAGE =================
// Allows PDFs, documents, HTML files, and images up to ~15MB to be safely
// stored in Cloud Firestore without exceeding the 1MB document limit.
const FILE_CHUNK_SIZE = 400000; // 400KB characters per chunk
const INLINE_MAX_LENGTH = 450000;
const fileUrlCache = new Map<string, string>();

async function uploadChunkedStringToFirestore(
  payload: string,
  fileName: string,
  mimeType: string,
  isRawText: boolean
): Promise<string> {
  const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const safeFileName = (fileName || 'document').slice(0, 480);
  const safeMimeType = (mimeType || 'application/octet-stream').slice(0, 140);
  const totalLength = payload.length;
  const chunkCount = Math.ceil(totalLength / FILE_CHUNK_SIZE);

  if (chunkCount > 100) {
    throw new Error('File exceeds the 35MB maximum upload size supported by the portal.');
  }

  try {
    // 1. Write manifest FIRST so Master Gate `exists(parent)` passes for every chunk
    const manifestDocRef = doc(db, 'uploadedFiles', fileId);
    await setDoc(manifestDocRef, {
      fileId,
      fileName: safeFileName,
      mimeType: safeMimeType,
      chunkCount,
      totalLength,
      createdAt: serverTimestamp(),
    });

    // 2. Write all chunks in parallel now that parent manifest exists
    const chunkPromises: Promise<void>[] = [];
    for (let i = 0; i < chunkCount; i++) {
      const chunkStr = payload.substring(i * FILE_CHUNK_SIZE, (i + 1) * FILE_CHUNK_SIZE);
      const chunkDocRef = doc(db, 'uploadedFiles', fileId, 'chunks', `chunk_${i}`);
      chunkPromises.push(
        setDoc(chunkDocRef, {
          index: i,
          data: chunkStr,
          createdAt: serverTimestamp(),
        })
      );
    }
    await Promise.all(chunkPromises);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `uploadedFiles/${fileId}`);
  }

  const rawParam = isRawText ? '&raw=1' : '';
  const fileRefUrl = `firestore-file://${fileId}?mime=${encodeURIComponent(safeMimeType)}&name=${encodeURIComponent(safeFileName)}${rawParam}`;
  fileUrlCache.set(fileRefUrl, payload);
  return fileRefUrl;
}

export async function uploadFileToFirestore(
  dataUri: string,
  fileName = 'document.pdf'
): Promise<string> {
  if (!dataUri || !dataUri.startsWith('data:')) {
    return dataUri || '';
  }

  if (dataUri.length < INLINE_MAX_LENGTH) {
    return dataUri;
  }

  const mimeMatch = dataUri.match(/^data:([^;]+);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'application/pdf';
  return uploadChunkedStringToFirestore(dataUri, fileName, mimeType, false);
}

export async function uploadTextToFirestore(
  textContent: string,
  fileName = 'tool.html',
  mimeType = 'text/html'
): Promise<string> {
  if (!textContent || textContent.length < INLINE_MAX_LENGTH) {
    return textContent || '';
  }
  return uploadChunkedStringToFirestore(textContent, fileName, mimeType, true);
}

export async function resolveFileUrl(fileRefUrl: string): Promise<string> {
  if (!fileRefUrl) return '';
  if (!fileRefUrl.startsWith('firestore-file://')) {
    return fileRefUrl;
  }

  if (fileUrlCache.has(fileRefUrl)) {
    return fileUrlCache.get(fileRefUrl)!;
  }

  try {
    const withoutScheme = fileRefUrl.replace('firestore-file://', '');
    const [idPart, queryPart = ''] = withoutScheme.split('?');
    const cleanId = idPart.replace(/^\/+/, '');
    const isRawText = queryPart.includes('raw=1');

    const manifestSnap = await getDoc(doc(db, 'uploadedFiles', cleanId));
    if (!manifestSnap.exists()) {
      return fileRefUrl;
    }
    const manifest = manifestSnap.data();
    const chunkCount = manifest.chunkCount || 1;
    const mimeType = manifest.mimeType || 'application/pdf';

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

    const joined = sortedChunks.join('');
    let result = joined;
    if (!isRawText && !joined.startsWith('data:')) {
      result = `data:${mimeType};base64,${joined}`;
    }
    fileUrlCache.set(fileRefUrl, result);
    return result;
  } catch (err) {
    console.error('Error resolving chunked file from Firestore:', err);
    return fileRefUrl;
  }
}

/**
 * Filter out legacy seed items so user gets a clean portal view.
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

async function chunkDataList(items: string[] | undefined, baseName: string): Promise<string[]> {
  if (!items || items.length === 0) return [];
  const results: string[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item && item.startsWith('data:') && item.length >= INLINE_MAX_LENGTH) {
      results.push(await uploadFileToFirestore(item, `${baseName}-${i + 1}`));
    } else if (item) {
      results.push(item);
    }
  }
  return results;
}

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
  const publishedDate = new Date().toISOString();
  const resolvedLinks = await chunkDataList(input.fileLinks, input.title || 'circular-doc');
  const resolvedImages = await chunkDataList(input.imageUrls, input.title || 'circular-img');

  const payload = {
    title: (input.title || '').trim().slice(0, 500),
    category: (input.category || 'UNION NEWS').trim().slice(0, 120),
    snippet: (input.snippet || '').trim().slice(0, 5000),
    contentHtml: (input.contentHtml || `<p>${input.snippet || ''}</p>`).slice(0, 200000),
    driveLinks: resolvedLinks.slice(0, 50),
    images: resolvedImages.slice(0, 50),
    published: publishedDate,
    updated: publishedDate,
    author: (input.author || DEFAULT_TOOL_ADMIN_AUTHOR).trim().slice(0, 200),
    urgent: !!input.urgent,
    createdAt: serverTimestamp(),
  };

  let docId = '';
  try {
    const colRef = collection(db, 'circulars');
    const docRef = await addDoc(colRef, payload);
    docId = docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'circulars');
  }

  try {
    const newPost: BlogPost = {
      id: docId,
      title: payload.title,
      published: publishedDate,
      updated: publishedDate,
      author: payload.author,
      url: '',
      categories: [payload.category],
      snippet: payload.snippet,
      contentHtml: payload.contentHtml,
      images: payload.images,
      driveLinks: payload.driveLinks,
      isSavedOffline: false,
    };
    const raw = localStorage.getItem('aipeu_admin_circulars');
    const currentList: BlogPost[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem('aipeu_admin_circulars', JSON.stringify([newPost, ...currentList.filter((p) => p.id !== docId)]));
  } catch {}

  return docId;
}

export async function updateCircularInFirestore(
  id: string,
  input: Partial<NewCircularInput>
): Promise<void> {
  const safeId = sanitizeFirestoreId(id, 'circ');
  const now = new Date().toISOString();
  const updateData: Record<string, any> = {
    updated: now,
    updatedAt: serverTimestamp(),
  };
  if (input.title !== undefined) updateData.title = input.title.trim().slice(0, 500);
  if (input.category !== undefined) updateData.category = input.category.trim().slice(0, 120);
  if (input.snippet !== undefined) {
    updateData.snippet = input.snippet.trim().slice(0, 5000);
    updateData.contentHtml = (input.contentHtml || `<p>${input.snippet}</p>`).slice(0, 200000);
  }
  if (input.fileLinks !== undefined) {
    updateData.driveLinks = (await chunkDataList(input.fileLinks, input.title || 'circular-doc')).slice(0, 50);
  }
  if (input.imageUrls !== undefined) {
    updateData.images = (await chunkDataList(input.imageUrls, input.title || 'circular-img')).slice(0, 50);
  }
  if (input.author !== undefined) updateData.author = input.author.trim().slice(0, 200);
  if (input.urgent !== undefined) updateData.urgent = input.urgent;

  try {
    const docRef = doc(db, 'circulars', safeId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      updateData.published = now;
      updateData.createdAt = serverTimestamp();
    }
    await setDoc(docRef, updateData, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `circulars/${safeId}`);
  }

  try {
    const raw = localStorage.getItem('aipeu_admin_circulars');
    const currentList: BlogPost[] = raw ? JSON.parse(raw) : [];
    const idx = currentList.findIndex((p) => p.id === safeId);
    if (idx >= 0) {
      currentList[idx] = {
        ...currentList[idx],
        title: updateData.title ?? currentList[idx].title,
        categories: updateData.category ? [updateData.category] : currentList[idx].categories,
        snippet: updateData.snippet ?? currentList[idx].snippet,
        contentHtml: updateData.contentHtml ?? currentList[idx].contentHtml,
        driveLinks: updateData.driveLinks ?? currentList[idx].driveLinks,
        images: updateData.images ?? currentList[idx].images,
        author: updateData.author ?? currentList[idx].author,
        updated: now,
      };
      localStorage.setItem('aipeu_admin_circulars', JSON.stringify(currentList));
    }
  } catch {}
}

export async function getCircularsFromFirestore(): Promise<BlogPost[]> {
  const deletedIds = new Set<string>();
  try {
    const rawDel = localStorage.getItem('aipeu_deleted_post_ids');
    if (rawDel) JSON.parse(rawDel).forEach((id: string) => deletedIds.add(id));
  } catch {}

  try {
    const colRef = collection(db, 'circulars');
    const q = query(colRef, orderBy('published', 'desc'));
    const snapshot = await getDocs(q);

    const firestorePosts: BlogPost[] = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title || '',
        published: data.published || new Date().toISOString(),
        updated: data.updated || data.published || '',
        author: data.author || DEFAULT_TOOL_ADMIN_AUTHOR,
        url: data.url || '',
        categories: data.category ? [data.category] : ['UNION NEWS'],
        snippet: data.snippet || '',
        contentHtml: data.contentHtml || '',
        images: data.images || [],
        driveLinks: data.driveLinks || [],
        isSavedOffline: false,
      };
    });

    const map = new Map<string, BlogPost>();
    (fallbackPosts as BlogPost[]).forEach((p) => {
      if (!deletedIds.has(p.id)) map.set(p.id, p);
    });
    firestorePosts.forEach((p) => {
      if (!deletedIds.has(p.id)) map.set(p.id, p);
    });

    const sorted = Array.from(map.values()).sort(
      (a, b) => new Date(b.published || '').getTime() - new Date(a.published || '').getTime()
    );
    try {
      localStorage.setItem('aipeu_admin_circulars', JSON.stringify(firestorePosts));
    } catch {}
    return sorted;
  } catch (err) {
    console.warn('Firestore fetch circulars offline fallback:', err);
    let localCustomPosts: BlogPost[] = [];
    try {
      const raw = localStorage.getItem('aipeu_admin_circulars');
      if (raw) localCustomPosts = JSON.parse(raw);
    } catch {}
    const map = new Map<string, BlogPost>();
    (fallbackPosts as BlogPost[]).forEach((p) => {
      if (!deletedIds.has(p.id)) map.set(p.id, p);
    });
    localCustomPosts.forEach((p) => {
      if (!deletedIds.has(p.id)) map.set(p.id, p);
    });
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.published || '').getTime() - new Date(a.published || '').getTime()
    );
  }
}

export async function deleteCircularFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'circulars', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `circulars/${id}`);
  }
  try {
    const raw = localStorage.getItem('aipeu_admin_circulars');
    if (raw) {
      const currentList: BlogPost[] = JSON.parse(raw);
      localStorage.setItem('aipeu_admin_circulars', JSON.stringify(currentList.filter((p) => p.id !== id)));
    }
    const rawDel = localStorage.getItem('aipeu_deleted_post_ids');
    const deletedList: string[] = rawDel ? JSON.parse(rawDel) : [];
    if (!deletedList.includes(id)) {
      deletedList.push(id);
      localStorage.setItem('aipeu_deleted_post_ids', JSON.stringify(deletedList));
    }
  } catch {}
}

// ================= EXECUTIVE MEMBERS =================

export async function getExecutiveMembersFromFirestore(): Promise<OfficeBearer[]> {
  const deletedIds = new Set<string>();
  try {
    const rawDel = localStorage.getItem('aipeu_deleted_bearer_ids');
    if (rawDel) JSON.parse(rawDel).forEach((id: string) => deletedIds.add(id));
  } catch {}

  const isLegacyItem = (item: OfficeBearer & { id?: string }) => {
    if (item.id && (isLegacySeedId(item.id) || deletedIds.has(item.id))) return true;
    const normName = (item.name || '').trim().toLowerCase();
    if (LEGACY_SAMPLE_BEARER_NAMES.has(normName)) return true;
    return false;
  };

  try {
    const colRef = collection(db, 'executiveMembers');
    const snapshot = await getDocs(colRef);
    const firestoreList: (OfficeBearer & { id: string })[] = snapshot.docs.map((d) => {
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

    const map = new Map<string, OfficeBearer>();
    DEFAULT_OFFICE_BEARERS.forEach((m, idx) => {
      const mid = m.id || `bearer-${idx}`;
      if (!isLegacyItem({ ...m, id: mid })) map.set(mid, { ...m, id: mid });
    });
    firestoreList.forEach((m) => {
      if (!isLegacyItem(m)) map.set(m.id, m);
    });

    const sorted = sortOfficeBearers(Array.from(map.values()));
    try {
      localStorage.setItem('aipeu_office_bearers', JSON.stringify(sorted));
    } catch {}
    return sorted;
  } catch (err) {
    console.warn('Firestore fetch executive members offline fallback:', err);
    try {
      const raw = localStorage.getItem('aipeu_office_bearers');
      if (raw) {
        const list: OfficeBearer[] = JSON.parse(raw);
        return sortOfficeBearers(list.filter((m) => !isLegacyItem(m)));
      }
    } catch {}
    return [];
  }
}

export async function clearAllExecutiveMembersFromFirestore(): Promise<void> {
  try {
    const colRef = collection(db, 'executiveMembers');
    const snapshot = await getDocs(colRef);
    await Promise.all(snapshot.docs.map((d) => deleteDoc(doc(db, 'executiveMembers', d.id))));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, 'executiveMembers');
  }
  try {
    localStorage.setItem('aipeu_office_bearers', '[]');
  } catch {}
}

export async function saveExecutiveMemberToFirestore(
  member: OfficeBearer & { id?: string }
): Promise<string> {
  let resolvedPhoto = member.photoUrl || '';
  if (resolvedPhoto.startsWith('data:') && resolvedPhoto.length >= INLINE_MAX_LENGTH) {
    resolvedPhoto = await uploadFileToFirestore(resolvedPhoto, `${member.name || 'member'}.jpg`);
  }

  const payload = {
    name: (member.name || '').trim().slice(0, 200),
    designation: (member.designation || '').trim().slice(0, 200),
    branch: (member.branch || '').trim().slice(0, 200),
    phone: (member.phone || '').trim().slice(0, 50),
    location: (member.location || '').trim().slice(0, 200),
    roleType: (member.roleType || 'executive').slice(0, 50),
    photoUrl: resolvedPhoto,
    updatedAt: serverTimestamp(),
  };

  let finalId = '';
  try {
    const colRef = collection(db, 'executiveMembers');
    if (
      member.id &&
      !member.id.startsWith('temp-') &&
      !member.id.startsWith('exec-local-') &&
      !isLegacySeedId(member.id)
    ) {
      const safeId = sanitizeFirestoreId(member.id, 'exec');
      await setDoc(doc(db, 'executiveMembers', safeId), payload, { merge: true });
      finalId = safeId;
    } else {
      const docRef = await addDoc(colRef, {
        ...payload,
        createdAt: serverTimestamp(),
      });
      finalId = docRef.id;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'executiveMembers');
  }

  try {
    const raw = localStorage.getItem('aipeu_office_bearers');
    const list: (OfficeBearer & { id: string })[] = raw ? JSON.parse(raw) : [];
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
    if (existingIdx >= 0) list[existingIdx] = newMember;
    else list.push(newMember);
    localStorage.setItem('aipeu_office_bearers', JSON.stringify(sortOfficeBearers(list)));
  } catch {}

  return finalId;
}

export async function deleteExecutiveMemberFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'executiveMembers', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `executiveMembers/${id}`);
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
  } catch {}
}

// ================= HERO SLIDER (DAKSHIKSHA) =================

export async function getHeroSlidesFromFirestore(): Promise<HeroSlide[]> {
  const deletedIds = new Set<string>();
  try {
    const rawDel = localStorage.getItem('aipeu_deleted_slide_ids');
    if (rawDel) JSON.parse(rawDel).forEach((id: string) => deletedIds.add(id));
  } catch {}

  try {
    const colRef = collection(db, 'heroSlides');
    const snapshot = await getDocs(colRef);
    const firestoreSlides: HeroSlide[] = snapshot.docs.map((d) => {
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

    const map = new Map<string, HeroSlide>();
    DEFAULT_HERO_SLIDES.forEach((s) => {
      if (!deletedIds.has(s.id)) map.set(s.id, s);
    });
    firestoreSlides.forEach((s) => {
      if (!deletedIds.has(s.id)) map.set(s.id, s);
    });

    const result = Array.from(map.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
    try {
      localStorage.setItem('aipeu_hero_slides', JSON.stringify(result));
    } catch {}
    return result;
  } catch (err) {
    console.warn('Firestore fetch hero slides offline fallback:', err);
    try {
      const raw = localStorage.getItem('aipeu_hero_slides');
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_HERO_SLIDES;
  }
}

export async function saveHeroSlideToFirestore(
  slide: Partial<HeroSlide> & { id?: string }
): Promise<string> {
  let resolvedImg = slide.imageUrl || '';
  if (resolvedImg.startsWith('data:') && resolvedImg.length >= INLINE_MAX_LENGTH) {
    resolvedImg = await uploadFileToFirestore(resolvedImg, `${slide.title || 'slide'}.jpg`);
  }

  const slideData = {
    title: (slide.title || '').trim().slice(0, 300),
    subtitle: (slide.subtitle || '').trim().slice(0, 2000),
    tag: (slide.tag || 'DAKSHIKSHA').trim().slice(0, 120),
    imageUrl: resolvedImg,
    ctaText: (slide.ctaText || 'Learn More').trim().slice(0, 120),
    ctaLink: (slide.ctaLink || '#').trim().slice(0, 2000),
    gradient: (slide.gradient || 'from-[#0A2540] via-[#1E3A8A] to-[#B91C1C]').slice(0, 200),
    order: Number(slide.order ?? 0),
    active: slide.active !== false,
    targetPage: (slide.targetPage || 'home').slice(0, 32),
    updatedAt: serverTimestamp(),
  };

  let finalId = '';
  try {
    const colRef = collection(db, 'heroSlides');
    if (slide.id && !slide.id.startsWith('temp-') && !slide.id.startsWith('slide-local-')) {
      const safeId = sanitizeFirestoreId(slide.id, 'slide');
      await setDoc(doc(db, 'heroSlides', safeId), slideData, { merge: true });
      finalId = safeId;
    } else {
      const docRef = await addDoc(colRef, {
        ...slideData,
        createdAt: serverTimestamp(),
      });
      finalId = docRef.id;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'heroSlides');
  }

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
      targetPage: slideData.targetPage as any,
    };
    if (existingIdx >= 0) list[existingIdx] = newSlide;
    else list.push(newSlide);
    localStorage.setItem('aipeu_hero_slides', JSON.stringify(list));

    const rawDel = localStorage.getItem('aipeu_deleted_slide_ids');
    if (rawDel) {
      const delList: string[] = JSON.parse(rawDel);
      localStorage.setItem(
        'aipeu_deleted_slide_ids',
        JSON.stringify(delList.filter((x) => x !== finalId))
      );
    }
  } catch {}

  return finalId;
}

export async function deleteHeroSlideFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'heroSlides', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `heroSlides/${id}`);
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
  } catch {}
}

// ================= MOVING NEWS SLIDER & TICKER =================

export async function getNewsItemsFromFirestore(): Promise<NewsSliderItem[]> {
  const deletedIds = new Set<string>();
  try {
    const rawDel = localStorage.getItem('aipeu_deleted_news_ids');
    if (rawDel) JSON.parse(rawDel).forEach((id: string) => deletedIds.add(id));
  } catch {}

  try {
    const colRef = collection(db, 'newsSliderItems');
    const snapshot = await getDocs(colRef);
    const firestoreItems: NewsSliderItem[] = snapshot.docs.map((d) => {
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

    const map = new Map<string, NewsSliderItem>();
    DEFAULT_NEWS_ITEMS.forEach((item) => {
      if (!deletedIds.has(item.id)) map.set(item.id, item);
    });
    firestoreItems.forEach((item) => {
      if (!deletedIds.has(item.id)) map.set(item.id, item);
    });

    const result = Array.from(map.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
    try {
      localStorage.setItem('aipeu_news_items', JSON.stringify(result));
    } catch {}
    return result;
  } catch (err) {
    console.warn('Firestore fetch news items offline fallback:', err);
    try {
      const raw = localStorage.getItem('aipeu_news_items');
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_NEWS_ITEMS;
  }
}

export async function saveNewsItemToFirestore(
  item: Partial<NewsSliderItem> & { id?: string }
): Promise<string> {
  const itemData = {
    title: (item.title || '').trim().slice(0, 500),
    category: (item.category || 'LATEST NEWS').trim().slice(0, 120),
    link: (item.link || '').trim().slice(0, 2000),
    isUrgent: !!item.isUrgent,
    published: item.published || new Date().toISOString(),
    order: Number(item.order ?? 0),
    updatedAt: serverTimestamp(),
  };

  let finalId = '';
  try {
    const colRef = collection(db, 'newsSliderItems');
    if (item.id && !item.id.startsWith('temp-') && !item.id.startsWith('news-local-')) {
      const safeId = sanitizeFirestoreId(item.id, 'news');
      await setDoc(doc(db, 'newsSliderItems', safeId), itemData, { merge: true });
      finalId = safeId;
    } else {
      const docRef = await addDoc(colRef, {
        ...itemData,
        createdAt: serverTimestamp(),
      });
      finalId = docRef.id;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'newsSliderItems');
  }

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
    if (existingIdx >= 0) list[existingIdx] = newItem;
    else list.push(newItem);
    localStorage.setItem('aipeu_news_items', JSON.stringify(list));

    const rawDel = localStorage.getItem('aipeu_deleted_news_ids');
    if (rawDel) {
      const delList: string[] = JSON.parse(rawDel);
      localStorage.setItem(
        'aipeu_deleted_news_ids',
        JSON.stringify(delList.filter((x) => x !== finalId))
      );
    }
  } catch {}

  return finalId;
}

export async function deleteNewsItemFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'newsSliderItems', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `newsSliderItems/${id}`);
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
  } catch {}
}

// ================= ANNOUNCEMENTS =================

export async function getAnnouncementsFromFirestore(): Promise<AnnouncementItem[]> {
  const deletedIds = new Set<string>();
  try {
    const rawDel = localStorage.getItem('aipeu_deleted_announcement_ids');
    if (rawDel) JSON.parse(rawDel).forEach((id: string) => deletedIds.add(id));
  } catch {}

  try {
    const colRef = collection(db, 'announcements');
    const snapshot = await getDocs(colRef);
    const firestoreItems: AnnouncementItem[] = snapshot.docs
      .filter((d) => !isLegacySeedId(d.id) && !deletedIds.has(d.id))
      .map((d) => {
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

    const result = firestoreItems.sort((a, b) => (a.order || 0) - (b.order || 0));
    try {
      localStorage.setItem('aipeu_announcements', JSON.stringify(result));
    } catch {}
    return result;
  } catch (err) {
    console.warn('Firestore fetch announcements offline fallback:', err);
    try {
      const raw = localStorage.getItem('aipeu_announcements');
      if (raw) {
        const list: AnnouncementItem[] = JSON.parse(raw);
        return list.filter((a) => !deletedIds.has(a.id) && !isLegacySeedId(a.id));
      }
    } catch {}
    return DEFAULT_ANNOUNCEMENTS.filter((a) => !isLegacySeedId(a.id));
  }
}

export async function saveAnnouncementToFirestore(
  ann: Partial<AnnouncementItem> & { id?: string }
): Promise<string> {
  let resolvedLink = ann.link || '';
  if (resolvedLink.startsWith('data:') && resolvedLink.length >= INLINE_MAX_LENGTH) {
    resolvedLink = await uploadFileToFirestore(resolvedLink, ann.title || 'announcement.pdf');
  }

  const annData = {
    title: (ann.title || '').trim().slice(0, 500),
    link: resolvedLink,
    published: ann.published || new Date().toISOString(),
    order: Number(ann.order ?? 0),
    active: ann.active !== false,
    updatedAt: serverTimestamp(),
  };

  let finalId = '';
  try {
    const colRef = collection(db, 'announcements');
    if (
      ann.id &&
      !ann.id.startsWith('ann-') &&
      !ann.id.startsWith('temp-') &&
      !ann.id.startsWith('ann-local-')
    ) {
      const safeId = sanitizeFirestoreId(ann.id, 'ann');
      await setDoc(doc(db, 'announcements', safeId), annData, { merge: true });
      finalId = safeId;
    } else {
      const docRef = await addDoc(colRef, {
        ...annData,
        createdAt: serverTimestamp(),
      });
      finalId = docRef.id;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'announcements');
  }

  try {
    const raw = localStorage.getItem('aipeu_announcements');
    const list: AnnouncementItem[] = raw ? JSON.parse(raw) : [];
    const existingIdx = list.findIndex((a) => a.id === finalId);
    const newItem: AnnouncementItem = {
      id: finalId,
      title: annData.title,
      link: annData.link,
      published: annData.published,
      order: annData.order,
      active: annData.active,
    };
    if (existingIdx >= 0) list[existingIdx] = newItem;
    else list.push(newItem);
    localStorage.setItem('aipeu_announcements', JSON.stringify(list));

    const rawDel = localStorage.getItem('aipeu_deleted_announcement_ids');
    if (rawDel) {
      const delList: string[] = JSON.parse(rawDel);
      localStorage.setItem(
        'aipeu_deleted_announcement_ids',
        JSON.stringify(delList.filter((x) => x !== finalId))
      );
    }
  } catch {}

  return finalId;
}

export async function deleteAnnouncementFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'announcements', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `announcements/${id}`);
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
  } catch {}
}

// ================= IMPORTANT DOCUMENTS =================

export async function getImportantDocumentsFromFirestore(): Promise<ImportantDocItem[]> {
  const deletedIds = new Set<string>();
  try {
    const rawDel = localStorage.getItem('aipeu_deleted_doc_ids');
    if (rawDel) JSON.parse(rawDel).forEach((id: string) => deletedIds.add(id));
  } catch {}

  try {
    const colRef = collection(db, 'importantDocuments');
    const snapshot = await getDocs(colRef);
    const firestoreItems: ImportantDocItem[] = snapshot.docs
      .filter((d) => !isLegacySeedId(d.id) && !deletedIds.has(d.id))
      .map((d) => {
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

    const result = firestoreItems.sort((a, b) => (a.order || 0) - (b.order || 0));
    try {
      localStorage.setItem('aipeu_important_documents', JSON.stringify(result));
    } catch {}
    return result;
  } catch (err) {
    console.warn('Firestore fetch important documents offline fallback:', err);
    try {
      const raw = localStorage.getItem('aipeu_important_documents');
      if (raw) {
        const list: ImportantDocItem[] = JSON.parse(raw);
        return list.filter((d) => !deletedIds.has(d.id) && !isLegacySeedId(d.id));
      }
    } catch {}
    return DEFAULT_IMPORTANT_DOCUMENTS.filter((d) => !isLegacySeedId(d.id));
  }
}

export async function saveImportantDocumentToFirestore(
  docItem: Partial<ImportantDocItem> & { id?: string }
): Promise<string> {
  let resolvedUrl = docItem.url || '';
  if (resolvedUrl.startsWith('data:') && resolvedUrl.length >= INLINE_MAX_LENGTH) {
    resolvedUrl = await uploadFileToFirestore(resolvedUrl, docItem.title || 'document.pdf');
  }

  const docData = {
    title: (docItem.title || '').trim().slice(0, 500),
    url: resolvedUrl,
    category: (docItem.category || 'General').trim().slice(0, 120),
    order: Number(docItem.order ?? 0),
    published: docItem.published || new Date().toISOString(),
    updatedAt: serverTimestamp(),
  };

  let finalId = '';
  try {
    const colRef = collection(db, 'importantDocuments');
    if (
      docItem.id &&
      !docItem.id.startsWith('doc-') &&
      !docItem.id.startsWith('temp-') &&
      !docItem.id.startsWith('doc-local-')
    ) {
      const safeId = sanitizeFirestoreId(docItem.id, 'impdoc');
      await setDoc(doc(db, 'importantDocuments', safeId), docData, { merge: true });
      finalId = safeId;
    } else {
      const docRef = await addDoc(colRef, {
        ...docData,
        createdAt: serverTimestamp(),
      });
      finalId = docRef.id;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'importantDocuments');
  }

  try {
    const raw = localStorage.getItem('aipeu_important_documents');
    const list: ImportantDocItem[] = raw ? JSON.parse(raw) : [];
    const existingIdx = list.findIndex((d) => d.id === finalId);
    const newItem: ImportantDocItem = {
      id: finalId,
      title: docData.title,
      url: docData.url,
      category: docData.category,
      order: docData.order,
      published: docData.published,
    };
    if (existingIdx >= 0) list[existingIdx] = newItem;
    else list.push(newItem);
    localStorage.setItem('aipeu_important_documents', JSON.stringify(list));

    const rawDel = localStorage.getItem('aipeu_deleted_doc_ids');
    if (rawDel) {
      const delList: string[] = JSON.parse(rawDel);
      localStorage.setItem(
        'aipeu_deleted_doc_ids',
        JSON.stringify(delList.filter((x) => x !== finalId))
      );
    }
  } catch {}

  return finalId;
}

export async function deleteImportantDocumentFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'importantDocuments', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `importantDocuments/${id}`);
  }
  try {
    const raw = localStorage.getItem('aipeu_important_documents');
    if (raw) {
      const list: ImportantDocItem[] = JSON.parse(raw);
      localStorage.setItem(
        'aipeu_important_documents',
        JSON.stringify(list.filter((d) => d.id !== id))
      );
    }
    const rawDel = localStorage.getItem('aipeu_deleted_doc_ids');
    const delList: string[] = rawDel ? JSON.parse(rawDel) : [];
    if (!delList.includes(id)) {
      delList.push(id);
      localStorage.setItem('aipeu_deleted_doc_ids', JSON.stringify(delList));
    }
  } catch {}
}

// ================= NOTICE / CIRCULARS =================

export async function getNoticeCircularsFromFirestore(): Promise<NoticeCircularItem[]> {
  const deletedIds = new Set<string>();
  try {
    const rawDel = localStorage.getItem('aipeu_deleted_notice_ids');
    if (rawDel) JSON.parse(rawDel).forEach((id: string) => deletedIds.add(id));
  } catch {}

  try {
    const colRef = collection(db, 'noticeCirculars');
    const snapshot = await getDocs(colRef);
    const firestoreItems: NoticeCircularItem[] = snapshot.docs
      .filter((d) => !isLegacySeedId(d.id) && !deletedIds.has(d.id))
      .map((d) => {
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

    const result = firestoreItems.sort((a, b) => (a.order || 0) - (b.order || 0));
    try {
      localStorage.setItem('aipeu_notice_circulars', JSON.stringify(result));
    } catch {}
    return result;
  } catch (err) {
    console.warn('Firestore fetch notice circulars offline fallback:', err);
    try {
      const raw = localStorage.getItem('aipeu_notice_circulars');
      if (raw) {
        const list: NoticeCircularItem[] = JSON.parse(raw);
        return list.filter((nc) => !deletedIds.has(nc.id) && !isLegacySeedId(nc.id));
      }
    } catch {}
    return DEFAULT_NOTICE_CIRCULARS.filter((nc) => !isLegacySeedId(nc.id));
  }
}

export async function saveNoticeCircularToFirestore(
  nc: Partial<NoticeCircularItem> & { id?: string }
): Promise<string> {
  let resolvedUrl = nc.url || '';
  if (resolvedUrl.startsWith('data:') && resolvedUrl.length >= INLINE_MAX_LENGTH) {
    resolvedUrl = await uploadFileToFirestore(resolvedUrl, nc.title || 'notice.pdf');
  }

  const ncData = {
    title: (nc.title || '').trim().slice(0, 500),
    category: (nc.category || 'NOTICE').trim().slice(0, 120),
    published: nc.published || new Date().toISOString().split('T')[0],
    url: resolvedUrl,
    order: Number(nc.order ?? 0),
    updatedAt: serverTimestamp(),
  };

  let finalId = '';
  try {
    const colRef = collection(db, 'noticeCirculars');
    if (
      nc.id &&
      !nc.id.startsWith('nc-') &&
      !nc.id.startsWith('temp-') &&
      !nc.id.startsWith('nc-local-')
    ) {
      const safeId = sanitizeFirestoreId(nc.id, 'notice');
      await setDoc(doc(db, 'noticeCirculars', safeId), ncData, { merge: true });
      finalId = safeId;
    } else {
      const docRef = await addDoc(colRef, {
        ...ncData,
        createdAt: serverTimestamp(),
      });
      finalId = docRef.id;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'noticeCirculars');
  }

  try {
    const raw = localStorage.getItem('aipeu_notice_circulars');
    const list: NoticeCircularItem[] = raw ? JSON.parse(raw) : [];
    const existingIdx = list.findIndex((n) => n.id === finalId);
    const newItem: NoticeCircularItem = {
      id: finalId,
      title: ncData.title,
      category: ncData.category,
      published: ncData.published,
      url: ncData.url,
      order: ncData.order,
    };
    if (existingIdx >= 0) list[existingIdx] = newItem;
    else list.push(newItem);
    localStorage.setItem('aipeu_notice_circulars', JSON.stringify(list));

    const rawDel = localStorage.getItem('aipeu_deleted_notice_ids');
    if (rawDel) {
      const delList: string[] = JSON.parse(rawDel);
      localStorage.setItem(
        'aipeu_deleted_notice_ids',
        JSON.stringify(delList.filter((x) => x !== finalId))
      );
    }
  } catch {}

  return finalId;
}

export async function deleteNoticeCircularFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'noticeCirculars', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `noticeCirculars/${id}`);
  }
  try {
    const raw = localStorage.getItem('aipeu_notice_circulars');
    if (raw) {
      const list: NoticeCircularItem[] = JSON.parse(raw);
      localStorage.setItem(
        'aipeu_notice_circulars',
        JSON.stringify(list.filter((n) => n.id !== id))
      );
    }
    const rawDel = localStorage.getItem('aipeu_deleted_notice_ids');
    const delList: string[] = rawDel ? JSON.parse(rawDel) : [];
    if (!delList.includes(id)) {
      delList.push(id);
      localStorage.setItem('aipeu_deleted_notice_ids', JSON.stringify(delList));
    }
  } catch {}
}

// ================= UNION DOCUMENTS & RULINGS (EXECUTIVE BODY) =================

export async function getUnionDocumentsAndRulingsFromFirestore(): Promise<UnionDocumentRuling[]> {
  const deletedIds = new Set<string>();
  try {
    const rawDel = localStorage.getItem('aipeu_deleted_ruling_ids');
    if (rawDel) JSON.parse(rawDel).forEach((id: string) => deletedIds.add(id));
  } catch {}

  try {
    const colRef = collection(db, 'unionDocumentsAndRulings');
    const snapshot = await getDocs(colRef);
    const firestoreItems: UnionDocumentRuling[] = snapshot.docs.map((d) => {
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

    const map = new Map<string, UnionDocumentRuling>();
    DEFAULT_UNION_DOCUMENTS_AND_RULINGS.forEach((item) => {
      if (!deletedIds.has(item.id)) map.set(item.id, item);
    });
    firestoreItems.forEach((item) => {
      if (!deletedIds.has(item.id)) map.set(item.id, item);
    });

    const result = Array.from(map.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
    try {
      localStorage.setItem('aipeu_union_documents_rulings', JSON.stringify(result));
    } catch {}
    return result;
  } catch (err) {
    console.warn('Firestore fetch union documents offline fallback:', err);
    try {
      const raw = localStorage.getItem('aipeu_union_documents_rulings');
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_UNION_DOCUMENTS_AND_RULINGS;
  }
}

export async function saveUnionDocumentRulingToFirestore(
  item: Partial<UnionDocumentRuling> & { id?: string }
): Promise<string> {
  let resolvedLink = item.link || '';
  if (resolvedLink.startsWith('data:') && resolvedLink.length >= INLINE_MAX_LENGTH) {
    resolvedLink = await uploadFileToFirestore(resolvedLink, `${item.title || 'ruling'}.pdf`);
  }

  const docData = {
    title: (item.title || '').trim().slice(0, 500),
    desc: (item.desc || '').trim().slice(0, 2000),
    link: resolvedLink,
    type: (item.type || 'Legal').trim().slice(0, 120),
    order: Number(item.order ?? 0),
    published: item.published || new Date().toISOString().split('T')[0],
    updatedAt: serverTimestamp(),
  };

  let finalId = '';
  try {
    const colRef = collection(db, 'unionDocumentsAndRulings');
    if (item.id && !item.id.startsWith('temp-') && !item.id.startsWith('ruling-local-')) {
      const safeId = sanitizeFirestoreId(item.id, 'ruling');
      await setDoc(doc(db, 'unionDocumentsAndRulings', safeId), docData, { merge: true });
      finalId = safeId;
    } else {
      const docRef = await addDoc(colRef, {
        ...docData,
        createdAt: serverTimestamp(),
      });
      finalId = docRef.id;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'unionDocumentsAndRulings');
  }

  try {
    const raw = localStorage.getItem('aipeu_union_documents_rulings');
    const list: UnionDocumentRuling[] = raw
      ? JSON.parse(raw)
      : [...DEFAULT_UNION_DOCUMENTS_AND_RULINGS];
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
    if (existingIdx >= 0) list[existingIdx] = newItem;
    else list.push(newItem);
    localStorage.setItem('aipeu_union_documents_rulings', JSON.stringify(list));

    const rawDel = localStorage.getItem('aipeu_deleted_ruling_ids');
    if (rawDel) {
      const delList: string[] = JSON.parse(rawDel);
      localStorage.setItem(
        'aipeu_deleted_ruling_ids',
        JSON.stringify(delList.filter((x) => x !== finalId))
      );
    }
  } catch {}

  return finalId;
}

export async function deleteUnionDocumentRulingFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'unionDocumentsAndRulings', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `unionDocumentsAndRulings/${id}`);
  }
  try {
    const raw = localStorage.getItem('aipeu_union_documents_rulings');
    if (raw) {
      const list: UnionDocumentRuling[] = JSON.parse(raw);
      localStorage.setItem(
        'aipeu_union_documents_rulings',
        JSON.stringify(list.filter((r) => r.id !== id))
      );
    }
    const rawDel = localStorage.getItem('aipeu_deleted_ruling_ids');
    const delList: string[] = rawDel ? JSON.parse(rawDel) : [];
    if (!delList.includes(id)) {
      delList.push(id);
      localStorage.setItem('aipeu_deleted_ruling_ids', JSON.stringify(delList));
    }
  } catch {}
}

// ================= ORDERS / RULINGS / GUIDE =================

export const DEFAULT_ORDERS_RULINGS_GUIDES: OrderRulingGuideItem[] = [];

export async function getOrdersRulingsGuidesFromFirestore(): Promise<OrderRulingGuideItem[]> {
  const deletedIds = new Set<string>();
  try {
    const rawDel = localStorage.getItem('aipeu_deleted_org_ids');
    if (rawDel) JSON.parse(rawDel).forEach((id: string) => deletedIds.add(id));
  } catch {}

  try {
    const colRef = collection(db, 'ordersRulingsGuides');
    const snapshot = await getDocs(colRef);
    const firestoreItems: OrderRulingGuideItem[] = snapshot.docs
      .filter((d) => !isLegacySeedId(d.id) && !deletedIds.has(d.id))
      .map((d) => {
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

    const sorted = firestoreItems.sort((a, b) => {
      if ((a.order ?? 0) !== (b.order ?? 0)) return (a.order ?? 0) - (b.order ?? 0);
      return (b.published || '').localeCompare(a.published || '');
    });
    try {
      localStorage.setItem('aipeu_orders_rulings_guides', JSON.stringify(sorted));
    } catch {}
    return sorted;
  } catch (err) {
    console.warn('Firestore fetch orders/rulings/guides offline fallback:', err);
    try {
      const localItems: OrderRulingGuideItem[] = JSON.parse(
        localStorage.getItem('aipeu_orders_rulings_guides') || '[]'
      );
      return localItems.filter((item) => !deletedIds.has(item.id) && !isLegacySeedId(item.id));
    } catch {
      return [];
    }
  }
}

// ================= BATCH PURGE / CLEAR ALL HELPERS =================
export async function clearAllAnnouncementsFromFirestore(): Promise<void> {
  try {
    const colRef = collection(db, 'announcements');
    const snapshot = await getDocs(colRef);
    await Promise.all(snapshot.docs.map((d) => deleteDoc(doc(db, 'announcements', d.id))));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, 'announcements');
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
    handleFirestoreError(err, OperationType.DELETE, 'importantDocuments');
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
    handleFirestoreError(err, OperationType.DELETE, 'noticeCirculars');
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
    handleFirestoreError(err, OperationType.DELETE, 'ordersRulingsGuides');
  }
  try {
    localStorage.setItem('aipeu_orders_rulings_guides', '[]');
  } catch {}
}

export async function saveOrderRulingGuideToFirestore(
  item: Partial<OrderRulingGuideItem> & { id?: string }
): Promise<string> {
  let resolvedDocUrl = item.documentUrl || '';
  if (resolvedDocUrl.startsWith('data:') && resolvedDocUrl.length >= INLINE_MAX_LENGTH) {
    resolvedDocUrl = await uploadFileToFirestore(resolvedDocUrl, item.fileName || 'order.pdf');
  }

  const docData = {
    fileName: (item.fileName || '').trim().slice(0, 500),
    folderName: (item.folderName || 'General').trim().slice(0, 200),
    category: (item.category || 'Orders').trim().slice(0, 120),
    documentUrl: resolvedDocUrl,
    published: item.published || new Date().toISOString().split('T')[0],
    order: Number(item.order ?? 0),
    notes: (item.notes || '').trim().slice(0, 3000),
    updatedAt: serverTimestamp(),
  };

  let finalId = '';
  try {
    const colRef = collection(db, 'ordersRulingsGuides');
    if (
      item.id &&
      !item.id.startsWith('org-seed-') &&
      !item.id.startsWith('temp-') &&
      !item.id.startsWith('org-local-')
    ) {
      const safeId = sanitizeFirestoreId(item.id, 'org');
      await setDoc(doc(db, 'ordersRulingsGuides', safeId), docData, { merge: true });
      finalId = safeId;
    } else {
      const docRef = await addDoc(colRef, {
        ...docData,
        createdAt: serverTimestamp(),
      });
      finalId = docRef.id;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'ordersRulingsGuides');
  }

  try {
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
    if (existingIdx >= 0) localList[existingIdx] = newItem;
    else localList.unshift(newItem);
    localStorage.setItem('aipeu_orders_rulings_guides', JSON.stringify(localList));
  } catch {}

  return finalId;
}

export async function deleteOrderRulingGuideFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'ordersRulingsGuides', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `ordersRulingsGuides/${id}`);
  }
  try {
    const localList: OrderRulingGuideItem[] = JSON.parse(
      localStorage.getItem('aipeu_orders_rulings_guides') || '[]'
    );
    localStorage.setItem(
      'aipeu_orders_rulings_guides',
      JSON.stringify(localList.filter((x) => x.id !== id))
    );
    const rawDel = localStorage.getItem('aipeu_deleted_org_ids');
    const delList: string[] = rawDel ? JSON.parse(rawDel) : [];
    if (!delList.includes(id)) {
      delList.push(id);
      localStorage.setItem('aipeu_deleted_org_ids', JSON.stringify(delList));
    }
  } catch {}
}

// ================= REAL-TIME FIRESTORE SUBSCRIPTIONS (CROSS-DEVICE SYNC) =================

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
    (err) => logSnapshotError(err, 'announcements')
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
    (err) => logSnapshotError(err, 'importantDocuments')
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
    (err) => logSnapshotError(err, 'noticeCirculars')
  );
}

export function subscribeToUnionDocumentsAndRulings(
  callback: (items: UnionDocumentRuling[]) => void
): () => void {
  const colRef = collection(db, 'unionDocumentsAndRulings');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const deletedIds = new Set<string>();
      try {
        const rawDel = localStorage.getItem('aipeu_deleted_ruling_ids');
        if (rawDel) JSON.parse(rawDel).forEach((id: string) => deletedIds.add(id));
      } catch {}

      const map = new Map<string, UnionDocumentRuling>();
      DEFAULT_UNION_DOCUMENTS_AND_RULINGS.forEach((item) => {
        if (!deletedIds.has(item.id)) map.set(item.id, item);
      });
      snapshot.forEach((d) => {
        if (!deletedIds.has(d.id)) {
          const data = d.data();
          map.set(d.id, {
            id: d.id,
            title: data.title || '',
            desc: data.desc || '',
            link: data.link || '',
            type: data.type || 'Legal',
            order: data.order ?? 0,
            published: data.published || '',
          });
        }
      });

      const result = Array.from(map.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
      try {
        localStorage.setItem('aipeu_union_documents_rulings', JSON.stringify(result));
      } catch {}
      callback(result);
    },
    (err) => logSnapshotError(err, 'unionDocumentsAndRulings')
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
    (err) => logSnapshotError(err, 'ordersRulingsGuides')
  );
}

export function subscribeToNewsItems(
  callback: (items: NewsSliderItem[]) => void
): () => void {
  const colRef = collection(db, 'newsSliderItems');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const deletedIds = new Set<string>();
      try {
        const rawDel = localStorage.getItem('aipeu_deleted_news_ids');
        if (rawDel) JSON.parse(rawDel).forEach((id: string) => deletedIds.add(id));
      } catch {}

      const map = new Map<string, NewsSliderItem>();
      DEFAULT_NEWS_ITEMS.forEach((item) => {
        if (!deletedIds.has(item.id)) map.set(item.id, item);
      });
      snapshot.forEach((d) => {
        if (!deletedIds.has(d.id)) {
          const data = d.data();
          map.set(d.id, {
            id: d.id,
            title: data.title || '',
            category: data.category || 'LATEST NEWS',
            link: data.link || '',
            isUrgent: !!data.isUrgent,
            published: data.published || '',
            order: data.order ?? 0,
          });
        }
      });

      const items = Array.from(map.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
      try {
        localStorage.setItem('aipeu_news_items', JSON.stringify(items));
      } catch {}
      callback(items);
    },
    (err) => logSnapshotError(err, 'newsSliderItems')
  );
}

export function subscribeToHeroSlides(
  callback: (slides: HeroSlide[]) => void
): () => void {
  const colRef = collection(db, 'heroSlides');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const deletedIds = new Set<string>();
      try {
        const rawDel = localStorage.getItem('aipeu_deleted_slide_ids');
        if (rawDel) JSON.parse(rawDel).forEach((id: string) => deletedIds.add(id));
      } catch {}

      const map = new Map<string, HeroSlide>();
      DEFAULT_HERO_SLIDES.forEach((s) => {
        if (!deletedIds.has(s.id)) map.set(s.id, s);
      });
      snapshot.forEach((d) => {
        if (!deletedIds.has(d.id)) {
          const data = d.data();
          map.set(d.id, {
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
        }
      });

      const slides = Array.from(map.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
      try {
        localStorage.setItem('aipeu_hero_slides', JSON.stringify(slides));
      } catch {}
      callback(slides);
    },
    (err) => logSnapshotError(err, 'heroSlides')
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
    (err) => logSnapshotError(err, 'executiveMembers')
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
          author: data.author || DEFAULT_TOOL_ADMIN_AUTHOR,
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
    (err) => logSnapshotError(err, 'circulars')
  );
}

// ================= MY APPS & ONLINE PORTALS FIRESTORE SYNC =================
export async function getMyAppsFromFirestore(): Promise<CustomPortalApp[]> {
  const deletedIds = new Set<string>();
  try {
    const rawDel = localStorage.getItem('aipeu_deleted_app_ids');
    if (rawDel) JSON.parse(rawDel).forEach((id: string) => deletedIds.add(id));
  } catch {}

  try {
    const colRef = collection(db, 'customPortalApps');
    const snap = await getDocs(colRef);
    const firestoreApps: CustomPortalApp[] = snap.docs.map((d) => {
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
    return merged;
  } catch (err) {
    console.warn('Firestore fetch myApps offline fallback:', err);
    try {
      const raw = localStorage.getItem('aipeu_admin_apps');
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_MY_APPS;
  }
}

export async function saveMyAppToFirestore(app: CustomPortalApp): Promise<string> {
  const targetId =
    app.id && !app.id.startsWith('temp-')
      ? sanitizeFirestoreId(app.id, 'app')
      : `app-${Date.now()}`;

  let codeSnippet = app.codeSnippet;
  if (codeSnippet && codeSnippet.length >= INLINE_MAX_LENGTH) {
    if (codeSnippet.startsWith('data:')) {
      codeSnippet = await uploadFileToFirestore(codeSnippet, `${app.name || 'tool'}.html`);
    } else {
      codeSnippet = await uploadTextToFirestore(codeSnippet, `${app.name || 'tool'}.html`, 'text/html');
    }
  }

  const appData = {
    name: (app.name || '').trim().slice(0, 300),
    category: (app.category || 'Others').trim().slice(0, 120),
    sourceType: (app.sourceType === 'url' ? 'url' : 'code') as 'code' | 'url',
    ...(codeSnippet !== undefined ? { codeSnippet } : {}),
    ...(app.url !== undefined ? { url: app.url.trim().slice(0, 2000) } : {}),
    description: (app.description || '').trim().slice(0, 2000),
    fileSize: (app.fileSize || '').slice(0, 64),
    createdAt: app.createdAt || new Date().toISOString().split('T')[0],
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'customPortalApps', targetId), appData, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `customPortalApps/${targetId}`);
  }

  try {
    const raw = localStorage.getItem('aipeu_admin_apps');
    const list: CustomPortalApp[] = raw ? JSON.parse(raw) : [...DEFAULT_MY_APPS];
    const idx = list.findIndex((a) => a.id === targetId);
    const updatedApp: CustomPortalApp = {
      id: targetId,
      name: appData.name,
      category: appData.category,
      sourceType: appData.sourceType,
      codeSnippet: appData.codeSnippet,
      url: appData.url,
      description: appData.description,
      fileSize: appData.fileSize,
      createdAt: appData.createdAt,
    };
    if (idx >= 0) list[idx] = updatedApp;
    else list.unshift(updatedApp);
    localStorage.setItem('aipeu_admin_apps', JSON.stringify(list));

    const rawDel = localStorage.getItem('aipeu_deleted_app_ids');
    if (rawDel) {
      const delList: string[] = JSON.parse(rawDel);
      localStorage.setItem(
        'aipeu_deleted_app_ids',
        JSON.stringify(delList.filter((x) => x !== targetId))
      );
    }
  } catch {}

  window.dispatchEvent(new CustomEvent('my-apps-updated'));
  return targetId;
}

export async function deleteMyAppFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'customPortalApps', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `customPortalApps/${id}`);
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
  } catch {}

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

      const map = new Map<string, CustomPortalApp>();
      DEFAULT_MY_APPS.forEach((a) => {
        if (!deletedIds.has(a.id)) map.set(a.id, a);
      });
      snapshot.forEach((d) => {
        if (!deletedIds.has(d.id)) {
          const data = d.data();
          map.set(d.id, {
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

      const merged = Array.from(map.values());
      try {
        localStorage.setItem('aipeu_admin_apps', JSON.stringify(merged));
      } catch {}
      callback(merged);
    },
    (err) => logSnapshotError(err, 'customPortalApps')
  );
}

// ================= PHOTO GALLERY (Firestore Collection: /galleryPhotos) =================

export async function getGalleryPhotosFromFirestore(): Promise<GalleryPhoto[]> {
  const deletedIds = new Set<string>();
  try {
    const rawDel = localStorage.getItem('aipeu_deleted_gallery_ids');
    if (rawDel) JSON.parse(rawDel).forEach((id: string) => deletedIds.add(id));
  } catch {}

  try {
    const snap = await getDocs(collection(db, 'galleryPhotos'));
    const firestorePhotos: GalleryPhoto[] = [];
    snap.forEach((d) => {
      if (d.exists()) {
        const data = d.data();
        firestorePhotos.push({
          id: d.id,
          title: data.title || '',
          imageUrl: data.imageUrl || data.url || '',
          url: data.url || data.imageUrl || '',
          category: data.category || 'General',
          date: data.date || '',
          caption: data.caption,
        });
      }
    });

    const map = new Map<string, GalleryPhoto>();
    DEFAULT_GALLERY.forEach((g) => {
      if (!deletedIds.has(g.id)) map.set(g.id, g);
    });
    firestorePhotos.forEach((g) => {
      if (!deletedIds.has(g.id)) map.set(g.id, g);
    });
    const result = Array.from(map.values());
    try {
      localStorage.setItem('aipeu_admin_gallery', JSON.stringify(result));
    } catch {}
    return result;
  } catch (err) {
    console.warn('Firestore fetch gallery offline fallback:', err);
    try {
      const raw = localStorage.getItem('aipeu_admin_gallery');
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_GALLERY;
  }
}

export async function saveGalleryPhotoToFirestore(photo: GalleryPhoto): Promise<void> {
  const safeId = sanitizeFirestoreId(photo.id, 'gal');
  let resolvedUrl = photo.imageUrl || photo.url || '';
  if (resolvedUrl.startsWith('data:') && resolvedUrl.length >= INLINE_MAX_LENGTH) {
    resolvedUrl = await uploadFileToFirestore(resolvedUrl, `${photo.title || 'photo'}.jpg`);
  }

  const payload = {
    title: (photo.title || '').trim().slice(0, 300),
    imageUrl: resolvedUrl,
    url: resolvedUrl,
    category: (photo.category || 'General').trim().slice(0, 120),
    date: (photo.date || new Date().toISOString().split('T')[0]).slice(0, 64),
    caption: (photo.caption || '').trim().slice(0, 1000),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'galleryPhotos', safeId), payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `galleryPhotos/${safeId}`);
  }

  try {
    const raw = localStorage.getItem('aipeu_admin_gallery');
    const list: GalleryPhoto[] = raw ? JSON.parse(raw) : [...DEFAULT_GALLERY];
    const savedPhoto: GalleryPhoto = {
      id: safeId,
      title: payload.title,
      imageUrl: payload.imageUrl,
      url: payload.url,
      category: payload.category,
      date: payload.date,
      caption: payload.caption,
    };
    const updated = [savedPhoto, ...list.filter((p) => p.id !== safeId)];
    localStorage.setItem('aipeu_admin_gallery', JSON.stringify(updated));
  } catch {}
}

export async function deleteGalleryPhotoFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'galleryPhotos', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `galleryPhotos/${id}`);
  }
  try {
    const deleted: string[] = JSON.parse(localStorage.getItem('aipeu_deleted_gallery_ids') || '[]');
    if (!deleted.includes(id)) {
      deleted.push(id);
      localStorage.setItem('aipeu_deleted_gallery_ids', JSON.stringify(deleted));
    }
    const raw = localStorage.getItem('aipeu_admin_gallery');
    if (raw) {
      const list: GalleryPhoto[] = JSON.parse(raw);
      localStorage.setItem('aipeu_admin_gallery', JSON.stringify(list.filter((p) => p.id !== id)));
    }
  } catch {}
}

export function subscribeToGalleryPhotos(
  callback: (photos: GalleryPhoto[]) => void
): () => void {
  return onSnapshot(
    collection(db, 'galleryPhotos'),
    (snap) => {
      const deletedIds = new Set<string>(
        JSON.parse(localStorage.getItem('aipeu_deleted_gallery_ids') || '[]')
      );
      const map = new Map<string, GalleryPhoto>();
      DEFAULT_GALLERY.forEach((g) => {
        if (!deletedIds.has(g.id)) map.set(g.id, g);
      });
      snap.forEach((d) => {
        if (d.exists() && !deletedIds.has(d.id)) {
          const data = d.data();
          map.set(d.id, {
            id: d.id,
            title: data.title || '',
            imageUrl: data.imageUrl || data.url || '',
            url: data.url || data.imageUrl || '',
            category: data.category || 'General',
            date: data.date || '',
            caption: data.caption,
          });
        }
      });
      const merged = Array.from(map.values());
      try {
        localStorage.setItem('aipeu_admin_gallery', JSON.stringify(merged));
      } catch {}
      callback(merged);
    },
    (err) => logSnapshotError(err, 'galleryPhotos')
  );
}

// ================= DOWNLOADABLE FORMS (Firestore Collection: /downloadableForms) =================

export async function getDownloadableFormsFromFirestore(): Promise<DownloadableForm[]> {
  const deletedIds = new Set<string>();
  try {
    const rawDel = localStorage.getItem('aipeu_deleted_form_ids');
    if (rawDel) JSON.parse(rawDel).forEach((id: string) => deletedIds.add(id));
  } catch {}

  try {
    const snap = await getDocs(collection(db, 'downloadableForms'));
    const firestoreForms: DownloadableForm[] = [];
    snap.forEach((d) => {
      if (d.exists()) {
        const data = d.data();
        firestoreForms.push({
          id: d.id,
          title: data.title || '',
          formCode: data.formCode || '',
          category: data.category || 'Service Matters',
          downloadUrl: data.downloadUrl || '',
          fileSize: data.fileSize,
        });
      }
    });

    const map = new Map<string, DownloadableForm>();
    (DEFAULT_FORMS_LIST as DownloadableForm[]).forEach((f) => {
      if (!deletedIds.has(f.id)) map.set(f.id, f);
    });
    firestoreForms.forEach((f) => {
      if (!deletedIds.has(f.id)) map.set(f.id, f);
    });
    const result = Array.from(map.values());
    try {
      localStorage.setItem('aipeu_admin_forms', JSON.stringify(result));
    } catch {}
    return result;
  } catch (err) {
    console.warn('Firestore fetch forms offline fallback:', err);
    try {
      const raw = localStorage.getItem('aipeu_admin_forms');
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_FORMS_LIST as DownloadableForm[];
  }
}

export async function saveDownloadableFormToFirestore(form: DownloadableForm): Promise<void> {
  const safeId = sanitizeFirestoreId(form.id, 'form');
  let resolvedUrl = form.downloadUrl || '';
  if (resolvedUrl.startsWith('data:') && resolvedUrl.length >= INLINE_MAX_LENGTH) {
    resolvedUrl = await uploadFileToFirestore(resolvedUrl, `${form.title || 'form'}.pdf`);
  }

  const payload = {
    title: (form.title || '').trim().slice(0, 300),
    formCode: (form.formCode || 'FORM').trim().slice(0, 100),
    category: (form.category || 'Service Matters').trim().slice(0, 120),
    downloadUrl: resolvedUrl,
    fileSize: (form.fileSize || '').slice(0, 64),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'downloadableForms', safeId), payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `downloadableForms/${safeId}`);
  }

  try {
    const raw = localStorage.getItem('aipeu_admin_forms');
    const list: DownloadableForm[] = raw ? JSON.parse(raw) : [...(DEFAULT_FORMS_LIST as DownloadableForm[])];
    const savedForm: DownloadableForm = {
      id: safeId,
      title: payload.title,
      formCode: payload.formCode,
      category: payload.category,
      downloadUrl: payload.downloadUrl,
      fileSize: payload.fileSize,
    };
    const updated = [savedForm, ...list.filter((f) => f.id !== safeId)];
    localStorage.setItem('aipeu_admin_forms', JSON.stringify(updated));
  } catch {}
}

export async function deleteDownloadableFormFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'downloadableForms', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `downloadableForms/${id}`);
  }
  try {
    const deleted: string[] = JSON.parse(localStorage.getItem('aipeu_deleted_form_ids') || '[]');
    if (!deleted.includes(id)) {
      deleted.push(id);
      localStorage.setItem('aipeu_deleted_form_ids', JSON.stringify(deleted));
    }
    const raw = localStorage.getItem('aipeu_admin_forms');
    if (raw) {
      const list: DownloadableForm[] = JSON.parse(raw);
      localStorage.setItem('aipeu_admin_forms', JSON.stringify(list.filter((f) => f.id !== id)));
    }
  } catch {}
}

export function subscribeToDownloadableForms(
  callback: (forms: DownloadableForm[]) => void
): () => void {
  return onSnapshot(
    collection(db, 'downloadableForms'),
    (snap) => {
      const deletedIds = new Set<string>(
        JSON.parse(localStorage.getItem('aipeu_deleted_form_ids') || '[]')
      );
      const map = new Map<string, DownloadableForm>();
      (DEFAULT_FORMS_LIST as DownloadableForm[]).forEach((f) => {
        if (!deletedIds.has(f.id)) map.set(f.id, f);
      });
      snap.forEach((d) => {
        if (d.exists() && !deletedIds.has(d.id)) {
          const data = d.data();
          map.set(d.id, {
            id: d.id,
            title: data.title || '',
            formCode: data.formCode || '',
            category: data.category || 'Service Matters',
            downloadUrl: data.downloadUrl || '',
            fileSize: data.fileSize,
          });
        }
      });
      const merged = Array.from(map.values());
      try {
        localStorage.setItem('aipeu_admin_forms', JSON.stringify(merged));
      } catch {}
      callback(merged);
    },
    (err) => logSnapshotError(err, 'downloadableForms')
  );
}

// ================= EMPLOYEE RESOURCES (Firestore Collection: /employeeResources) =================

export async function getEmployeeResourcesFromFirestore(): Promise<EmployeeResource[]> {
  const deletedIds = new Set<string>();
  try {
    const rawDel = localStorage.getItem('aipeu_deleted_res_ids');
    if (rawDel) JSON.parse(rawDel).forEach((id: string) => deletedIds.add(id));
  } catch {}

  try {
    const snap = await getDocs(collection(db, 'employeeResources'));
    const firestoreRes: EmployeeResource[] = [];
    snap.forEach((d) => {
      if (d.exists()) {
        const data = d.data();
        firestoreRes.push({
          id: d.id,
          title: data.title || '',
          category: data.category || 'Postal Manuals',
          url: data.url || '',
          description: data.description,
        });
      }
    });

    const map = new Map<string, EmployeeResource>();
    DEFAULT_EMPLOYEE_RESOURCES.forEach((r) => {
      if (!deletedIds.has(r.id)) map.set(r.id, r);
    });
    firestoreRes.forEach((r) => {
      if (!deletedIds.has(r.id)) map.set(r.id, r);
    });
    const result = Array.from(map.values());
    try {
      localStorage.setItem('aipeu_admin_resources', JSON.stringify(result));
    } catch {}
    return result;
  } catch (err) {
    console.warn('Firestore fetch employee resources offline fallback:', err);
    try {
      const raw = localStorage.getItem('aipeu_admin_resources');
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_EMPLOYEE_RESOURCES;
  }
}

export async function saveEmployeeResourceToFirestore(res: EmployeeResource): Promise<void> {
  const safeId = sanitizeFirestoreId(res.id, 'res');
  let resolvedUrl = res.url || '';
  if (resolvedUrl.startsWith('data:') && resolvedUrl.length >= INLINE_MAX_LENGTH) {
    resolvedUrl = await uploadFileToFirestore(resolvedUrl, `${res.title || 'resource'}.pdf`);
  }

  const payload = {
    title: (res.title || '').trim().slice(0, 300),
    category: (res.category || 'Postal Manuals').trim().slice(0, 120),
    url: resolvedUrl,
    description: (res.description || '').trim().slice(0, 1000),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'employeeResources', safeId), payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `employeeResources/${safeId}`);
  }

  try {
    const raw = localStorage.getItem('aipeu_admin_resources');
    const list: EmployeeResource[] = raw ? JSON.parse(raw) : [...DEFAULT_EMPLOYEE_RESOURCES];
    const savedRes: EmployeeResource = {
      id: safeId,
      title: payload.title,
      category: payload.category,
      url: payload.url,
      description: payload.description,
    };
    const updated = [savedRes, ...list.filter((r) => r.id !== safeId)];
    localStorage.setItem('aipeu_admin_resources', JSON.stringify(updated));
  } catch {}
}

export async function deleteEmployeeResourceFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'employeeResources', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `employeeResources/${id}`);
  }
  try {
    const deleted: string[] = JSON.parse(localStorage.getItem('aipeu_deleted_res_ids') || '[]');
    if (!deleted.includes(id)) {
      deleted.push(id);
      localStorage.setItem('aipeu_deleted_res_ids', JSON.stringify(deleted));
    }
    const raw = localStorage.getItem('aipeu_admin_resources');
    if (raw) {
      const list: EmployeeResource[] = JSON.parse(raw);
      localStorage.setItem(
        'aipeu_admin_resources',
        JSON.stringify(list.filter((r) => r.id !== id))
      );
    }
  } catch {}
}

export function subscribeToEmployeeResources(
  callback: (resources: EmployeeResource[]) => void
): () => void {
  return onSnapshot(
    collection(db, 'employeeResources'),
    (snap) => {
      const deletedIds = new Set<string>(
        JSON.parse(localStorage.getItem('aipeu_deleted_res_ids') || '[]')
      );
      const map = new Map<string, EmployeeResource>();
      DEFAULT_EMPLOYEE_RESOURCES.forEach((r) => {
        if (!deletedIds.has(r.id)) map.set(r.id, r);
      });
      snap.forEach((d) => {
        if (d.exists() && !deletedIds.has(d.id)) {
          const data = d.data();
          map.set(d.id, {
            id: d.id,
            title: data.title || '',
            category: data.category || 'Postal Manuals',
            url: data.url || '',
            description: data.description,
          });
        }
      });
      const merged = Array.from(map.values());
      try {
        localStorage.setItem('aipeu_admin_resources', JSON.stringify(merged));
      } catch {}
      callback(merged);
    },
    (err) => logSnapshotError(err, 'employeeResources')
  );
}
