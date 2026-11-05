import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Home,
  Image as ImageIcon,
  Grid,
  Briefcase,
  FileText,
  Search,
  Calendar,
  ExternalLink,
  Play,
  FileCode,
  RotateCcw,
  X,
  Download,
  Folder,
  Tag,
  ChevronRight,
  Calculator,
  Building2,
  GraduationCap,
  Cpu,
  Landmark,
  ShieldCheck,
  Package,
  HeartPulse,
  Award,
  MessageSquareWarning,
  Globe,
  Users,
  Sparkles,
} from 'lucide-react';
import {
  ActiveTab,
  GalleryPhoto,
  CustomPortalApp,
  EmployeeResource,
  DownloadableForm,
} from '../types';
import {
  getStoredGallery,
  getStoredMyApps,
  getStoredEmployeeResources,
  getStoredForms,
} from '../data/portalMenuData';
import { PRIMARY_BRAND_LOGO } from '../data/logos';

export interface AppCardColorTheme {
  name: string;
  cardBg: string;
  cardBorder: string;
  cardHoverBorder: string;
  accentBar: string;
  glowBg: string;
  iconBg: string;
  categoryBadge: string;
  typeBadge: string;
  titleHover: string;
  metaBg: string;
  buttonBg: string;
}

// 16 Distinct, High-Contrast Attractive Card Color Themes so every card in My Apps has a unique color
export const MY_APPS_COLOR_PALETTE: AppCardColorTheme[] = [
  {
    name: 'Crimson Rose',
    cardBg: 'bg-gradient-to-br from-rose-50 via-red-50/80 to-pink-100/70 dark:from-rose-950/55 dark:via-red-950/40 dark:to-slate-900',
    cardBorder: 'border-rose-200/90 dark:border-rose-800/70',
    cardHoverBorder: 'hover:border-rose-500 dark:hover:border-rose-400',
    accentBar: 'bg-gradient-to-r from-rose-600 via-red-500 to-pink-600',
    glowBg: 'bg-rose-400/15',
    iconBg: 'bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-md shadow-rose-600/25 ring-2 ring-rose-200 dark:ring-rose-800',
    categoryBadge: 'bg-rose-600 text-white',
    typeBadge: 'bg-white/90 dark:bg-slate-800 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-700',
    titleHover: 'group-hover:text-rose-700 dark:group-hover:text-rose-300',
    metaBg: 'bg-white/80 dark:bg-slate-800/80 border-rose-200/70 dark:border-rose-800/60 text-rose-900 dark:text-rose-200',
    buttonBg: 'bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white shadow-md shadow-rose-600/20',
  },
  {
    name: 'Golden Amber',
    cardBg: 'bg-gradient-to-br from-amber-50 via-yellow-50/85 to-orange-100/70 dark:from-amber-950/55 dark:via-yellow-950/40 dark:to-slate-900',
    cardBorder: 'border-amber-200/90 dark:border-amber-800/70',
    cardHoverBorder: 'hover:border-amber-500 dark:hover:border-amber-400',
    accentBar: 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500',
    glowBg: 'bg-amber-400/15',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-200 dark:ring-amber-800',
    categoryBadge: 'bg-amber-600 text-white',
    typeBadge: 'bg-white/90 dark:bg-slate-800 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-700',
    titleHover: 'group-hover:text-amber-800 dark:group-hover:text-amber-300',
    metaBg: 'bg-white/80 dark:bg-slate-800/80 border-amber-200/70 dark:border-amber-800/60 text-amber-950 dark:text-amber-200',
    buttonBg: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-md shadow-amber-600/20',
  },
  {
    name: 'Ocean Cobalt',
    cardBg: 'bg-gradient-to-br from-sky-50 via-blue-50/85 to-indigo-100/70 dark:from-sky-950/55 dark:via-blue-950/40 dark:to-slate-900',
    cardBorder: 'border-sky-200/90 dark:border-sky-800/70',
    cardHoverBorder: 'hover:border-sky-500 dark:hover:border-sky-400',
    accentBar: 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600',
    glowBg: 'bg-sky-400/15',
    iconBg: 'bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow-md shadow-sky-500/25 ring-2 ring-sky-200 dark:ring-sky-800',
    categoryBadge: 'bg-sky-600 text-white',
    typeBadge: 'bg-white/90 dark:bg-slate-800 text-sky-900 dark:text-sky-200 border-sky-200 dark:border-sky-700',
    titleHover: 'group-hover:text-sky-800 dark:group-hover:text-sky-300',
    metaBg: 'bg-white/80 dark:bg-slate-800/80 border-sky-200/70 dark:border-sky-800/60 text-sky-950 dark:text-sky-200',
    buttonBg: 'bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white shadow-md shadow-sky-600/20',
  },
  {
    name: 'Emerald Mint',
    cardBg: 'bg-gradient-to-br from-emerald-50 via-green-50/85 to-teal-100/70 dark:from-emerald-950/55 dark:via-green-950/40 dark:to-slate-900',
    cardBorder: 'border-emerald-200/90 dark:border-emerald-800/70',
    cardHoverBorder: 'hover:border-emerald-500 dark:hover:border-emerald-400',
    accentBar: 'bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600',
    glowBg: 'bg-emerald-400/15',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-green-700 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-200 dark:ring-emerald-800',
    categoryBadge: 'bg-emerald-600 text-white',
    typeBadge: 'bg-white/90 dark:bg-slate-800 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700',
    titleHover: 'group-hover:text-emerald-800 dark:group-hover:text-emerald-300',
    metaBg: 'bg-white/80 dark:bg-slate-800/80 border-emerald-200/70 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200',
    buttonBg: 'bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white shadow-md shadow-emerald-600/20',
  },
  {
    name: 'Royal Violet',
    cardBg: 'bg-gradient-to-br from-violet-50 via-purple-50/85 to-fuchsia-100/65 dark:from-violet-950/55 dark:via-purple-950/40 dark:to-slate-900',
    cardBorder: 'border-violet-200/90 dark:border-violet-800/70',
    cardHoverBorder: 'hover:border-violet-500 dark:hover:border-violet-400',
    accentBar: 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600',
    glowBg: 'bg-violet-400/15',
    iconBg: 'bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-md shadow-violet-600/25 ring-2 ring-violet-200 dark:ring-violet-800',
    categoryBadge: 'bg-violet-600 text-white',
    typeBadge: 'bg-white/90 dark:bg-slate-800 text-violet-900 dark:text-violet-200 border-violet-200 dark:border-violet-700',
    titleHover: 'group-hover:text-violet-800 dark:group-hover:text-violet-300',
    metaBg: 'bg-white/80 dark:bg-slate-800/80 border-violet-200/70 dark:border-violet-800/60 text-violet-950 dark:text-violet-200',
    buttonBg: 'bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white shadow-md shadow-violet-600/20',
  },
  {
    name: 'Tropical Teal',
    cardBg: 'bg-gradient-to-br from-teal-50 via-cyan-50/85 to-sky-100/70 dark:from-teal-950/55 dark:via-cyan-950/40 dark:to-slate-900',
    cardBorder: 'border-teal-200/90 dark:border-teal-800/70',
    cardHoverBorder: 'hover:border-teal-500 dark:hover:border-teal-400',
    accentBar: 'bg-gradient-to-r from-teal-500 via-cyan-600 to-sky-600',
    glowBg: 'bg-teal-400/15',
    iconBg: 'bg-gradient-to-br from-teal-500 to-cyan-700 text-white shadow-md shadow-teal-500/25 ring-2 ring-teal-200 dark:ring-teal-800',
    categoryBadge: 'bg-teal-600 text-white',
    typeBadge: 'bg-white/90 dark:bg-slate-800 text-teal-900 dark:text-teal-200 border-teal-200 dark:border-teal-700',
    titleHover: 'group-hover:text-teal-800 dark:group-hover:text-teal-300',
    metaBg: 'bg-white/80 dark:bg-slate-800/80 border-teal-200/70 dark:border-teal-800/60 text-teal-950 dark:text-teal-200',
    buttonBg: 'bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-500 hover:to-cyan-600 text-white shadow-md shadow-teal-600/20',
  },
  {
    name: 'Sunset Coral',
    cardBg: 'bg-gradient-to-br from-orange-50 via-red-50/75 to-amber-100/70 dark:from-orange-950/55 dark:via-red-950/40 dark:to-slate-900',
    cardBorder: 'border-orange-200/90 dark:border-orange-800/70',
    cardHoverBorder: 'hover:border-orange-500 dark:hover:border-orange-400',
    accentBar: 'bg-gradient-to-r from-orange-500 via-red-500 to-amber-500',
    glowBg: 'bg-orange-400/15',
    iconBg: 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-200 dark:ring-orange-800',
    categoryBadge: 'bg-orange-600 text-white',
    typeBadge: 'bg-white/90 dark:bg-slate-800 text-orange-900 dark:text-orange-200 border-orange-200 dark:border-orange-700',
    titleHover: 'group-hover:text-orange-800 dark:group-hover:text-orange-300',
    metaBg: 'bg-white/80 dark:bg-slate-800/80 border-orange-200/70 dark:border-orange-800/60 text-orange-950 dark:text-orange-200',
    buttonBg: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-md shadow-orange-600/20',
  },
  {
    name: 'Berry Fuchsia',
    cardBg: 'bg-gradient-to-br from-fuchsia-50 via-pink-50/85 to-rose-100/65 dark:from-fuchsia-950/55 dark:via-pink-950/40 dark:to-slate-900',
    cardBorder: 'border-fuchsia-200/90 dark:border-fuchsia-800/70',
    cardHoverBorder: 'hover:border-fuchsia-500 dark:hover:border-fuchsia-400',
    accentBar: 'bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-500',
    glowBg: 'bg-fuchsia-400/15',
    iconBg: 'bg-gradient-to-br from-fuchsia-600 to-pink-700 text-white shadow-md shadow-fuchsia-600/25 ring-2 ring-fuchsia-200 dark:ring-fuchsia-800',
    categoryBadge: 'bg-fuchsia-600 text-white',
    typeBadge: 'bg-white/90 dark:bg-slate-800 text-fuchsia-900 dark:text-fuchsia-200 border-fuchsia-200 dark:border-fuchsia-700',
    titleHover: 'group-hover:text-fuchsia-800 dark:group-hover:text-fuchsia-300',
    metaBg: 'bg-white/80 dark:bg-slate-800/80 border-fuchsia-200/70 dark:border-fuchsia-800/60 text-fuchsia-950 dark:text-fuchsia-200',
    buttonBg: 'bg-gradient-to-r from-fuchsia-600 to-pink-700 hover:from-fuchsia-500 hover:to-pink-600 text-white shadow-md shadow-fuchsia-600/20',
  },
  {
    name: 'Sapphire Indigo',
    cardBg: 'bg-gradient-to-br from-indigo-50 via-blue-50/85 to-violet-100/70 dark:from-indigo-950/55 dark:via-blue-950/40 dark:to-slate-900',
    cardBorder: 'border-indigo-200/90 dark:border-indigo-800/70',
    cardHoverBorder: 'hover:border-indigo-500 dark:hover:border-indigo-400',
    accentBar: 'bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600',
    glowBg: 'bg-indigo-400/15',
    iconBg: 'bg-gradient-to-br from-indigo-600 to-blue-800 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-200 dark:ring-indigo-800',
    categoryBadge: 'bg-indigo-600 text-white',
    typeBadge: 'bg-white/90 dark:bg-slate-800 text-indigo-900 dark:text-indigo-200 border-indigo-200 dark:border-indigo-700',
    titleHover: 'group-hover:text-indigo-800 dark:group-hover:text-indigo-300',
    metaBg: 'bg-white/80 dark:bg-slate-800/80 border-indigo-200/70 dark:border-indigo-800/60 text-indigo-950 dark:text-indigo-200',
    buttonBg: 'bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-500 hover:to-blue-600 text-white shadow-md shadow-indigo-600/20',
  },
  {
    name: 'Jade Seafoam',
    cardBg: 'bg-gradient-to-br from-green-50 via-emerald-50/85 to-lime-100/65 dark:from-green-950/55 dark:via-emerald-950/40 dark:to-slate-900',
    cardBorder: 'border-green-200/90 dark:border-green-800/70',
    cardHoverBorder: 'hover:border-green-500 dark:hover:border-green-400',
    accentBar: 'bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500',
    glowBg: 'bg-green-400/15',
    iconBg: 'bg-gradient-to-br from-green-600 to-emerald-700 text-white shadow-md shadow-green-600/25 ring-2 ring-green-200 dark:ring-green-800',
    categoryBadge: 'bg-green-600 text-white',
    typeBadge: 'bg-white/90 dark:bg-slate-800 text-green-900 dark:text-green-200 border-green-200 dark:border-green-700',
    titleHover: 'group-hover:text-green-800 dark:group-hover:text-green-300',
    metaBg: 'bg-white/80 dark:bg-slate-800/80 border-green-200/70 dark:border-green-800/60 text-green-950 dark:text-green-200',
    buttonBg: 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white shadow-md shadow-green-600/20',
  },
  {
    name: 'Warm Honey Gold',
    cardBg: 'bg-gradient-to-br from-yellow-50 via-amber-50/85 to-orange-100/60 dark:from-yellow-950/55 dark:via-amber-950/40 dark:to-slate-900',
    cardBorder: 'border-yellow-300/90 dark:border-yellow-800/70',
    cardHoverBorder: 'hover:border-amber-500 dark:hover:border-yellow-400',
    accentBar: 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500',
    glowBg: 'bg-yellow-400/15',
    iconBg: 'bg-gradient-to-br from-yellow-500 to-amber-600 text-white shadow-md shadow-amber-500/25 ring-2 ring-yellow-200 dark:ring-yellow-800',
    categoryBadge: 'bg-amber-600 text-white',
    typeBadge: 'bg-white/90 dark:bg-slate-800 text-amber-900 dark:text-amber-200 border-yellow-300 dark:border-yellow-700',
    titleHover: 'group-hover:text-amber-800 dark:group-hover:text-yellow-300',
    metaBg: 'bg-white/80 dark:bg-slate-800/80 border-yellow-300/70 dark:border-yellow-800/60 text-amber-950 dark:text-yellow-200',
    buttonBg: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-md shadow-amber-500/20',
  },
  {
    name: 'Orchid Plum',
    cardBg: 'bg-gradient-to-br from-purple-50 via-fuchsia-50/80 to-indigo-100/65 dark:from-purple-950/55 dark:via-fuchsia-950/40 dark:to-slate-900',
    cardBorder: 'border-purple-200/90 dark:border-purple-800/70',
    cardHoverBorder: 'hover:border-purple-500 dark:hover:border-purple-400',
    accentBar: 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600',
    glowBg: 'bg-purple-400/15',
    iconBg: 'bg-gradient-to-br from-purple-600 to-fuchsia-700 text-white shadow-md shadow-purple-600/25 ring-2 ring-purple-200 dark:ring-purple-800',
    categoryBadge: 'bg-purple-600 text-white',
    typeBadge: 'bg-white/90 dark:bg-slate-800 text-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-700',
    titleHover: 'group-hover:text-purple-800 dark:group-hover:text-purple-300',
    metaBg: 'bg-white/80 dark:bg-slate-800/80 border-purple-200/70 dark:border-purple-800/60 text-purple-950 dark:text-purple-200',
    buttonBg: 'bg-gradient-to-r from-purple-600 to-fuchsia-700 hover:from-purple-500 hover:to-fuchsia-600 text-white shadow-md shadow-purple-600/20',
  },
  {
    name: 'Cerulean Azure',
    cardBg: 'bg-gradient-to-br from-cyan-50 via-sky-50/85 to-blue-100/70 dark:from-cyan-950/55 dark:via-sky-950/40 dark:to-slate-900',
    cardBorder: 'border-cyan-200/90 dark:border-cyan-800/70',
    cardHoverBorder: 'hover:border-cyan-500 dark:hover:border-cyan-400',
    accentBar: 'bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-600',
    glowBg: 'bg-cyan-400/15',
    iconBg: 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white shadow-md shadow-cyan-600/25 ring-2 ring-cyan-200 dark:ring-cyan-800',
    categoryBadge: 'bg-cyan-600 text-white',
    typeBadge: 'bg-white/90 dark:bg-slate-800 text-cyan-900 dark:text-cyan-200 border-cyan-200 dark:border-cyan-700',
    titleHover: 'group-hover:text-cyan-800 dark:group-hover:text-cyan-300',
    metaBg: 'bg-white/80 dark:bg-slate-800/80 border-cyan-200/70 dark:border-cyan-800/60 text-cyan-950 dark:text-cyan-200',
    buttonBg: 'bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white shadow-md shadow-cyan-600/20',
  },
  {
    name: 'Ruby Garnet',
    cardBg: 'bg-gradient-to-br from-red-50 via-rose-50/85 to-orange-100/65 dark:from-red-950/55 dark:via-rose-950/40 dark:to-slate-900',
    cardBorder: 'border-red-200/90 dark:border-red-800/70',
    cardHoverBorder: 'hover:border-red-500 dark:hover:border-red-400',
    accentBar: 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-500',
    glowBg: 'bg-red-400/15',
    iconBg: 'bg-gradient-to-br from-red-600 to-rose-800 text-white shadow-md shadow-red-600/25 ring-2 ring-red-200 dark:ring-red-800',
    categoryBadge: 'bg-red-600 text-white',
    typeBadge: 'bg-white/90 dark:bg-slate-800 text-red-900 dark:text-red-200 border-red-200 dark:border-red-700',
    titleHover: 'group-hover:text-red-800 dark:group-hover:text-red-300',
    metaBg: 'bg-white/80 dark:bg-slate-800/80 border-red-200/70 dark:border-red-800/60 text-red-950 dark:text-red-200',
    buttonBg: 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-md shadow-red-600/20',
  },
  {
    name: 'PinkBlush Coral',
    cardBg: 'bg-gradient-to-br from-pink-50 via-rose-50/85 to-fuchsia-100/65 dark:from-pink-950/55 dark:via-rose-950/40 dark:to-slate-900',
    cardBorder: 'border-pink-200/90 dark:border-pink-800/70',
    cardHoverBorder: 'hover:border-pink-500 dark:hover:border-pink-400',
    accentBar: 'bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600',
    glowBg: 'bg-pink-400/15',
    iconBg: 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/25 ring-2 ring-pink-200 dark:ring-pink-800',
    categoryBadge: 'bg-pink-600 text-white',
    typeBadge: 'bg-white/90 dark:bg-slate-800 text-pink-900 dark:text-pink-200 border-pink-200 dark:border-pink-700',
    titleHover: 'group-hover:text-pink-800 dark:group-hover:text-pink-300',
    metaBg: 'bg-white/80 dark:bg-slate-800/80 border-pink-200/70 dark:border-pink-800/60 text-pink-950 dark:text-pink-200',
    buttonBg: 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-md shadow-pink-600/20',
  },
  {
    name: 'Periwinkle Blue',
    cardBg: 'bg-gradient-to-br from-blue-50 via-indigo-50/85 to-sky-100/70 dark:from-blue-950/55 dark:via-indigo-950/40 dark:to-slate-900',
    cardBorder: 'border-blue-200/90 dark:border-blue-800/70',
    cardHoverBorder: 'hover:border-blue-500 dark:hover:border-blue-400',
    accentBar: 'bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500',
    glowBg: 'bg-blue-400/15',
    iconBg: 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-600/25 ring-2 ring-blue-200 dark:ring-blue-800',
    categoryBadge: 'bg-blue-600 text-white',
    typeBadge: 'bg-white/90 dark:bg-slate-800 text-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-700',
    titleHover: 'group-hover:text-blue-800 dark:group-hover:text-blue-300',
    metaBg: 'bg-white/80 dark:bg-slate-800/80 border-blue-200/70 dark:border-blue-800/60 text-blue-950 dark:text-blue-200',
    buttonBg: 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white shadow-md shadow-blue-600/20',
  },
];

