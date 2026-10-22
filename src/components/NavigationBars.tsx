import {
  Home,
  Layers,
  Bookmark,
  Users,
  Settings,
  Bell,
  RotateCw,
  Share2,
  Lock,
  FileText,
} from 'lucide-react';
import { ActiveTab, PlatformStyle } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  platform: PlatformStyle;
  offlineCount: number;
}

export const BottomNavBar: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  platform,
  offlineCount,
}) => {
  const isIOS = platform === 'ios';

  const tabs: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'feed', label: 'Circulars', icon: FileText },
    { id: 'categories', label: 'Wings', icon: Layers },
    { id: 'offline', label: 'Saved', icon: Bookmark },
    { id: 'directory', label: 'Union', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (isIOS) {
    // 🍏 iOS Cupertino Bottom Tab Bar (hidden on desktop md:)
    return (
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 pb-safe transition-all"
        role="navigation"
        aria-label="iOS Navigation"
      >
        <div className="max-w-lg mx-auto grid grid-cols-6 h-14">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className="relative flex flex-col items-center justify-center min-h-[44px] text-center active:opacity-60 transition-opacity"
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 stroke-[2.4] scale-105'
                        : 'text-slate-400 dark:text-slate-500 stroke-[1.8]'
                    }`}
                  />
                  {tab.id === 'offline' && offlineCount > 0 && (
                    <span className="absolute -top-1 -right-2 px-1 min-w-[15px] h-3.5 rounded-full bg-amber-500 text-[9px] font-bold text-white flex items-center justify-center">
                      {offlineCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1 tracking-tight transition-colors ${
                    isActive
                      ? 'font-bold text-blue-600 dark:text-blue-400'
                      : 'font-medium text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  // 🤖 Android Material 3 Navigation Bar (hidden on desktop md:)
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe transition-all shadow-lg"
      role="navigation"
      aria-label="Material 3 Navigation"
    >
      <div className="max-w-lg mx-auto grid grid-cols-6 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="group flex flex-col items-center justify-center min-h-[48px] py-1 active:scale-95 transition-transform"
            >
              <div
                className={`relative px-4 py-1 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 group-hover:bg-slate-200/50 dark:group-hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {tab.id === 'offline' && offlineCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 min-w-[16px] h-4 rounded-full bg-amber-500 text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                    {offlineCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] mt-1 transition-all ${
                  isActive
                    ? 'font-bold text-blue-800 dark:text-blue-200'
                    : 'font-normal text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

interface TopAppBarProps {
  platform: PlatformStyle;
  unreadNotifsCount: number;
  onOpenNotifications: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenShareModal: () => void;
  onOpenAdmin: () => void;
  activeTab?: ActiveTab;
  onSelectTab?: (tab: ActiveTab) => void;
  offlineCount?: number;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  platform,
  unreadNotifsCount,
  onOpenNotifications,
  onRefresh,
  isRefreshing,
  onOpenShareModal,
  onOpenAdmin,
  activeTab = 'home',
  onSelectTab,
  offlineCount = 0,
}) => {
  const isIOS = platform === 'ios';

  const navLinks: { id: ActiveTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'feed', label: 'Circulars & Feed' },
    { id: 'categories', label: 'Union Wings' },
    { id: 'offline', label: 'Offline Vault' },
    { id: 'directory', label: 'Office Bearers & Docs' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <header
      className={`sticky top-0 z-30 transition-colors pt-safe ${
        isIOS
          ? 'bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800'
          : 'bg-[#022A61] dark:bg-slate-900 text-white shadow-md'
      }`}
    >
      {/* Decorative India Post Gold & Red accent hairline */}
      <div className="h-0.5 w-full bg-gradient-to-r from-red-500 via-yellow-400 to-red-500" />
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 h-15 flex items-center justify-between gap-4">
        {/* Left: Brand / Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer shrink-0"
          onClick={() => onSelectTab && onSelectTab('feed')}
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-500 p-0.5 shadow-md flex items-center justify-center text-white font-black text-sm ring-2 ring-amber-400/30">
            📮
          </div>
          <div>
            <h1
              className={`text-sm sm:text-base font-black tracking-tight leading-none ${
                isIOS ? 'text-slate-900 dark:text-white' : 'text-white'
              }`}
            >
              AIPEU Dhenkanal
            </h1>
            <p
              className={`text-[10px] font-semibold mt-0.5 ${
                isIOS ? 'text-slate-500 dark:text-slate-400' : 'text-amber-200 dark:text-slate-300'
              }`}
            >
              Group C, Postman, MTS & AIGDSU
            </p>
          </div>
        </div>

        {/* Center: Desktop Navigation Bar (Direct Full Desktop View) */}
        {onSelectTab && (
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-3 text-xs font-bold">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onSelectTab(link.id)}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? isIOS
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white/20 text-white shadow-sm ring-1 ring-white/30'
                      : isIOS
                      ? 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                      : 'text-blue-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.id === 'offline' && offlineCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-[10px] text-white">
                      {offlineCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Admin Portal Button */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
            title="Open Union Admin Portal (Add Circulars, News, Modify Executives)"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin Portal</span>
            <span className="sm:hidden">Admin</span>
          </button>

          {/* Refresh Posts Button */}
          <button
            onClick={onRefresh}
            className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl transition-all active:scale-95 ${
              isIOS
                ? 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
                : 'text-white/90 hover:text-white hover:bg-white/10'
            }`}
            title="Refresh circulars from blog"
            aria-label="Refresh feed"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-300' : ''}`} />
          </button>

          {/* Quick Share App Button */}
          <button
            onClick={onOpenShareModal}
            className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl transition-all active:scale-95 ${
              isIOS
                ? 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
                : 'text-white/90 hover:text-white hover:bg-white/10'
            }`}
            title="Share Portal with Comrades"
            aria-label="Share App"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Push Notification Center Trigger */}
          <button
            onClick={onOpenNotifications}
            className={`relative min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl transition-all active:scale-95 ${
              isIOS
                ? 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
                : 'text-white/90 hover:text-white hover:bg-white/10'
            }`}
            title="Postal Circular Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
