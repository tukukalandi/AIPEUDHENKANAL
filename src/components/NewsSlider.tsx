import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Share2,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  Sparkles,
  Flame,
} from 'lucide-react';
import { BlogPost, ShareData } from '../types';

interface NewsSliderProps {
  posts: BlogPost[];
  onSelectPost: (post: BlogPost) => void;
  onSharePost: (data: ShareData) => void;
  onToggleSaveOffline: (post: BlogPost) => void;
  savedPostIds: string[];
}

// Vibrant background gradient themes for different featured slides
const SLIDE_THEMES = [
  {
    bg: 'from-[#8B0000] via-[#C5221F] to-[#EA4335]', // Vibrant Postal Scarlet Red
    badgeBg: 'bg-amber-400 text-slate-950',
    accentText: 'text-amber-200',
    tag: '⚡ BREAKING ACTION',
  },
  {
    bg: 'from-[#022A61] via-[#0A4D9E] to-[#1976D2]', // Royal India Post Navy Blue
    badgeBg: 'bg-sky-400 text-slate-950',
    accentText: 'text-sky-200',
    tag: '📢 DIVISION ORDER',
  },
  {
    bg: 'from-[#064E3B] via-[#059669] to-[#10B981]', // Gramin Dak Sevaks Emerald
    badgeBg: 'bg-emerald-300 text-slate-950',
    accentText: 'text-emerald-100',
    tag: '🌿 GDS & 8th CPC',
  },
  {
    bg: 'from-[#581C87] via-[#7E22CE] to-[#A855F7]', // Royal Purple
    badgeBg: 'bg-fuchsia-300 text-slate-950',
    accentText: 'text-fuchsia-100',
    tag: '⚖️ CHARTER & RIGHTS',
  },
  {
    bg: 'from-[#9A3412] via-[#EA580C] to-[#F97316]', // Amber / Sunset Orange
    badgeBg: 'bg-yellow-300 text-slate-950',
    accentText: 'text-yellow-100',
    tag: '📰 MEDIA COVERAGE',
  },
];

export const NewsSlider: React.FC<NewsSliderProps> = ({
  posts,
  onSelectPost,
  onSharePost,
  onToggleSaveOffline,
  savedPostIds,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Take top 5 featured posts
  const featuredPosts = posts.slice(0, 5);

  // Auto-advance slider every 10 seconds when not paused so readers can comfortably read the news
  useEffect(() => {
    if (isPaused || featuredPosts.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredPosts.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [isPaused, featuredPosts.length]);

  if (featuredPosts.length === 0) return null;

  const currentPost = featuredPosts[currentIndex];
  const theme = SLIDE_THEMES[currentIndex % SLIDE_THEMES.length];
  const isSaved = savedPostIds.includes(currentPost.id);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      // Swiped left -> next
      setCurrentIndex((prev) => (prev + 1) % featuredPosts.length);
    } else if (distance < -50) {
      // Swiped right -> prev
      setCurrentIndex((prev) => (prev - 1 + featuredPosts.length) % featuredPosts.length);
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const formattedDate = currentPost.published
    ? new Date(currentPost.published).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  // Get image if post has one
  const heroImage = currentPost.images && currentPost.images.length > 0 ? currentPost.images[0] : null;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl shadow-xl transition-all">
      {/* Slider Container */}
      <div
        className={`relative w-full min-h-[260px] sm:min-h-[290px] bg-gradient-to-br ${theme.bg} text-white p-5 sm:p-6 flex flex-col justify-between cursor-pointer select-none`}
        onClick={() => onSelectPost(currentPost)}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Image Scrim if photo available */}
        {heroImage && (
          <div className="absolute inset-0 z-0 opacity-25 mix-blend-overlay overflow-hidden">
            <img
              src={heroImage}
              alt={currentPost.title}
              className="w-full h-full object-cover scale-105 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Decorative postal emblem subtle pattern overlay */}
        <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full border-8 border-white/10 pointer-events-none z-0" />
        <div className="absolute right-12 top-4 w-24 h-24 rounded-full border-4 border-white/5 pointer-events-none z-0" />

        {/* Top Kicker Bar */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 ${theme.badgeBg}`}
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              {theme.tag}
            </span>
            <span className="text-xs font-medium text-white/90 hidden sm:flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
          </div>

          {/* Quick Action Icons */}
          <div
            className="flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onToggleSaveOffline(currentPost)}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm active:scale-90 transition-all shadow-sm"
              title={isSaved ? 'Saved offline' : 'Save offline'}
              aria-label="Save for offline"
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 fill-current text-yellow-300" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() =>
                onSharePost({
                  title: currentPost.title,
                  text: currentPost.snippet,
                  url: currentPost.url,
                })
              }
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm active:scale-90 transition-all shadow-sm"
              title="Share"
              aria-label="Share post"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Middle: Headline & Snippet */}
        <div className="relative z-10 my-3 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold sm:hidden opacity-90">
            <Calendar className="w-3 h-3" />
            <span>{formattedDate}</span>
          </div>

          <h3 className="text-base sm:text-xl md:text-2xl font-black leading-snug line-clamp-2 tracking-tight text-white drop-shadow-sm">
            {currentPost.title}
          </h3>

          <p className="text-xs sm:text-sm text-white/90 line-clamp-2 max-w-2xl leading-relaxed font-normal">
            {currentPost.snippet}
          </p>
        </div>

        {/* Bottom Bar: CTA & Navigation Controls */}
        <div className="relative z-10 pt-3 border-t border-white/20 flex items-center justify-between gap-3">
          {/* Read CTA Button */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-md active:scale-95 transition-all">
            <span>Read Circular</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>

          {/* Dots & Nav Arrows */}
          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pagination Indicators */}
            <div className="flex items-center gap-1.5">
              {featuredPosts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'w-6 bg-white shadow-sm'
                      : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Prev / Next buttons */}
            <div className="flex items-center gap-1 ml-1">
              <button
                onClick={() =>
                  setCurrentIndex((prev) => (prev - 1 + featuredPosts.length) % featuredPosts.length)
                }
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white active:scale-90 transition-all"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredPosts.length)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white active:scale-90 transition-all"
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
    </div>
  );
};
