import React, { useState } from 'react';
import { Pause, Play, Sparkles, Flame, ChevronRight } from 'lucide-react';
import { BlogPost, NewsSliderItem } from '../types';

interface NewsTickerProps {
  posts: BlogPost[];
  newsItems?: NewsSliderItem[];
  onSelectPost: (post: BlogPost) => void;
  onOpenAdmin?: () => void;
}

export const NewsTicker: React.FC<NewsTickerProps> = ({
  posts,
  newsItems = [],
  onSelectPost,
  onOpenAdmin,
}) => {
  const [isPaused, setIsPaused] = useState(false);

  // Combine news items from admin Firestore with top circular posts
  const tickerItems: {
    id: string;
    title: string;
    category?: string;
    isUrgent?: boolean;
    post?: BlogPost;
    link?: string;
  }[] = [];

  if (newsItems && newsItems.length > 0) {
    newsItems.forEach((n) => {
      tickerItems.push({
        id: n.id,
        title: n.title,
        category: n.category || 'FLASH NEWS',
        isUrgent: n.isUrgent,
        link: n.link,
      });
    });
  }

  posts.slice(0, 8).forEach((p) => {
    tickerItems.push({
      id: p.id,
      title: p.title,
      category: p.categories[0] || 'CIRCULAR',
      post: p,
    });
  });

  if (tickerItems.length === 0) return null;

  const handleItemClick = (item: typeof tickerItems[0]) => {
    if (item.post) {
      onSelectPost(item.post);
    } else if (item.link) {
      if (item.link.startsWith('#')) {
        const el = document.querySelector(item.link);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.open(item.link, '_blank');
      }
    } else if (onOpenAdmin) {
      onOpenAdmin();
    }
  };

  // Duplicate items for continuous seamless loop without gap
  const displayItems = [...tickerItems, ...tickerItems];

  return (
    <div className="w-full bg-gradient-to-r from-[#991B1B] via-[#C5221F] to-[#D97706] text-white shadow-md border-b-2 border-amber-400/40 relative z-20 overflow-hidden">
      <div className="w-full flex items-center">
        {/* Fixed Flash Kicker Badge on the Left */}
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-950/80 backdrop-blur-md border-r-2 border-amber-400 text-xs sm:text-sm font-black uppercase tracking-wider shrink-0 z-10 shadow-lg select-none">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400" />
          </span>
          <span className="text-yellow-300 font-extrabold flex items-center gap-1.5 whitespace-nowrap">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
            <span>LATEST NEWS</span>
          </span>
        </div>

        {/* 🚀 Smooth Right-to-Left Continuous Scrolling Track */}
        <div
          className="flex-1 overflow-hidden relative py-1.5 cursor-pointer"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div
            className={`animate-marquee-rtl flex items-center gap-8 ${
              isPaused ? 'marquee-paused' : ''
            }`}
          >
            {displayItems.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                onClick={() => handleItemClick(item)}
                className="flex items-center gap-2.5 shrink-0 group hover:opacity-95"
              >
                {/* Category Badge */}
                {item.category && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                      item.isUrgent
                        ? 'bg-amber-300 text-slate-950 ring-1 ring-white/50'
                        : 'bg-white/20 text-white border border-white/30'
                    }`}
                  >
                    {item.category}
                  </span>
                )}

                {/* News Title Writings */}
                <span className="text-xs sm:text-sm font-bold text-white tracking-wide group-hover:text-yellow-200 group-hover:underline transition-colors drop-shadow-sm whitespace-nowrap">
                  {item.title}
                </span>

                {/* Separator icon */}
                <span className="text-amber-300 text-base font-black px-2 select-none">
                  ✦
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Controls: Pause/Play & Edit */}
        <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1 bg-black/30 backdrop-blur-sm border-l border-white/20 shrink-0 z-10">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
            title={isPaused ? 'Resume scrolling' : 'Pause scrolling'}
            aria-label={isPaused ? 'Play' : 'Pause'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" /> : <Pause className="w-3.5 h-3.5 text-white" />}
          </button>

          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="px-2 py-0.5 rounded-lg bg-white/20 hover:bg-white/30 text-[10px] font-bold text-white transition-colors hidden sm:block"
              title="Edit news in Admin Portal"
            >
              ✏️ Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
