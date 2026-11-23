import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  FileText,
  ExternalLink,
  BookOpen,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { EmployeeResource, PlatformStyle } from '../types';
import { getStoredEmployeeResources } from '../data/portalMenuData';
import {
  getEmployeeResourcesFromFirestore,
  subscribeToEmployeeResources,
  resolveFileUrl,
} from '../services/firebase';
import { PageHeaderWithNav } from './PageHeaderWithNav';

interface EmployeeSitePageViewProps {
  onBack: () => void;
  onHome: () => void;
  platform?: PlatformStyle;
}

export const EmployeeSitePageView: React.FC<EmployeeSitePageViewProps> = ({
  onBack,
  onHome,
  platform,
}) => {
  const [resources, setResources] = useState<EmployeeResource[]>([]);
  const [resSearch, setResSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    setResources(getStoredEmployeeResources());
    getEmployeeResourcesFromFirestore()
      .then((list) => {
        if (list) setResources(list);
      })
      .catch(() => {});
    const unsub = subscribeToEmployeeResources((liveList) => setResources(liveList));
    return () => unsub();
  }, []);

  const handleOpenResource = async (rawUrl: string, title: string) => {
    if (!rawUrl) return;
    const resolved = rawUrl.startsWith('firestore-file://') ? await resolveFileUrl(rawUrl) : rawUrl;
    if (!resolved) return;
    const a = document.createElement('a');
    if (resolved.startsWith('data:')) {
      try {
        const [header, base64] = resolved.split(',');
        const mimeMatch = header.match(/data:([^;]+);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'application/pdf';
        const binary = atob(base64 || '');
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blobUrl = URL.createObjectURL(new Blob([bytes], { type: mimeType }));
        a.href = blobUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.download = `${title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60)}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
        return;
      } catch {
        // fallback below
      }
    }
    a.href = resolved;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const categories = ['all', ...Array.from(new Set(resources.map((r) => r.category)))];

  const filteredResources = resources.filter((r) => {
    const q = resSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q);
    const matchesCat = selectedCategory === 'all' || r.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="w-full space-y-6 pb-16 animate-fade-in">
      {/* Universal Page Header with Back & Home */}
      <PageHeaderWithNav
        title="Employee Site & Postal Rules"
        category="Reference Library"
        onBack={onBack}
        onHome={onHome}
      />

      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-900 via-orange-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border-2 border-amber-500/40 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-bold uppercase tracking-wider">
            <Briefcase className="w-3.5 h-3.5" />
            <span>POSTAL REFERENCE & CADRE RULES</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Employee Site & Statutory Manuals
          </h2>
          <p className="text-xs sm:text-sm text-amber-200 font-medium max-w-2xl leading-relaxed">
            Direct access to official Postal Manuals (Vol IV, VI, VII, VIII), CCS (Conduct) Rules 1964, CCS (CCA) Rules 1965, 7th CPC Pay Matrix, and GDS Service Conduct Rules.
          </p>
          <div className="pt-2 text-xs font-bold text-white/80">
            {resources.length} Reference Manuals & Links
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={resSearch}
            onChange={(e) => setResSearch(e.target.value)}
            placeholder="Search Postal Manuals, CCS rules, Pay Matrix, GDS rules..."
            className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
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

      {/* Resource Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((res) => {
          const isFirestoreFile = res.url?.startsWith('firestore-file://') || res.url?.startsWith('data:');
          return (
            <a
              key={res.id}
              href={isFirestoreFile ? '#' : res.url}
              target={isFirestoreFile ? undefined : '_blank'}
              rel={isFirestoreFile ? undefined : 'noopener noreferrer'}
              onClick={(e) => {
                if (isFirestoreFile) {
                  e.preventDefault();
                  handleOpenResource(res.url, res.title);
                }
              }}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-lg transition-all flex flex-col justify-between gap-3 group active:scale-[0.99] cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                    {res.category}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>

                <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
                  {res.title}
                </h4>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 group-hover:underline flex items-center gap-1">
                  <span>Open Reference</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-sm">
          No employee reference found matching "{resSearch}".
        </div>
      )}
    </div>
  );
};
