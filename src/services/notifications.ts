import { PushNotificationItem } from '../types';

const NOTIFICATIONS_STORAGE_KEY = 'aipeu_notifications_list_v1';
const PUSH_ENABLED_KEY = 'aipeu_push_enabled_v1';

export const INITIAL_NOTIFICATIONS: PushNotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Urgent: Lunch Hour Demonstrations on 16.10.2026',
    body: 'Demonstration at Divisional Office Dhenkanal demanding immediate Bonus, DA/DR payment.',
    timestamp: '2026-10-17T20:44:05Z',
    category: "GROUP - 'C' AGENDA",
    read: false,
    urgent: true,
  },
  {
    id: 'notif-2',
    title: 'Media Coverage: AIGDSU Dhenkanal Protest',
    body: 'Print & web media coverage of massive demonstration against target pressure & GDS 8th CPC.',
    timestamp: '2026-10-17T20:42:24Z',
    category: 'GDS / ED AGENDA',
    read: false,
    urgent: false,
  },
  {
    id: 'notif-3',
    title: 'Trade Union Facilities Extended',
    body: 'Limited trade union facilities extended to AIPEU Gr C NFPE by postal administration.',
    timestamp: '2026-09-17T10:51:42Z',
    category: 'CIRCULARS & ORDERS',
    read: true,
    urgent: false,
  },
  {
    id: 'notif-4',
    title: 'Staff Adalat Grievance Redressal Hearing',
    body: 'Holding of Staff Adalat for redressal of staff grievances. Check circular for submission dates.',
    timestamp: '2026-01-31T16:33:13Z',
    category: 'CIRCULARS & ORDERS',
    read: true,
    urgent: false,
  },
];

export function getStoredNotifications(): PushNotificationItem[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveNotification(notif: PushNotificationItem): void {
  try {
    const list = getStoredNotifications();
    list.unshift(notif);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('notifications-updated'));
  } catch {}
}

export function markNotificationAsRead(id: string): void {
  try {
    const list = getStoredNotifications().map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('notifications-updated'));
  } catch {}
}

export function markAllNotificationsAsRead(): void {
  try {
    const list = getStoredNotifications().map((n) => ({ ...n, read: true }));
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('notifications-updated'));
  } catch {}
}

export function isPushPermissionGranted(): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  return Notification.permission === 'granted';
}

export async function requestPushPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    const perm = await Notification.requestPermission();
    const granted = perm === 'granted';
    localStorage.setItem(PUSH_ENABLED_KEY, granted ? 'true' : 'false');
    window.dispatchEvent(new Event('push-permission-changed'));
    return granted;
  } catch (err) {
    console.error('Error requesting push permission', err);
    return false;
  }
}

export function isPushEnabled(): boolean {
  try {
    return localStorage.getItem(PUSH_ENABLED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setPushEnabled(val: boolean): void {
  try {
    localStorage.setItem(PUSH_ENABLED_KEY, val ? 'true' : 'false');
    window.dispatchEvent(new Event('push-permission-changed'));
  } catch {}
}

export function triggerSimulatedPushNotification(customTitle?: string, customBody?: string): PushNotificationItem {
  const titles = [
    'DA / DR Hike 3% Order Issued by Ministry of Finance',
    'Bonus Sanctioned for Postal & GDS Employees 2026',
    'AIPEU Notice: All India Postal Strike Call Updates',
    'Dhenkanal Division Monthly Meeting Minutes Released',
    'GDS 8th Pay Commission Committee Recommendations',
    'Transfer Orders under Rule 38 Published',
  ];

  const bodies = [
    'Orders issued regarding Dearness Allowance payable to Central Government employees from 01.07.2026.',
    'Bonus entitlement ceiling and payment schedules announced by Directorate.',
    'Urgent bulletin from NFPE CHQ Delhi on charter of demands and strike preparedness.',
    'Supdt of Post Offices Dhenkanal Division holds meeting on staff grievances and pending claims.',
    'AIGDSU submits memorandum to Ministry of Communications regarding wage revisions.',
    'Circle Office releases list of approved inter-circle and intra-circle transfers.',
  ];

  const randomIndex = Math.floor(Math.random() * titles.length);
  const newNotif: PushNotificationItem = {
    id: `notif-${Date.now()}`,
    title: customTitle || titles[randomIndex],
    body: customBody || bodies[randomIndex],
    timestamp: new Date().toISOString(),
    category: 'BREAKING CIRCULAR',
    read: false,
    urgent: true,
  };

  saveNotification(newNotif);

  // If native notification is supported and allowed, trigger it!
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(newNotif.title, {
        body: newNotif.body,
        icon: '/pwa-192x192.png',
        badge: '/icon.svg',
        tag: newNotif.id,
      });
    } catch {
      // In some sandboxes system Notification may fail silently
    }
  }

  return newNotif;
}
