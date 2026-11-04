import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Calendar,
  Sparkles,
  X,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { GalleryPhoto, PlatformStyle } from '../types';
import { getStoredGallery } from '../data/portalMenuData';
import { PageHeaderWithNav } from './PageHeaderWithNav';

interface GalleryPageViewProps {
  onBack: () => void;
  onHome: () => void;
  platform?: PlatformStyle;
}

export const GalleryPageView: React.FC<GalleryPageViewProps> = ({
  onBack,
  onHome,
  platform,
}) => {
  const [gallery, setGallery] = useState<GalleryPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    setGallery(getStoredGallery());
  }, []);

  const categories = ['all', ...Array.from(new Set(gallery.map((g) => g.category)))];
  const filteredGallery = gallery.filter((g) =>
    selectedCategory === 'all' ? true : g.category === selectedCategory
  );

  return (
    <div className="w-full space-y-6 pb-16 animate-fade-in">
      {/* Universal Page Header with Back & Home */}
      <PageHeaderWithNav
        title="Photo Gallery"
        category="Media & Archives"
        onBack={onBack}
        onHome={onHome}
      />

      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border-2 border-purple-500/40 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/30 border border-purple-400/40 text-purple-200 text-xs font-bold uppercase tracking-wider">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>HISTORIC PHOTO ARCHIVES</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Union Photo Gallery
          </h2>
          <p className="text-xs sm:text-sm text-purple-200 font-medium max-w-2xl leading-relaxed">
            Historic divisional conferences, Staff Adalat meetings, rallies, and commemorative postal trade union moments of Dhenkanal Division.
          </p>
          <div className="pt-2 text-xs font-bold text-white/80">
            {gallery.length} Photographs Documented
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      {categories.length > 2 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-400/40'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-purple-300'
              }`}
            >
              {cat === 'all' ? 'All Photographs' : cat}
            </button>
          ))}
        </div>
      )}

      {/* Photos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGallery.map((photo) => (
          <div
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-xl transition-all cursor-pointer flex flex-col hover:border-purple-400"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={photo.imageUrl}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white border border-white/20">
                {photo.category}
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                {photo.title}
              </h4>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{photo.date}</span>
                </span>
                <span className="text-purple-600 dark:text-purple-400 font-bold group-hover:underline flex items-center gap-1">
                  <span>View</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredGallery.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-sm">
          No photographs found in this category.
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-950/80">
              <div className="min-w-0 pr-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">
                  {selectedPhoto.category}
                </span>
                <h3 className="font-bold text-sm sm:text-base text-white truncate">
                  {selectedPhoto.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
                aria-label="Close photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 bg-black flex items-center justify-center max-h-[70vh]">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className="max-h-[68vh] w-auto object-contain rounded-xl"
              />
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
              <span>Date: {selectedPhoto.date}</span>
              <a
                href={selectedPhoto.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:underline flex items-center gap-1 font-bold"
              >
                <span>Open original</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
