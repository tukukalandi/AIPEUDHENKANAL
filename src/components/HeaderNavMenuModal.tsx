import React, { useState, useEffect } from 'react';
import {
  X,
  Image as ImageIcon,
  Grid,
  Briefcase,
  Bookmark,
  Settings,
  Layers,
  Shield,
  FileText,
  ChevronRight,
  UserCheck,
  BookOpen,
  Download,
  Users,
  Home,
} from 'lucide-react';
import { ActiveTab, PlatformStyle, GalleryPhoto, CustomPortalApp, EmployeeResource } from '../types';
import {
  getStoredGallery,
  getStoredMyApps,
  getStoredEmployeeResources,
  getStoredForms,
} from '../data/portalMenuData';
import { subscribeToMyApps, getMyAppsFromFirestore } from '../services/firebase';

interface HeaderNavMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAdmin?: () => void;
  offlineCount: number;
  platform: PlatformStyle;
  initialSubView?: 'menu' | 'gallery' | 'apps' | 'employeeSite';
}

export const HeaderNavMenuModal: React.FC<HeaderNavMenuModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenAdmin,
  offlineCount,
}) => {
  const [gallery, setGallery] = useState<GalleryPhoto[]>([]);
  const [myApps, setMyApps] = useState<CustomPortalApp[]>([]);
  const [employeeResources, setEmployeeResources] = useState<EmployeeResource[]>([]);
  const [formsCount, setFormsCount] = useState<number>(5);

  useEffect(() => {
    if (isOpen) {
      setGallery(getStoredGallery());
      setMyApps(getStoredMyApps());
      setEmployeeResources(getStoredEmployeeResources());
      setFormsCount(getStoredForms().length);

      getMyAppsFromFirestore()
        .then((apps) => {
          if (apps && apps.length > 0) setMyApps(apps);
        })
        .catch(console.error);

      const unsub = subscribeToMyApps((liveApps) => {
        if (liveApps && liveApps.length > 0) {
          setMyApps(liveApps);
        }
      });
      return () => unsub();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const menuItems = [
    {
      id: 'home',
      title: 'Home Page',
      desc: 'Main union portal, announcements, important documents & notices',
      count: 'Main',
      icon: Home,
      gradient: 'from-blue-700 to-indigo-800',
      badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300',
      action: () => {
        onSelectTab('home');
        onClose();
      },
    },
    {
      id: 'user-portal',
      title: 'User Portal (Self-Service)',
      desc: 'Member Grievances, Digital Membership Card, Directory & Forms',
      count: 'Portal',
      icon: UserCheck,
      gradient: 'from-emerald-600 to-teal-600',
      badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
      action: () => {
        onSelectTab('user-portal');
        onClose();
      },
    },
    {
      id: 'orders-rulings-guide',
      title: 'Orders / Rulings / Guide',
      desc: 'Postal department orders, union rulings, guidelines and handbooks in card view',
      count: 'Official Docs',
      icon: BookOpen,
      gradient: 'from-rose-600 to-red-700',
      badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300',
      action: () => {
        onSelectTab('orders-rulings-guide');
        onClose();
      },
    },
    {
      id: 'feed',
      title: 'Circulars & Feed',
      desc: 'Divisional circulars, meeting minutes, exam notifications & orders',
      count: 'Live Feed',
      icon: FileText,
      gradient: 'from-red-600 to-orange-600',
      badgeBg: 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300',
      action: () => {
        onSelectTab('feed');
        onClose();
      },
    },
    {
      id: 'categories',
      title: 'Constituent Union Wings',
      desc: 'AIPEU Group C, Postman & MTS, AIGDSU, AIPRPA & Women Committee',
      count: '5 Wings',
      icon: Layers,
      gradient: 'from-indigo-600 to-blue-600',
      badgeBg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300',
      action: () => {
        onSelectTab('categories');
        onClose();
      },
    },
    {
      id: 'directory',
      title: 'Office Bearers & Directory',
      desc: 'Divisional executives, contact numbers, union constitution & rulings',
      count: 'Directory',
      icon: Users,
      gradient: 'from-cyan-600 to-blue-700',
      badgeBg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300',
      action: () => {
        onSelectTab('directory');
        onClose();
      },
    },
    {
      id: 'gallery',
      title: 'Photo Gallery',
      desc: 'Historic conferences, Staff Adalat, and union rallies in full-page view',
      count: `${gallery.length} Photos`,
      icon: ImageIcon,
      gradient: 'from-purple-600 to-indigo-600',
      badgeBg: 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300',
      action: () => {
        onSelectTab('gallery');
        onClose();
      },
    },
    {
      id: 'my-apps',
      title: 'My Apps & Online Portals',
      desc: 'ACG-17 Receipt Generator, Target Calculator, SAP ERP, CEPT, Finacle & PLI',
      count: `${myApps.length} Apps`,
      icon: Grid,
      gradient: 'from-blue-600 to-cyan-600',
      badgeBg: 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300',
      action: () => {
        onSelectTab('my-apps');
        onClose();
      },
    },
    {
      id: 'employee-site',
      title: 'Employee Site & Rules',
      desc: 'Postal Manuals Vol IV & VI, CCS Conduct Rules, Pay Matrix',
      count: `${employeeResources.length} Manuals`,
      icon: Briefcase,
      gradient: 'from-amber-600 to-orange-600',
      badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300',
      action: () => {
        onSelectTab('employee-site');
        onClose();
      },
    },
    {
      id: 'forms',
      title: 'Downloadable Forms',
      desc: 'Claim settlement, LDCE proforma, CCL leave, PLI revival & union forms',
      count: `${formsCount} Forms`,
      icon: Download,
      gradient: 'from-violet-600 to-purple-700',
      badgeBg: 'bg-violet-100 text-violet-800 dark:bg-violet-950/80 dark:text-violet-300',
      action: () => {
        onSelectTab('forms');
        onClose();
      },
    },
    {
      id: 'offline',
      title: 'Offline Vault',
      desc: 'Cached circulars & orders accessible without internet',
      count: offlineCount > 0 ? `${offlineCount} Saved` : 'Vault',
      icon: Bookmark,
      gradient: 'from-emerald-600 to-teal-600',
      badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
      action: () => {
        onSelectTab('offline');
        onClose();
      },
    },
    {
      id: 'settings',
      title: 'Settings & Preferences',
      desc: 'Display modes, UI platform style, language, and font sizing',
      count: 'Preferences',
      icon: Settings,
      gradient: 'from-slate-700 to-slate-900',
      badgeBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      action: () => {
        onSelectTab('settings');
        onClose();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#022A61] to-[#0A3D80] text-white">
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase text-amber-300 block">
              FULL-PAGE PORTAL DIRECTORY
            </span>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
              Union Menu & Full-Page Portals
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select any portal section below to open its dedicated full-page view.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  className="p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all active:scale-[0.98] group bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md cursor-pointer"
                >
                  <div
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${item.badgeBg}`}>
                        {item.count}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {item.desc}
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                </button>
              );
            })}
          </div>

          {onOpenAdmin && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdmin();
                }}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-sm flex items-center justify-between shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-amber-300" />
                  <div className="text-left">
                    <div className="font-black">Admin Portal & Management Console</div>
                    <div className="text-[11px] text-rose-100 font-normal">
                      Manage circulars, hero slider, homepage docs, members & executive bearers
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>AIPEU Dhenkanal Division Portal</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold transition-all text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
