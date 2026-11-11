import React, { useState } from 'react';
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
  UserCheck,
  Menu,
  LayoutGrid,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { ActiveTab, PlatformStyle } from '../types';
import { PRIMARY_BRAND_LOGO } from '../data/logos';
import { HeaderNavMenuModal } from './HeaderNavMenuModal';

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
    { id: 'user-portal', label: 'Portal', icon: UserCheck },
    { id: 'feed', label: 'Circulars', icon: FileText },
    { id: 'categories', label: 'Wings', icon: Layers },
    { id: 'offline', label: 'Saved', icon: Bookmark },
    { id: 'directory', label: 'Union', icon: Users },
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
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [navMenuInitialSubView, setNavMenuInitialSubView] = useState<'menu' | 'apps'>('menu');

  const [isAdminAuth, setIsAdminAuth] = useState(() => {
    try {
      return (
        sessionStorage.getItem('aipeu_admin_authenticated') === 'true' ||
        localStorage.getItem('aipeu_admin_authenticated') === 'true'
      );
    } catch {
      return false;
    }
  });

  const [adminEmail, setAdminEmail] = useState(() => {
    try {
      return (
        sessionStorage.getItem('aipeu_admin_email') ||
        localStorage.getItem('aipeu_admin_email') ||
        'aipeup3dhenkanaldivn@gmail.com'
      );
    } catch {
      return 'aipeup3dhenkanaldivn@gmail.com';
    }
  });

  React.useEffect(() => {
    const checkAuth = () => {
      try {
        const authed =
          sessionStorage.getItem('aipeu_admin_authenticated') === 'true' ||
          localStorage.getItem('aipeu_admin_authenticated') === 'true';
        setIsAdminAuth(authed);
        const email =
          sessionStorage.getItem('aipeu_admin_email') ||
          localStorage.getItem('aipeu_admin_email') ||
          'aipeup3dhenkanaldivn@gmail.com';
        setAdminEmail(email);
      } catch {}
    };

    window.addEventListener('aipeu_admin_auth_changed', checkAuth);
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('aipeu_admin_auth_changed', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const handleSignOutAdmin = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      sessionStorage.removeItem('aipeu_admin_authenticated');
      sessionStorage.removeItem('aipeu_admin_email');
      localStorage.removeItem('aipeu_admin_authenticated');
      localStorage.removeItem('aipeu_admin_email');
      window.dispatchEvent(new Event('aipeu_admin_auth_changed'));
    } catch {}
    setIsAdminAuth(false);
  };

  // Offline Vault and Settings are accessed via the dedicated Menu button
  const navLinks: { id: ActiveTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'user-portal', label: 'User Portal' },
    { id: 'orders-rulings-guide', label: 'Orders / Rulings' },
    { id: 'feed', label: 'Circulars & Feed' },
    { id: 'categories', label: 'Union Wings' },
    { id: 'directory', label: 'Directory' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'my-apps', label: 'My Apps' },
  ];

  return (
    <header
      className={`sticky top-0 z-30 transition-colors pt-safe ${
        isIOS
          ? 'bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800'
          : 'bg-[#022A61] dark:bg-slate-900 text-white shadow-md'
      }`}
    >
      {/* Decorative India Post Gold & Red accent hairline matching reference screenshot */}
      <div className="h-0.5 w-full bg-gradient-to-r from-red-600 via-amber-400 to-red-600" />

      {/* 📱 MOBILE VIEW (< md): Exact 2-row layout matching reference screenshot image_df0433dd.png */}
      <div className="md:hidden px-3.5 pt-3 pb-2.5 flex flex-col gap-2.5 bg-[#022A61] dark:bg-slate-900 text-white">
        {/* Row 1: Logo on Left + Full Website Name taking entire remaining width on Right */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => onSelectTab && onSelectTab('home')}
        >
          {/* Emblem / Logo */}
          <div className="w-12 h-12 rounded-full bg-white p-1 shadow-md ring-2 ring-amber-400 overflow-hidden shrink-0 flex items-center justify-center">
            <img
              src={PRIMARY_BRAND_LOGO}
              alt="NFPE Official Website Logo"
              className="w-full h-full object-contain rounded-full"
            />
          </div>

          {/* Full Website Name: Crisp, prominent, completely readable */}
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-black text-white leading-snug tracking-tight">
              NFPE AIPEU Unions AIGDSU AIPRPA AIPCPCCWF – Dhenkanal Division
            </h1>
          </div>
        </div>

        {/* Row 2: Centered Action Bar (Grid [Apps], Menu [Yellow Pill], Refresh, Share, Bell with red dot) */}
        <div className="flex items-center justify-center gap-3 pt-1">
          {/* 1. Grid Button (Quick Apps Launcher -> Opens full-page My Apps) */}
          <button
            type="button"
            onClick={() => {
              if (onSelectTab) {
                onSelectTab('my-apps');
              } else {
                setNavMenuInitialSubView('apps');
                setIsNavMenuOpen(true);
              }
            }}
            className="w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white flex items-center justify-center border border-white/10 shadow-xs transition-all active:scale-95 cursor-pointer"
            title="My Apps & Online Tools"
            aria-label="My Apps"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          {/* 2. Menu Button (Prominent Yellow Pill matching screenshot) */}
          <button
            type="button"
            onClick={() => {
              setNavMenuInitialSubView('menu');
              setIsNavMenuOpen(true);
            }}
            className="bg-[#F59E0B] hover:bg-[#EAB308] text-slate-950 font-black text-sm px-6 py-2 rounded-full shadow-md flex items-center gap-2 active:scale-95 transition-all cursor-pointer ring-1 ring-amber-300"
            title="Open Portal Menu"
            aria-label="Open Menu"
          >
            <Menu className="w-4 h-4 stroke-[2.8]" />
            <span>Menu</span>
            {offlineCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[9px] font-black">
                {offlineCount}
              </span>
            )}
          </button>

          {/* 3. Refresh Posts Button */}
          <button
            type="button"
            onClick={onRefresh}
            className="w-10 h-10 rounded-2xl hover:bg-white/15 text-white/90 hover:text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            title="Refresh circulars from blog"
            aria-label="Refresh feed"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-300' : ''}`} />
          </button>

          {/* 4. Quick Share App Button */}
          <button
            type="button"
            onClick={onOpenShareModal}
            className="w-10 h-10 rounded-2xl hover:bg-white/15 text-white/90 hover:text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            title="Share Portal with Comrades"
            aria-label="Share App"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* 5. Push Notification Center Trigger with Red Indicator Dot */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative w-10 h-10 rounded-2xl hover:bg-white/15 text-white/90 hover:text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            title="Postal Circular Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
          </button>

          {/* 6. Admin Login / Logout Facility for Mobile */}
          {onOpenAdmin && (
            isAdminAuth ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="h-10 px-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 border border-amber-400/40 shadow-xs active:scale-95 transition-all cursor-pointer font-bold text-xs"
                  title={`Admin Portal (${adminEmail})`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span className="text-[11px]">Admin</span>
                </button>
                <button
                  type="button"
                  onClick={handleSignOutAdmin}
                  className="w-8 h-10 rounded-2xl bg-red-950/70 hover:bg-red-900 text-red-200 flex items-center justify-center border border-red-500/30 transition-all active:scale-95 cursor-pointer"
                  title="Log Out Admin"
                  aria-label="Log Out Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="h-10 px-2.5 rounded-2xl bg-red-600/90 hover:bg-red-600 text-white flex items-center gap-1.5 border border-white/20 shadow-xs active:scale-95 transition-all cursor-pointer font-bold text-xs"
                title="Official Admin Login"
              >
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-[11px]">Admin</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* 💻 DESKTOP VIEW (hidden on mobile, flex on md+) */}
      <div className="hidden md:flex w-full px-4 sm:px-6 lg:px-8 xl:px-12 min-h-[62px] py-2 items-center justify-between gap-4">
        {/* Left: Brand / Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer min-w-0"
          onClick={() => onSelectTab && onSelectTab('home')}
        >
          {/* Single Website Logo */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white p-1 shadow-lg ring-2 ring-amber-400 overflow-hidden shrink-0 flex items-center justify-center">
            <img
              src={PRIMARY_BRAND_LOGO}
              alt="NFPE Official Website Logo"
              className="w-full h-full object-contain rounded-full transform hover:scale-105 transition-transform"
            />
          </div>
          <div className="min-w-0">
            <h1
              className={`text-xs sm:text-sm lg:text-base font-black tracking-tight leading-snug line-clamp-2 sm:line-clamp-none ${
                isIOS ? 'text-slate-900 dark:text-white' : 'text-white'
              }`}
              title="NFPE AIPEU Unions AIGDSU AIPRPA AIPCPCCWF - Dhenkanal Division"
            >
              NFPE AIPEU Unions AIGDSU AIPRPA AIPCPCCWF - Dhenkanal Division
            </h1>
          </div>
        </div>

        {/* Center: Desktop Navigation Bar */}
        {onSelectTab && (
          <nav className="flex items-center gap-1.5 lg:gap-2.5 text-xs font-bold">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onSelectTab(link.id)}
                  className={`px-2.5 lg:px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
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
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Admin Login / Console Status Button */}
          {onOpenAdmin && (
            isAdminAuth ? (
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-red-950/80 to-slate-900 border border-red-500/50 px-2.5 py-1.5 rounded-xl shadow-xs">
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1.5 text-white hover:text-amber-300 transition-colors font-bold text-xs cursor-pointer"
                  title={`AIPEU Admin Console (${adminEmail})`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="hidden xl:inline text-[11px] font-black truncate max-w-[170px]">
                    {adminEmail}
                  </span>
                  <span className="xl:hidden text-[11px] font-black">Admin</span>
                </button>
                <div className="h-3.5 w-px bg-white/20" />
                <button
                  type="button"
                  onClick={handleSignOutAdmin}
                  className="px-1.5 py-0.5 rounded-md hover:bg-white/20 text-red-300 hover:text-white transition-colors flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                  title="Sign Out from Admin"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all cursor-pointer border border-red-400/40"
                title="Admin Portal Login (aipeup3dhenkanaldivn@gmail.com)"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            )
          )}

          {/* Menu Button */}
          <button
            onClick={() => {
              setNavMenuInitialSubView('menu');
              setIsNavMenuOpen(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs shadow-sm active:scale-95 transition-all cursor-pointer ${
              isIOS
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25 ring-1 ring-amber-400'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/30 ring-2 ring-amber-300'
            }`}
            title="Open Menu"
            aria-label="Open Menu"
          >
            <Menu className="w-4 h-4 stroke-[2.5]" />
            <span>Menu</span>
            {offlineCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[9px] font-black">
                {offlineCount}
              </span>
            )}
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

      {/* Header Menu Modal for Photo Gallery, My Apps, Employee Site, Offline Vault, Settings */}
      <HeaderNavMenuModal
        isOpen={isNavMenuOpen}
        onClose={() => setIsNavMenuOpen(false)}
        onSelectTab={(tab) => {
          if (onSelectTab) onSelectTab(tab);
        }}
        offlineCount={offlineCount}
        platform={platform}
        initialSubView={navMenuInitialSubView}
        onOpenAdmin={onOpenAdmin}
      />
    </header>
  );
};
