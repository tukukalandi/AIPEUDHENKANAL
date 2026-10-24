import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  Share2,
  FileText,
  Calendar,
  ChevronRight,
  WifiOff,
  Sparkles,
  MessageCircle,
  Send,
  Download,
  Flame,
  Phone,
  MapPin,
  ExternalLink,
  Shield,
  Users,
  CheckCircle,
  UserPlus,
} from 'lucide-react';
import { BlogPost, PlatformStyle, ShareData, OfficeBearer, ActiveTab, HeroSlide } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { NewsSlider } from './NewsSlider';
import { FeedHeroSlider } from './FeedHeroSlider';
import {
  UNION_CONTACT_INFO,
  OFFICE_BEARERS,
  IMPORTANT_DOCUMENTS,
} from '../data/unionInfo';
import { getExecutiveMembersFromFirestore } from '../services/firebase';
import { AddOfficeBearerModal } from './AddOfficeBearerModal';
import { sortOfficeBearers } from '../utils/officeBearerSorting';

interface FeedTabProps {
  posts: BlogPost[];
  onSelectPost: (post: BlogPost) => void;
  onSharePost: (data: ShareData) => void;
  onToggleSaveOffline: (post: BlogPost) => void;
  savedPostIds: string[];
  platform: PlatformStyle;
  isOnline: boolean;
  officeBearers?: OfficeBearer[];
  onRefreshOfficeBearers?: () => void;
  onOpenAdmin?: () => void;
  onNavigateTab?: (tab: ActiveTab) => void;
  heroSlides?: HeroSlide[];
}

const CATEGORIES = [
  'All Circulars',
  "GROUP - 'C' AGENDA",
  'POSTMAN & GROUP - D',
  'GDS / ED AGENDA',
  'CIRCULARS & ORDERS',
  'ଓଡ଼ିଆ (Odia)',
];

