import React, { useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'button' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'button',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'banner') {
      return (
        <div className={`p-4 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-lg flex items-center justify-between gap-3 ${className}`}>
          <div>
            <h4 className="text-sm font-bold">Install AIPEU App</h4>
            <p className="text-xs text-blue-100">Add to home screen for faster offline reading & instant alerts</p>
          </div>
          <button
            onClick={install}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-blue-900 text-xs font-bold shadow active:scale-95 transition-all shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Install</span>
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={install}
        className={`flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition ${className}`}
      >
        <Download className="w-4 h-4" />
        <span>Install Mobile App</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        {variant === 'banner' ? (
          <div className={`p-4 rounded-2xl bg-slate-900 text-white shadow-lg flex items-center justify-between gap-3 border border-slate-800 ${className}`}>
            <div>
              <h4 className="text-sm font-bold">Install on iPhone / iPad</h4>
              <p className="text-xs text-slate-300">Tap Share and 'Add to Home Screen'</p>
            </div>
            <button
              onClick={() => setShowIOSGuide(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold shadow active:scale-95 transition-all shrink-0"
            >
              <Share className="w-3.5 h-3.5" />
              <span>Guide</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition ${className}`}
          >
            <Share className="w-3.5 h-3.5 text-blue-500" />
            <span>Install on iOS</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Install on iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Share className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-100 block">Step 1: Tap Share</span>
                    <span>Tap the Safari <strong>Share</strong> button at the bottom of the screen.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-100 block">Step 2: Add to Home Screen</span>
                    <span>Scroll down the action list and select <strong>Add to Home Screen</strong>.</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md active:scale-98 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Generic fallback install guide button if neither
  return (
    <button
      onClick={() => setShowIOSGuide(true)}
      className={`flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 ${className}`}
    >
      <Download className="w-3.5 h-3.5 text-blue-600" />
      <span>Install App</span>
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl text-left border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Install AIPEU Dhenkanal App
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
              To install this PWA app, open your browser menu (Chrome / Safari / Edge) and click <strong>'Install App'</strong> or <strong>'Add to Home screen'</strong>.
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowIOSGuide(false);
              }}
              className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </button>
  );
};