export const getMyAppCardTheme = (index: number): AppCardColorTheme => {
  return MY_APPS_COLOR_PALETTE[Math.abs(index) % MY_APPS_COLOR_PALETTE.length];
};

export const getMyAppIcon = (app: CustomPortalApp) => {
  const text = `${app.name} ${app.category}`.toLowerCase();
  if (text.includes('acg') || text.includes('receipt')) return FileText;
  if (text.includes('calc') || text.includes('target')) return Calculator;
  if (text.includes('karmayogi') || text.includes('training') || text.includes('learn')) return GraduationCap;
  if (text.includes('cept') || text.includes('tech') || text.includes('it')) return Cpu;
  if (text.includes('cbs') || text.includes('finacle') || text.includes('bank')) return Landmark;
  if (text.includes('pli') || text.includes('insur')) return ShieldCheck;
  if (text.includes('track') || text.includes('speed')) return Package;
  if (text.includes('cghs') || text.includes('health') || text.includes('medical')) return HeartPulse;
  if (text.includes('bhavishya') || text.includes('pension')) return Award;
  if (text.includes('griev') || text.includes('cpengrams')) return MessageSquareWarning;
  if (text.includes('erp') || text.includes('meghdoot') || text.includes('sap')) return Building2;
  if (text.includes('nfpe') || text.includes('union')) return Users;
  if (app.sourceType === 'code' || app.codeSnippet) return FileCode;
  return Globe;
};

