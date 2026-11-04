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

export interface CardColorTheme {
  name: string;
  cardBg: string;
  cardBorder: string;
  cardHoverBorder: string;
  accentBar: string;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  folderBadge: string;
  titleColor: string;
  titleHover: string;
  notesColor: string;
  buttonBg: string;
  copyBtnBg: string;
}

// 8-Color Deterministic Professional Pastel / Light Palette:
// 1. Light Blue, 2. Light Green, 3. Light Yellow, 4. Light Pink,
// 5. Lavender, 6. Light Orange, 7. Light Teal, 8. Soft Purple
export const CARD_COLOR_PALETTE: CardColorTheme[] = [
  {
    name: 'Light Blue',
    cardBg: 'bg-gradient-to-br from-sky-50 via-blue-50/90 to-indigo-50/70 dark:from-sky-950/50 dark:via-blue-950/40 dark:to-slate-900',
    cardBorder: 'border-sky-200/90 dark:border-sky-800/70',
    cardHoverBorder: 'hover:border-sky-400 dark:hover:border-sky-500',
    accentBar: 'bg-gradient-to-r from-sky-500 to-blue-600',
    iconBg: 'bg-sky-100 dark:bg-sky-900/70 text-sky-700 dark:text-sky-300 ring-1 ring-sky-300/60 dark:ring-sky-700',
    iconColor: 'text-sky-700 dark:text-sky-300',
    badgeBg: 'bg-sky-600 text-white',
    badgeText: 'text-white',
    badgeBorder: 'border-sky-700',
    folderBadge: 'bg-white/90 dark:bg-slate-800 text-sky-900 dark:text-sky-200 border-sky-200 dark:border-sky-800',
    titleColor: 'text-slate-900 dark:text-white',
    titleHover: 'group-hover:text-sky-800 dark:group-hover:text-sky-300',
    notesColor: 'text-slate-600 dark:text-slate-300',
    buttonBg: 'bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white shadow-sky-600/20',
    copyBtnBg: 'bg-white/90 hover:bg-sky-100 dark:bg-slate-800 dark:hover:bg-sky-900/50 text-sky-800 dark:text-sky-200 border border-sky-200 dark:border-sky-800',
  },
  {
    name: 'Light Green',
    cardBg: 'bg-gradient-to-br from-emerald-50 via-green-50/90 to-teal-50/70 dark:from-emerald-950/50 dark:via-green-950/40 dark:to-slate-900',
    cardBorder: 'border-emerald-200/90 dark:border-emerald-800/70',
    cardHoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-500',
    accentBar: 'bg-gradient-to-r from-emerald-500 to-green-600',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-300/60 dark:ring-emerald-700',
    iconColor: 'text-emerald-700 dark:text-emerald-300',
    badgeBg: 'bg-emerald-600 text-white',
    badgeText: 'text-white',
    badgeBorder: 'border-emerald-700',
    folderBadge: 'bg-white/90 dark:bg-slate-800 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
    titleColor: 'text-slate-900 dark:text-white',
    titleHover: 'group-hover:text-emerald-800 dark:group-hover:text-emerald-300',
    notesColor: 'text-slate-600 dark:text-slate-300',
    buttonBg: 'bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white shadow-emerald-600/20',
    copyBtnBg: 'bg-white/90 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800',
  },
  {
    name: 'Light Yellow',
    cardBg: 'bg-gradient-to-br from-amber-50 via-yellow-50/90 to-orange-50/60 dark:from-amber-950/50 dark:via-yellow-950/40 dark:to-slate-900',
    cardBorder: 'border-amber-200/90 dark:border-amber-800/70',
    cardHoverBorder: 'hover:border-amber-400 dark:hover:border-amber-500',
    accentBar: 'bg-gradient-to-r from-amber-500 to-yellow-600',
    iconBg: 'bg-amber-100 dark:bg-amber-900/70 text-amber-800 dark:text-amber-300 ring-1 ring-amber-300/60 dark:ring-amber-700',
    iconColor: 'text-amber-800 dark:text-amber-300',
    badgeBg: 'bg-amber-600 text-white',
    badgeText: 'text-white',
    badgeBorder: 'border-amber-700',
    folderBadge: 'bg-white/90 dark:bg-slate-800 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800',
    titleColor: 'text-slate-900 dark:text-white',
    titleHover: 'group-hover:text-amber-900 dark:group-hover:text-amber-300',
    notesColor: 'text-slate-600 dark:text-slate-300',
    buttonBg: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-600/20',
    copyBtnBg: 'bg-white/90 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800',
  },
  {
    name: 'Light Pink',
    cardBg: 'bg-gradient-to-br from-rose-50 via-pink-50/90 to-fuchsia-50/60 dark:from-rose-950/50 dark:via-pink-950/40 dark:to-slate-900',
    cardBorder: 'border-rose-200/90 dark:border-rose-800/70',
    cardHoverBorder: 'hover:border-rose-400 dark:hover:border-rose-500',
    accentBar: 'bg-gradient-to-r from-rose-500 to-pink-600',
    iconBg: 'bg-rose-100 dark:bg-rose-900/70 text-rose-700 dark:text-rose-300 ring-1 ring-rose-300/60 dark:ring-rose-700',
    iconColor: 'text-rose-700 dark:text-rose-300',
    badgeBg: 'bg-rose-600 text-white',
    badgeText: 'text-white',
    badgeBorder: 'border-rose-700',
    folderBadge: 'bg-white/90 dark:bg-slate-800 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-800',
    titleColor: 'text-slate-900 dark:text-white',
    titleHover: 'group-hover:text-rose-800 dark:group-hover:text-rose-300',
    notesColor: 'text-slate-600 dark:text-slate-300',
    buttonBg: 'bg-gradient-to-r from-rose-600 to-pink-700 hover:from-rose-500 hover:to-pink-600 text-white shadow-rose-600/20',
    copyBtnBg: 'bg-white/90 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-900/50 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800',
  },
  {
    name: 'Lavender',
    cardBg: 'bg-gradient-to-br from-indigo-50 via-violet-50/90 to-purple-50/60 dark:from-indigo-950/50 dark:via-violet-950/40 dark:to-slate-900',
    cardBorder: 'border-indigo-200/90 dark:border-indigo-800/70',
    cardHoverBorder: 'hover:border-indigo-400 dark:hover:border-indigo-500',
    accentBar: 'bg-gradient-to-r from-indigo-500 to-violet-600',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-300/60 dark:ring-indigo-700',
    iconColor: 'text-indigo-700 dark:text-indigo-300',
    badgeBg: 'bg-indigo-600 text-white',
    badgeText: 'text-white',
    badgeBorder: 'border-indigo-700',
    folderBadge: 'bg-white/90 dark:bg-slate-800 text-indigo-900 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800',
    titleColor: 'text-slate-900 dark:text-white',
    titleHover: 'group-hover:text-indigo-800 dark:group-hover:text-indigo-300',
    notesColor: 'text-slate-600 dark:text-slate-300',
    buttonBg: 'bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white shadow-indigo-600/20',
    copyBtnBg: 'bg-white/90 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800',
  },
  {
    name: 'Light Orange',
    cardBg: 'bg-gradient-to-br from-orange-50 via-amber-50/80 to-red-50/50 dark:from-orange-950/50 dark:via-amber-950/40 dark:to-slate-900',
    cardBorder: 'border-orange-200/90 dark:border-orange-800/70',
    cardHoverBorder: 'hover:border-orange-400 dark:hover:border-orange-500',
    accentBar: 'bg-gradient-to-r from-orange-500 to-red-500',
    iconBg: 'bg-orange-100 dark:bg-orange-900/70 text-orange-700 dark:text-orange-300 ring-1 ring-orange-300/60 dark:ring-orange-700',
    iconColor: 'text-orange-700 dark:text-orange-300',
    badgeBg: 'bg-orange-600 text-white',
    badgeText: 'text-white',
    badgeBorder: 'border-orange-700',
    folderBadge: 'bg-white/90 dark:bg-slate-800 text-orange-900 dark:text-orange-200 border-orange-200 dark:border-orange-800',
    titleColor: 'text-slate-900 dark:text-white',
    titleHover: 'group-hover:text-orange-800 dark:group-hover:text-orange-300',
    notesColor: 'text-slate-600 dark:text-slate-300',
    buttonBg: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-orange-600/20',
    copyBtnBg: 'bg-white/90 hover:bg-orange-100 dark:bg-slate-800 dark:hover:bg-orange-900/50 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-800',
  },
  {
    name: 'Light Teal',
    cardBg: 'bg-gradient-to-br from-teal-50 via-cyan-50/90 to-sky-50/60 dark:from-teal-950/50 dark:via-cyan-950/40 dark:to-slate-900',
    cardBorder: 'border-teal-200/90 dark:border-teal-800/70',
    cardHoverBorder: 'hover:border-teal-400 dark:hover:border-teal-500',
    accentBar: 'bg-gradient-to-r from-teal-500 to-cyan-600',
    iconBg: 'bg-teal-100 dark:bg-teal-900/70 text-teal-700 dark:text-teal-300 ring-1 ring-teal-300/60 dark:ring-teal-700',
    iconColor: 'text-teal-700 dark:text-teal-300',
    badgeBg: 'bg-teal-600 text-white',
    badgeText: 'text-white',
    badgeBorder: 'border-teal-700',
    folderBadge: 'bg-white/90 dark:bg-slate-800 text-teal-900 dark:text-teal-200 border-teal-200 dark:border-teal-800',
    titleColor: 'text-slate-900 dark:text-white',
    titleHover: 'group-hover:text-teal-800 dark:group-hover:text-teal-300',
    notesColor: 'text-slate-600 dark:text-slate-300',
    buttonBg: 'bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-500 hover:to-cyan-600 text-white shadow-teal-600/20',
    copyBtnBg: 'bg-white/90 hover:bg-teal-100 dark:bg-slate-800 dark:hover:bg-teal-900/50 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800',
  },
  {
    name: 'Soft Purple',
    cardBg: 'bg-gradient-to-br from-purple-50 via-fuchsia-50/85 to-pink-50/60 dark:from-purple-950/50 dark:via-fuchsia-950/40 dark:to-slate-900',
    cardBorder: 'border-purple-200/90 dark:border-purple-800/70',
    cardHoverBorder: 'hover:border-purple-400 dark:hover:border-purple-500',
    accentBar: 'bg-gradient-to-r from-purple-500 to-fuchsia-600',
    iconBg: 'bg-purple-100 dark:bg-purple-900/70 text-purple-700 dark:text-purple-300 ring-1 ring-purple-300/60 dark:ring-purple-700',
    iconColor: 'text-purple-700 dark:text-purple-300',
    badgeBg: 'bg-purple-600 text-white',
    badgeText: 'text-white',
    badgeBorder: 'border-purple-700',
    folderBadge: 'bg-white/90 dark:bg-slate-800 text-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-800',
    titleColor: 'text-slate-900 dark:text-white',
    titleHover: 'group-hover:text-purple-800 dark:group-hover:text-purple-300',
    notesColor: 'text-slate-600 dark:text-slate-300',
    buttonBg: 'bg-gradient-to-r from-purple-600 to-fuchsia-700 hover:from-purple-500 hover:to-fuchsia-600 text-white shadow-purple-600/20',
    copyBtnBg: 'bg-white/90 hover:bg-purple-100 dark:bg-slate-800 dark:hover:bg-purple-900/50 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800',
  },
];

