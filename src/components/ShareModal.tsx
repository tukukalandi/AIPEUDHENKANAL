import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Send,
  MessageCircle,
  ExternalLink,
  Users,
} from 'lucide-react';
import { PlatformStyle, ShareData } from '../types';
import { UNION_CONTACT_INFO } from '../data/unionInfo';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShareData;
  platform: PlatformStyle;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  data,
  platform,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const encodedUrl = encodeURIComponent(data.url);
  const shareText = `${data.title}\n\nRead more on AIPEU Dhenkanal:\n`;
  const encodedText = encodeURIComponent(shareText);

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}${encodedUrl}`;
  const telegramUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(data.title)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.title)}&url=${encodedUrl}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${data.title}\n${data.url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: data.text,
          url: data.url,
        });
        onClose();
      } catch (err) {
        // User cancelled or aborted
      }
    }
  };

  const isIOS = platform === 'ios';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl transition-all ${
          isIOS
            ? 'rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200/80 dark:border-slate-800'
            : 'rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-200 dark:border-slate-800'
        } overflow-hidden max-h-[90vh] flex flex-col`}
      >
        {/* Handle bar on mobile */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isIOS ? 'Share Circular & Notice' : 'Share with Postal Comrades'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[260px]">
              {data.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Quick Copy Link Bar */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate flex-1 pl-2">
              {data.url}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-600 active:scale-95 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Social Buttons Grid */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 block">
              Direct Social Share
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 active:scale-95 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <MessageCircle className="w-5 h-5 fill-current" />
                </div>
                <span className="text-xs font-medium">WhatsApp</span>
              </a>

              {/* Telegram */}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 active:scale-95 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-sm">
                  <Send className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">Telegram</span>
              </a>

              {/* Twitter / X */}
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 active:scale-95 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-sm">
                  <span className="text-sm font-bold font-mono">X</span>
                </div>
                <span className="text-xs font-medium">Twitter / X</span>
              </a>

              {/* Facebook */}
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 active:scale-95 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                  <span className="text-base font-bold font-serif">f</span>
                </div>
                <span className="text-xs font-medium">Facebook</span>
              </a>
            </div>
          </div>

          {/* Native Mobile Share Button */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold active:scale-[0.98] transition-all shadow-md shadow-blue-600/20"
            >
              <Share2 className="w-4 h-4" />
              <span>Use {isIOS ? 'iOS Share Sheet' : 'Android System Share'}</span>
            </button>
          )}

          {/* Union Community Connect - As seen on Blog */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 block">
              Official Union Groups
            </label>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={UNION_CONTACT_INFO.whatsappGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-semibold transition-colors"
              >
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="truncate">Join WhatsApp</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
              </a>

              <a
                href={UNION_CONTACT_INFO.telegramChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/20 text-xs font-semibold transition-colors"
              >
                <Send className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span className="truncate">Join Telegram</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom dismiss */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
