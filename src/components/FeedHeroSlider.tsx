import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  FileText,
  ExternalLink,
  Edit2,
  Lock,
} from 'lucide-react';
import { HeroSlide, ActiveTab } from '../types';

interface FeedHeroSliderProps {
  slides: HeroSlide[];
  onOpenAdmin?: () => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const FeedHeroSlider: React.FC<FeedHeroSliderProps> = ({
  slides,
  onOpenAdmin,
  onNavigateTab,
}) => {
  const activeSlides = slides.filter((s) => s.active !== false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Auto-advance slowly every 10 seconds for easy reading
  useEffect(() => {
    if (isPaused || activeSlides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [isPaused, activeSlides.length]);

  if (activeSlides.length === 0) return null;

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  return (
    <section className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl transition-all border-2 border-red-500/40 dark:border-red-600/40 hover:border-amber-400 group">
      <div
        className={`relative w-full min-h-[300px] sm:min-h-[340px] md:min-h-[380px] bg-gradient-to-br ${
          currentSlide.gradient || 'from-[#881337] via-[#BE123C] to-[#E11D48]'
        } text-white p-5 sm:p-7 md:p-8 flex flex-col justify-between overflow-hidden cursor-pointer select-none`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={(e) => {
          setIsPaused(true);
          touchStartX.current = e.targetTouches[0].clientX;
        }}
        onTouchEnd={(e) => {
          setIsPaused(false);
          if (!touchStartX.current) return;
          const diff = touchStartX.current - e.changedTouches[0].clientX;
          if (diff > 50) handleNext();
          else if (diff < -50) handlePrev();
          touchStartX.current = null;
        }}
      >
        {/* Background Image Overlay */}
        {currentSlide.imageUrl && (
          <div className="absolute inset-0 z-0 opacity-25 mix-blend-overlay overflow-hidden pointer-events-none">
            <img
              src={currentSlide.imageUrl}
              alt={currentSlide.title}
              className="w-full h-full object-cover scale-105 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Decorative Postal Stamp Background Motifs */}
        <div className="absolute -right-10 -bottom-10 w-52 h-52 rounded-full border-8 border-white/10 pointer-events-none" />
        <div className="absolute right-20 top-4 w-28 h-28 rounded-full border-4 border-white/5 pointer-events-none" />

        {/* Top Header: Badge, Counter & Admin Shortcut */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-amber-400 text-slate-950 shadow-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentSlide.tag || '📜 CIRCULAR HERO'}</span>
            </span>

            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-black/40 text-[10px] font-bold uppercase tracking-wider text-amber-200 border border-white/10">
              CIRCULAR & FEED SLIDER
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAdmin && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAdmin();
                }}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 hover:bg-black/70 text-white/90 hover:text-amber-300 text-[11px] font-bold border border-white/20 transition-all cursor-pointer"
                title="Edit this slider in Admin Portal"
              >
                <Edit2 className="w-3 h-3 text-amber-400" />
                <span>Edit Slider</span>
              </button>
            )}

            <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-xs font-mono font-bold text-white/90">
              {currentIndex + 1} / {activeSlides.length}
            </span>
          </div>
        </div>

        {/* Middle: Title & Subtitle */}
        <div className="relative z-10 my-3 sm:my-4 max-w-2xl space-y-2">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black leading-snug tracking-tight text-white drop-shadow-md">
            {currentSlide.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-100 font-normal leading-relaxed line-clamp-2 sm:line-clamp-3 drop-shadow">
            {currentSlide.subtitle}
          </p>
        </div>

        {/* Bottom Bar: Action Button, Dots & Nav Controls */}
        <div className="relative z-10 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between gap-3">
          {/* CTA Link */}
          <div className="flex items-center gap-2">
            <a
              href={currentSlide.ctaLink || '#feed-search'}
              onClick={(e) => {
                e.stopPropagation();
                if (currentSlide.ctaLink?.startsWith('#')) {
                  const el = document.querySelector(currentSlide.ctaLink);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                } else if (currentSlide.ctaLink?.startsWith('http')) {
                  window.open(currentSlide.ctaLink, '_blank');
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-amber-300 text-slate-900 font-black text-xs shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer"
            >
              <span>{currentSlide.ctaText || 'Read Circular'}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-900" />
            </a>
          </div>

          {/* Dots & Arrow Navigation */}
          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dots */}
            <div className="flex items-center gap-1.5 max-w-[120px] sm:max-w-xs overflow-x-auto no-scrollbar py-1">
              {activeSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 shrink-0 ${
                    idx === currentIndex
                      ? 'w-6 bg-white shadow'
                      : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Prev / Next Arrows */}
            <div className="flex items-center gap-1 ml-1 shrink-0">
              <button
                onClick={handlePrev}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white active:scale-90 transition-all cursor-pointer"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white active:scale-90 transition-all cursor-pointer"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar for Auto-advance */}
        {!isPaused && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 overflow-hidden">
            <div
              key={currentIndex}
              className="h-full bg-yellow-300 w-full origin-left"
              style={{
                animation: 'progress 10s linear',
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
};
