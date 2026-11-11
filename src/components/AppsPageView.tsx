import React, { useState, useEffect } from 'react';
import {
  Grid,
  Search,
  FileCode,
  Play,
  ExternalLink,
  RotateCcw,
  X,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react';
import { CustomPortalApp, PlatformStyle } from '../types';
import { getStoredMyApps } from '../data/portalMenuData';
import { subscribeToMyApps, getMyAppsFromFirestore } from '../services/firebase';
import { PageHeaderWithNav } from './PageHeaderWithNav';

interface AppsPageViewProps {
  onBack: () => void;
  onHome: () => void;
  platform?: PlatformStyle;
}

export const AppsPageView: React.FC<AppsPageViewProps> = ({
  onBack,
  onHome,
  platform,
}) => {
  const [myApps, setMyApps] = useState<CustomPortalApp[]>([]);
  const [appSearch, setAppSearch] = useState('');
  const [runningApp, setRunningApp] = useState<CustomPortalApp | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // 1. Initial cached apps
    setMyApps(getStoredMyApps());

    // 2. Load latest from Firestore
    getMyAppsFromFirestore()
      .then((apps) => {
        if (apps && apps.length > 0) setMyApps(apps);
      })
      .catch((err) => console.warn('Could not fetch apps from Firestore:', err));

    // 3. Real-time sub-second sync across all domains
    const unsub = subscribeToMyApps((liveApps) => {
      if (liveApps && liveApps.length > 0) {
        setMyApps(liveApps);
      }
    });

    return () => {
      unsub();
    };
  }, []);

  const categories = ['all', ...Array.from(new Set(myApps.map((a) => a.category)))];

  const filteredApps = myApps.filter((a) => {
    const q = appSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      a.name.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      (a.description && a.description.toLowerCase().includes(q));
    const matchesCat = selectedCategory === 'all' || a.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="w-full space-y-6 pb-16 animate-fade-in">
      {/* Universal Page Header with Back & Home */}
      <PageHeaderWithNav
        title="My Apps & Portals"
        category="Utilities"
        onBack={onBack}
        onHome={onHome}
      />

      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-sky-900 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border-2 border-blue-500/40 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-200 text-xs font-bold uppercase tracking-wider">
            <Grid className="w-3.5 h-3.5" />
            <span>POSTAL UTILITIES & CUSTOM TOOLS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            My Apps & Online Tools
          </h2>
          <p className="text-xs sm:text-sm text-blue-200 font-medium max-w-2xl leading-relaxed">
            Direct shortcuts to SAP ERP, CEPT, Finacle, PLI / RPLI, CGHS, and custom standalone HTML applications designed for postal staff.
          </p>
          <div className="pt-2 text-xs font-bold text-white/80">
            {myApps.length} Applications Available
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={appSearch}
            onChange={(e) => setAppSearch(e.target.value)}
            placeholder="Search portal name, ERP, CEPT, CBS, tools..."
            className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {categories.length > 2 && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApps.map((app) => {
          const isCodeApp = app.sourceType === 'code' || !!app.codeSnippet;
          if (isCodeApp) {
            return (
              <div
                key={app.id}
                onClick={() => {
                  setRunningApp(app);
                  setIframeKey((k) => k + 1);
                }}
                className="p-5 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-lg transition-all flex flex-col justify-between gap-3 group active:scale-[0.99] cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 uppercase">
                      {app.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                      <FileCode className="w-3 h-3 text-amber-600" /> HTML Application
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {app.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {app.description || 'Custom interactive application uploaded by union admin.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-amber-100 dark:border-amber-900/40 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Launch Full View</span>
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
            );
          }
          return (
            <a
              key={app.id}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg transition-all flex flex-col justify-between gap-3 group active:scale-[0.99]"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 uppercase">
                  {app.category}
                </span>
                <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {app.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {app.description || 'Official departmental web portal'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                  Open Website
                </span>
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {filteredApps.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-sm">
          No portals or applications found matching "{appSearch}".
        </div>
      )}

      {/* Full-view HTML Application Runner Modal */}
      {runningApp && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex flex-col p-2 sm:p-4 animate-fade-in">
          <div className="w-full flex-1 max-w-6xl mx-auto bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
            {/* Modal Top Bar */}
            <div className="p-3 sm:p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-sm sm:text-base text-white truncate">
                    {runningApp.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 truncate">
                    Interactive HTML Application
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIframeKey((k) => k + 1)}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Reload Application"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reload</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRunningApp(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                  aria-label="Close app"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Iframe Runner Container */}
            <div className="flex-1 w-full bg-slate-100 dark:bg-slate-950 relative overflow-hidden">
              <iframe
                key={iframeKey}
                title={runningApp.name}
                srcDoc={runningApp.codeSnippet || '<p>No application code loaded.</p>'}
                sandbox="allow-scripts allow-forms allow-modals allow-downloads"
                className="w-full h-full border-0 bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
