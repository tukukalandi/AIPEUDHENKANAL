import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  CheckCheck,
  Zap,
  Clock,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { PushNotificationItem, PlatformStyle } from '../types';
import {
  getStoredNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  triggerSimulatedPushNotification,
  requestPushPermission,
  isPushPermissionGranted,
} from '../services/notifications';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNotification?: (postId?: string) => void;
  platform: PlatformStyle;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onSelectNotification,
  platform,
}) => {
  const [notifications, setNotifications] = useState<PushNotificationItem[]>([]);
  const [hasPermission, setHasPermission] = useState(false);
  const [testSent, setTestSent] = useState(false);

  const refreshList = () => {
    setNotifications(getStoredNotifications());
    setHasPermission(isPushPermissionGranted());
  };

  useEffect(() => {
    if (isOpen) {
      refreshList();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleUpdate = () => refreshList();
    window.addEventListener('notifications-updated', handleUpdate);
    window.addEventListener('push-permission-changed', handleUpdate);
    return () => {
      window.removeEventListener('notifications-updated', handleUpdate);
      window.removeEventListener('push-permission-changed', handleUpdate);
    };
  }, []);

  if (!isOpen) return null;

  const handleEnablePush = async () => {
    const granted = await requestPushPermission();
    setHasPermission(granted);
  };

  const handleSendTestPush = () => {
    triggerSimulatedPushNotification();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2000);
    refreshList();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isIOS = platform === 'ios';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl transition-all ${
          isIOS
            ? 'rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200/80 dark:border-slate-800'
            : 'rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-200 dark:border-slate-800'
        } overflow-hidden max-h-[85vh] flex flex-col`}
      >
        {/* Grab Handle */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Postal Circular Alerts</span>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                    ({unreadCount} unread)
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AIPEU & AIGDSU Dhenkanal updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="p-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                title="Mark all read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Push Notification Permission & Simulation Banner */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Web Push Status:{' '}
                <span
                  className={
                    hasPermission
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-amber-600 dark:text-amber-400 font-bold'
                  }
                >
                  {hasPermission ? 'Enabled' : 'Disabled / Prompt'}
                </span>
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Receive instant alerts for DA/DR orders and strike calls.
              </p>
            </div>

            {!hasPermission ? (
              <button
                onClick={handleEnablePush}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0 active:scale-95 transition-all shadow-sm"
              >
                Allow Push
              </button>
            ) : (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                Active
              </span>
            )}
          </div>

          {/* Test Push Simulation Button */}
          <button
            onClick={handleSendTestPush}
            className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
              testSent
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60 hover:bg-blue-50/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>
              {testSent
                ? 'Simulated Alert Sent to App!'
                : 'Test Push Notification (Simulate Breaking Order)'}
            </span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 p-2">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 space-y-2">
              <Bell className="w-8 h-8 mx-auto stroke-1" />
              <p className="text-sm font-medium">No alerts right now</p>
              <p className="text-xs">
                You will receive breaking orders and circular notices here.
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  markNotificationAsRead(item.id);
                  if (onSelectNotification && item.postId) {
                    onSelectNotification(item.postId);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-xl transition-colors cursor-pointer flex items-start gap-3 ${
                  !item.read
                    ? 'bg-blue-50/70 dark:bg-blue-950/30 hover:bg-blue-50 dark:hover:bg-blue-950/50'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {item.urgent ? (
                    <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5 shrink-0">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(item.timestamp).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <h4
                    className={`text-xs leading-snug line-clamp-2 ${
                      !item.read
                        ? 'font-bold text-slate-900 dark:text-white'
                        : 'font-medium text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.title}
                  </h4>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                    {item.body}
                  </p>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0 self-center" />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
