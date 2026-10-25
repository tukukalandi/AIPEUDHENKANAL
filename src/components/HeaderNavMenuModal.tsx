import React, { useState, useEffect } from 'react';
import {
  X,
  Image as ImageIcon,
  Grid,
  Briefcase,
  Bookmark,
  Settings,
  ExternalLink,
  Search,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Layers,
  Sparkles,
  Shield,
  FileText,
  ChevronRight,
  UserCheck,
  Play,
  FileCode,
  RotateCcw,
} from 'lucide-react';
import { ActiveTab, PlatformStyle, GalleryPhoto, CustomPortalApp, EmployeeResource } from '../types';
import {
  getStoredGallery,
  getStoredMyApps,
  getStoredEmployeeResources,
} from '../data/portalMenuData';

interface HeaderNavMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  offlineCount: number;
  platform: PlatformStyle;
  initialSubView?: 'menu' | 'gallery' | 'apps' | 'employeeSite';
}

export const HeaderNavMenuModal: React.FC<HeaderNavMenuModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  offlineCount,
  platform,
  initialSubView = 'menu',
}) => {
  const [subView, setSubView] = useState<'menu' | 'gallery' | 'apps' | 'employeeSite'>(initialSubView);
  const [gallery, setGallery] = useState<GalleryPhoto[]>([]);
  const [myApps, setMyApps] = useState<CustomPortalApp[]>([]);
  const [employeeResources, setEmployeeResources] = useState<EmployeeResource[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [runningApp, setRunningApp] = useState<CustomPortalApp | null>(null);
  const [iframeKey, setIframeKey] = useState(0);

  // Search & filters
  const [appSearch, setAppSearch] = useState('');
  const [resSearch, setResSearch] = useState('');
  const [galleryCat, setGalleryCat] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      setGallery(getStoredGallery());
      setMyApps(getStoredMyApps());
      setEmployeeResources(getStoredEmployeeResources());
      setSubView(initialSubView);
      setSelectedPhoto(null);
      setRunningApp(null);
    }
  }, [isOpen, initialSubView]);

  if (!isOpen) return null;

  const isIOS = platform === 'ios';

  const menuItems = [
    {
      id: 'user-portal',
      title: 'User Portal (Self-Service)',
      desc: 'Member Grievances, Executive Directory & Contacts, ID Cards, Forms',
      count: 'Portal',
      icon: UserCheck,
      gradient: 'from-emerald-600 to-teal-600',
      badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
      action: () => {
        onSelectTab('user-portal');
        onClose();
      },
    },
    {
      id: 'gallery',
      title: 'Photo Gallery',
      desc: 'Historic conferences, Staff Adalat, and union rallies',
      count: `${gallery.length} Photos`,
      icon: ImageIcon,
      gradient: 'from-purple-600 to-indigo-600',
      badgeBg: 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300',
      action: () => setSubView('gallery'),
    },
    {
      id: 'apps',
      title: 'My Apps',
      desc: 'Quick portal shortcuts: SAP ERP, CEPT, Finacle, PLI & CGHS',
      count: `${myApps.length} Apps`,
      icon: Grid,
      gradient: 'from-blue-600 to-cyan-600',
      badgeBg: 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300',
      action: () => setSubView('apps'),
    },
    {
      id: 'employeeSite',
      title: 'Employee Site',
      desc: 'Postal Manuals Vol IV & VI, CCS Conduct Rules, Pay Matrix',
      count: `${employeeResources.length} Manuals`,
      icon: Briefcase,
      gradient: 'from-amber-600 to-orange-600',
      badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300',
      action: () => setSubView('employeeSite'),
    },
    {
      id: 'offline',
      title: 'Offline Vault',
      desc: 'Cached circulars & orders accessible without internet',
      count: offlineCount > 0 ? `${offlineCount} Saved` : 'Vault',
      badge: offlineCount > 0 ? `${offlineCount}` : undefined,
      icon: Bookmark,
      gradient: 'from-emerald-600 to-teal-600',
      badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
      action: () => {
        onSelectTab('offline');
        onClose();
      },
    },
    {
      id: 'settings',
      title: 'Settings',
      desc: 'Display modes, UI platform style, language, and font sizing',
      count: 'Preferences',
      icon: Settings,
      gradient: 'from-slate-700 to-slate-900',
      badgeBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      action: () => {
        onSelectTab('settings');
        onClose();
      },
    },
  ];

  // Gallery categories
  const galleryCategories = ['all', ...Array.from(new Set(gallery.map((g) => g.category)))];
  const filteredGallery = gallery.filter((g) =>
    galleryCat === 'all' ? true : g.category === galleryCat
  );

  // Filtered Apps
  const filteredApps = myApps.filter((a) => {
    const q = appSearch.toLowerCase().trim();
    return (
      !q ||
      a.name.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      (a.description && a.description.toLowerCase().includes(q))
    );
  });

  // Filtered Resources
  const filteredResources = employeeResources.filter((r) => {
    const q = resSearch.toLowerCase().trim();
    return (
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#022A61] to-[#0A3D80] text-white">
          <div className="flex items-center gap-3">
            {subView !== 'menu' && (
              <button
                type="button"
                onClick={() => setSubView('menu')}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all active:scale-95"
                title="Back to Menu"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <span className="text-[10px] font-black tracking-widest uppercase text-amber-300 block">
                {subView === 'menu' ? 'PORTAL NAVIGATION' : 'EXPLORE UTILITIES'}
              </span>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                {subView === 'menu' && 'Union Menu & Portals'}
                {subView === 'gallery' && 'Union Photo Gallery'}
                {subView === 'apps' && 'My Apps & Online Portals'}
                {subView === 'employeeSite' && 'Employee Site & Postal Rules'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all active:scale-95"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* ================= 1. ROOT MENU VIEW ================= */}
          {subView === 'menu' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Access official India Post employee tools, union photo archives, postal rules, offline vault, and settings.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={item.action}
                      className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all active:scale-[0.98] group bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md ${
                        item.id === 'offline' && offlineCount > 0
                          ? 'ring-1 ring-emerald-500/30'
                          : ''
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {item.title}
                          </h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeBg}`}
                          >
                            {item.count}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {item.desc}
                        </p>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= 2. PHOTO GALLERY VIEW ================= */}
          {subView === 'gallery' && (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              {galleryCategories.length > 2 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {galleryCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setGalleryCat(cat)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        galleryCat === cat
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {cat === 'all' ? 'All Photos' : cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Photos Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredGallery.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo)}
                    className="group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white">
                        {photo.category}
                      </div>
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2">
                        {photo.title}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {photo.date}
                        </span>
                        <span className="text-purple-600 dark:text-purple-400 font-bold group-hover:underline">
                          View full →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredGallery.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No photos found in this category.
                </div>
              )}
            </div>
          )}

          {/* ================= 3. MY APPS VIEW ================= */}
          {subView === 'apps' && (
            <div className="space-y-4">
              {/* Search box */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  placeholder="Search portal name, ERP, CEPT, CBS..."
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Apps List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredApps.map((app) => {
                  const isCodeApp = app.sourceType === 'code' || !!app.codeSnippet;
                  if (isCodeApp) {
                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => {
                          setRunningApp(app);
                          setIframeKey((k) => k + 1);
                        }}
                        className="p-3.5 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all flex items-start justify-between gap-3 group active:scale-[0.99] text-left cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 uppercase">
                              {app.category}
                            </span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                              <FileCode className="w-2.5 h-2.5 text-amber-600" /> HTML App
                            </span>
                          </div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                            {app.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {app.description || 'Custom interactive application'}
                          </p>
                        </div>

                        <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </div>
                      </button>
                    );
                  }
                  return (
                    <a
                      key={app.id}
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all flex items-start justify-between gap-3 group active:scale-[0.99]"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 uppercase">
                          {app.category}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {app.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {app.description}
                        </p>
                      </div>

                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </a>
                  );
                })}
              </div>

              {filteredApps.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No portal found matching "{appSearch}".
                </div>
              )}
            </div>
          )}

          {/* ================= 4. EMPLOYEE SITE VIEW ================= */}
          {subView === 'employeeSite' && (
            <div className="space-y-4">
              {/* Search box */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={resSearch}
                  onChange={(e) => setResSearch(e.target.value)}
                  placeholder="Search Postal Manuals, CCS rules, Pay Matrix..."
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Resource List */}
              <div className="space-y-2.5">
                {filteredResources.map((res) => (
                  <a
                    key={res.id}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all flex items-center justify-between gap-3 group active:scale-[0.99]"
                  >
                    <div className="min-w-0 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                          {res.category}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {res.title}
                        </h4>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </a>
                ))}
              </div>

              {filteredResources.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No employee resource found matching "{resSearch}".
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>AIPEU Dhenkanal Division Portal</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold transition-all text-xs"
          >
            Close
          </button>
        </div>
      </div>

      {/* Full Photo Modal Viewer */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex items-center justify-between border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-600 uppercase">
                  {selectedPhoto.category}
                </span>
                <h3 className="font-bold text-sm sm:text-base mt-1">{selectedPhoto.title}</h3>
                <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {selectedPhoto.date}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 bg-black flex items-center justify-center max-h-[70vh]">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className="max-h-[65vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Running HTML Application Modal */}
      {runningApp && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
          <div className="relative w-full max-w-4xl h-[85vh] bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-red-600 text-white shadow-xs">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-base truncate">{runningApp.name}</h3>
                  <span className="text-[10px] text-slate-400">{runningApp.category} • HTML Application</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIframeKey((k) => k + 1)}
                  title="Reload App"
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setRunningApp(null)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-red-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-white relative">
              <iframe
                key={iframeKey}
                title={runningApp.name}
                sandbox="allow-scripts allow-forms allow-modals"
                srcDoc={runningApp.codeSnippet}
                className="w-full h-full border-0 bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