export const getCardColorPalette = (index: number): CardColorTheme => {
  const safeIndex = Math.abs(index) % CARD_COLOR_PALETTE.length;
  return CARD_COLOR_PALETTE[safeIndex];
};

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

  return (
    <div className="w-full space-y-6 pb-14 animate-fade-in">
      {/* 🌟 Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#022A61] via-[#0A3D80] to-[#B91C1C] text-white p-6 sm:p-8 shadow-xl border-2 border-amber-400/50 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>OFFICIAL ARCHIVES & REPOSITORY</span>
              </span>
              <span className="text-xs text-amber-200 font-bold uppercase tracking-wider">
                DHENKANAL DIVISION
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Orders / Rulings / Guide
            </h2>

            <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
              Official postal department orders, statutory rulings, administrative guidelines, and cadre service manuals in color-coded card view.
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
        {categories.length > 1 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <Tag className="w-3.5 h-3.5 text-blue-500" />
              <span>Filter by Section (Orders / Rulings / Guide):</span>
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
                    {cat === 'All' ? '🏷️ All Sections' : cat}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 🗂️ DISTINCT PASTEL COLOR-CODED CARD DISPLAY OF UPLOADED DOCUMENTS */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((docItem, idx) => {
            const isCopied = copiedId === docItem.id;
            // Assign consistent deterministic color from the 8-color pastel palette
            // based on item's original index in `items` so filtering doesn't randomly shift colors
            const stableIndex = items.findIndex((x) => x.id === docItem.id);
            const palette = getCardColorPalette(stableIndex >= 0 ? stableIndex : idx);

            return (
              <div
                key={docItem.id}
                className={`group relative overflow-hidden p-5 rounded-3xl border-2 ${palette.cardBg} ${palette.cardBorder} ${palette.cardHoverBorder} shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between min-h-[230px]`}
              >
                {/* Top Decorative Accent Strip */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${palette.accentBar}`} />

                <div className="space-y-3.5 pt-1">
                  {/* Top Row: Attractive Icon + Category & Folder Badges */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${palette.iconBg}`}>
                        <FileText className={`w-5 h-5 ${palette.iconColor}`} />
                      </div>
                      <div>
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-2xs ${palette.badgeBg}`}
                        >
                          {docItem.category || 'Orders'}
                        </span>
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{docItem.published || 'Official Order'}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-extrabold border shadow-2xs ${palette.folderBadge}`}
                    >
                      <Folder className="w-3 h-3 shrink-0" />
                      <span className="truncate max-w-[110px]">{docItem.folderName || 'General'}</span>
                    </span>
                  </div>

                  {/* File Name & Notes */}
                  <div className="space-y-1.5">
                    <h3
                      className={`text-sm sm:text-base font-black leading-snug transition-colors line-clamp-3 ${palette.titleColor} ${palette.titleHover}`}
                    >
                      {docItem.fileName}
                    </h3>

                    {docItem.notes && (
                      <p className={`text-xs leading-relaxed line-clamp-2 font-medium ${palette.notesColor}`}>
                        {docItem.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-4 pt-3.5 border-t border-black/5 dark:border-white/10 flex items-center justify-between gap-2">
                  <a
                    href={docItem.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer ${palette.buttonBg}`}
                  >
                    <span>Open / Download</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => handleCopyLink(docItem)}
                    className={`p-2.5 rounded-xl transition-colors cursor-pointer shadow-2xs ${palette.copyBtnBg}`}
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

