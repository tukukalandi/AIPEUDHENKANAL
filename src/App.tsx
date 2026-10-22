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
  ShareData,
  HeroSlide,
  NewsSliderItem,
  AnnouncementItem,
  ImportantDocItem,
  NoticeCircularItem,
} from './types';
import fallbackPosts from './data/posts.json';
import {
  DEFAULT_HERO_SLIDES,
  DEFAULT_NEWS_ITEMS,
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_IMPORTANT_DOCUMENTS,
  DEFAULT_NOTICE_CIRCULARS,
} from './data/dakshikshaData';
import { TopAppBar, BottomNavBar } from './components/NavigationBars';
import { HomePage } from './components/HomePage';
import { FeedTab } from './components/FeedTab';
import { CategoriesTab } from './components/CategoriesTab';
import { OfflineTab } from './components/OfflineTab';
import { DirectoryTab } from './components/DirectoryTab';
import { SettingsTab } from './components/SettingsTab';
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
} from './services/firebase';
import {
  getSavedPostIds,
  savePostForOffline,
  removePostFromOffline,
  isPostSavedOffline,
  getSimulatedOffline,
} from './services/storage';
import { getStoredNotifications } from './services/notifications';

export default function App() {
  const [posts, setPosts] = useState<BlogPost[]>(fallbackPosts as BlogPost[]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);
  const [newsItems, setNewsItems] = useState<NewsSliderItem[]>(DEFAULT_NEWS_ITEMS);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(DEFAULT_ANNOUNCEMENTS);
  const [importantDocs, setImportantDocs] = useState<ImportantDocItem[]>(DEFAULT_IMPORTANT_DOCUMENTS);
  const [noticeCirculars, setNoticeCirculars] = useState<NoticeCircularItem[]>(DEFAULT_NOTICE_CIRCULARS);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [platformMode, setPlatformMode] = useState<PlatformStyle>('auto');
  const [deviceFrame, setDeviceFrame] = useState<'none' | 'iphone' | 'pixel'>('none');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);

  // Modals
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareData, setShareData] = useState<ShareData>({
    title: 'AIPEU Dhenkanal Mobile',
    text: 'All India Postal Employees Union Dhenkanal Division updates and circulars.',
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

    // Fetch live posts, hero slides, news, announcements, docs, and circulars
    fetchPosts();
    loadDynamicContent();

    // Online / offline listeners
    const handleOnline = () => setIsOnline(!getSimulatedOffline());
    const handleOffline = () => setIsOnline(false);
    const handleStorageUpdate = () => {
      setSavedPostIds(getSavedPostIds());
      setIsOnline(navigator.onLine && !getSimulatedOffline());
    };
    const handleNotifUpdate = () => updateUnreadCount();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offline-storage-updated', handleStorageUpdate);
    window.addEventListener('online-status-changed', handleStorageUpdate);
    window.addEventListener('notifications-updated', handleNotifUpdate);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offline-storage-updated', handleStorageUpdate);
      window.removeEventListener('online-status-changed', handleStorageUpdate);
      window.removeEventListener('notifications-updated', handleNotifUpdate);
    };
  }, []);

  const updateUnreadCount = () => {
    const list = getStoredNotifications();
    setUnreadNotifsCount(list.filter((n) => !n.read).length);
  };

  const applyTheme = (theme: ThemeMode) => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.classList.add('dark');
      else root.classList.remove('dark');
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

      setPosts(Array.from(mergedMap.values()));
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
        title: 'AIPEU Dhenkanal Mobile App',
        text: 'All India Postal Employees Union Dhenkanal Division mobile portal for circulars, orders & updates.',
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

          {/* Main Tab Content - Full Desktop Width with edge-to-edge layout */}
          <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-12 pt-5">
            {activeTab === 'home' && (
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
            )}

            {activeTab === 'feed' && (
              <FeedTab
                posts={posts}
                onSelectPost={(post) => setSelectedPost(post)}
                onSharePost={handleOpenShare}
                onToggleSaveOffline={handleToggleSaveOffline}
                savedPostIds={savedPostIds}
                platform={effectivePlatform}
                isOnline={isOnline}
              />
            )}

            {activeTab === 'categories' && (
              <CategoriesTab
                posts={posts}
                onSelectPost={(post) => setSelectedPost(post)}
                platform={effectivePlatform}
              />
            )}

            {activeTab === 'offline' && (
              <OfflineTab
                allPosts={posts}
                onSelectPost={(post) => setSelectedPost(post)}
                onSharePost={handleOpenShare}
                platform={effectivePlatform}
                isOnline={isOnline}
              />
            )}

            {activeTab === 'directory' && (
              <DirectoryTab platform={effectivePlatform} />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                platform={platformMode}
                onSetPlatform={handleSetPlatform}
                deviceFrame={deviceFrame}
                onSetDeviceFrame={handleSetDeviceFrame}
                theme={themeMode}
                onSetTheme={handleSetTheme}
                onOpenShareApp={() => handleOpenShare()}
              />
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
        onExecutiveUpdated={() => fetchPosts()}
        onHeroSlidesUpdated={() => loadDynamicContent()}
        onNewsItemsUpdated={() => loadDynamicContent()}
        onAnnouncementsUpdated={() => loadDynamicContent()}
        onDocsUpdated={() => loadDynamicContent()}
        onNoticeCircularsUpdated={() => loadDynamicContent()}
      />
    </DeviceFrameWrapper>
  );
}
