import React, { useState, useEffect } from 'react';
import {
  Users,
  Phone,
  MapPin,
  FileText,
  ExternalLink,
  MessageCircle,
  Send,
  Mail,
  Shield,
  Download,
  CheckCircle,
  UserPlus,
  Search,
  Plus,
  BookOpen,
  Filter,
  Clock,
  X,
} from 'lucide-react';
import { PlatformStyle, OfficeBearer, UnionDocumentRuling } from '../types';
import {
  OFFICE_BEARERS,
  UNION_CONTACT_INFO,
  IMPORTANT_DOCUMENTS,
} from '../data/unionInfo';
import {
  getExecutiveMembersFromFirestore,
  getUnionDocumentsAndRulingsFromFirestore,
} from '../services/firebase';
import { AddOfficeBearerModal } from './AddOfficeBearerModal';
import {
  sortOfficeBearers,
  groupOfficeBearersByWing,
  WingCategory,
  WING_DEFINITIONS,
  getRoleRank,
} from '../utils/officeBearerSorting';

interface DirectoryTabProps {
  platform: PlatformStyle;
  officeBearers?: OfficeBearer[];
  onRefreshOfficeBearers?: () => void;
  onOpenAdmin?: () => void;
}

export const DirectoryTab: React.FC<DirectoryTabProps> = ({
  platform,
  officeBearers,
  onRefreshOfficeBearers,
  onOpenAdmin,
}) => {
  const [activeSection, setActiveSection] = useState<'bearers' | 'documents' | 'contact'>(
    'bearers'
  );
  const [bearers, setBearers] = useState<OfficeBearer[]>(officeBearers || OFFICE_BEARERS);
  const [unionRulings, setUnionRulings] = useState<UnionDocumentRuling[]>(IMPORTANT_DOCUMENTS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Sync with prop when passed
  useEffect(() => {
    if (officeBearers && officeBearers.length > 0) {
      setBearers(officeBearers);
    }
  }, [officeBearers]);

  useEffect(() => {
    const fetchLatest = () => {
      getExecutiveMembersFromFirestore()
        .then((data) => {
          if (data && data.length > 0) setBearers(data);
        })
        .catch((err) => console.error(err));
    };

    const fetchRulings = () => {
      getUnionDocumentsAndRulingsFromFirestore()
        .then((data) => {
          if (data && data.length > 0) setUnionRulings(data);
        })
        .catch((err) => console.error(err));
    };

    fetchLatest();
    fetchRulings();

    const handleUpdate = () => {
      fetchLatest();
      if (onRefreshOfficeBearers) onRefreshOfficeBearers();
    };

    const handleRulingsUpdate = () => {
      fetchRulings();
    };

    window.addEventListener('office-bearers-updated', handleUpdate);
    window.addEventListener('union-rulings-updated', handleRulingsUpdate);
    return () => {
      window.removeEventListener('office-bearers-updated', handleUpdate);
      window.removeEventListener('union-rulings-updated', handleRulingsUpdate);
    };
  }, [onRefreshOfficeBearers]);

  const [selectedWingFilter, setSelectedWingFilter] = useState<'all' | WingCategory>('all');
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [selectedDocType, setSelectedDocType] = useState<string>('all');

  // 🔍 Top Search Bar & Recent Searches for Directory (stores & shows last 5 searched terms)
  const [directorySearch, setDirectorySearch] = useState('');
  const [recentDirectorySearches, setRecentDirectorySearches] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('aipeu_recent_searches_directory');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const commitRecentDirectorySearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed || trimmed.length < 2) return;
    setRecentDirectorySearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('aipeu_recent_searches_directory', JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not save recent directory searches', err);
      }
      return updated;
    });
  };

  const removeRecentDirectorySearch = (termToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentDirectorySearches((prev) => {
      const updated = prev.filter((s) => s !== termToRemove);
      try {
        localStorage.setItem('aipeu_recent_searches_directory', JSON.stringify(updated));
      } catch (err) {
        console.warn(err);
      }
      return updated;
    });
  };

  const clearAllRecentDirectorySearches = () => {
    setRecentDirectorySearches([]);
    try {
      localStorage.removeItem('aipeu_recent_searches_directory');
    } catch (err) {
      console.warn(err);
    }
  };

  // Debounce auto-save to recent searches
  useEffect(() => {
    const q = directorySearch.trim();
    if (q.length >= 3) {
      const timer = setTimeout(() => {
        commitRecentDirectorySearch(q);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [directorySearch]);

  // Available document types for filter pills
  const availableDocTypes = React.useMemo(() => {
    const types = new Set<string>();
    unionRulings.forEach((r) => {
      if (r.type) types.add(r.type);
    });
    return ['all', ...Array.from(types)];
  }, [unionRulings]);

  // Filtered and sorted union documents & rulings
  const filteredUnionRulings = React.useMemo(() => {
    return unionRulings
      .filter((doc) => {
        if (doc.published === 'false') return false;
        const matchesType = selectedDocType === 'all' || doc.type === selectedDocType;
        const q = (directorySearch || docSearchQuery).trim().toLowerCase();
        const matchesQuery =
          !q ||
          doc.title.toLowerCase().includes(q) ||
          (doc.desc && doc.desc.toLowerCase().includes(q)) ||
          doc.type.toLowerCase().includes(q);
        return matchesType && matchesQuery;
      })
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  }, [unionRulings, selectedDocType, docSearchQuery, directorySearch]);

  // Master sorted bearers according to union protocol:
  // 1. Group C -> 2. Postman & MTS -> 3. GDS -> 4. Other wings
  // Within each wing: Divisional Secretary -> Divisional President -> Other members
  const filteredBearersForSearch = React.useMemo(() => {
    const q = directorySearch.trim().toLowerCase();
    if (!q) return bearers;
    return bearers.filter((b) => {
      return (
        b.name.toLowerCase().includes(q) ||
        b.designation.toLowerCase().includes(q) ||
        b.branch.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q) ||
        (b.phone && b.phone.includes(q))
      );
    });
  }, [bearers, directorySearch]);

  const sortedAllBearers = React.useMemo(() => sortOfficeBearers(filteredBearersForSearch), [filteredBearersForSearch]);
  const wingGroups = React.useMemo(() => groupOfficeBearersByWing(filteredBearersForSearch), [filteredBearersForSearch]);

  const displayedGroups = React.useMemo(() => {
    if (selectedWingFilter === 'all') {
      return wingGroups;
    }
    return wingGroups.filter((g) => g.category === selectedWingFilter);
  }, [wingGroups, selectedWingFilter]);

  const isIOS = platform === 'ios';

  const renderBearerCard = (bearer: OfficeBearer, idx: number) => {
    const branchLower = (bearer.branch || '').toLowerCase();
    const desigLower = (bearer.designation || '').toLowerCase();
    const roleRank = getRoleRank(bearer);
    const roleType = bearer.roleType;

    // Distinct vibrant theme based on leadership role & division wing
    let theme = {
      cardBorder: 'border-2 border-blue-300 dark:border-blue-600/60 hover:border-blue-500',
      cardShadow: 'shadow-md shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/15',
      topAccent: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500',
      badgeBg: 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white',
      ringBorder: 'ring-4 ring-blue-400/30 border-2 border-blue-600',
      avatarFallback: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800',
      callBtn: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 shadow-blue-500/30',
      cardBg: 'bg-white dark:bg-slate-900',
      tagBg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60',
      iconColor: 'text-blue-600 dark:text-blue-400',
    };

    if (roleRank === 1) {
      // ⭐ Divisional Secretary
      theme = {
        cardBorder: 'border-2 border-blue-500 dark:border-blue-500 hover:border-blue-600 ring-2 ring-blue-500/15',
        cardShadow: 'shadow-lg shadow-blue-500/15 hover:shadow-2xl hover:shadow-blue-500/25',
        topAccent: 'bg-gradient-to-r from-blue-700 via-indigo-600 to-red-600',
        badgeBg: 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white',
        ringBorder: 'ring-4 ring-blue-400/50 border-2 border-blue-700',
        avatarFallback: 'bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900',
        callBtn: 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 hover:to-indigo-900 shadow-blue-600/30',
        cardBg: 'bg-white dark:bg-slate-900',
        tagBg: 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border border-blue-300 dark:border-blue-800 font-extrabold',
        iconColor: 'text-blue-600 dark:text-blue-400',
      };
    } else if (roleRank === 2 || desigLower.includes('president') || roleType === 'president') {
      // 👑 Divisional President
      theme = {
        cardBorder: 'border-2 border-amber-400 dark:border-amber-500/70 hover:border-amber-500 ring-2 ring-amber-400/15',
        cardShadow: 'shadow-lg shadow-amber-500/15 hover:shadow-2xl hover:shadow-amber-500/25',
        topAccent: 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600',
        badgeBg: 'bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white',
        ringBorder: 'ring-4 ring-amber-400/40 border-2 border-amber-600',
        avatarFallback: 'bg-gradient-to-br from-amber-500 via-orange-600 to-red-700',
        callBtn: 'bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-700 hover:to-red-700 shadow-amber-500/30',
        cardBg: 'bg-white dark:bg-slate-900',
        tagBg: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800 font-extrabold',
        iconColor: 'text-amber-600 dark:text-amber-400',
      };
    } else if (branchLower.includes('women') || desigLower.includes('women')) {
      theme = {
        cardBorder: 'border-2 border-pink-400 dark:border-pink-500/70 hover:border-pink-500',
        cardShadow: 'shadow-md shadow-pink-500/10 hover:shadow-xl hover:shadow-pink-500/25',
        topAccent: 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600',
        badgeBg: 'bg-gradient-to-r from-pink-600 to-rose-600 text-white',
        ringBorder: 'ring-4 ring-pink-400/40 border-2 border-pink-600',
        avatarFallback: 'bg-gradient-to-br from-pink-500 via-rose-600 to-fuchsia-700',
        callBtn: 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 shadow-pink-500/30',
        cardBg: 'bg-white dark:bg-slate-900',
        tagBg: 'bg-pink-50 text-pink-800 dark:bg-pink-950/70 dark:text-pink-300 border border-pink-200 dark:border-pink-900/60',
        iconColor: 'text-pink-600 dark:text-pink-400',
      };
    } else if (
      desigLower.includes('financial') ||
      desigLower.includes('treasurer') ||
      roleType === 'treasurer'
    ) {
      theme = {
        cardBorder: 'border-2 border-emerald-400 dark:border-emerald-500/70 hover:border-emerald-500',
        cardShadow: 'shadow-md shadow-emerald-500/10 hover:shadow-xl hover:shadow-emerald-500/25',
        topAccent: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600',
        badgeBg: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white',
        ringBorder: 'ring-4 ring-emerald-400/40 border-2 border-emerald-600',
        avatarFallback: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800',
        callBtn: 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-emerald-500/30',
        cardBg: 'bg-white dark:bg-slate-900',
        tagBg: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
      };
    } else if (branchLower.includes('postmen') || branchLower.includes('mts')) {
      theme = {
        cardBorder: 'border-2 border-purple-400 dark:border-purple-500/70 hover:border-purple-500',
        cardShadow: 'shadow-md shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/25',
        topAccent: 'bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-600',
        badgeBg: 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white',
        ringBorder: 'ring-4 ring-purple-400/40 border-2 border-purple-600',
        avatarFallback: 'bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800',
        callBtn: 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 shadow-purple-500/30',
        cardBg: 'bg-white dark:bg-slate-900',
        tagBg: 'bg-purple-50 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60',
        iconColor: 'text-purple-600 dark:text-purple-400',
      };
    } else if (branchLower.includes('aigdsu') || branchLower.includes('gds')) {
      theme = {
        cardBorder: 'border-2 border-orange-400 dark:border-orange-500/70 hover:border-orange-500',
        cardShadow: 'shadow-md shadow-orange-500/10 hover:shadow-xl hover:shadow-orange-500/25',
        topAccent: 'bg-gradient-to-r from-orange-500 via-amber-500 to-red-600',
        badgeBg: 'bg-gradient-to-r from-orange-600 to-amber-700 text-white',
        ringBorder: 'ring-4 ring-orange-400/40 border-2 border-orange-600',
        avatarFallback: 'bg-gradient-to-br from-orange-600 via-amber-600 to-red-700',
        callBtn: 'bg-gradient-to-r from-orange-600 to-amber-700 hover:from-orange-700 hover:to-amber-800 shadow-orange-500/30',
        cardBg: 'bg-white dark:bg-slate-900',
        tagBg: 'bg-orange-50 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 border border-orange-200 dark:border-orange-900/60',
        iconColor: 'text-orange-600 dark:text-orange-400',
      };
    }

    // Extract initials for fallback
    const cleanName = bearer.name.replace(/^(Com\.|Shri|Sri|Smt\.)\s*/i, '').trim();
    const nameParts = cleanName.split(' ').filter(Boolean);
    const initials =
      nameParts.length >= 2
        ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
        : cleanName.slice(0, 2).toUpperCase();

    return (
      <div
        key={bearer.id || `${bearer.name}-${idx}`}
        className={`overflow-hidden transition-all duration-300 flex flex-col justify-between rounded-3xl ${theme.cardBorder} ${theme.cardBg} ${theme.cardShadow} hover:-translate-y-1`}
      >
        {/* Colorful Top Accent Stripe */}
        <div className={`h-2.5 w-full ${theme.topAccent}`} />

        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          {/* Header Wing & Location */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {roleRank === 1 && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-xs flex items-center gap-1">
                  <span>⭐</span>
                  <span>Divisional Secretary</span>
                </span>
              )}
              {roleRank === 2 && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500 text-white shadow-xs flex items-center gap-1">
                  <span>👑</span>
                  <span>Divisional President</span>
                </span>
              )}
              {roleRank === 3 && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                  <span>💰</span>
                  <span>Financial Secretary</span>
                </span>
              )}
              {roleRank === 4 && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-600 text-white shadow-xs flex items-center gap-1">
                  <span>🛡️</span>
                  <span>Assistant Secretary</span>
                </span>
              )}
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${theme.badgeBg} shadow-xs`}>
                {bearer.branch.replace(/,.*$/, '')}
              </span>
            </div>

            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              <MapPin className="w-2.5 h-2.5 text-red-500 shrink-0" />
              <span className="truncate max-w-[110px]">{bearer.location}</span>
            </span>
          </div>

          {/* Member Portrait Photo & Identity */}
          <div className="flex items-center gap-3.5 mb-3.5">
            <div className="relative shrink-0">
              {bearer.photoUrl ? (
                <img
                  src={bearer.photoUrl}
                  alt={bearer.name}
                  className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover shadow-md ${theme.ringBorder}`}
                  onError={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.display = 'none';
                    const next = target.nextElementSibling as HTMLElement;
                    if (next) next.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                style={{ display: bearer.photoUrl ? 'none' : 'flex' }}
                className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl ${theme.avatarFallback} text-white flex-col items-center justify-center font-black shadow-md ${theme.ringBorder}`}
              >
                <span className="text-lg font-black tracking-wider leading-none">
                  {initials}
                </span>
                <span className="text-[9px] opacity-90 uppercase tracking-widest mt-1">
                  AIPEU
                </span>
              </div>
              {/* Verified Union Seal */}
              <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white dark:bg-slate-900 shadow">
                <CheckCircle className={`w-4 h-4 ${theme.iconColor}`} />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-2">
                {bearer.name}
              </h3>
              <div className="mt-1">
                <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-lg ${theme.tagBg}`}>
                  {bearer.designation}
                </span>
              </div>
            </div>
          </div>

          {/* Full Branch Name Tag */}
          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-2 font-medium">
            🏛️ {bearer.branch}
          </p>
        </div>

        {/* Phone & Call CTA */}
        <div className="px-4 py-3 sm:px-5 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
          {bearer.phone ? (
            <>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Phone / Contact
                </span>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate block">
                  {bearer.phone}
                </span>
              </div>
              <a
                href={`tel:${bearer.phone.replace(/[^0-9+]/g, '')}`}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-xs font-black shadow-md active:scale-95 transition-all ${theme.callBtn}`}
                title={`Call ${bearer.name}`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
            </>
          ) : (
            <span className="text-xs text-slate-400 italic">Official Division Line</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-12 animate-fade-in">
      {/* Tab Header */}
      <div>
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
          Union Directory & Documents
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Executive leadership ordered strictly by union protocol: Group C, Postman & MTS, GDS (Divisional Secretary first, then Divisional President, then members)
        </p>
      </div>

      {/* 🔍 Top Search Bar & Recent Searches for Directory & Bearers */}
      <div className="space-y-2 bg-white dark:bg-slate-900 p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <input
            type="text"
            value={directorySearch}
            onChange={(e) => setDirectorySearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                commitRecentDirectorySearch(directorySearch);
              }
            }}
            placeholder="Search office bearers by name, phone, designation, branch, or rulings..."
            className={`w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all shadow-inner ${
              isIOS
                ? 'rounded-2xl border-slate-200/80 dark:border-slate-700 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'rounded-xl border-slate-300 dark:border-slate-700 focus:border-red-600 focus:ring-2 focus:ring-red-600/20'
            }`}
          />
          {directorySearch && (
            <button
              onClick={() => setDirectorySearch('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 🕒 Recent Searches (Stores and shows last 5 searched terms in localStorage) */}
        {recentDirectorySearches.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-xs">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>Recent Searches:</span>
            </div>
            {recentDirectorySearches.map((term) => (
              <div
                key={term}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/60 text-slate-700 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-300 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs group cursor-pointer"
              >
                <button
                  type="button"
                  onClick={() => {
                    setDirectorySearch(term);
                    commitRecentDirectorySearch(term);
                  }}
                  className="cursor-pointer"
                  title={`Search for "${term}"`}
                >
                  {term}
                </button>
                <button
                  type="button"
                  onClick={(e) => removeRecentDirectorySearch(term, e)}
                  className="text-slate-400 hover:text-red-500 text-[11px] ml-0.5 leading-none transition-colors"
                  title="Remove from history"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={clearAllRecentDirectorySearches}
              className="text-[10px] font-bold text-slate-400 hover:text-red-500 underline ml-1 cursor-pointer transition-colors"
              title="Clear search history"
            >
              Clear History
            </button>
          </div>
        )}
      </div>

      {/* Segmented Control Bar */}
      <div className="flex p-1 bg-slate-200/70 dark:bg-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveSection('bearers')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeSection === 'bearers'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Office Bearers
        </button>
        <button
          onClick={() => setActiveSection('documents')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeSection === 'documents'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Documents & Rulings
        </button>
        <button
          onClick={() => setActiveSection('contact')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeSection === 'contact'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Headquarters
        </button>
      </div>

      {/* Section 1: Office Bearers */}
      {activeSection === 'bearers' && (
        <div className="space-y-6">
          {/* Top Info Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-blue-500/10 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between flex-wrap gap-3">
            <div className="max-w-3xl">
              <strong className="text-red-700 dark:text-red-400 font-extrabold">
                NFPE AIPEU Unions AIGDSU AIPRPA AIPCPCCWF - Dhenkanal Division:
              </strong>{' '}
              Official Cadre Order: <strong>1. Group 'C'</strong> ➔ <strong>2. Postman &amp; MTS</strong> ➔ <strong>3. GDS</strong>. In each cadre: <strong>Divisional Secretary</strong> is placed first, followed by <strong>Divisional President</strong> and executive members.
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                title="Add new office bearer (instantly syncs to Circulars & Feed page)"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add Office Bearer</span>
              </button>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-600 text-white shadow-sm whitespace-nowrap">
                {directorySearch
                  ? `${filteredBearersForSearch.length} of ${bearers.length} Officers`
                  : `${bearers.length} Office Bearers`}
              </span>
            </div>
          </div>

          {/* Interactive Cadre Wing Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <button
              onClick={() => setSelectedWingFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
                selectedWingFilter === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              <span>🌐 All Cadres</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/20 dark:bg-black/20">
                {filteredBearersForSearch.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedWingFilter('group-c')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
                selectedWingFilter === 'group-c'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
              }`}
            >
              <span>🏛️ 1. Group 'C'</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-blue-700 text-white">
                {wingGroups.find((g) => g.category === 'group-c')?.members.length || 0}
              </span>
            </button>

            <button
              onClick={() => setSelectedWingFilter('postman-mts')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
                selectedWingFilter === 'postman-mts'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100'
              }`}
            >
              <span>📦 2. Postman &amp; MTS</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-purple-700 text-white">
                {wingGroups.find((g) => g.category === 'postman-mts')?.members.length || 0}
              </span>
            </button>

            <button
              onClick={() => setSelectedWingFilter('gds')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
                selectedWingFilter === 'gds'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
              }`}
            >
              <span>🌾 3. GDS (AIGDSU)</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-700 text-white">
                {wingGroups.find((g) => g.category === 'gds')?.members.length || 0}
              </span>
            </button>

            <button
              onClick={() => setSelectedWingFilter('other')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
                selectedWingFilter === 'other'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
              }`}
            >
              <span>👥 4. Sub-Committees &amp; Circle</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-rose-700 text-white">
                {wingGroups.find((g) => g.category === 'other')?.members.length || 0}
              </span>
            </button>
          </div>

          {/* Grouped Cadre Sections (Strict: 1. Group C -> 2. Postman & MTS -> 3. GDS -> 4. Other) */}
          <div className="space-y-8">
            {displayedGroups.map((group) => {
              const info = group.info;
              const members = group.members;

              return (
                <div key={group.category} className="space-y-4">
                  {/* Cadre Wing Header Banner */}
                  <div
                    className={`p-4 rounded-2xl bg-gradient-to-r ${info.gradient} text-white shadow-md flex items-center justify-between flex-wrap gap-3`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
                          {info.badge}
                        </span>
                        <span className="text-xs font-bold text-white/90">
                          {members.length} Comrades
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black mt-1 tracking-tight">
                        {info.name}
                      </h3>
                      <p className="text-xs text-white/80 mt-0.5">{info.description}</p>
                    </div>

                    <div className="text-[11px] font-bold bg-white/15 px-3 py-1.5 rounded-xl backdrop-blur-xs border border-white/20">
                      Top: Divisional Secretary ➔ Divisional President
                    </div>
                  </div>

                  {/* Office Bearers Grid for this wing */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                    {members.map((bearer, idx) => renderBearerCard(bearer, idx))}
                  </div>
                </div>
              );
            })}

            {(displayedGroups.length === 0 || displayedGroups.every((g) => g.members.length === 0)) && (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm space-y-3">
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  {directorySearch
                    ? `No office bearers found matching "${directorySearch}"`
                    : 'No office bearers found in this category.'}
                </p>
                {directorySearch && (
                  <button
                    onClick={() => setDirectorySearch('')}
                    className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-500 transition-colors cursor-pointer"
                  >
                    Clear Search Filter
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section 2: Important Documents & Rulings */}
      {activeSection === 'documents' && (
        <div className="space-y-4">
          {/* Header Banner & Manage button */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white shadow-md flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
                  Official Trade Union Repository
                </span>
                <span className="text-xs font-bold text-white/90">
                  {unionRulings.length} Documents & Rulings
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black mt-1 tracking-tight">
                Documents & Trade Union Rulings
              </h3>
              <p className="text-xs text-white/80 mt-0.5">
                Official union constitution, Form 'B' register entries, service rules, and representation guidelines.
              </p>
            </div>

            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-900 hover:bg-blue-50 text-xs font-black rounded-xl shadow-xs transition-all active:scale-95 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Manage in Admin Portal
              </button>
            )}
          </div>

          {/* Search & Category Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={docSearchQuery}
                onChange={(e) => setDocSearchQuery(e.target.value)}
                placeholder="Search document title, type, or description..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              {docSearchQuery && (
                <button
                  type="button"
                  onClick={() => setDocSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Type filter pill list */}
            {availableDocTypes.length > 2 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {availableDocTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedDocType(type)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedDocType === type
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {type === 'all' ? 'All Types' : type}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Documents Grid / List */}
          <div className="space-y-2.5">
            {filteredUnionRulings.map((doc) => {
              const typeLower = (doc.type || '').toLowerCase();
              let badgeColor = 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50';
              if (typeLower.includes('constitution')) {
                badgeColor = 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/50';
              } else if (typeLower.includes('legal') || typeLower.includes('act')) {
                badgeColor = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50';
              } else if (typeLower.includes('grievance')) {
                badgeColor = 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50';
              } else if (typeLower.includes('resolution')) {
                badgeColor = 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50';
              }

              return (
                <a
                  key={doc.id || doc.title}
                  href={doc.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-4 bg-white dark:bg-slate-900 border flex items-center justify-between gap-3 transition-all hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md active:scale-[0.99] group ${
                    isIOS
                      ? 'rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-sm'
                      : 'rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${badgeColor}`}>
                          {doc.type}
                        </span>
                        {doc.order !== undefined && (
                          <span className="text-[10px] font-bold text-slate-400">
                            #{doc.order}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {doc.title}
                      </h3>
                      {doc.desc && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {doc.desc}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="min-h-[38px] min-w-[38px] rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-950/70 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </a>
              );
            })}

            {filteredUnionRulings.length === 0 && (
              <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                No documents or rulings match your search.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section 3: Headquarters & Contact */}
      {activeSection === 'contact' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                Official Division Office
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {UNION_CONTACT_INFO.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {UNION_CONTACT_INFO.headquarters}
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <a
                  href="tel:9861184651"
                  className="text-slate-800 dark:text-slate-200 hover:text-blue-600 font-bold font-mono"
                >
                  Mob - 9861184651
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <a
                  href={`mailto:${UNION_CONTACT_INFO.email}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {UNION_CONTACT_INFO.email}
                </a>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
                Join Postal Union Groups
              </span>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={UNION_CONTACT_INFO.whatsappGroup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Group</span>
                </a>

                <a
                  href={UNION_CONTACT_INFO.telegramChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Telegram Channel</span>
                </a>
              </div>
            </div>
          </div>

          {/* Union Subscription Information (from the blog's side banner) */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs space-y-1.5">
            <h4 className="font-bold text-amber-900 dark:text-amber-200">
              Union Subscription & Check-Off
            </h4>
            <p className="text-amber-800 dark:text-amber-300">
              As per Directorate guidelines, membership subscription is deducted through monthly salary roll. Members can contact the Financial Secretary for receipt and check-off verification.
            </p>
          </div>
        </div>
      )}

      {/* Add Office Bearer Modal */}
      <AddOfficeBearerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onBearerAdded={() => {
          if (onRefreshOfficeBearers) onRefreshOfficeBearers();
        }}
      />
    </div>
  );
};
