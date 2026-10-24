import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDocFromServer,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { BlogPost, OfficeBearer, HeroSlide, NewsSliderItem, AnnouncementItem, ImportantDocItem, NoticeCircularItem, UnionDocumentRuling } from '../types';
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

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp({
  projectId: firebaseConfig.projectId,
  appId: firebaseConfig.appId,
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
});

// Initialize Firestore using the designated databaseId from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

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
  const colRef = collection(db, 'circulars');
  const publishedDate = new Date().toISOString();
  
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

  return docRef.id;
}

export async function updateCircularInFirestore(id: string, input: Partial<NewCircularInput>): Promise<void> {
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
}

export async function getCircularsFromFirestore(): Promise<BlogPost[]> {
  try {
    const colRef = collection(db, 'circulars');
    const q = query(colRef, orderBy('published', 'desc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Seed default circulars so all documents have real Firestore records that can be modified & deleted
      for (const p of (fallbackPosts as BlogPost[])) {
        await addDoc(colRef, {
          title: p.title,
          category: p.categories?.[0] || 'UNION NEWS',
          snippet: p.snippet || '',
          contentHtml: p.contentHtml || `<p>${p.snippet || ''}</p>`,
          driveLinks: p.driveLinks || [],
          images: p.images || [],
          published: p.published || new Date().toISOString(),
          updated: p.updated || p.published || new Date().toISOString(),
          author: p.author || 'Divisional Secretary, AIPEU Dhenkanal',
          urgent: false,
          createdAt: serverTimestamp(),
        });
      }
      const seededSnap = await getDocs(q);
      return seededSnap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || '',
          published: data.published || new Date().toISOString(),
          updated: data.updated || data.published || '',
          author: data.author || 'AIPEU Dhenkanal',
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

    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title || '',
        published: data.published || new Date().toISOString(),
        updated: data.updated || data.published || '',
        author: data.author || 'AIPEU Dhenkanal',
        url: data.url || '',
        categories: data.category ? [data.category] : ['UNION NEWS'],
        snippet: data.snippet || '',
        contentHtml: data.contentHtml || '',
        images: data.images || [],
        driveLinks: data.driveLinks || [],
        isSavedOffline: false,
      };
    });
  } catch (err) {
    console.error('Error fetching circulars from Firestore:', err);
    return [];
  }
}

export async function deleteCircularFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'circulars', id));
  } catch (err) {
    console.warn(`Could not delete document ${id} directly from circulars collection:`, err);
  }
}

// ================= EXECUTIVE MEMBERS =================

export async function getExecutiveMembersFromFirestore(): Promise<OfficeBearer[]> {
  try {
    const colRef = collection(db, 'executiveMembers');
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      // Seed initial members into Firestore if empty
      for (const m of DEFAULT_OFFICE_BEARERS) {
        await addDoc(colRef, m);
      }
      return DEFAULT_OFFICE_BEARERS;
    }

    const sortedList = snapshot.docs.map((d) => {
      const data = d.data();
      // If photoUrl not stored in Firestore document, check if default seed has a photo for this member
      const matchedDefault = DEFAULT_OFFICE_BEARERS.find(
        (def) => def.name.trim().toLowerCase() === (data.name || '').trim().toLowerCase()
      );

      return {
        id: d.id,
        name: data.name || '',
        designation: data.designation || '',
        branch: data.branch || '',
        phone: data.phone || '',
        location: data.location || '',
        roleType: data.roleType || 'executive',
        photoUrl: data.photoUrl || matchedDefault?.photoUrl || '',
      } as OfficeBearer & { id: string };
    });

    return sortOfficeBearers(sortedList);
  } catch (err) {
    console.error('Error fetching executive members from Firestore:', err);
    return sortOfficeBearers(DEFAULT_OFFICE_BEARERS);
  }
}

export async function saveExecutiveMemberToFirestore(
  member: OfficeBearer & { id?: string }
): Promise<string> {
  const colRef = collection(db, 'executiveMembers');
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

  if (member.id && !member.id.startsWith('temp-')) {
    const memberDoc = doc(db, 'executiveMembers', member.id);
    await updateDoc(memberDoc, payload);
    return member.id;
  } else {
    const docRef = await addDoc(colRef, {
      ...payload,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }
}

export async function deleteExecutiveMemberFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, 'executiveMembers', id));
}

// ================= HERO SLIDER (DAKSHIKSHA) =================

