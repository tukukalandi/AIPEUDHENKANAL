import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  Download,
  Trash2,
  HardDrive,
  WifiOff,
  Wifi,
  Search,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { BlogPost, PlatformStyle, ShareData } from '../types';
import {
  getOfflinePosts,
  removePostFromOffline,
  saveAllForOffline,
  clearAllOfflinePosts,
  getStorageUsage,
  getSimulatedOffline,
  setSimulatedOffline,
} from '../services/storage';

interface OfflineTabProps {
  allPosts: BlogPost[];
  onSelectPost: (post: BlogPost) => void;
  onSharePost: (data: ShareData) => void;
  platform: PlatformStyle;
  isOnline: boolean;
}

export const OfflineTab: React.FC<OfflineTabProps> = ({
  allPosts,
  onSelectPost,
  onSharePost,
  platform,
  isOnline,
}) => {
  const [offlinePosts, setOfflinePosts] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState({ count: 0, estimatedSizeKb: 0 });
  const [isSimulatingOffline, setIsSimulatingOffline] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const refreshOfflineData = () => {
    setOfflinePosts(getOfflinePosts());
    setStats(getStorageUsage());
    setIsSimulatingOffline(getSimulatedOffline());
  };

  useEffect(() => {
    refreshOfflineData();
    window.addEventListener('offline-storage-updated', refreshOfflineData);
    window.addEventListener('online-status-changed', refreshOfflineData);
    return () => {
      window.removeEventListener('offline-storage-updated', refreshOfflineData);
      window.removeEventListener('online-status-changed', refreshOfflineData);
    };
  }, []);

  const handleSaveAll = () => {
    const saved = saveAllForOffline(allPosts);
    refreshOfflineData();
    setFeedbackMsg(`Successfully cached ${saved} circulars for offline reading.`);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all cached offline circulars?')) {
      clearAllOfflinePosts();
      refreshOfflineData();
      setFeedbackMsg('Offline storage cleared.');
      setTimeout(() => setFeedbackMsg(''), 2500);
    }
  };

  const handleToggleSimulatedOffline = () => {
    const nextVal = !isSimulatingOffline;
    setSimulatedOffline(nextVal);
    setIsSimulatingOffline(nextVal);
  };

  const isIOS = platform === 'ios';

  const filteredOffline = offlinePosts.filter(
    (p) =>
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.snippet.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-12 animate-fade-in">
      {/* Header Info */}
      <div>
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
          Offline Reading Vault
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Access saved circulars, orders, and union decisions anywhere without internet
        </p>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-600 text-white text-xs font-semibold shadow-md">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Storage & Connectivity Status Card */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Local Cache Storage
              </span>
              <span className="text-[11px] text-slate-500">
                {stats.count} saved circulars · ~{stats.estimatedSizeKb} KB cached
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isOnline && !isSimulatingOffline
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              {isOnline && !isSimulatingOffline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Action Buttons: Cache All vs Clear */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleSaveAll}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold active:scale-95 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download All ({allPosts.length})</span>
          </button>

          <button
            onClick={handleClearAll}
            disabled={stats.count === 0}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold active:scale-95 transition-all disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cache</span>
          </button>
        </div>

        {/* Offline Simulator Switch */}
        <div className="pt-2 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            {isSimulatingOffline ? (
              <WifiOff className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <Wifi className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>Simulate Disconnected Offline</span>
          </div>
          <button
            onClick={handleToggleSimulatedOffline}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
              isSimulatingOffline
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {isSimulatingOffline ? 'Disconnect ON' : 'Normal'}
          </button>
        </div>
      </div>

      {/* Search Bar if items present */}
      {offlinePosts.length > 0 && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved circulars..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      )}

      {/* Saved Posts List */}
      <div>
        {filteredOffline.length === 0 ? (
          <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <Bookmark className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto stroke-1" />
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No saved circulars
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1">
                Tap the bookmark icon on any post or click <strong>'Download All'</strong> above to save circulars for reading on trains, field visits, or areas with poor mobile signal.
              </p>
            </div>
            <button
              onClick={handleSaveAll}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow active:scale-95 transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Recent Circulars</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOffline.map((post) => (
            <div
              key={post.id}
              onClick={() => onSelectPost(post)}
              className={`p-4 bg-white dark:bg-slate-900 border transition-all cursor-pointer active:scale-[0.99] flex items-start justify-between gap-3 ${
                isIOS
                  ? 'rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-sm'
                  : 'rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1">
                  <BookmarkCheck className="w-3.5 h-3.5 fill-current" />
                  <span>Available Offline</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">
                    {post.published
                      ? new Date(post.published).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : ''}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 mb-1">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {post.snippet}
                </p>
              </div>

              <div
                className="flex flex-col items-center gap-1 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    removePostFromOffline(post.id);
                    refreshOfflineData();
                  }}
                  className="min-h-[38px] min-w-[38px] flex items-center justify-center text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                  title="Remove from offline"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
};
