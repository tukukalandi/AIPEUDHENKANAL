import React, { useState, useRef } from 'react';
import {
  Bell,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AnnouncementItem, ImportantDocItem, NoticeCircularItem } from '../types';

interface AnnouncementsAndDocsSectionProps {
  announcements: AnnouncementItem[];
  importantDocs: ImportantDocItem[];
  noticeCirculars: NoticeCircularItem[];
  onOpenAdmin?: () => void;
  onViewAllAnnouncements?: () => void;
}

export const AnnouncementsAndDocsSection: React.FC<AnnouncementsAndDocsSectionProps> = ({
  announcements,
  importantDocs,
  noticeCirculars,
  onViewAllAnnouncements,
}) => {
  const [selectedNoticeCategory, setSelectedNoticeCategory] = useState<string>('ALL');

  const annScrollRef = useRef<HTMLDivElement | null>(null);
  const docsScrollRef = useRef<HTMLDivElement | null>(null);
  const noticesScrollRef = useRef<HTMLDivElement | null>(null);

  const noticeCategories = [
    'ALL',
    'NOTICE',
    'ACCOMMODATION',
    'CGHS',
    'PENSION/SALARY',
    'MISCELLANEOUS',
  ];

  // Filter notice circulars by active category (matching PENSION to PENSION/SALARY & MISC to MISCELLANEOUS too)
  const filteredNotices = noticeCirculars.filter((item) => {
    if (selectedNoticeCategory === 'ALL') return true;
    const itemCat = (item.category || 'NOTICE').toUpperCase().trim();
    const activeCat = selectedNoticeCategory.toUpperCase().trim();
    if (activeCat === 'PENSION/SALARY') {
      return itemCat === 'PENSION/SALARY' || itemCat === 'PENSION' || itemCat === 'SALARY';
    }
    if (activeCat === 'MISCELLANEOUS') {
      return itemCat === 'MISCELLANEOUS' || itemCat === 'MISC' || itemCat === 'ORDERS' || itemCat === 'CIRCULAR';
    }
    return itemCat === activeCat;
  });

  const handleOpenLink = (url?: string, title?: string) => {
    if (!url) return;
    if (url.startsWith('#')) {
      const el = document.querySelector(url);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (url.startsWith('data:')) {
      try {
        const arr = url.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        const win = window.open(blobUrl, '_blank');
        if (!win) {
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `${(title || 'document').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        return;
      } catch (err) {
        console.error('Error handling data URL:', err);
      }
    }
    window.open(url, '_blank');
  };

  /**
   * Seamless scroll-chaining handler for mouse-wheel and touchpad:
   * When scrolling inside a 6-document container reaches the top or bottom boundary,
   * it immediately chains the scroll delta to the main window so the webpage never locks.
   */
  const handleSectionWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight <= el.clientHeight + 2) {
      return; // Not scrollable, let browser scroll window naturally
    }
    const isScrollingDown = e.deltaY > 0;
    const isScrollingUp = e.deltaY < 0;
    const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
    const isAtTop = el.scrollTop <= 1;

    if ((isScrollingDown && isAtBottom) || (isScrollingUp && isAtTop)) {
      window.scrollBy({ top: e.deltaY, behavior: 'auto' });
    }
  };

  const scrollContainerBy = (ref: React.RefObject<HTMLDivElement | null>, amount: number) => {
    if (ref.current) {
      ref.current.scrollBy({ top: amount, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full space-y-8 pt-2">
      {/* 🔴 Top Section: Announcements Card with Defined Colorful Border & Legible Typography */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-lg border-2 border-red-500/40 hover:border-red-500 transition-all duration-300 space-y-4">
        {/* Header with Red Bell & VIEW ALL */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-red-600">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center shadow-sm">
              <Bell className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-red-700 dark:text-red-400 tracking-tight">
              Announcements
            </h3>
            {announcements.length > 0 && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                {announcements.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {announcements.length > 6 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollContainerBy(annScrollRef, -160)}
                  className="p-1.5 rounded-lg bg-red-50 dark:bg-slate-800 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                  title="Scroll announcements up"
                  aria-label="Scroll announcements up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollContainerBy(annScrollRef, 160)}
                  className="p-1.5 rounded-lg bg-red-50 dark:bg-slate-800 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                  title="Scroll announcements down"
                  aria-label="Scroll announcements down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
            <button
              onClick={onViewAllAnnouncements}
              className="text-xs sm:text-sm font-black text-red-600 hover:text-red-700 uppercase tracking-wider transition-colors hover:underline cursor-pointer"
            >
              VIEW ALL
            </button>
          </div>
        </div>

        {/* Announcements List: maximum 6 documents visible in area, smooth vertical scroll for more */}
        <div
          ref={annScrollRef}
          onWheel={handleSectionWheel}
          className={`space-y-3 pt-1 pr-1.5 ${
            announcements.length > 6 ? 'max-h-[360px] doc-scroll-area' : ''
          }`}
        >
          {announcements.length === 0 ? (
            <p className="text-sm text-slate-400 italic py-3 font-medium">
              No current announcements posted.
            </p>
          ) : (
            announcements.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenLink(item.link || '#', item.title)}
                className="group cursor-pointer border-l-4 border-amber-500 hover:border-red-600 pl-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 rounded-r-2xl border border-slate-200/60 dark:border-slate-700/60 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs sm:text-sm md:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 leading-snug transition-colors">
                    {item.title}
                  </p>
                  {item.link && (
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-red-600 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {announcements.length > 6 && (
          <div className="pt-1 text-center text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
            <span>Showing 6 in view • Scroll to view all {announcements.length} announcements</span>
          </div>
        )}
      </div>

      {/* 🔷 Split Bottom Grid: IMPORTANT DOCUMENTS (Left) & NOTICE / CIRCULAR (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
        {/* ================= LEFT: IMPORTANT DOCUMENTS ================= */}
        <div className="rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border-2 border-blue-600/50 hover:border-blue-600 shadow-xl transition-all duration-300 flex flex-col">
          {/* Vibrant Blue Header Bar */}
          <div className="bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#1D4ED8] text-white px-6 py-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <FileText className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-black tracking-wider uppercase">
                IMPORTANT DOCUMENTS
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {importantDocs.length > 6 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => scrollContainerBy(docsScrollRef, -160)}
                    className="p-1 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
                    title="Scroll documents up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollContainerBy(docsScrollRef, 160)}
                    className="p-1 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
                    title="Scroll documents down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}
              {importantDocs.length > 0 && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                  {importantDocs.length}
                </span>
              )}
            </div>
          </div>

          {/* Documents List: maximum 6 documents visible, smooth vertical scroll for more */}
          <div
            ref={docsScrollRef}
            onWheel={handleSectionWheel}
            className={`p-5 sm:p-6 space-y-3 flex-1 ${
              importantDocs.length > 6 ? 'max-h-[385px] doc-scroll-area pr-2' : ''
            }`}
          >
            {importantDocs.length === 0 ? (
              <p className="text-sm text-slate-400 italic font-medium">No documents uploaded yet.</p>
            ) : (
              importantDocs.map((docItem) => (
                <div
                  key={docItem.id}
                  onClick={() => handleOpenLink(docItem.url, docItem.title)}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-500 hover:shadow-md cursor-pointer group transition-all duration-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
                    <span className="text-xs sm:text-sm md:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {docItem.title}
                    </span>
                  </div>

                  <span className="text-xs font-black uppercase tracking-wider text-white bg-blue-600 group-hover:bg-blue-700 px-3 py-1 rounded-xl transition-all shadow-sm shrink-0">
                    LINK
                  </span>
                </div>
              ))
            )}
          </div>

          {importantDocs.length > 6 && (
            <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 text-center text-xs font-bold text-blue-600 dark:text-blue-400">
              Showing 6 in view • Scroll to view all {importantDocs.length} documents
            </div>
          )}
        </div>

        {/* ================= RIGHT: NOTICE / CIRCULAR ================= */}
        <div className="rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border-2 border-amber-500/50 hover:border-amber-500 shadow-xl transition-all duration-300 flex flex-col">
          {/* Warm Golden/Amber Header Bar */}
          <div className="bg-gradient-to-r from-[#D97706] via-[#EA580C] to-[#B45309] text-white px-6 py-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Bell className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-black tracking-wider uppercase">
                NOTICE / CIRCULAR
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {filteredNotices.length > 6 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => scrollContainerBy(noticesScrollRef, -180)}
                    className="p-1 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
                    title="Scroll notices up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollContainerBy(noticesScrollRef, 180)}
                    className="p-1 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
                    title="Scroll notices down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}
              {filteredNotices.length > 0 && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                  {filteredNotices.length}
                </span>
              )}
            </div>
          </div>

          {/* Category Tabs Bar */}
          <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900 px-4 sm:px-6 overflow-x-auto scrollbar-none">
            {noticeCategories.map((cat) => {
              const isActive = selectedNoticeCategory.toUpperCase() === cat.toUpperCase();
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedNoticeCategory(cat)}
                  className={`py-3 px-3 sm:px-4 text-xs font-black uppercase whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                    isActive
                      ? 'border-slate-950 dark:border-white text-slate-950 dark:text-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Notices List for Active Category: maximum 6 documents visible, smooth vertical scroll for more */}
          <div
            ref={noticesScrollRef}
            onWheel={handleSectionWheel}
            className={`p-5 sm:p-6 space-y-3 flex-1 ${
              filteredNotices.length > 6 ? 'max-h-[495px] doc-scroll-area pr-2' : ''
            }`}
          >
            {filteredNotices.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400 italic font-medium">
                No circulars published under {selectedNoticeCategory} yet.
              </div>
            ) : (
              filteredNotices.map((nc) => (
                <div
                  key={nc.id}
                  onClick={() => handleOpenLink(nc.url || '#', nc.title)}
                  className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-amber-500 hover:shadow-md cursor-pointer group space-y-1.5 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0 mt-1.5" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm md:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
                        {nc.title}
                      </h4>
                      <p className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md inline-block mt-1">
                        PUBLISHED: {nc.published}
                      </p>
                    </div>
                    {nc.url && (
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-amber-600 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {filteredNotices.length > 6 && (
            <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 text-center text-xs font-bold text-amber-700 dark:text-amber-400">
              Showing 6 in view • Scroll to view all {filteredNotices.length} circulars
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
