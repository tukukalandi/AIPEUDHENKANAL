import React from 'react';
import { ArrowLeft, Home, ChevronRight } from 'lucide-react';

interface PageHeaderWithNavProps {
  title: string;
  category?: string;
  onBack: () => void;
  onHome: () => void;
  actions?: React.ReactNode;
}

export const PageHeaderWithNav: React.FC<PageHeaderWithNavProps> = ({
  title,
  category,
  onBack,
  onHome,
  actions,
}) => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl px-4 py-3 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-3 sticky top-2 z-20 backdrop-blur-md bg-white/95 dark:bg-slate-900/95 transition-all">
      {/* Left: Quick Navigation Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-2xs border border-slate-200/80 dark:border-slate-700"
          title="Go back to previous page"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onHome}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/70 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-xs transition-all active:scale-95 cursor-pointer border border-blue-200/80 dark:border-blue-800 shadow-2xs"
          title="Go directly to Home page"
        >
          <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Home</span>
        </button>
      </div>

      {/* Middle: Breadcrumbs / Page Title */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 truncate max-w-md">
        <button
          type="button"
          onClick={onHome}
          className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        {category && (
          <>
            <span className="text-slate-400 truncate">{category}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </>
        )}
        <span className="font-extrabold text-slate-900 dark:text-white truncate">
          {title}
        </span>
      </div>

      {/* Right: Actions */}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};
