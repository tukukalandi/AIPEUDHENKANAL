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
import { OrdersRulingsGuideView } from './components/OrdersRulingsGuideView';
import {
  InternalPageNavBar,
  PhotoGalleryPage,
  MyAppsPage,
  EmployeeSitePage,
  FormsPage,
} from './components/FullPagePortalViews';
import { SocialAndVisitorSection } from './components/SocialAndVisitorSection';
import { ArticleReader } from './components/ArticleReader';
import { ShareModal } from './components/ShareModal';
import { NotificationCenter } from './components/NotificationCenter';
import { DeviceFrameWrapper } from './components/DeviceFrameWrapper';
import { NewsTicker } from './components/NewsTicker';
import { Footer } from './components/Footer';
import { AdminPortal } from './components/AdminPortal';
import { CardVerificationScreen } from './components/CardVerificationScreen';
import {
  getCircularsFromFirestore,
  getHeroSlidesFromFirestore,
  getNewsItemsFromFirestore,
  getAnnouncementsFromFirestore,
  getImportantDocumentsFromFirestore,
  getNoticeCircularsFromFirestore,
  getExecutiveMembersFromFirestore,
  isLegacySeedId,
  LEGACY_SAMPLE_BEARER_NAMES,
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
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() => {
    try {
      const stored = localStorage.getItem('aipeu_hero_slides');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_HERO_SLIDES;
  });
  const [newsItems, setNewsItems] = useState<NewsSliderItem[]>(() => {
    try {
      const stored = localStorage.getItem('aipeu_news_items');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_NEWS_ITEMS;
  });
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() => {
    try {
      const stored = localStorage.getItem('aipeu_announcements');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.filter((a: any) => !isLegacySeedId(a.id));
      }
    } catch {}
    return [];
  });
  const [importantDocs, setImportantDocs] = useState<ImportantDocItem[]>(() => {
    try {
      const stored = localStorage.getItem('aipeu_important_documents');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.filter((d: any) => !isLegacySeedId(d.id));
      }
    } catch {}
    return [];
  });
  const [noticeCirculars, setNoticeCirculars] = useState<NoticeCircularItem[]>(() => {
    try {
      const stored = localStorage.getItem('aipeu_notice_circulars');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.filter((n: any) => !isLegacySeedId(n.id));
      }
    } catch {}
    return [];
  });
  const [officeBearers, setOfficeBearers] = useState<OfficeBearer[]>(() => {
    try {
      const stored = localStorage.getItem('aipeu_office_bearers');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter((b: any) => !isLegacySeedId(b.id) && !LEGACY_SAMPLE_BEARER_NAMES.has((b.name || '').trim().toLowerCase()));
        }
      }
    } catch {}
    return [];
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [navHistory, setNavHistory] = useState<ActiveTab[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Navigate to a tab while recording navigation history & browser history state
  const handleNavigateTab = (nextTab: ActiveTab) => {
    if (selectedPost) {
      setSelectedPost(null);
    }
    if (nextTab !== activeTab) {
      setNavHistory((prev) => [...prev, activeTab]);
      setActiveTab(nextTab);
      try {
        window.history.pushState({ tab: nextTab, postId: null }, '', `#${nextTab}`);
      } catch {}
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open an article while recording browser history state
  const handleSelectPost = (post: BlogPost | null) => {
    setSelectedPost(post);
    if (post) {
      try {
        window.history.pushState({ tab: activeTab, postId: post.id }, '', `#post-${post.id}`);
      } catch {}
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ← Back handler using actual previous navigation history
  const handleGoBack = () => {
    if (selectedPost) {
      setSelectedPost(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (navHistory.length > 0) {
      const previousTab = navHistory[navHistory.length - 1];
      setNavHistory((prev) => prev.slice(0, -1));
      setActiveTab(previousTab);
      try {
        window.history.replaceState({ tab: previousTab, postId: null }, '', `#${previousTab}`);
      } catch {}
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveTab('home');
      try {
        window.history.replaceState({ tab: 'home', postId: null }, '', '#home');
      } catch {}
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ⌂ Home handler directly to Home Page
  const handleGoHome = () => {
    setSelectedPost(null);
    if (activeTab !== 'home') {
      setNavHistory((prev) => [...prev, activeTab]);
      setActiveTab('home');
      try {
        window.history.pushState({ tab: 'home', postId: null }, '', '#home');
      } catch {}
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Support browser back/forward buttons seamlessly
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state && state.tab) {
        setSelectedPost(null);
        setActiveTab(state.tab as ActiveTab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSelectedPost(null);
        setActiveTab('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Digital Membership Card QR verification token from URL (?verifyCard=...)
  const [verifyCardToken, setVerifyCardToken] = useState<string | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('verifyCard');
    } catch {
      return null;
    }
  });

  const loadOfficeBearers = async () => {
    try {
      const data = await getExecutiveMembersFromFirestore();
      setOfficeBearers(data || []);
      localStorage.setItem('aipeu_office_bearers', JSON.stringify(data || []));
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

    // One-time fresh start cleanup: purge all files from Announcements, Important Documents, Notices, and Directory cards
    try {
      if (!localStorage.getItem('aipeu_fresh_start_v4_purged')) {
        ['aipeu_announcements', 'aipeu_important_documents', 'aipeu_notice_circulars', 'aipeu_office_bearers'].forEach((k) => {
          localStorage.setItem(k, '[]');
        });
        localStorage.setItem('aipeu_fresh_start_v4_purged', 'true');
      }
    } catch {}

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

    // ⚡ 0ms INSTANT SYNCHRONIZATION: reads local state synchronously before background network refresh
    const syncDynamicContentInstantly = () => {
      try {
        const d = localStorage.getItem('aipeu_important_documents');
        if (d) setImportantDocs(JSON.parse(d).filter((x: any) => !isLegacySeedId(x.id)));
        const n = localStorage.getItem('aipeu_notice_circulars');
        if (n) setNoticeCirculars(JSON.parse(n).filter((x: any) => !isLegacySeedId(x.id)));
        const a = localStorage.getItem('aipeu_announcements');
        if (a) setAnnouncements(JSON.parse(a).filter((x: any) => !isLegacySeedId(x.id)));
        const ns = localStorage.getItem('aipeu_news_items');
        if (ns) setNewsItems(JSON.parse(ns));
        const s = localStorage.getItem('aipeu_hero_slides');
        if (s) setHeroSlides(JSON.parse(s));
      } catch {}
    };

    const handleDynamicContentUpdate = () => {
      syncDynamicContentInstantly();
      loadDynamicContent();
    };
    const handlePostsUpdate = () => fetchPosts();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offline-storage-updated', handleStorageUpdate);
    window.addEventListener('online-status-changed', handleStorageUpdate);
    window.addEventListener('notifications-updated', handleNotifUpdate);
    window.addEventListener('office-bearers-updated', handleBearersUpdated);
    window.addEventListener('dynamic-content-updated', handleDynamicContentUpdate);
    window.addEventListener('docs-updated', handleDynamicContentUpdate);
    window.addEventListener('notices-updated', handleDynamicContentUpdate);
    window.addEventListener('announcements-updated', handleDynamicContentUpdate);
    window.addEventListener('news-items-updated', handleDynamicContentUpdate);
    window.addEventListener('hero-slides-updated', handleDynamicContentUpdate);
    window.addEventListener('posts-updated', handlePostsUpdate);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offline-storage-updated', handleStorageUpdate);
      window.removeEventListener('online-status-changed', handleStorageUpdate);
      window.removeEventListener('notifications-updated', handleNotifUpdate);
      window.removeEventListener('office-bearers-updated', handleBearersUpdated);
      window.removeEventListener('dynamic-content-updated', handleDynamicContentUpdate);
      window.removeEventListener('docs-updated', handleDynamicContentUpdate);
      window.removeEventListener('notices-updated', handleDynamicContentUpdate);
      window.removeEventListener('announcements-updated', handleDynamicContentUpdate);
      window.removeEventListener('news-items-updated', handleDynamicContentUpdate);
      window.removeEventListener('hero-slides-updated', handleDynamicContentUpdate);
      window.removeEventListener('posts-updated', handlePostsUpdate);
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
      if (slides) setHeroSlides(slides);
      if (news) setNewsItems(news);
      if (anns) setAnnouncements(anns.filter((a) => !isLegacySeedId(a.id)));
      if (docs) setImportantDocs(docs.filter((d) => !isLegacySeedId(d.id)));
      if (notcs) setNoticeCirculars(notcs.filter((n) => !isLegacySeedId(n.id)));
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
        handleSelectPost(found);
        return;
      }
    }
    handleNavigateTab('feed');
  };

  const handleCircularAdded = (newPost: BlogPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  return (
    <DeviceFrameWrapper deviceFrame={deviceFrame} platform={effectivePlatform}>
      {/* If an article is open, render reader view with Back & Home */}
      {selectedPost ? (
        <ArticleReader
          post={selectedPost}
          onBack={handleGoBack}
          onHome={handleGoHome}
          onShare={handleOpenShare}
          platform={effectivePlatform}
        />
      ) : (
        <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-16 md:pb-0">
          {/* 🕒 Top Bar: Live Date & Clock, Language Switcher, User Portal & Admin Portal */}
          <TopTimeDateBar
            language={language}
            onSetLanguage={handleSetLanguage}
            theme={themeMode}
            onToggleTheme={() => handleSetTheme(themeMode === 'dark' ? 'light' : 'dark')}
            onOpenUserPortal={() => handleNavigateTab('user-portal')}
            onOpenAdmin={() => setIsAdminOpen(true)}
            activeTab={activeTab}
          />

          {/* Top App Bar with Full-Page Menu Navigation */}
          <TopAppBar
            platform={effectivePlatform}
            unreadNotifsCount={unreadNotifsCount}
            onOpenNotifications={() => setIsNotifsOpen(true)}
            onRefresh={fetchPosts}
            isRefreshing={isRefreshing}
            onOpenShareModal={() => handleOpenShare()}
            onOpenAdmin={() => setIsAdminOpen(true)}
            activeTab={activeTab}
            onSelectTab={(tab) => handleNavigateTab(tab)}
            offlineCount={savedPostIds.length}
          />

          {/* Moving Latest News Ticker */}
          <NewsTicker
            posts={posts}
            newsItems={newsItems}
            onSelectPost={(post) => handleSelectPost(post)}
            onOpenAdmin={() => setIsAdminOpen(true)}
          />

          {/* Main Tab Content - Full-Page View for Every Menu Option */}
          <main className="flex-1 w-full px-0 sm:px-6 lg:px-8 xl:px-12 pt-0 sm:pt-5">
            {/* Internal Page Navigation Controls (← Back and ⌂ Home) on all non-Home pages */}
            {activeTab !== 'home' && (
              <div className="px-3.5 sm:px-0 pt-3 sm:pt-0">
                <InternalPageNavBar
                  activeTab={activeTab}
                  onBack={handleGoBack}
                  onHome={handleGoHome}
                />
              </div>
            )}

            {activeTab === 'home' && (
              <>
                <HomePage
                  heroSlides={heroSlides}
                  newsItems={newsItems}
                  posts={posts}
                  announcements={announcements}
                  importantDocs={importantDocs}
                  noticeCirculars={noticeCirculars}
                  onSelectPost={(post) => handleSelectPost(post)}
                  onNavigateTab={(tab) => handleNavigateTab(tab)}
                  onOpenAdmin={() => setIsAdminOpen(true)}
                  platform={effectivePlatform}
                />
                {/* 📱 Official Social Media Network & Constituent Wings Showcase */}
                <div className="px-3.5 sm:px-0 mt-8">
                  <SocialAndVisitorSection
                    language={language}
                    onSelectWing={() => handleNavigateTab('categories')}
                  />
                </div>
              </>
            )}

            {activeTab === 'user-portal' && (
              <div className="px-3.5 sm:px-0">
                <UserPortal
                  language={language}
                  platform={effectivePlatform}
                  officeBearers={officeBearers}
                  onRefreshOfficeBearers={loadOfficeBearers}
                  onNavigateTab={(tab) => handleNavigateTab(tab)}
                />
              </div>
            )}

            {activeTab === 'orders-rulings-guide' && (
              <div className="px-3.5 sm:px-0">
                <OrdersRulingsGuideView
                  platform={effectivePlatform}
                  onOpenAdmin={() => setIsAdminOpen(true)}
                />
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="px-3.5 sm:px-0">
                <PhotoGalleryPage />
              </div>
            )}

            {activeTab === 'my-apps' && (
              <div className="px-3.5 sm:px-0">
                <MyAppsPage />
              </div>
            )}

            {activeTab === 'employee-site' && (
              <div className="px-3.5 sm:px-0">
                <EmployeeSitePage onNavigateTab={(tab) => handleNavigateTab(tab)} />
              </div>
            )}

            {activeTab === 'forms' && (
              <div className="px-3.5 sm:px-0">
                <FormsPage />
              </div>
            )}

            {activeTab === 'feed' && (
              <div className="px-3.5 sm:px-0">
                <FeedTab
                  posts={posts}
                  heroSlides={heroSlides}
                  onSelectPost={(post) => handleSelectPost(post)}
                  onSharePost={handleOpenShare}
                  onToggleSaveOffline={handleToggleSaveOffline}
                  savedPostIds={savedPostIds}
                  platform={effectivePlatform}
                  isOnline={isOnline}
                  officeBearers={officeBearers}
                  onRefreshOfficeBearers={loadOfficeBearers}
                  onOpenAdmin={() => setIsAdminOpen(true)}
                  onNavigateTab={(tab) => handleNavigateTab(tab)}
                />
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="px-3.5 sm:px-0">
                <CategoriesTab
                  posts={posts}
                  onSelectPost={(post) => handleSelectPost(post)}
                  platform={effectivePlatform}
                />
              </div>
            )}

            {activeTab === 'offline' && (
              <div className="px-3.5 sm:px-0">
                <OfflineTab
                  allPosts={posts}
                  onSelectPost={(post) => handleSelectPost(post)}
                  onSharePost={handleOpenShare}
                  platform={effectivePlatform}
                  isOnline={isOnline}
                />
              </div>
            )}

            {activeTab === 'directory' && (
              <div className="px-3.5 sm:px-0">
                <DirectoryTab
                  platform={effectivePlatform}
                  officeBearers={officeBearers}
                  onRefreshOfficeBearers={loadOfficeBearers}
                  onOpenAdmin={() => setIsAdminOpen(true)}
                />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="px-3.5 sm:px-0">
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
            onNavigateSection={(sec) => handleNavigateTab(sec as ActiveTab)}
          />

          {/* Bottom Navigation Bar for Mobile Viewports (hidden on desktop md:) */}
          <BottomNavBar
            activeTab={activeTab}
            onSelectTab={(tab) => handleNavigateTab(tab)}
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
        onGoHome={() => {
          setIsAdminOpen(false);
          handleGoHome();
        }}
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

      {/* 💳 Digital Membership Card QR Verification Overlay */}
      {verifyCardToken && (
        <CardVerificationScreen
          token={verifyCardToken}
          onClose={() => {
            setVerifyCardToken(null);
            try {
              const url = new URL(window.location.href);
              url.searchParams.delete('verifyCard');
              window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
            } catch {}
          }}
        />
      )}
    </DeviceFrameWrapper>
  );
}
