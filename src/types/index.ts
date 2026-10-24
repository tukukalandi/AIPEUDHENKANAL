export interface BlogPost {
  id: string;
  title: string;
  published: string;
  updated: string;
  author: string;
  url: string;
  categories: string[];
  snippet: string;
  contentHtml: string;
  images: string[];
  driveLinks: string[];
  isSavedOffline?: boolean;
}

export type PlatformStyle = 'ios' | 'android' | 'auto';
export type ThemeMode = 'light' | 'dark' | 'system';
export type ActiveTab = 'home' | 'feed' | 'categories' | 'offline' | 'directory' | 'settings' | 'user-portal';
export type AppLanguage = 'en' | 'hi' | 'or' | string;

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  tag?: string;
  imageUrl: string;
  ctaText?: string;
  ctaLink?: string;
  gradient?: string;
  order?: number;
  active?: boolean;
  targetPage?: 'home' | 'feed' | 'both';
}

export interface NewsSliderItem {
  id: string;
  title: string;
  category?: string;
  link?: string;
  isUrgent?: boolean;
  published?: string;
  order?: number;
}


export interface OfficeBearer {
  id?: string;
  name: string;
  designation: string;
  branch: string;
  phone?: string;
  location: string;
  roleType: 'president' | 'secretary' | 'treasurer' | 'executive';
  photoUrl?: string;
}

export interface PushNotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  category: string;
  read: boolean;
  postId?: string;
  urgent?: boolean;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  link?: string;
  published?: string;
  order?: number;
  active?: boolean;
}

export interface ImportantDocItem {
  id: string;
  title: string;
  url: string;
  category?: string;
  order?: number;
  published?: string;
}

export interface NoticeCircularItem {
  id: string;
  title: string;
  category: 'NOTICE' | 'ACCOMMODATION' | 'CGHS' | 'PENSION/SALARY' | 'MISCELLANEOUS' | string;
  published: string;
  url?: string;
  order?: number;
}

export interface ShareData {
  title: string;
  text: string;
  url: string;
}

export interface UnionDocumentRuling {
  id: string;
  title: string;
  desc?: string;
  link: string;
  type: string;
  order?: number;
  published?: string;
}
