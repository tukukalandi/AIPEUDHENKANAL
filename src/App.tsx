/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BlogPost,
  PlatformStyle,
  ThemeMode,
  ActiveTab,
  AppLanguage,
  ShareData,
  HeroSlide,
  NewsSliderItem,
  AnnouncementItem,
  ImportantDocItem,
  NoticeCircularItem,
  OfficeBearer,
} from './types';
import fallbackPosts from './data/posts.json';
import {
  DEFAULT_HERO_SLIDES,
  DEFAULT_NEWS_ITEMS,
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_IMPORTANT_DOCUMENTS,
  DEFAULT_NOTICE_CIRCULARS,
} from './data/dakshikshaData';
import { OFFICE_BEARERS } from './data/unionInfo';
import { TopTimeDateBar } from './components/TopTimeDateBar';
import { TopAppBar, BottomNavBar } from './components/NavigationBars';
import { HomePage } from './components/HomePage';
import { FeedTab } from './components/FeedTab';
import { CategoriesTab } from './components/CategoriesTab';
import { OfflineTab } from './components/OfflineTab';
import { DirectoryTab } from './components/DirectoryTab';
import { SettingsTab } from './components/SettingsTab';
import { UserPortal } from './components/UserPortal';
import { SocialAndVisitorSection } from './components/SocialAndVisitorSection';
import { ArticleReader } from './components/ArticleReader';
import { ShareModal } from './components/ShareModal';
import { NotificationCenter } from './components/NotificationCenter';
import { DeviceFrameWrapper } from './components/DeviceFrameWrapper';
import { NewsTicker } from './components/NewsTicker';
import { Footer } from './components/Footer';
import { AdminPortal } from './components/AdminPortal';
import {
  getCircularsFromFirestore,
  getHeroSlidesFromFirestore,
  getNewsItemsFromFirestore,
  getAnnouncementsFromFirestore,
  getImportantDocumentsFromFirestore,
  getNoticeCircularsFromFirestore,
  getExecutiveMembersFromFirestore,
} from './services/firebase';
import {
  getSavedPostIds,
  savePostForOffline,
  removePostFromOffline,
  isPostSavedOffline,
  getSimulatedOffline,
} from './services/storage';
import { getStoredNotifications } from './services/notifications';
import { changeGoogleLanguage } from './services/translator';