export const FeedTab: React.FC<FeedTabProps> = ({
  posts,
  onSelectPost,
  onSharePost,
  onToggleSaveOffline,
  savedPostIds,
  platform,
  isOnline,
  officeBearers,
  onRefreshOfficeBearers,
  onOpenAdmin,
  onNavigateTab,
  heroSlides,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All Circulars');
  const [searchQuery, setSearchQuery] = useState('');

  // 🎯 Circular & Feed Hero Slider items configured from Admin Portal
  const feedSlides = useMemo(() => {
    return (heroSlides || []).filter(
      (s) => (s.targetPage === 'feed' || s.targetPage === 'both') && s.active !== false
    );
  }, [heroSlides]);

  const isIOS = platform === 'ios';

  // 🏛️ Office Bearers State synced with Firestore and Directory page
  const [bearers, setBearers] = useState<OfficeBearer[]>(officeBearers || OFFICE_BEARERS);
  const [bearerSearch, setBearerSearch] = useState('');
  const [bearerWingFilter, setBearerWingFilter] = useState('All');
  const [isAddBearerModalOpen, setIsAddBearerModalOpen] = useState(false);

  // Sync when prop changes
  useEffect(() => {
    if (officeBearers && officeBearers.length > 0) {
      setBearers(officeBearers);
    }
  }, [officeBearers]);

  // Listen to global updates when any bearer is added from anywhere in the app
  useEffect(() => {
    const fetchLatestBearers = () => {
      getExecutiveMembersFromFirestore()
        .then((data) => {
          if (data && data.length > 0) setBearers(data);
        })
        .catch((err) => console.error(err));
    };

    fetchLatestBearers();

    const handleBearersUpdated = () => {
      fetchLatestBearers();
      if (onRefreshOfficeBearers) onRefreshOfficeBearers();
    };

    window.addEventListener('office-bearers-updated', handleBearersUpdated);
    return () => window.removeEventListener('office-bearers-updated', handleBearersUpdated);
  }, [onRefreshOfficeBearers]);

  const filteredBearers = useMemo(() => {
    const sorted = sortOfficeBearers(bearers);
    return sorted.filter((b) => {
      const q = bearerSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.designation.toLowerCase().includes(q) ||
        b.branch.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q);

      const branchLower = (b.branch || '').toLowerCase();
      const matchesWing =
        bearerWingFilter === 'All'
          ? true
          : bearerWingFilter === "Group 'C'"
          ? branchLower.includes('group') && branchLower.includes('c')
          : bearerWingFilter === 'Postman/MTS'
          ? branchLower.includes('postm') || branchLower.includes('mts')
          : bearerWingFilter === 'AIGDSU'
          ? branchLower.includes('gds') || branchLower.includes('aigdsu')
          : bearerWingFilter === 'Pensioners'
          ? branchLower.includes('pensioner') || branchLower.includes('aiprpa')
          : bearerWingFilter === 'Women'
          ? branchLower.includes('women')
          : true;

      return matchesSearch && matchesWing;
    });
  }, [bearers, bearerSearch, bearerWingFilter]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Category match
      const matchesCategory =
        selectedCategory === 'All Circulars'
          ? true
          : selectedCategory === 'ଓଡ଼ିଆ (Odia)'
          ? /[\u0B00-\u0B7F]/.test(post.title + post.snippet)
          : post.categories.some((c) =>
              c.toLowerCase().includes(selectedCategory.toLowerCase())
            );

      // Search match
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.snippet.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  const getCategoryColor = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('group - c')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
    if (c.includes('gds') || c.includes('aigdsu') || c.includes('ଗ୍ରାମୀଣ')) {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
    if (c.includes('postman') || c.includes('mts') || c.includes('group - d')) {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
    if (c.includes('circular') || c.includes('order') || c.includes('adalat')) {
      return 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border-red-200 dark:border-red-800';
    }
    return 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800';
  };

  return (
    <div className="w-full pb-12">
      {/* Offline Alert Banner if offline */}
      {!isOnline && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-2xl bg-amber-500 text-white text-xs font-semibold shadow-md">
          <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
          <div className="flex-1">
            <span>Offline Mode Active</span>
            <span className="font-normal block text-[11px] opacity-90">
              Reading from local cache. Bookmarked circulars are ready to read.
            </span>
          </div>
        </div>
      )}

      {/* Full Desktop 2-Column Grid: Left 8 Cols (News & Feed), Right 4 Cols (Sidebar & Widgets) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
        {/* Main Content Area (8 Cols on Desktop) */}
        <div className="lg:col-span-8 space-y-4">
          {/* 🌟 1. CIRCULAR & FEED HERO SLIDER & LATEST UPDATES (Managed via Admin Portal) */}
          {!searchQuery && selectedCategory === 'All Circulars' && (
            <div className="space-y-4 pt-0.5">
              {feedSlides.length > 0 && (
                <FeedHeroSlider
                  slides={feedSlides}
                  onOpenAdmin={onOpenAdmin}
                  onNavigateTab={onNavigateTab}
                />
              )}

              <NewsSlider
                posts={posts}
                onSelectPost={onSelectPost}
                onSharePost={onSharePost}
                onToggleSaveOffline={onToggleSaveOffline}
                savedPostIds={savedPostIds}
              />
            </div>
          )}

          {/* 🌈 2. Colorful Quick Action Cards (WhatsApp, Telegram, Cadre Portals) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <a
              href={UNION_CONTACT_INFO.whatsappGroup}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm hover:shadow-md active:scale-95 transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4 fill-current" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-100 block">
                  Official
                </span>
                <span className="text-xs font-bold truncate block">WhatsApp</span>
              </div>
            </a>

            <a
              href={UNION_CONTACT_INFO.telegramChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm hover:shadow-md active:scale-95 transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Send className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-sky-100 block">
                  Channel
                </span>
                <span className="text-xs font-bold truncate block">Telegram</span>
              </div>
            </a>

            <button
              onClick={() => setSelectedCategory("GROUP - 'C' AGENDA")}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-sm hover:shadow-md active:scale-95 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-100 block">
                  Cadre
                </span>
                <span className="text-xs font-bold truncate block">Group 'C'</span>
              </div>
            </button>

            <button
              onClick={() => setSelectedCategory('GDS / ED AGENDA')}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-sm hover:shadow-md active:scale-95 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-100 block">
                  Gramin
                </span>
                <span className="text-xs font-bold truncate block">AIGDSU</span>
              </div>
            </button>
          </div>

          {/* Search Input Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search circulars, orders, DA/DR, 8th CPC, GDS, Dhenkanal..."
              className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all shadow-sm ${
                isIOS
                  ? 'rounded-2xl border-slate-200/80 dark:border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  : 'rounded-xl border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 active:scale-95 ${
                    isActive
                      ? 'bg-[#022A61] dark:bg-blue-600 text-white shadow-md ring-2 ring-blue-500/30'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Circulars List */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 font-bold">
              <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-extrabold">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                {filteredPosts.length} Circulars & Notices
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Updated from Dhenkanal HO</span>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
                <Filter className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No matching circulars found
                </p>
                <p className="text-xs text-slate-500">
                  Try a different keyword or select 'All Circulars'.
                </p>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const isSaved = savedPostIds.includes(post.id);
                const dateStr = post.published
                  ? new Date(post.published).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '';

                const firstImage = post.images && post.images.length > 0 ? post.images[0] : null;
                const primaryCat = post.categories[0] || 'Union Bulletin';
                const catColorClass = getCategoryColor(primaryCat);

                return (
                  <div
                    key={post.id}
                    onClick={() => onSelectPost(post)}
                    className={`p-4 sm:p-5 bg-white dark:bg-slate-900 border transition-all cursor-pointer active:scale-[0.99] group shadow-sm hover:shadow-md ${
                      isIOS
                        ? 'rounded-2xl border-slate-200/80 dark:border-slate-800/80 hover:border-blue-400'
                        : 'rounded-2xl border-slate-200 dark:border-slate-800 hover:border-blue-500'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Category & Date Header */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold mb-2">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${catColorClass}`}>
                            {primaryCat}
                          </span>
                          <span className="text-slate-400 text-[10px] flex items-center gap-1 font-medium">
                            <Calendar className="w-3 h-3" />
                            {dateStr}
                          </span>
                          {post.driveLinks && post.driveLinks.length > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-[10px] font-bold flex items-center gap-0.5">
                              <FileText className="w-2.5 h-2.5" />
                              PDF Order
                            </span>
                          )}
                          {isSaved && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold">
                              Saved Offline
                            </span>
                          )}
                        </div>

                        {/* Card Title */}
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                          {post.title}
                        </h3>

                        {/* Snippet */}
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed font-normal">
                          {post.snippet}
                        </p>
                      </div>

                      {/* Thumbnail Image if post has photo */}
                      {firstImage && (
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-800 shadow-sm relative">
                          <img
                            src={firstImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Bottom Row Actions */}
                    <div
                      className="flex items-center justify-between pt-3 mt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-xs text-slate-400 font-medium truncate max-w-[200px]">
                        {post.author}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onToggleSaveOffline(post)}
                          className={`min-h-[38px] px-2.5 flex items-center gap-1 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                            isSaved
                              ? 'text-amber-700 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800'
                              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                          title={isSaved ? 'Remove from offline' : 'Save for offline'}
                        >
                          {isSaved ? (
                            <>
                              <BookmarkCheck className="w-4 h-4 fill-current text-amber-500" />
                              <span className="hidden sm:inline">Offline</span>
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-4 h-4" />
                              <span className="hidden sm:inline">Save</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() =>
                            onSharePost({
                              title: post.title,
                              text: post.snippet,
                              url: post.url,
                            })
                          }
                          className="min-h-[38px] px-2.5 flex items-center gap-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95 text-xs font-semibold"
                          title="Share"
                        >
                          <Share2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 🏛️ Right Sidebar Area (4 Cols on Desktop - Like Original Blog) */}
        <div className="lg:col-span-4 space-y-5">
          {/* 1. Official Union Connect Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#022A61] via-[#083E82] to-[#0A4D9E] text-white shadow-lg space-y-3.5">
            <div>
              <span className="text-[10px] font-black tracking-wider uppercase text-amber-300 block">
                Official Union Community
              </span>
              <h3 className="text-base font-black mt-1">
                AIPEU & AIGDSU Dhenkanal
              </h3>
              <p className="text-xs text-blue-100 mt-0.5 leading-relaxed">
                Stay updated with breaking postal notices, bonus orders, and strike announcements.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <a
                href={UNION_CONTACT_INFO.whatsappGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Join WhatsApp Group</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <a
                href={UNION_CONTACT_INFO.telegramChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md transition-all active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <Send className="w-4 h-4" />
                  <span>Join Telegram Channel</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>
          </div>

          {/* 2. Comprehensive Executive Office Bearers Widget (All Bearers Available & Synced) */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-md space-y-3.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                    Executive Office Bearers
                  </h3>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Dhenkanal Division
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white shadow-sm">
                  {bearers.length} Executives
                </span>
                <button
                  onClick={() => setIsAddBearerModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-[11px] font-black shadow-sm transition-all active:scale-95 cursor-pointer"
                  title="Add new office bearer (immediately syncs to Directory page)"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>+ Add</span>
                </button>
              </div>
            </div>

            {/* Quick Search for Office Bearers */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={bearerSearch}
                onChange={(e) => setBearerSearch(e.target.value)}
                placeholder="Search executive comrades by name, post, office..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Wing Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-[10px] font-bold">
              {['All', "Group 'C'", 'Postman/MTS', 'AIGDSU', 'Pensioners', 'Women'].map((w) => (
                <button
                  key={w}
                  onClick={() => setBearerWingFilter(w)}
                  className={`px-2 py-0.5 rounded-lg whitespace-nowrap transition-all ${
                    bearerWingFilter === w
                      ? 'bg-[#022A61] dark:bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>

            {/* Scrollable List of ALL Office Bearers */}
            <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredBearers.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No office bearers match "{bearerSearch}".
                </div>
              ) : (
                filteredBearers.map((bearer, idx) => {
                  const initials = bearer.name
                    .replace(/^Com\.\s*/i, '')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'CM';

                  return (
                    <div
                      key={bearer.id || idx}
                      className="pt-2.5 first:pt-0 flex items-center justify-between gap-2.5 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Avatar */}
                        {bearer.photoUrl ? (
                          <img
                            src={bearer.photoUrl}
                            alt={bearer.name}
                            className="w-9 h-9 rounded-xl object-cover ring-2 ring-amber-400/50 shadow-sm shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 text-white font-black text-xs flex items-center justify-center ring-1 ring-amber-400/40 shadow-sm shrink-0">
                            {initials}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-red-600 dark:group-hover:text-amber-400 transition-colors">
                            {bearer.name}
                          </p>
                          <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300 truncate">
                            {bearer.designation}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                            {bearer.location} · {bearer.branch.split(',')[0]}
                          </p>
                        </div>
                      </div>

                      {bearer.phone && (
                        <a
                          href={`tel:${bearer.phone.replace(/[^0-9+]/g, '')}`}
                          className="px-2.5 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 hover:bg-red-600 hover:text-white font-bold text-[11px] transition-all shrink-0 flex items-center gap-1 shadow-sm active:scale-95"
                          title={`Call ${bearer.name}`}
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call</span>
                        </a>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Navigate to Full Directory Tab */}
            {onNavigateTab && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => onNavigateTab('directory')}
                  className="text-xs font-bold text-blue-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>View All {bearers.length} in Office Bearers & Docs Page</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. Statutory Documents & Forms Widget */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Statutory Documents & Forms</span>
            </h3>

            <div className="space-y-2">
              {IMPORTANT_DOCUMENTS.slice(0, 3).map((doc, idx) => (
                <a
                  key={idx}
                  href={doc.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors group"
                >
                  <span className="truncate pr-2">{doc.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                </a>
              ))}
            </div>
          </div>

          {/* 4. Union Subscription / Check-Off Card */}
          <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-black text-sm">
              <Shield className="w-4 h-4" />
              <span>Union Subscription & Relief Fund</span>
            </div>
            <p className="text-amber-800 dark:text-amber-300 leading-relaxed font-normal">
              A Federal Attempt to Ensure Service Security of All the Employees with Mutual Benefit for All the Staffs and Members. Check-off verification available at Divisional Office.
            </p>
          </div>

          {/* 5. In-App PWA Install Banner */}
          <PWAInstallButton variant="banner" />
        </div>
      </div>

      {/* Add Office Bearer Modal (Real-time synchronization with Directory & Feed) */}
      <AddOfficeBearerModal
        isOpen={isAddBearerModalOpen}
        onClose={() => setIsAddBearerModalOpen(false)}
        onBearerAdded={() => {
          if (onRefreshOfficeBearers) onRefreshOfficeBearers();
        }}
      />
    </div>
  );
};