// ================= 1. CONSISTENT INTERNAL PAGE NAVIGATION BAR =================

interface InternalPageNavBarProps {
  activeTab: ActiveTab;
  onBack: () => void;
  onHome: () => void;
  customTitle?: string;
}

const TAB_TITLES: Record<ActiveTab, string> = {
  home: 'Home Page',
  'user-portal': 'User Portal & Member Area',
  'orders-rulings-guide': 'Orders / Rulings / Guide',
  feed: 'Circulars & Feed',
  categories: 'Constituent Union Wings',
  directory: 'Office Bearers & Union Directory',
  gallery: 'Union Photo Gallery',
  'my-apps': 'My Apps & Online Portals',
  'employee-site': 'Employee Site & Postal Rules',
  forms: 'Downloadable Service Forms',
  offline: 'Offline Saved Vault',
  settings: 'Portal Settings & Preferences',
};

export const InternalPageNavBar: React.FC<InternalPageNavBarProps> = ({
  activeTab,
  onBack,
  onHome,
  customTitle,
}) => {
  const pageTitle = customTitle || TAB_TITLES[activeTab] || 'Portal Section';

  return (
    <div className="w-full mb-5 bg-white dark:bg-slate-900 rounded-2xl px-4 py-3 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        {/* 1. ← Back Button */}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm border border-slate-200/80 dark:border-slate-700 transition-all active:scale-95 cursor-pointer shadow-2xs"
          title="Return to previously visited page"
        >
          <ArrowLeft className="w-4 h-4 text-red-600 dark:text-red-400 stroke-[2.5]" />
          <span>← Back</span>
        </button>

        {/* 2. ⌂ Home Button */}
        <button
          type="button"
          onClick={onHome}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#022A61] to-[#0A3D80] hover:from-[#033579] hover:to-[#0d4a9a] text-white font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer shadow-sm"
          title="Go directly to main Home Page"
        >
          <Home className="w-4 h-4 text-amber-300 stroke-[2.3]" />
          <span>⌂ Home</span>
        </button>
      </div>

      {/* Current Page Breadcrumb Context */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
        <button
          type="button"
          onClick={onHome}
          className="hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer hidden sm:inline"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
        <span className="text-red-600 dark:text-amber-400 font-extrabold uppercase tracking-wider truncate max-w-[220px] sm:max-w-xs">
          {pageTitle}
        </span>
      </div>
    </div>
  );
};

// ================= 2. FULL-PAGE PHOTO GALLERY VIEW =================

export const PhotoGalleryPage: React.FC = () => {
  const [gallery, setGallery] = useState<GalleryPhoto[]>([]);
  const [galleryCat, setGalleryCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  useEffect(() => {
    const loadGallery = () => setGallery(getStoredGallery());
    loadGallery();
    window.addEventListener('storage', loadGallery);
    return () => window.removeEventListener('storage', loadGallery);
  }, []);

  const galleryCategories = useMemo(
    () => ['all', ...Array.from(new Set(gallery.map((g) => g.category).filter(Boolean)))],
    [gallery]
  );

  const filteredGallery = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return gallery.filter((g) => {
      const matchesCat = galleryCat === 'all' || g.category === galleryCat;
      const matchesSearch =
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        (g.date && g.date.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [gallery, galleryCat, searchQuery]);

  return (
    <div className="w-full space-y-6 pb-14 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#3B0764] via-[#581C87] to-[#B91C1C] text-white p-6 sm:p-8 shadow-xl border-2 border-amber-400/50 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
              <ImageIcon className="w-4 h-4" />
              <span>OFFICIAL VISUAL ARCHIVES · DHENKANAL DIVISION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Union Photo Gallery
            </h1>
            <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
              Historic divisional conferences, Staff Adalat meetings, felicitation ceremonies, philatelic exhibitions, and union rallies across Dhenkanal Division.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3 bg-black/35 p-3 rounded-2xl border border-amber-400/30">
            <div className="w-14 h-14 rounded-full bg-white p-1 shadow-md ring-2 ring-amber-400 overflow-hidden flex items-center justify-center">
              <img src={PRIMARY_BRAND_LOGO} alt="NFPE Crest" className="w-full h-full object-contain rounded-full" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">GALLERY ARCHIVE</div>
              <div className="text-sm font-black text-white">{gallery.length} Event Photos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event photos by title, category, or date..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
            Showing {filteredGallery.length} of {gallery.length} photos
          </div>
        </div>

        {galleryCategories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {galleryCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setGalleryCat(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  galleryCat === cat
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Events' : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Full-Page Photos Grid */}
      {filteredGallery.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGallery.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:border-purple-400 transition-all cursor-pointer flex flex-col"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    {photo.category} · {photo.date}
                  </div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white mt-1 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {photo.title}
                  </h3>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
                  <span>Click to enlarge photo</span>
                  <span>View Full →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-slate-500">
          No photos found matching your criteria.
        </div>
      )}

      {/* Lightbox Modal for Enlarged Photo */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
              <div>
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  {selectedPhoto.category} · {selectedPhoto.date}
                </div>
                <h3 className="font-bold text-base sm:text-lg mt-0.5">{selectedPhoto.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 bg-black flex items-center justify-center max-h-[75vh]">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ================= 3. FULL-PAGE MY APPS & ONLINE PORTALS VIEW =================

export const MyAppsPage: React.FC = () => {
  const [myApps, setMyApps] = useState<CustomPortalApp[]>([]);
  const [appSearch, setAppSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [runningApp, setRunningApp] = useState<CustomPortalApp | null>(null);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    const loadApps = () => setMyApps(getStoredMyApps());
    loadApps();
    window.addEventListener('storage', loadApps);
    return () => window.removeEventListener('storage', loadApps);
  }, []);

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(myApps.map((a) => a.category).filter(Boolean)))],
    [myApps]
  );

  const filteredApps = useMemo(() => {
    const q = appSearch.toLowerCase().trim();
    return myApps.filter((a) => {
      const matchesCat = selectedCategory === 'all' || a.category === selectedCategory;
      const matchesSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [myApps, appSearch, selectedCategory]);

  // If an interactive HTML tool is launched, show it in clean full-page view
  if (runningApp) {
    return (
      <div className="w-full space-y-4 pb-12 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setRunningApp(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-red-600" />
              <span>← Back to All Apps</span>
            </button>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {runningApp.name}
              </h2>
              <p className="text-[11px] text-slate-500">{runningApp.category}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIframeKey((k) => k + 1)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload Tool</span>
            </button>
            {runningApp.codeSnippet && (
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([runningApp.codeSnippet || ''], { type: 'text/html' });
                  const blobUrl = URL.createObjectURL(blob);
                  window.open(blobUrl, '_blank');
                }}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in New Tab</span>
              </button>
            )}
          </div>
        </div>

        <div className="w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white shadow-lg min-h-[750px]">
          {runningApp.codeSnippet ? (
            <iframe
              key={iframeKey}
              title={runningApp.name}
              sandbox="allow-scripts allow-forms allow-modals"
              srcDoc={runningApp.codeSnippet}
              className="w-full h-[800px] border-0 bg-[#f1f3f6]"
            />
          ) : (
            <div className="p-12 text-center">
              <a
                href={runningApp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-sm inline-flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open External Portal</span>
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-14 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#022A61] via-[#0369A1] to-[#0D9488] text-white p-6 sm:p-8 shadow-xl border-2 border-amber-400/50 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
              <Grid className="w-4 h-4" />
              <span>DIGITAL POSTAL UTILITIES & WEB PORTALS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              My Apps & Online Portals
            </h1>
            <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
              Interactive postal calculators, ACG-17 receipt generator, SAP ERP, CEPT, Finacle CBS, PLI, CGHS, and pension utilities in one color-coded workspace.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3 bg-black/35 p-3 rounded-2xl border border-amber-400/30">
            <div className="w-14 h-14 rounded-full bg-white p-1 shadow-md ring-2 ring-amber-400 overflow-hidden flex items-center justify-center">
              <img src={PRIMARY_BRAND_LOGO} alt="NFPE Crest" className="w-full h-full object-contain rounded-full" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">APPLICATIONS</div>
              <div className="text-sm font-black text-white">{myApps.length} Active Tools</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={appSearch}
              onChange={(e) => setAppSearch(e.target.value)}
              placeholder="Search app name, ACG-17, calculator, ERP, CEPT, CBS..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
            Showing {filteredApps.length} of {myApps.length} apps
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Full-Page Apps Grid with Distinct Color Combination for Every Single Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredApps.map((app, idx) => {
          const isCodeApp = app.sourceType === 'code' || !!app.codeSnippet;
          const stableIdx = myApps.findIndex((item) => item.id === app.id);
          const theme = getMyAppCardTheme(stableIdx >= 0 ? stableIdx : idx);
          const AppIcon = getMyAppIcon(app);

          return (
            <div
              key={app.id}
              className={`group relative overflow-hidden p-5 sm:p-6 rounded-3xl border-2 ${theme.cardBg} ${theme.cardBorder} ${theme.cardHoverBorder} shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between min-h-[245px]`}
            >
              {/* Top Gradient Accent Ribbon */}
              <div className={`absolute top-0 left-0 right-0 h-2 ${theme.accentBar}`} />

              {/* Subtle Decorative Corner Glow */}
              <div className={`pointer-events-none absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl ${theme.glowBg}`} />

              <div className="relative z-10 space-y-3.5 pt-1">
                {/* Top Header Row: 3D Icon Badge + Category & Type Pills */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${theme.iconBg}`}>
                      <AppIcon className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-2xs ${theme.categoryBadge}`}>
                        {app.category || 'Utility'}
                      </span>
                      <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="truncate">{isCodeApp ? 'Instant Built-in Tool' : 'Verified Dept Portal'}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-extrabold border shadow-2xs ${theme.typeBadge}`}>
                    {isCodeApp ? (
                      <>
                        <FileCode className="w-3 h-3" />
                        <span>HTML App</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-3 h-3" />
                        <span>Web Portal</span>
                      </>
                    )}
                  </span>
                </div>

                {/* App Title & Description */}
                <div className="space-y-1.5 pt-0.5">
                  <h3 className={`text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug transition-colors ${theme.titleHover}`}>
                    {app.name}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 font-medium">
                    {app.description || 'Official postal utility and service portal for Dhenkanal Division.'}
                  </p>
                </div>

                {/* Compact Info Pill */}
                <div className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center justify-between gap-2 ${theme.metaBg}`}>
                  {isCodeApp ? (
                    <>
                      <span className="truncate font-mono">⚡ Interactive Workspace</span>
                      <span className="text-[10px] font-bold opacity-80 shrink-0">{app.fileSize || 'Ready'}</span>
                    </>
                  ) : (
                    <>
                      <span className="truncate font-mono">{app.url?.replace(/^https?:\/\//, '')}</span>
                      <span className="text-[10px] font-bold opacity-80 shrink-0">Direct Link</span>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom Action Button */}
              <div className="relative z-10 mt-4 pt-3.5 border-t border-black/5 dark:border-white/10">
                {isCodeApp ? (
                  <button
                    type="button"
                    onClick={() => {
                      setRunningApp(app);
                      setIframeKey((k) => k + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${theme.buttonBg}`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Launch Interactive Tool</span>
                  </button>
                ) : (
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${theme.buttonBg}`}
                  >
                    <span>Open Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ================= 4. FULL-PAGE EMPLOYEE SITE & POSTAL RULES VIEW =================

export const EmployeeSitePage: React.FC<{ onNavigateTab?: (tab: ActiveTab) => void }> = ({
  onNavigateTab,
}) => {
  const [resources, setResources] = useState<EmployeeResource[]>([]);
  const [resSearch, setResSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');

  useEffect(() => {
    const loadRes = () => setResources(getStoredEmployeeResources());
    loadRes();
    window.addEventListener('storage', loadRes);
    return () => window.removeEventListener('storage', loadRes);
  }, []);

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(resources.map((r) => r.category).filter(Boolean)))],
    [resources]
  );

  const filteredResources = useMemo(() => {
    const q = resSearch.toLowerCase().trim();
    return resources.filter((r) => {
      const matchesCat = selectedCat === 'all' || r.category === selectedCat;
      const matchesSearch =
        !q || r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [resources, resSearch, selectedCat]);

  return (
    <div className="w-full space-y-6 pb-14 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#9A3412] via-[#C2410C] to-[#B45309] text-white p-6 sm:p-8 shadow-xl border-2 border-amber-300/50 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-200">
              <Briefcase className="w-4 h-4" />
              <span>EMPLOYEE CORNER & STATUTORY MANUALS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Employee Site & Postal Rules
            </h1>
            <p className="text-xs sm:text-sm text-amber-50 font-medium leading-relaxed">
              Complete reference hub for Postal Manual Volumes, CCS (Conduct & CCA) Rules, Pay Matrix tables, seniority lists, and establishment orders.
            </p>
          </div>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('forms')}
              className="px-4 py-2.5 rounded-2xl bg-white text-slate-900 hover:bg-amber-200 font-black text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4 text-red-600" />
              <span>View Downloadable Forms →</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={resSearch}
            onChange={(e) => setResSearch(e.target.value)}
            placeholder="Search Postal Manuals, CCS Rules, Pay Matrix, Seniority..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCat(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCat === cat
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Manuals & Rules' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.map((res) => (
          <a
            key={res.id}
            href={res.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 shadow-sm hover:shadow-lg transition-all flex items-center justify-between gap-4 group"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  {res.category}
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors mt-0.5">
                  {res.title}
                </h3>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <ExternalLink className="w-4 h-4" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

// ================= 5. FULL-PAGE DOWNLOADABLE FORMS VIEW =================

export const FormsPage: React.FC = () => {
  const [forms, setForms] = useState<DownloadableForm[]>([]);
  const [formSearch, setFormSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');

  useEffect(() => {
    const loadForms = () => setForms(getStoredForms());
    loadForms();
    window.addEventListener('storage', loadForms);
    return () => window.removeEventListener('storage', loadForms);
  }, []);

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(forms.map((f) => f.category).filter(Boolean)))],
    [forms]
  );

  const filteredForms = useMemo(() => {
    const q = formSearch.toLowerCase().trim();
    return forms.filter((f) => {
      const matchesCat = selectedCat === 'all' || f.category === selectedCat;
      const matchesSearch =
        !q ||
        f.title.toLowerCase().includes(q) ||
        f.formCode.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [forms, formSearch, selectedCat]);

  return (
    <div className="w-full space-y-6 pb-14 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] via-[#312E81] to-[#7F1D1D] text-white p-6 sm:p-8 shadow-xl border-2 border-amber-400/50 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
              <Download className="w-4 h-4" />
              <span>OFFICIAL DEPARTMENTAL & UNION PROFORMAS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Downloadable Service Forms
            </h1>
            <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
              Download official claim forms, leave applications, LDCE examination proformas, PLI/RPLI revival forms, and union membership forms.
            </p>
          </div>
          <div className="shrink-0 bg-black/35 px-4 py-3 rounded-2xl border border-amber-400/30 text-center">
            <div className="text-[10px] font-bold text-amber-300 uppercase">AVAILABLE PROFORMAS</div>
            <div className="text-lg font-black text-white">{forms.length} Forms</div>
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={formSearch}
            onChange={(e) => setFormSearch(e.target.value)}
            placeholder="Search by form title, form code (e.g. Form-1, CCL), or category..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCat(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCat === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredForms.map((form) => (
          <div
            key={form.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs font-bold">
                <span className="text-indigo-600 dark:text-indigo-400 uppercase">{form.category}</span>
                <span className="font-mono text-slate-500 dark:text-slate-400">{form.formCode}</span>
              </div>
              <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {form.title}
              </h3>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <a
                href={form.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Form PDF</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