export default function App() {
  const [posts, setPosts] = useState<BlogPost[]>(fallbackPosts as BlogPost[]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);
  const [newsItems, setNewsItems] = useState<NewsSliderItem[]>(DEFAULT_NEWS_ITEMS);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(DEFAULT_ANNOUNCEMENTS);
  const [importantDocs, setImportantDocs] = useState<ImportantDocItem[]>(DEFAULT_IMPORTANT_DOCUMENTS);
  const [noticeCirculars, setNoticeCirculars] = useState<NoticeCircularItem[]>(DEFAULT_NOTICE_CIRCULARS);
  const [officeBearers, setOfficeBearers] = useState<OfficeBearer[]>(() => {
    try {
      const stored = localStorage.getItem('aipeu_office_bearers');
      return stored ? JSON.parse(stored) : OFFICE_BEARERS;
    } catch {
      return OFFICE_BEARERS;
    }
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const loadOfficeBearers = async () => {
    try {
      const data = await getExecutiveMembersFromFirestore();
      if (data && data.length > 0) {
        setOfficeBearers(data);
        localStorage.setItem('aipeu_office_bearers', JSON.stringify(data));
      }
    } catch (err) {
      console.warn('Could not load executive members from Firestore', err);
    }
  };
  const [platformMode, setPlatformMode] = useState<PlatformStyle>('auto');
  const [deviceFrame, setDeviceFrame] = useState<'none' | 'iphone' | 'pixel'>('none');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);

  // Multi-Language State (English, Hindi, Odia, and Google Languages)
  const [language, setLanguage] = useState<AppLanguage>(() => {
    return (localStorage.getItem('aipeu_lang') as AppLanguage) || 'en';
  });

  const handleSetLanguage = (lang: AppLanguage) => {
    setLanguage(lang);
    localStorage.setItem('aipeu_lang', lang);
    changeGoogleLanguage(lang);
  };

  // Modals
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareData, setShareData] = useState<ShareData>({
    title: 'NFPE AIPEU Unions AIGDSU AIPRPA AIPCPCCWF - Dhenkanal Division',
    text: 'NFPE AIPEU Unions AIGDSU AIPRPA AIPCPCCWF - Dhenkanal Division official portal. Contact: aipeup3dhenkanaldivn@gmail.com, Mob - 9861184651.',
    url: window.location.href,
  });
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Network State
  const [isOnline, setIsOnline] = useState(navigator.onLine && !getSimulatedOffline());

  // Auto-detect effective platform (iOS vs Android)
  const effectivePlatform: 'ios' | 'android' =
    platformMode === 'auto'
      ? /iphone|ipad|ipod|macintosh/i.test(navigator.userAgent)
        ? 'ios'
        : 'android'
      : platformMode;

  // Initialize and listen to storage & notifications
  useEffect(() => {
    // Theme setup
    const savedTheme = (localStorage.getItem('aipeu_theme') as ThemeMode) || 'light';
    setThemeMode(savedTheme);
    applyTheme(savedTheme);

    // Platform mode setup
    const savedPlatform = (localStorage.getItem('aipeu_platform') as PlatformStyle) || 'auto';
    setPlatformMode(savedPlatform);

    // Frame setup
    const savedFrame = (localStorage.getItem('aipeu_frame') as any) || 'none';
    setDeviceFrame(savedFrame);

    // Saved post IDs
    setSavedPostIds(getSavedPostIds());

    // Notifications count
    updateUnreadCount();

    // Fetch live posts, hero slides, news, announcements, docs, circulars, and office bearers
    fetchPosts();
    loadDynamicContent();
    loadOfficeBearers();

    // Online / offline listeners
    const handleOnline = () => setIsOnline(!getSimulatedOffline());
    const handleOffline = () => setIsOnline(false);
    const handleStorageUpdate = () => {
      setSavedPostIds(getSavedPostIds());
      setIsOnline(navigator.onLine && !getSimulatedOffline());
    };
    const handleNotifUpdate = () => updateUnreadCount();
    const handleBearersUpdated = () => loadOfficeBearers();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offline-storage-updated', handleStorageUpdate);
    window.addEventListener('online-status-changed', handleStorageUpdate);
    window.addEventListener('notifications-updated', handleNotifUpdate);
    window.addEventListener('office-bearers-updated', handleBearersUpdated);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offline-storage-updated', handleStorageUpdate);
      window.removeEventListener('online-status-changed', handleStorageUpdate);
      window.removeEventListener('notifications-updated', handleNotifUpdate);
      window.removeEventListener('office-bearers-updated', handleBearersUpdated);
    };
  }, []);

  const updateUnreadCount = () => {
    const list = getStoredNotifications();
    setUnreadNotifsCount(list.filter((n) => !n.read).length);
  };

  const applyTheme = (theme: ThemeMode) => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    } else {
      // System
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        body.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.classList.remove('dark');
        body.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
      }
    }
  };

  const handleSetTheme = (theme: ThemeMode) => {
    setThemeMode(theme);
    localStorage.setItem('aipeu_theme', theme);
    applyTheme(theme);
  };

  const handleSetPlatform = (p: PlatformStyle) => {
    setPlatformMode(p);
    localStorage.setItem('aipeu_platform', p);
  };

  const handleSetDeviceFrame = (f: 'none' | 'iphone' | 'pixel') => {
    setDeviceFrame(f);
    localStorage.setItem('aipeu_frame', f);
  };

  const fetchPosts = async () => {
    setIsRefreshing(true);
    try {
      let bloggerPosts: BlogPost[] = fallbackPosts as BlogPost[];
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        if (data.posts && data.posts.length > 0) {
          bloggerPosts = data.posts;
        }
      }

      // Fetch any admin circulars from Firebase Firestore
      let firestorePosts: BlogPost[] = [];
      try {
        firestorePosts = await getCircularsFromFirestore();
      } catch (err) {
        console.warn('Could not fetch Firestore posts, offline or initializing', err);
      }

      // Merge Firestore posts on top
      const mergedMap = new Map<string, BlogPost>();
      firestorePosts.forEach((p) => mergedMap.set(p.id, p));
      bloggerPosts.forEach((p) => {
        if (!mergedMap.has(p.id)) mergedMap.set(p.id, p);
      });

      // Filter out any posts deleted by admin
      const deletedIds = new Set<string>(JSON.parse(localStorage.getItem('aipeu_deleted_post_ids') || '[]'));
      const finalPosts = Array.from(mergedMap.values()).filter((p) => !deletedIds.has(p.id));
      setPosts(finalPosts);
    } catch {
      // Keep bundled posts
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadDynamicContent = async () => {
    try {
      const [slides, news, anns, docs, notcs] = await Promise.all([
        getHeroSlidesFromFirestore(),
        getNewsItemsFromFirestore(),
        getAnnouncementsFromFirestore(),
        getImportantDocumentsFromFirestore(),
        getNoticeCircularsFromFirestore(),
      ]);
      if (slides && slides.length > 0) setHeroSlides(slides);
      if (news && news.length > 0) setNewsItems(news);
      if (anns && anns.length > 0) setAnnouncements(anns);
      if (docs && docs.length > 0) setImportantDocs(docs);
      if (notcs && notcs.length > 0) setNoticeCirculars(notcs);
    } catch (err) {
      console.warn('Could not load dynamic content from Firestore', err);
    }
  };

  const handleToggleSaveOffline = (post: BlogPost) => {
    if (isPostSavedOffline(post.id)) {
      removePostFromOffline(post.id);
      setSavedPostIds(getSavedPostIds());
    } else {
      savePostForOffline(post);
      setSavedPostIds(getSavedPostIds());
    }
  };

  const handleOpenShare = (data?: ShareData) => {
    if (data) {
      setShareData(data);
    } else {
      setShareData({
        title: 'NFPE AIPEU Unions AIGDSU AIPRPA AIPCPCCWF - Dhenkanal Division',
        text: 'NFPE AIPEU Unions AIGDSU AIPRPA AIPCPCCWF - Dhenkanal Division official portal. Contact: aipeup3dhenkanaldivn@gmail.com, Mob - 9861184651.',
        url: window.location.href,
      });
    }
    setIsShareOpen(true);
  };

  const handleSelectNotification = (postId?: string) => {
    if (postId) {
      const found = posts.find((p) => p.id === postId);
      if (found) {
        setSelectedPost(found);
        return;
      }
    }
    setActiveTab('feed');
  };

  const handleCircularAdded = (newPost: BlogPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  return (
    <DeviceFrameWrapper deviceFrame={deviceFrame} platform={effectivePlatform}>
      {/* If an article is open, render reader view */}
      {selectedPost ? (
        <ArticleReader
          post={selectedPost}
          onBack={() => setSelectedPost(null)}
          onShare={handleOpenShare}
          platform={effectivePlatform}
        />
      ) : (
        <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-16 md:pb-0">
          {/* 🕒 Top Bar: Live Date & Clock, Language Switcher (EN, HI, OR) & Dark Mode Toggle */}
          <TopTimeDateBar
            language={language}
            onSetLanguage={handleSetLanguage}
            theme={themeMode}
            onToggleTheme={() => handleSetTheme(themeMode === 'dark' ? 'light' : 'dark')}
            onOpenUserPortal={() => {
              setActiveTab('user-portal');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            activeTab={activeTab}
          />

          {/* Top App Bar with Admin Portal Button */}
          <TopAppBar
            platform={effectivePlatform}
            unreadNotifsCount={unreadNotifsCount}
            onOpenNotifications={() => setIsNotifsOpen(true)}
            onRefresh={fetchPosts}
            isRefreshing={isRefreshing}
            onOpenShareModal={() => handleOpenShare()}
            onOpenAdmin={() => setIsAdminOpen(true)}
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            offlineCount={savedPostIds.length}
          />

          {/* Moving Latest News Ticker */}
          <NewsTicker
            posts={posts}
            newsItems={newsItems}
            onSelectPost={(post) => setSelectedPost(post)}
            onOpenAdmin={() => setIsAdminOpen(true)}
          />

          {/* Main Tab Content - Full Edge-to-Edge on mobile for Hero Slider, padded on desktop */}
          <main className="flex-1 w-full px-0 sm:px-6 lg:px-8 xl:px-12 pt-0 sm:pt-5">
            {activeTab === 'home' && (
              <>
                <HomePage
                  heroSlides={heroSlides}
                  newsItems={newsItems}
                  posts={posts}
                  announcements={announcements}
                  importantDocs={importantDocs}
                  noticeCirculars={noticeCirculars}
                  onSelectPost={(post) => setSelectedPost(post)}
                  onNavigateTab={(tab) => {
                    setActiveTab(tab);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onOpenAdmin={() => setIsAdminOpen(true)}
                  platform={effectivePlatform}
                />
                {/* 📱 Official Social Media Network & Constituent Wings Showcase */}
                <div className="px-3.5 sm:px-0 mt-8">
                  <SocialAndVisitorSection
                    language={language}
                    onSelectWing={() => {
                      setActiveTab('categories');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </div>
              </>
            )}

            {activeTab === 'user-portal' && (
              <div className="px-3.5 sm:px-0 pt-4 sm:pt-0">
                <UserPortal
                  language={language}
                  platform={effectivePlatform}
                  onNavigateTab={(tab) => {
                    setActiveTab(tab);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}

            {activeTab === 'feed' && (
              <div className="px-3.5 sm:px-0 pt-4 sm:pt-0">
                <FeedTab
                  posts={posts}
                  heroSlides={heroSlides}
                  onSelectPost={(post) => setSelectedPost(post)}
                  onSharePost={handleOpenShare}
                  onToggleSaveOffline={handleToggleSaveOffline}
                  savedPostIds={savedPostIds}
                  platform={effectivePlatform}
                  isOnline={isOnline}
                  officeBearers={officeBearers}
                  onRefreshOfficeBearers={loadOfficeBearers}
                  onOpenAdmin={() => setIsAdminOpen(true)}
                  onNavigateTab={(tab) => {
                    setActiveTab(tab);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="px-3.5 sm:px-0 pt-4 sm:pt-0">
                <CategoriesTab
                  posts={posts}
                  onSelectPost={(post) => setSelectedPost(post)}
                  platform={effectivePlatform}
                />
              </div>
            )}

            {activeTab === 'offline' && (
              <div className="px-3.5 sm:px-0 pt-4 sm:pt-0">
                <OfflineTab
                  allPosts={posts}
                  onSelectPost={(post) => setSelectedPost(post)}
                  onSharePost={handleOpenShare}
                  platform={effectivePlatform}
                  isOnline={isOnline}
                />
              </div>
            )}

            {activeTab === 'directory' && (
              <div className="px-3.5 sm:px-0 pt-4 sm:pt-0">
                <DirectoryTab
                  platform={effectivePlatform}
                  officeBearers={officeBearers}
                  onRefreshOfficeBearers={loadOfficeBearers}
                  onOpenAdmin={() => setIsAdminOpen(true)}
                />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="px-3.5 sm:px-0 pt-4 sm:pt-0">
                <SettingsTab
                  platform={platformMode}
                  onSetPlatform={handleSetPlatform}
                  deviceFrame={deviceFrame}
                  onSetDeviceFrame={handleSetDeviceFrame}
                  theme={themeMode}
                  onSetTheme={handleSetTheme}
                  onOpenShareApp={() => handleOpenShare()}
                />
              </div>
            )}
          </main>

          {/* 🏛️ Comprehensive Footer matching attached design */}
          <Footer
            onOpenAdmin={() => setIsAdminOpen(true)}
            onNavigateSection={(sec) => {
              setActiveTab(sec as any);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* Bottom Navigation Bar for Mobile Viewports (hidden on desktop md:) */}
          <BottomNavBar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            platform={effectivePlatform}
            offlineCount={savedPostIds.length}
          />
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        data={shareData}
        platform={effectivePlatform}
      />

      {/* Push Notification Drawer */}
      <NotificationCenter
        isOpen={isNotifsOpen}
        onClose={() => setIsNotifsOpen(false)}
        onSelectNotification={handleSelectNotification}
        platform={effectivePlatform}
      />

      {/* 🔐 Admin Portal Modal (Firebase Database Integration) */}
      <AdminPortal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onCircularAdded={handleCircularAdded}
        onCircularDeleted={(id) => {
          setPosts((prev) => prev.filter((p) => p.id !== id));
          fetchPosts();
        }}
        onExecutiveUpdated={() => {
          loadOfficeBearers();
          window.dispatchEvent(new CustomEvent('office-bearers-updated'));
        }}
        onHeroSlidesUpdated={() => loadDynamicContent()}
        onNewsItemsUpdated={() => loadDynamicContent()}
        onAnnouncementsUpdated={() => loadDynamicContent()}
        onDocsUpdated={() => loadDynamicContent()}
        onNoticeCircularsUpdated={() => loadDynamicContent()}
      />
    </DeviceFrameWrapper>
  );
}
