import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Home,
  Image as ImageIcon,
  Grid,
  Briefcase,
  FileText,
  Search,
  Calendar,
  ExternalLink,
  Play,
  FileCode,
  RotateCcw,
  X,
  Download,
  Folder,
  Tag,
  ChevronRight,
} from 'lucide-react';
import {
  ActiveTab,
  GalleryPhoto,
  CustomPortalApp,
  EmployeeResource,
  DownloadableForm,
} from '../types';
import {
  getStoredGallery,
  getStoredMyApps,
  getStoredEmployeeResources,
  getStoredForms,
} from '../data/portalMenuData';
import { PRIMARY_BRAND_LOGO } from '../data/logos';

// ================= 1. CONSISTENT INTERNAL PAGE NAVIGATION BAR =================

interface InternalPageNavBarProps {
  activeTab: ActiveTab;
  onBack: () => void;
  onHome: () => void;
  customTitle?: string;
}

const TAB_TITLES: Record<ActiveTab, string> = {
  home: 'Home Page',
  'user-portal': 'User Portal & Member Area',
  'orders-rulings-guide': 'Orders / Rulings / Guide',
  feed: 'Circulars & Feed',
  categories: 'Constituent Union Wings',
  directory: 'Office Bearers & Union Directory',
  gallery: 'Union Photo Gallery',
  'my-apps': 'My Apps & Online Portals',
  'employee-site': 'Employee Site & Postal Rules',
  forms: 'Downloadable Service Forms',
  offline: 'Offline Saved Vault',
  settings: 'Portal Settings & Preferences',
};

