import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Folder,
  Tag,
  Search,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  RotateCw,
  FileText,
  ShieldCheck,
  Download,
  Filter,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { OrderRulingGuideItem, PlatformStyle } from '../types';
import { getOrdersRulingsGuidesFromFirestore } from '../services/firebase';
import { PRIMARY_BRAND_LOGO } from '../data/logos';

interface OrdersRulingsGuideViewProps {
  platform?: PlatformStyle;
  onOpenAdmin?: () => void;
}

export const OrdersRulingsGuideView: React.FC<OrdersRulingsGuideViewProps> = ({
  platform = 'android',
  onOpenAdmin,
}) => {
  const [items, setItems] = useState<OrderRulingGuideItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setIsRefreshing(true);
      const data = await getOrdersRulingsGuidesFromFirestore();
      setItems(data);
    } catch (err) {
      console.error('Failed to load Orders/Rulings/Guide items:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItems();

    const handleUpdate = () => {
      fetchItems();
    };

    window.addEventListener('orders-rulings-guide-updated', handleUpdate);
    return () => {
      window.removeEventListener('orders-rulings-guide-updated', handleUpdate);
    };
  }, []);

  // Compute unique folders and categories
  const folders = useMemo(() => {
    const list = Array.from(new Set(items.map((i) => i.folderName?.trim()).filter(Boolean)));
    return ['All', ...list];
  }, [items]);

  const categories = useMemo(() => {
    const list = Array.from(new Set(items.map((i) => i.category?.trim()).filter(Boolean)));
    return ['All', ...list];
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return items.filter((item) => {
      const matchesSearch =
        !q ||
        (item.fileName && item.fileName.toLowerCase().includes(q)) ||
        (item.folderName && item.folderName.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q));

      const matchesFolder =
        selectedFolder === 'All' || item.folderName?.trim().toLowerCase() === selectedFolder.toLowerCase();

      const matchesCategory =
        selectedCategory === 'All' || item.category?.trim().toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesFolder && matchesCategory;
    });
  }, [items, searchQuery, selectedFolder, selectedCategory]);

  const handleCopyLink = (item: OrderRulingGuideItem) => {
    if (!item.documentUrl) return;
    navigator.clipboard.writeText(item.documentUrl);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getCategoryBadgeStyle = (category: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('order')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-900';
    }
    if (cat.includes('ruling')) {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-900';
    }
    if (cat.includes('guide')) {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
    }
    if (cat.includes('manual')) {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-900';
    }
    return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  };

  return (
    <div className="w-full space-y-6 pb-14 animate-fade-in">
      {/* 🌟 Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#022A61] via-[#0A3D80] to-[#B91C1C] text-white p-6 sm:p-8 shadow-xl border-2 border-amber-400/50 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>OFFICIAL ARCHIVES & REPOSITORY</span>
              </span>
              <span className="text-xs text-amber-200 font-bold uppercase tracking-wider">
                DHENKANAL DIVISION
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Orders / Rullings / Guide
            </h2>

            <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
              Official postal department orders, statutory rulings, administrative guidelines, and cadre service manuals in card view.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              <span className="bg-white/20 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-amber-300" />
                <span>{folders.length - 1} Folders</span>
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-300" />
                <span>{items.length} Documents Available</span>
              </span>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3 bg-black/40 p-3 rounded-2xl border border-amber-400/30">
            <div className="w-16 h-16 rounded-full bg-white p-1 shadow-md ring-2 ring-amber-400 overflow-hidden flex items-center justify-center">
              <img
                src={PRIMARY_BRAND_LOGO}
                alt="NFPE Crest"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">CARD REPOSITORY</div>
              <div className="text-xs font-black text-white leading-tight">NFPE & AIPEU</div>
              <div className="text-[10px] text-slate-300">Dhenkanal Division</div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 Search & Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by file name, folder, category, or keyword..."
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Showing {filteredItems.length} of {items.length}
            </span>
            <button
              onClick={fetchItems}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Refresh repository"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-red-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Folder Pills */}
        <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <Folder className="w-3.5 h-3.5 text-amber-500" />
            <span>Filter by Folder:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {folders.map((folder) => {
              const isActive = selectedFolder === folder;
              return (
                <button
                  key={folder}
                  onClick={() => setSelectedFolder(folder)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {folder === 'All' ? '📁 All Folders' : `📁 ${folder}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Pills */}
        {categories.length > 2 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <Tag className="w-3.5 h-3.5 text-blue-500" />
              <span>Filter by Category:</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat === 'All' ? '🏷️ All Categories' : cat}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 🗂️ CARD TYPE DISPLAY OF UPLOADED DOCUMENTS */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse space-y-4"
            >
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3"></div>
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4"></div>
              <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
            </div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {filteredItems.map((docItem) => {
            const isCopied = copiedId === docItem.id;
            return (
              <div
                key={docItem.id}
                className="group p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-red-500/80 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Badges: Category & Folder */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getCategoryBadgeStyle(
                        docItem.category
                      )}`}
                    >
                      {docItem.category || 'Orders'}
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                      <Folder className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>{docItem.folderName || 'General'}</span>
                    </span>
                  </div>

                  {/* File Name */}
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-3">
                      {docItem.fileName}
                    </h3>

                    {docItem.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                        {docItem.notes}
                      </p>
                    )}
                  </div>

                  {/* Date Metadata */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{docItem.published || 'Official Order'}</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      {docItem.documentUrl?.includes('drive.google.com') ? '📁 Google Drive' : 'Verified'}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <a
                    href={docItem.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <span>View Document</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => handleCopyLink(docItem)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    title={isCopied ? 'Link Copied!' : 'Copy Document Link'}
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-white">
            No Documents Found
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No orders, rulings or guides matched "{searchQuery}" in folder "{selectedFolder}".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedFolder('All');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
