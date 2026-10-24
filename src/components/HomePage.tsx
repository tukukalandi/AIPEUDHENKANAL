import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import {
  BlogPost,
  HeroSlide,
  NewsSliderItem,
  PlatformStyle,
  AnnouncementItem,
  ImportantDocItem,
  NoticeCircularItem,
  ActiveTab,
} from '../types';
import {
  DEFAULT_HERO_SLIDES,
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_IMPORTANT_DOCUMENTS,
  DEFAULT_NOTICE_CIRCULARS,
} from '../data/dakshikshaData';
import { QuickLinksSection } from './QuickLinksSection';
import { AnnouncementsAndDocsSection } from './AnnouncementsAndDocsSection';

interface HomePageProps {
  heroSlides: HeroSlide[];
  newsItems: NewsSliderItem[];
  posts: BlogPost[];
  announcements?: AnnouncementItem[];
  importantDocs?: ImportantDocItem[];
  noticeCirculars?: NoticeCircularItem[];
  onSelectPost: (post: BlogPost) => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenAdmin: () => void;
  platform: PlatformStyle;
}

export const HomePage: React.FC<HomePageProps> = ({
  heroSlides,
  newsItems,
  posts,
  announcements = DEFAULT_ANNOUNCEMENTS,
  importantDocs = DEFAULT_IMPORTANT_DOCUMENTS,
  noticeCirculars = DEFAULT_NOTICE_CIRCULARS,
  onSelectPost,
  onNavigateTab,
  onOpenAdmin,
  platform,
}) => {
  // Hero Slider State
  const activeSlides = (heroSlides && heroSlides.length > 0
    ? heroSlides.filter((s) => s.active !== false)
    : DEFAULT_HERO_SLIDES
  );
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isSliderPaused, setIsSliderPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Auto-advance hero slides
  useEffect(() => {
    if (isSliderPaused || activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % activeSlides.length);
    }, 9000);
    return () => clearInterval(interval);
  }, [isSliderPaused, activeSlides.length]);

  const currentSlide = activeSlides[currentSlideIndex] || DEFAULT_HERO_SLIDES[0];

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % activeSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  return (
    <div className="w-full space-y-8 pb-12 animate-fade-in">
      {/* 🌟 Dynamic Hero Slider (dakshiksha model with Admin Portal editing) */}
      <section className="relative w-full overflow-hidden rounded-3xl shadow-2xl transition-all border-2 border-indigo-400/50 dark:border-indigo-600/50 hover:border-amber-400">
        <div
          className={`relative w-full min-h-[340px] sm:min-h-[400px] md:min-h-[440px] bg-gradient-to-br ${
            currentSlide.gradient || 'from-[#0A2540] via-[#1E3A8A] to-[#B91C1C]'
          } text-white p-6 sm:p-8 md:p-10 flex flex-col justify-between overflow-hidden cursor-pointer select-none`}
          onMouseEnter={() => setIsSliderPaused(true)}
          onMouseLeave={() => setIsSliderPaused(false)}
          onTouchStart={(e) => {
            setIsSliderPaused(true);
            touchStartX.current = e.targetTouches[0].clientX;
          }}
          onTouchEnd={(e) => {
            setIsSliderPaused(false);
            if (!touchStartX.current) return;
            const diff = touchStartX.current - e.changedTouches[0].clientX;
            if (diff > 50) handleNextSlide();
            else if (diff < -50) handlePrevSlide();
            touchStartX.current = null;
          }}
        >
          {/* Background image overlay */}
          {currentSlide.imageUrl && (
            <div className="absolute inset-0 z-0 opacity-30 mix-blend-overlay overflow-hidden pointer-events-none">
              <img
                src={currentSlide.imageUrl}
                alt={currentSlide.title}
                className="w-full h-full object-cover scale-105 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Postal seal decorative ring */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full border-8 border-white/10 pointer-events-none" />
          <div className="absolute right-24 top-6 w-32 h-32 rounded-full border-4 border-white/5 pointer-events-none" />

          {/* Top Tag & Slide Counter */}
          <div className="relative z-10 flex items-center justify-between gap-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-amber-400 text-slate-950 shadow-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {currentSlide.tag || 'AIPEU DHENKANAL'}
            </span>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-sm text-xs font-mono font-bold text-white/90">
                {currentSlideIndex + 1} / {activeSlides.length}
              </span>
            </div>
          </div>

          {/* Middle: Title & Subtitle Writings */}
          <div className="relative z-10 my-4 sm:my-6 max-w-3xl space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white drop-shadow-md">
              {currentSlide.title}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-100 font-normal leading-relaxed max-w-2xl drop-shadow">
              {currentSlide.subtitle}
            </p>
          </div>

          {/* Bottom Bar: CTA & Slider Controls */}
          <div className="relative z-10 pt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-4">
            {/* Action CTA Button */}
            <div className="flex items-center gap-3">
              <a
                href={currentSlide.ctaLink || '#circulars'}
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentSlide.ctaLink?.startsWith('#')) {
                    const el = document.querySelector(currentSlide.ctaLink);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  } else if (currentSlide.ctaLink?.startsWith('http')) {
                    window.open(currentSlide.ctaLink, '_blank');
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-amber-300 text-slate-900 font-black text-xs sm:text-sm shadow-xl hover:shadow-2xl active:scale-95 transition-all"
              >
                <span>{currentSlide.ctaText || 'Explore Now'}</span>
                <ChevronRight className="w-4 h-4" />
              </a>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateTab('feed');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm backdrop-blur-sm transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>All Circulars</span>
              </button>
            </div>

            {/* Slider Dots & Arrow Controls */}
            <div
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-1.5">
                {activeSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      idx === currentSlideIndex
                        ? 'w-7 bg-white shadow'
                        : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={handlePrevSlide}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white active:scale-90 transition-all"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextSlide}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white active:scale-90 transition-all"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Progress bar line */}
          {!isSliderPaused && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20 overflow-hidden">
              <div
                key={currentSlideIndex}
                className="h-full bg-amber-400 w-full origin-left"
                style={{ animation: 'progress 9s linear' }}
              />
            </div>
          )}
        </div>
      </section>

      {/* ⚡ Quick links section (Important Web Portals) matching user design */}
      <QuickLinksSection onNavigateTab={onNavigateTab} />

      {/* 📢 Announcements, Important Documents & Notice / Circular matching user design */}
      <AnnouncementsAndDocsSection
        announcements={announcements}
        importantDocs={importantDocs}
        noticeCirculars={noticeCirculars}
        onOpenAdmin={onOpenAdmin}
        onViewAllAnnouncements={() => onNavigateTab('feed')}
      />
    </div>
  );
};