export const InternalPageNavBar: React.FC<InternalPageNavBarProps> = ({
  activeTab,
  onBack,
  onHome,
  customTitle,
}) => {
  const pageTitle = customTitle || TAB_TITLES[activeTab] || 'Portal Section';

  return (
    <div className="w-full mb-5 bg-white dark:bg-slate-900 rounded-2xl px-4 py-3 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        {/* 1. ← Back Button */}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm border border-slate-200/80 dark:border-slate-700 transition-all active:scale-95 cursor-pointer shadow-2xs"
          title="Return to previously visited page"
        >
          <ArrowLeft className="w-4 h-4 text-red-600 dark:text-red-400 stroke-[2.5]" />
          <span>← Back</span>
        </button>

        {/* 2. ⌂ Home Button */}
        <button
          type="button"
          onClick={onHome}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#022A61] to-[#0A3D80] hover:from-[#033579] hover:to-[#0d4a9a] text-white font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer shadow-sm"
          title="Go directly to main Home Page"
        >
          <Home className="w-4 h-4 text-amber-300 stroke-[2.3]" />
          <span>⌂ Home</span>
        </button>
      </div>

      {/* Current Page Breadcrumb Context */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
        <button
          type="button"
          onClick={onHome}
          className="hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer hidden sm:inline"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
        <span className="text-red-600 dark:text-amber-400 font-extrabold uppercase tracking-wider truncate max-w-[220px] sm:max-w-xs">
          {pageTitle}
        </span>
      </div>
    </div>
  );
};

// ================= 2. FULL-PAGE PHOTO GALLERY VIEW =================

export const PhotoGalleryPage: React.FC = () => {
  const [gallery, setGallery] = useState<GalleryPhoto[]>([]);
  const [galleryCat, setGalleryCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  useEffect(() => {
    const loadGallery = () => setGallery(getStoredGallery());
    loadGallery();
    window.addEventListener('storage', loadGallery);
    return () => window.removeEventListener('storage', loadGallery);
  }, []);

  const galleryCategories = useMemo(
    () => ['all', ...Array.from(new Set(gallery.map((g) => g.category).filter(Boolean)))],
    [gallery]
  );

  const filteredGallery = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return gallery.filter((g) => {
      const matchesCat = galleryCat === 'all' || g.category === galleryCat;
      const matchesSearch =
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        (g.date && g.date.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [gallery, galleryCat, searchQuery]);

  return (
    <div className="w-full space-y-6 pb-14 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#3B0764] via-[#581C87] to-[#B91C1C] text-white p-6 sm:p-8 shadow-xl border-2 border-amber-400/50 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
              <ImageIcon className="w-4 h-4" />
              <span>OFFICIAL VISUAL ARCHIVES · DHENKANAL DIVISION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Union Photo Gallery
            </h1>
            <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
              Historic divisional conferences, Staff Adalat meetings, felicitation ceremonies, philatelic exhibitions, and union rallies across Dhenkanal Division.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3 bg-black/35 p-3 rounded-2xl border border-amber-400/30">
            <div className="w-14 h-14 rounded-full bg-white p-1 shadow-md ring-2 ring-amber-400 overflow-hidden flex items-center justify-center">
              <img src={PRIMARY_BRAND_LOGO} alt="NFPE Crest" className="w-full h-full object-contain rounded-full" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">GALLERY ARCHIVE</div>
              <div className="text-sm font-black text-white">{gallery.length} Event Photos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event photos by title, category, or date..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
            Showing {filteredGallery.length} of {gallery.length} photos
          </div>
        </div>

        {galleryCategories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {galleryCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setGalleryCat(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  galleryCat === cat
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Events' : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Full-Page Photos Grid */}
      {filteredGallery.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGallery.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:border-purple-400 transition-all cursor-pointer flex flex-col"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    {photo.category} · {photo.date}
                  </div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white mt-1 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {photo.title}
                  </h3>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
                  <span>Click to enlarge photo</span>
                  <span>View Full →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-slate-500">
          No photos found matching your criteria.
        </div>
      )}

      {/* Lightbox Modal for Enlarged Photo */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
              <div>
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  {selectedPhoto.category} · {selectedPhoto.date}
                </div>
                <h3 className="font-bold text-base sm:text-lg mt-0.5">{selectedPhoto.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 bg-black flex items-center justify-center max-h-[75vh]">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ================= 3. FULL-PAGE MY APPS & ONLINE PORTALS VIEW =================

export const MyAppsPage: React.FC = () => {
  const [myApps, setMyApps] = useState<CustomPortalApp[]>([]);
  const [appSearch, setAppSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [runningApp, setRunningApp] = useState<CustomPortalApp | null>(null);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    const loadApps = () => setMyApps(getStoredMyApps());
    loadApps();
    window.addEventListener('storage', loadApps);
    return () => window.removeEventListener('storage', loadApps);
  }, []);

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(myApps.map((a) => a.category).filter(Boolean)))],
    [myApps]
  );

  const filteredApps = useMemo(() => {
    const q = appSearch.toLowerCase().trim();
    return myApps.filter((a) => {
      const matchesCat = selectedCategory === 'all' || a.category === selectedCategory;
      const matchesSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [myApps, appSearch, selectedCategory]);

  // If an interactive HTML tool is launched, show it in clean full-page view
  if (runningApp) {
    return (
      <div className="w-full space-y-4 pb-12 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setRunningApp(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-red-600" />
              <span>← Back to All Apps</span>
            </button>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {runningApp.name}
              </h2>
              <p className="text-[11px] text-slate-500">{runningApp.category}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIframeKey((k) => k + 1)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload Tool</span>
            </button>
            {runningApp.codeSnippet && (
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([runningApp.codeSnippet || ''], { type: 'text/html' });
                  const blobUrl = URL.createObjectURL(blob);
                  window.open(blobUrl, '_blank');
                }}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in New Tab</span>
              </button>
            )}
          </div>
        </div>

        <div className="w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white shadow-lg min-h-[750px]">
          {runningApp.codeSnippet ? (
            <iframe
              key={iframeKey}
              title={runningApp.name}
              sandbox="allow-scripts allow-forms allow-modals"
              srcDoc={runningApp.codeSnippet}
              className="w-full h-[800px] border-0 bg-[#f1f3f6]"
            />
          ) : (
            <div className="p-12 text-center">
              <a
                href={runningApp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-sm inline-flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open External Portal</span>
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-14 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#022A61] via-[#0369A1] to-[#0D9488] text-white p-6 sm:p-8 shadow-xl border-2 border-amber-400/50 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
              <Grid className="w-4 h-4" />
              <span>DIGITAL POSTAL UTILITIES & WEB PORTALS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              My Apps & Online Portals
            </h1>
            <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
              Interactive postal calculators, ACG-17 receipt generator, SAP ERP, CEPT, Finacle CBS, PLI, CGHS, and pension utilities in one dedicated full-page workspace.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3 bg-black/35 p-3 rounded-2xl border border-amber-400/30">
            <div className="w-14 h-14 rounded-full bg-white p-1 shadow-md ring-2 ring-amber-400 overflow-hidden flex items-center justify-center">
              <img src={PRIMARY_BRAND_LOGO} alt="NFPE Crest" className="w-full h-full object-contain rounded-full" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">APPLICATIONS</div>
              <div className="text-sm font-black text-white">{myApps.length} Active Tools</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={appSearch}
              onChange={(e) => setAppSearch(e.target.value)}
              placeholder="Search app name, ACG-17, calculator, ERP, CEPT, CBS..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
            Showing {filteredApps.length} of {myApps.length} apps
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Full-Page Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredApps.map((app) => {
          const isCodeApp = app.sourceType === 'code' || !!app.codeSnippet;
          return (
            <div
              key={app.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between group shadow-sm hover:shadow-xl ${
                isCodeApp
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/70 hover:border-amber-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 text-xs font-bold">
                  <span className={isCodeApp ? 'text-amber-800 dark:text-amber-300 uppercase' : 'text-blue-700 dark:text-blue-400 uppercase'}>
                    {app.category}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    {isCodeApp ? (
                      <>
                        <FileCode className="w-3.5 h-3.5 text-amber-600" />
                        <span>Interactive App</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                        <span>Web Portal</span>
                      </>
                    )}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-amber-400 transition-colors">
                  {app.name}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {app.description || 'Official postal utility and service portal.'}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-200/60 dark:border-slate-800">
                {isCodeApp ? (
                  <button
                    type="button"
                    onClick={() => {
                      setRunningApp(app);
                      setIframeKey((k) => k + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Launch Interactive Tool</span>
                  </button>
                ) : (
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <span>Open Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ================= 4. FULL-PAGE EMPLOYEE SITE & POSTAL RULES VIEW =================

export const EmployeeSitePage: React.FC<{ onNavigateTab?: (tab: ActiveTab) => void }> = ({
  onNavigateTab,
}) => {
  const [resources, setResources] = useState<EmployeeResource[]>([]);
  const [resSearch, setResSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');

  useEffect(() => {
    const loadRes = () => setResources(getStoredEmployeeResources());
    loadRes();
    window.addEventListener('storage', loadRes);
    return () => window.removeEventListener('storage', loadRes);
  }, []);

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(resources.map((r) => r.category).filter(Boolean)))],
    [resources]
  );

  const filteredResources = useMemo(() => {
    const q = resSearch.toLowerCase().trim();
    return resources.filter((r) => {
      const matchesCat = selectedCat === 'all' || r.category === selectedCat;
      const matchesSearch =
        !q || r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [resources, resSearch, selectedCat]);

  return (
    <div className="w-full space-y-6 pb-14 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#9A3412] via-[#C2410C] to-[#B45309] text-white p-6 sm:p-8 shadow-xl border-2 border-amber-300/50 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-200">
              <Briefcase className="w-4 h-4" />
              <span>EMPLOYEE CORNER & STATUTORY MANUALS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Employee Site & Postal Rules
            </h1>
            <p className="text-xs sm:text-sm text-amber-50 font-medium leading-relaxed">
              Complete reference hub for Postal Manual Volumes, CCS (Conduct & CCA) Rules, Pay Matrix tables, seniority lists, and establishment orders.
            </p>
          </div>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('forms')}
              className="px-4 py-2.5 rounded-2xl bg-white text-slate-900 hover:bg-amber-200 font-black text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4 text-red-600" />
              <span>View Downloadable Forms →</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={resSearch}
            onChange={(e) => setResSearch(e.target.value)}
            placeholder="Search Postal Manuals, CCS Rules, Pay Matrix, Seniority..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCat(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCat === cat
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Manuals & Rules' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.map((res) => (
          <a
            key={res.id}
            href={res.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 shadow-sm hover:shadow-lg transition-all flex items-center justify-between gap-4 group"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  {res.category}
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors mt-0.5">
                  {res.title}
                </h3>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <ExternalLink className="w-4 h-4" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

// ================= 5. FULL-PAGE DOWNLOADABLE FORMS VIEW =================

export const FormsPage: React.FC = () => {
  const [forms, setForms] = useState<DownloadableForm[]>([]);
  const [formSearch, setFormSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');

  useEffect(() => {
    const loadForms = () => setForms(getStoredForms());
    loadForms();
    window.addEventListener('storage', loadForms);
    return () => window.removeEventListener('storage', loadForms);
  }, []);

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(forms.map((f) => f.category).filter(Boolean)))],
    [forms]
  );

  const filteredForms = useMemo(() => {
    const q = formSearch.toLowerCase().trim();
    return forms.filter((f) => {
      const matchesCat = selectedCat === 'all' || f.category === selectedCat;
      const matchesSearch =
        !q ||
        f.title.toLowerCase().includes(q) ||
        f.formCode.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [forms, formSearch, selectedCat]);

  return (
    <div className="w-full space-y-6 pb-14 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] via-[#312E81] to-[#7F1D1D] text-white p-6 sm:p-8 shadow-xl border-2 border-amber-400/50 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
              <Download className="w-4 h-4" />
              <span>OFFICIAL DEPARTMENTAL & UNION PROFORMAS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Downloadable Service Forms
            </h1>
            <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
              Download official claim forms, leave applications, LDCE examination proformas, PLI/RPLI revival forms, and union membership forms.
            </p>
          </div>
          <div className="shrink-0 bg-black/35 px-4 py-3 rounded-2xl border border-amber-400/30 text-center">
            <div className="text-[10px] font-bold text-amber-300 uppercase">AVAILABLE PROFORMAS</div>
            <div className="text-lg font-black text-white">{forms.length} Forms</div>
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={formSearch}
            onChange={(e) => setFormSearch(e.target.value)}
            placeholder="Search by form title, form code (e.g. Form-1, CCL), or category..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCat(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCat === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredForms.map((form) => (
          <div
            key={form.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs font-bold">
                <span className="text-indigo-600 dark:text-indigo-400 uppercase">{form.category}</span>
                <span className="font-mono text-slate-500 dark:text-slate-400">{form.formCode}</span>
              </div>
              <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {form.title}
              </h3>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <a
                href={form.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Form PDF</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
