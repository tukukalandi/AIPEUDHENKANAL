import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Moon,
  Sun,
  Globe,
  UserCheck,
  ShieldAlert,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { AppLanguage, ThemeMode, ActiveTab } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { UNION_AFFILIATION } from '../data/unionInfo';
import { SUPPORTED_LANGUAGES, changeGoogleLanguage } from '../services/translator';

interface TopTimeDateBarProps {
  language: AppLanguage;
  onSetLanguage: (lang: AppLanguage) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenUserPortal?: () => void;
  activeTab?: ActiveTab;
}

export const TopTimeDateBar: React.FC<TopTimeDateBarProps> = ({
  language,
  onSetLanguage,
  theme,
  onToggleTheme,
  onOpenUserPortal,
  activeTab,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date and time according to active language
  const formatDate = (date: Date, lang: AppLanguage): string => {
    try {
      const locale = lang === 'hi' ? 'hi-IN' : lang === 'or' ? 'or-IN' : 'en-IN';
      return new Intl.DateTimeFormat(locale, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(date);
    } catch {
      return date.toLocaleDateString();
    }
  };

  const formatTime = (date: Date): string => {
    try {
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return date.toTimeString().split(' ')[0];
    }
  };

  return (
    <div className="w-full bg-[#180303] text-slate-100 border-b border-red-900/60 text-xs py-1.5 px-3 sm:px-6 lg:px-12 select-none transition-colors">
      <div className="w-full flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
        {/* Left Side: Real-time Date and Running Digital Clock */}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-[11px] sm:text-xs">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold">
            <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{formatDate(currentTime, language)}</span>
          </div>

          <div className="h-3 w-px bg-white/20 hidden sm:block" />

          <div className="flex items-center gap-1.5 font-mono text-white tracking-wider font-semibold">
            <Clock className="w-3.5 h-3.5 text-yellow-400 shrink-0 animate-pulse" />
            <span className="bg-black/40 px-2 py-0.5 rounded border border-white/10 text-amber-200">
              {formatTime(currentTime)} <span className="text-[10px] text-amber-400/80 font-sans">IST</span>
            </span>
          </div>

          {/* Affiliation Tag on Medium+ screens */}
          <div className="hidden xl:flex items-center gap-1.5 pl-2 text-[11px] text-slate-300 border-l border-white/15">
            <span className="text-amber-400 font-bold uppercase">{t.affiliatedTo}:</span>
            <span className="truncate max-w-lg text-slate-200 font-medium" title={UNION_AFFILIATION.text}>
              {UNION_AFFILIATION.shortText}
            </span>
          </div>
        </div>

        {/* Right Side: Language Switcher, Dark Mode Toggle & User Portal Button */}
        {/* Right Side: Language Dropdown Selector (connected to Google Translate) & Dark Mode Toggle */}
        <div className="flex items-center flex-wrap gap-2 ml-auto">
          {/* Language Dropdown Selector */}
          <div className="relative flex items-center bg-black/60 hover:bg-black/80 px-2 py-1 rounded-xl border border-white/20 hover:border-amber-400/80 transition-all shadow-sm">
            <Globe className="w-3.5 h-3.5 text-amber-400 mr-1.5 shrink-0" />
            <select
              value={language}
              onChange={(e) => {
                const val = e.target.value;
                onSetLanguage(val);
                changeGoogleLanguage(val);
              }}
              className="bg-transparent text-amber-300 font-bold text-[11px] sm:text-xs cursor-pointer focus:outline-none appearance-none pr-4 select-none"
              title="Select website language (powered by Google Language)"
              aria-label="Select website language"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option
                  key={l.code}
                  value={l.code}
                  className="bg-slate-900 text-white font-medium py-1"
                >
                  {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-amber-400 pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Dark Mode Toggle Button */}
          <button
            onClick={onToggleTheme}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-black transition-all active:scale-95 cursor-pointer shadow-sm ${
              theme === 'dark'
                ? 'bg-amber-400 text-slate-950 border-amber-300 hover:bg-amber-300'
                : 'bg-black/60 hover:bg-black/80 text-amber-200 border-white/20 hover:border-amber-400'
            }`}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-slate-950 fill-slate-950 shrink-0" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-amber-300 fill-amber-300/30 shrink-0" />
                <span>Dark</span>
              </>
            )}
          </button>

          {/* User Portal Button in Top Bar */}
          {onOpenUserPortal && (
            <button
              onClick={onOpenUserPortal}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-black text-[11px] shadow-sm transition-all active:scale-95 cursor-pointer ${
                activeTab === 'user-portal'
                  ? 'bg-emerald-500 text-slate-950 ring-1 ring-emerald-300'
                  : 'bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-400/40'
              }`}
              title="Open Postal Staff & Members Self-Service Portal"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-200" />
              <span>{t.userPortal}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
