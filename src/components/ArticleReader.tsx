import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Share2,
  Bookmark,
  BookmarkCheck,
  Volume2,
  VolumeX,
  Type,
  ExternalLink,
  FileText,
  Calendar,
  User,
  Download,
  CheckCircle,
} from 'lucide-react';
import { BlogPost, PlatformStyle, ShareData } from '../types';
import { isPostSavedOffline, savePostForOffline, removePostFromOffline } from '../services/storage';

interface ArticleReaderProps {
  post: BlogPost;
  onBack: () => void;
  onShare: (data: ShareData) => void;
  platform: PlatformStyle;
}

export const ArticleReader: React.FC<ArticleReaderProps> = ({
  post,
  onBack,
  onShare,
  platform,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    setIsSaved(isPostSavedOffline(post.id));
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Stop speaking when post changes or unmounts
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [post.id]);

  const toggleOfflineSave = () => {
    if (isSaved) {
      removePostFromOffline(post.id);
      setIsSaved(false);
    } else {
      savePostForOffline(post);
      setIsSaved(true);
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 2400);
    }
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Extract text from content
    const div = document.createElement('div');
    div.innerHTML = post.contentHtml;
    const textToRead = `${post.title}. ${div.textContent || div.innerText || post.snippet}`;

    const utterance = new SpeechSynthesisUtterance(textToRead.slice(0, 1200));
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const formattedDate = post.published
    ? new Date(post.published).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  const isIOS = platform === 'ios';

  const fontClasses = {
    normal: 'text-base leading-relaxed',
    large: 'text-lg leading-relaxed',
    xlarge: 'text-xl leading-relaxed',
  }[fontSize];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20 transition-colors">
      {/* Toast Notification */}
      {showSavedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-full shadow-lg animate-bounce">
          <CheckCircle className="w-4 h-4" />
          <span>Saved for Offline Reading</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div
        className={`sticky top-0 z-40 transition-colors ${
          isIOS
            ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60'
            : 'bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800'
        } pt-safe`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 h-14 flex items-center justify-between gap-2">
          {/* Back button */}
          <button
            onClick={onBack}
            className="min-h-[44px] min-w-[44px] flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium text-sm active:opacity-70 transition-opacity"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1">
            {/* Font Size Toggle */}
            <button
              onClick={() => {
                if (fontSize === 'normal') setFontSize('large');
                else if (fontSize === 'large') setFontSize('xlarge');
                else setFontSize('normal');
              }}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg active:scale-95 transition-all"
              title="Adjust text size"
            >
              <Type className="w-4 h-4" />
              <span className="text-[10px] ml-0.5 font-bold uppercase">{fontSize[0]}</span>
            </button>

            {/* Read Aloud */}
            {'speechSynthesis' in window && (
              <button
                onClick={handleSpeak}
                className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg active:scale-95 transition-all ${
                  isSpeaking
                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
                title={isSpeaking ? 'Stop reading' : 'Read aloud'}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}

            {/* Offline Bookmark Button */}
            <button
              onClick={toggleOfflineSave}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg active:scale-95 transition-all ${
                isSaved
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
              title={isSaved ? 'Saved offline' : 'Save for offline'}
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 fill-current text-amber-500" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>

            {/* Share Button */}
            <button
              onClick={() =>
                onShare({
                  title: post.title,
                  text: post.snippet,
                  url: post.url || window.location.href,
                })
              }
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg active:scale-95 transition-all"
              title="Share circular"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Article Body Container */}
      <article className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        {/* Unboxed Metadata Header (Following Anti-Slop Zero-Pill Rules) */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>{post.categories[0] || 'Union Bulletin'}</span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {post.author}
          </span>
          {isSaved && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">Available Offline</span>
            </>
          )}
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-snug">
          {post.title}
        </h1>

        {/* Drive Circular Letter Attachments Callout */}
        {post.driveLinks && post.driveLinks.length > 0 && (
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-bold text-sm">
              <FileText className="w-4 h-4" />
              <span>Official Letter / Order Attached</span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Department of Posts official circular document available for download.
            </p>
            <div className="pt-1 flex flex-wrap gap-2">
              {post.driveLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold active:scale-95 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download / View Order #{idx + 1}</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Article HTML Content & Press Photos */}
        <div
          className={`prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 ${fontClasses} space-y-4`}
        >
          {post.contentHtml ? (
            <div
              className="blog-content-body [&_img]:rounded-xl [&_img]:shadow-md [&_img]:my-4 [&_img]:mx-auto [&_img]:max-w-full [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:p-2 [&_td]:border [&_td]:p-2"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
          ) : (
            <p className="whitespace-pre-wrap">{post.snippet}</p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={toggleOfflineSave}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border active:scale-95 transition-all ${
                isSaved
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              <span>{isSaved ? 'Saved in Offline Cache' : 'Save for Offline Reading'}</span>
            </button>

            <button
              onClick={() =>
                onShare({
                  title: post.title,
                  text: post.snippet,
                  url: post.url || window.location.href,
                })
              }
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Circular</span>
            </button>
          </div>

          {post.url && (
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors"
            >
              <span>View original blog post on Blogspot</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </article>
    </div>
  );
};