export async function getHeroSlidesFromFirestore(): Promise<HeroSlide[]> {
  try {
    const colRef = collection(db, 'heroSlides');
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      // Seed default slides into Firestore
      for (const slide of DEFAULT_HERO_SLIDES) {
        await addDoc(colRef, {
          title: slide.title,
          subtitle: slide.subtitle,
          tag: slide.tag || 'DAKSHIKSHA',
          imageUrl: slide.imageUrl,
          ctaText: slide.ctaText || 'Learn More',
          ctaLink: slide.ctaLink || '#',
          gradient: slide.gradient || 'from-[#0A2540] via-[#1E3A8A] to-[#B91C1C]',
          order: slide.order || 0,
          active: slide.active !== false,
          targetPage: slide.targetPage || 'home',
          createdAt: serverTimestamp(),
        });
      }
      return DEFAULT_HERO_SLIDES;
    }

    const slides: HeroSlide[] = snapshot.docs.map((d) => {
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

    // Sort by order ascending
    return slides.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (err) {
    console.error('Error fetching hero slides from Firestore:', err);
    return DEFAULT_HERO_SLIDES;
  }
}

export async function saveHeroSlideToFirestore(
  slide: Partial<HeroSlide> & { id?: string }
): Promise<string> {
  const colRef = collection(db, 'heroSlides');
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

  if (slide.id && !slide.id.startsWith('slide-') && !slide.id.startsWith('temp-') && !slide.id.startsWith('feed-slide-')) {
    const slideDoc = doc(db, 'heroSlides', slide.id);
    await updateDoc(slideDoc, slideData);
    return slide.id;
  } else {
    const docRef = await addDoc(colRef, {
      ...slideData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }
}

export async function deleteHeroSlideFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, 'heroSlides', id));
}

// ================= MOVING NEWS SLIDER & TICKER =================

export async function getNewsItemsFromFirestore(): Promise<NewsSliderItem[]> {
  try {
    const colRef = collection(db, 'newsSliderItems');
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      // Seed default news items into Firestore
      for (const item of DEFAULT_NEWS_ITEMS) {
        await addDoc(colRef, {
          title: item.title,
          category: item.category || 'LATEST NEWS',
          link: item.link || '',
          isUrgent: !!item.isUrgent,
          published: item.published || new Date().toISOString(),
          order: item.order || 0,
          createdAt: serverTimestamp(),
        });
      }
      return DEFAULT_NEWS_ITEMS;
    }

    const items: NewsSliderItem[] = snapshot.docs.map((d) => {
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

    return items;
  } catch (err) {
    console.error('Error fetching news items from Firestore:', err);
    return DEFAULT_NEWS_ITEMS;
  }
}

export async function saveNewsItemToFirestore(
  item: Partial<NewsSliderItem> & { id?: string }
): Promise<string> {
  const colRef = collection(db, 'newsSliderItems');
  const itemData = {
    title: item.title || '',
    category: item.category || 'LATEST NEWS',
    link: item.link || '',
    isUrgent: !!item.isUrgent,
    published: item.published || new Date().toISOString(),
    order: item.order ?? 0,
    updatedAt: serverTimestamp(),
  };

  if (item.id && !item.id.startsWith('news-') && !item.id.startsWith('temp-')) {
    const itemDoc = doc(db, 'newsSliderItems', item.id);
    await updateDoc(itemDoc, itemData);
    return item.id;
  } else {
    const docRef = await addDoc(colRef, {
      ...itemData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }
}

export async function deleteNewsItemFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, 'newsSliderItems', id));
}

// ================= ANNOUNCEMENTS =================

export async function getAnnouncementsFromFirestore(): Promise<AnnouncementItem[]> {
  try {
    const colRef = collection(db, 'announcements');
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      // Seed default announcements
      for (const ann of DEFAULT_ANNOUNCEMENTS) {
        await addDoc(colRef, {
          title: ann.title,
          link: ann.link || '',
          published: ann.published || new Date().toISOString(),
          order: ann.order || 0,
          active: ann.active !== false,
          createdAt: serverTimestamp(),
        });
      }
      return DEFAULT_ANNOUNCEMENTS;
    }

    const items: AnnouncementItem[] = snapshot.docs.map((d) => {
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

    return items.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (err) {
    console.error('Error fetching announcements from Firestore:', err);
    return DEFAULT_ANNOUNCEMENTS;
  }
}

export async function saveAnnouncementToFirestore(
  ann: Partial<AnnouncementItem> & { id?: string }
): Promise<string> {
  const colRef = collection(db, 'announcements');
  const annData = {
    title: ann.title || '',
    link: ann.link || '',
    published: ann.published || new Date().toISOString(),
    order: ann.order ?? 0,
    active: ann.active !== false,
    updatedAt: serverTimestamp(),
  };

  if (ann.id && !ann.id.startsWith('ann-') && !ann.id.startsWith('temp-')) {
    const annDoc = doc(db, 'announcements', ann.id);
    await updateDoc(annDoc, annData);
    return ann.id;
  } else {
    const docRef = await addDoc(colRef, {
      ...annData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }
}

export async function deleteAnnouncementFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, 'announcements', id));
}

// ================= IMPORTANT DOCUMENTS =================

export async function getImportantDocumentsFromFirestore(): Promise<ImportantDocItem[]> {
  try {
    const colRef = collection(db, 'importantDocuments');
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      // Seed default important documents
      for (const docItem of DEFAULT_IMPORTANT_DOCUMENTS) {
        await addDoc(colRef, {
          title: docItem.title,
          url: docItem.url || '',
          category: docItem.category || 'General',
          order: docItem.order || 0,
          published: docItem.published || new Date().toISOString(),
          createdAt: serverTimestamp(),
        });
      }
      return DEFAULT_IMPORTANT_DOCUMENTS;
    }

    const items: ImportantDocItem[] = snapshot.docs.map((d) => {
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

    return items.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (err) {
    console.error('Error fetching important documents from Firestore:', err);
    return DEFAULT_IMPORTANT_DOCUMENTS;
  }
}

export async function saveImportantDocumentToFirestore(
  docItem: Partial<ImportantDocItem> & { id?: string }
): Promise<string> {
  const colRef = collection(db, 'importantDocuments');
  const docData = {
    title: docItem.title || '',
    url: docItem.url || '',
    category: docItem.category || 'General',
    order: docItem.order ?? 0,
    published: docItem.published || new Date().toISOString(),
    updatedAt: serverTimestamp(),
  };

  if (docItem.id && !docItem.id.startsWith('doc-') && !docItem.id.startsWith('temp-')) {
    const docRef = doc(db, 'importantDocuments', docItem.id);
    await updateDoc(docRef, docData);
    return docItem.id;
  } else {
    const docRef = await addDoc(colRef, {
      ...docData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }
}

export async function deleteImportantDocumentFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, 'importantDocuments', id));
}

// ================= NOTICE / CIRCULARS =================

export async function getNoticeCircularsFromFirestore(): Promise<NoticeCircularItem[]> {
  try {
    const colRef = collection(db, 'noticeCirculars');
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      // Seed default notice circulars
      for (const nc of DEFAULT_NOTICE_CIRCULARS) {
        await addDoc(colRef, {
          title: nc.title,
          category: nc.category || 'NOTICE',
          published: nc.published || new Date().toISOString().split('T')[0],
          url: nc.url || '',
          order: nc.order || 0,
          createdAt: serverTimestamp(),
        });
      }
      return DEFAULT_NOTICE_CIRCULARS;
    }

    const items: NoticeCircularItem[] = snapshot.docs.map((d) => {
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

    return items.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (err) {
    console.error('Error fetching notice circulars from Firestore:', err);
    return DEFAULT_NOTICE_CIRCULARS;
  }
}

export async function saveNoticeCircularToFirestore(
  nc: Partial<NoticeCircularItem> & { id?: string }
): Promise<string> {
  const colRef = collection(db, 'noticeCirculars');
  const ncData = {
    title: nc.title || '',
    category: nc.category || 'NOTICE',
    published: nc.published || new Date().toISOString().split('T')[0],
    url: nc.url || '',
    order: nc.order ?? 0,
    updatedAt: serverTimestamp(),
  };

  if (nc.id && !nc.id.startsWith('nc-') && !nc.id.startsWith('temp-')) {
    const ncDoc = doc(db, 'noticeCirculars', nc.id);
    await updateDoc(ncDoc, ncData);
    return nc.id;
  } else {
    const docRef = await addDoc(colRef, {
      ...ncData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }
}

export async function deleteNoticeCircularFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, 'noticeCirculars', id));
}

// ================= UNION DOCUMENTS & RULINGS (EXECUTIVE BODY) =================

export async function getUnionDocumentsAndRulingsFromFirestore(): Promise<UnionDocumentRuling[]> {
  try {
    const colRef = collection(db, 'unionDocumentsAndRulings');
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      // Seed default union documents and rulings into Firestore
      try {
        for (const item of DEFAULT_UNION_DOCUMENTS_AND_RULINGS) {
          await addDoc(colRef, {
            title: item.title,
            desc: item.desc || '',
            link: item.link || '',
            type: item.type || 'Legal',
            order: item.order || 0,
            published: item.published || new Date().toISOString().split('T')[0],
            createdAt: serverTimestamp(),
          });
        }
      } catch (seedErr) {
        console.warn('Could not auto-seed union documents to Firestore (using default list):', seedErr);
      }
      return DEFAULT_UNION_DOCUMENTS_AND_RULINGS;
    }

    const items: UnionDocumentRuling[] = snapshot.docs.map((d) => {
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

    return items.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (err) {
    console.error('Error fetching union documents & rulings from Firestore:', err);
    return DEFAULT_UNION_DOCUMENTS_AND_RULINGS;
  }
}

export async function saveUnionDocumentRulingToFirestore(
  item: Partial<UnionDocumentRuling> & { id?: string }
): Promise<string> {
  const colRef = collection(db, 'unionDocumentsAndRulings');
  const docData = {
    title: item.title || '',
    desc: item.desc || '',
    link: item.link || '',
    type: item.type || 'Legal',
    order: item.order ?? 0,
    published: item.published || new Date().toISOString().split('T')[0],
    updatedAt: serverTimestamp(),
  };

  if (item.id && !item.id.startsWith('doc-ruling-') && !item.id.startsWith('temp-')) {
    const docItem = doc(db, 'unionDocumentsAndRulings', item.id);
    await updateDoc(docItem, docData);
    return item.id;
  } else {
    const docRef = await addDoc(colRef, {
      ...docData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }
}

export async function deleteUnionDocumentRulingFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, 'unionDocumentsAndRulings', id));
}

