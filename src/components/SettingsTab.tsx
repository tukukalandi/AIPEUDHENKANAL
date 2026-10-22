import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Moon,
  Sun,
  Bell,
  HardDrive,
  Download,
  Trash2,
  Zap,
  Globe,
  Share2,
  Info,
  CheckCircle,
} from 'lucide-react';
import { PlatformStyle, ThemeMode } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import {
  isPushPermissionGranted,
  requestPushPermission,
  triggerSimulatedPushNotification,
} from '../services/notifications';
import {
  clearAllOfflinePosts,
  getStorageUsage,
  getSimulatedOffline,
  setSimulatedOffline,
} from '../services/storage';

interface SettingsTabProps {
  platform: PlatformStyle;
  onSetPlatform: (p: PlatformStyle) => void;
  deviceFrame: 'none' | 'iphone' | 'pixel';
  onSetDeviceFrame: (f: 'none' | 'iphone' | 'pixel') => void;
  theme: ThemeMode;
  onSetTheme: (t: ThemeMode) => void;
  onOpenShareApp: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  platform,
  onSetPlatform,
  deviceFrame,
  onSetDeviceFrame,
  theme,
  onSetTheme,
  onOpenShareApp,
}) => {
  const [pushGranted, setPushGranted] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [storageStats, setStorageStats] = useState({ count: 0, estimatedSizeKb: 0 });
  const [isSimOffline, setIsSimOffline] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setPushGranted(isPushPermissionGranted());
    setStorageStats(getStorageUsage());
    setIsSimOffline(getSimulatedOffline());
  }, []);

  const handleRequestPush = async () => {
    const granted = await requestPushPermission();
    setPushGranted(granted);
    if (granted) {
      setMsg('Push notifications enabled successfully!');
      setTimeout(() => setMsg(''), 2500);
    }
  };

  const handleTriggerTestAlert = () => {
    triggerSimulatedPushNotification();
    setTestSent(true);
    setMsg('Simulated push notification dispatched!');
    setTimeout(() => {
      setTestSent(false);
      setMsg('');
    }, 2500);
  };

  const handleClearCache = () => {
    if (window.confirm('Clear all cached articles?')) {
      clearAllOfflinePosts();
      setStorageStats(getStorageUsage());
      setMsg('Cache cleared successfully.');
      setTimeout(() => setMsg(''), 2500);
    }
  };

  const handleToggleOfflineSim = () => {
    const next = !isSimOffline;
    setSimulatedOffline(next);
    setIsSimOffline(next);
  };

  const isIOS = platform === 'ios';

  return (
    <div className="space-y-4 pb-14 animate-fade-in">
      <div>
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
          App Settings & Controls
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Customize mobile platform feel, theme, offline sync, and notifications
        </p>
      </div>

      {msg && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-600 text-white text-xs font-semibold shadow-md">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Grid of Settings Cards for Full Desktop Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PWA Install Button */}
        <div className="md:col-span-2 p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Install PWA on Device
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              For native app launcher, full-screen view & offline speed
            </p>
          </div>
          <PWAInstallButton />
        </div>

        {/* 1. Mobile Platform Experience Switcher (iOS vs Android) */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
            Mobile OS Experience
          </span>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Native Platform Mode
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select between Apple iOS Cupertino or Google Android Material 3 component styling
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onSetPlatform('ios')}
            className={`p-2.5 rounded-2xl border text-center transition-all ${
              platform === 'ios'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium'
            }`}
          >
            <div className="text-base mb-0.5">🍏</div>
            <div className="text-xs font-semibold">iOS Mode</div>
            <div className="text-[10px] opacity-80">Cupertino</div>
          </button>

          <button
            onClick={() => onSetPlatform('android')}
            className={`p-2.5 rounded-2xl border text-center transition-all ${
              platform === 'android'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium'
            }`}
          >
            <div className="text-base mb-0.5">🤖</div>
            <div className="text-xs font-semibold">Android Mode</div>
            <div className="text-[10px] opacity-80">Material 3</div>
          </button>

          <button
            onClick={() => onSetPlatform('auto')}
            className={`p-2.5 rounded-2xl border text-center transition-all ${
              platform === 'auto'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium'
            }`}
          >
            <div className="text-base mb-0.5">⚡</div>
            <div className="text-xs font-semibold">Auto Detect</div>
            <div className="text-[10px] opacity-80">Device Based</div>
          </button>
        </div>
      </div>

      {/* 2. Device Mockup Frame Selector (for desktop / preview testing) */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Viewport Testing
          </span>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Mobile Device Frame Preview
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Preview inside realistic iPhone 16 Pro or Google Pixel 9 phone chassis
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onSetDeviceFrame('none')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
              deviceFrame === 'none'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            Full Width
          </button>

          <button
            onClick={() => onSetDeviceFrame('iphone')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
              deviceFrame === 'iphone'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            iPhone Frame
          </button>

          <button
            onClick={() => onSetDeviceFrame('pixel')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
              deviceFrame === 'pixel'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            Pixel Frame
          </button>
        </div>
      </div>

      {/* 3. Theme Mode (Dark Mode Theme requirement) */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Dark Mode Theme
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              High-contrast India Post theme for battery & low-light reading
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onSetTheme('light')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
              theme === 'light'
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Light</span>
          </button>

          <button
            onClick={() => onSetTheme('dark')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
              theme === 'dark'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Dark</span>
          </button>

          <button
            onClick={() => onSetTheme('system')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
              theme === 'system'
                ? 'bg-slate-700 text-white border-slate-700 shadow-sm'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>System</span>
          </button>
        </div>
      </div>

      {/* 4. Push Notifications */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Push Notifications
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time alerts for DA, bonus orders & strike calls
            </p>
          </div>
          {!pushGranted ? (
            <button
              onClick={handleRequestPush}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold active:scale-95 transition shadow-sm"
            >
              Enable
            </button>
          ) : (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Enabled
            </span>
          )}
        </div>

        <button
          onClick={handleTriggerTestAlert}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100/60 active:scale-98 transition"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{testSent ? 'Simulated Alert Dispatched!' : 'Send Test Breaking Alert'}</span>
        </button>
      </div>

      {/* 5. Offline Storage Management */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Offline Storage & Simulator
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {storageStats.count} circulars cached ({storageStats.estimatedSizeKb} KB)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleToggleOfflineSim}
            className={`py-2 px-3 rounded-xl text-xs font-semibold transition ${
              isSimOffline
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {isSimOffline ? 'Offline Sim: ON' : 'Test Offline Mode'}
          </button>

          <button
            onClick={handleClearCache}
            className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Clear Cache
          </button>
        </div>
      </div>

      {/* 6. Social Share & Union Info */}
      <div className="md:col-span-2 p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <button
          onClick={onOpenShareApp}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 active:scale-98 transition"
        >
          <Share2 className="w-4 h-4" />
          <span>Share App with Postal Comrades</span>
        </button>

        <div className="pt-2 text-center text-xs text-slate-400 dark:text-slate-500 space-y-0.5">
          <p className="font-bold text-slate-700 dark:text-slate-200">
            NFPE AIPEU Unions AIGDSU AIPRPA AIPCPCCWF - Dhenkanal Division
          </p>
          <p className="text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-400">
            Mob - 9861184651 · aipeup3dhenkanaldivn@gmail.com
          </p>
          <p>Affiliated to NFPE, AIGDSU, AIPRPA & AIPCPCCWF · Dhenkanal, Odisha</p>
          <a
            href="https://aipeup3dkl.blogspot.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline inline-block mt-1"
          >
            Visit Original Blogspot Website
          </a>
        </div>
      </div>
      </div>
    </div>
  );
};
