import React, { useState } from 'react';
import {
  Mail,
  Truck,
  Users,
  Shield,
  Award,
  FileText,
  ChevronRight,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import { BlogPost, PlatformStyle } from '../types';
import { UNION_BRANCHES } from '../data/unionInfo';

interface CategoriesTabProps {
  posts: BlogPost[];
  onSelectPost: (post: BlogPost) => void;
  platform: PlatformStyle;
}

const BRANCH_THEMES: Record<
  string,
  { gradient: string; iconBg: string; textAccent: string; badge: string }
> = {
  'group-c': {
    gradient: 'from-blue-600 via-indigo-600 to-blue-800',
    iconBg: 'bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300',
    textAccent: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  'postman-mts': {
    gradient: 'from-amber-600 via-orange-600 to-amber-800',
    iconBg: 'bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300',
    textAccent: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  aigdsu: {
    gradient: 'from-emerald-600 via-teal-600 to-emerald-800',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300',
    textAccent: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  'women-committee': {
    gradient: 'from-rose-600 via-pink-600 to-rose-800',
    iconBg: 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300',
    textAccent: 'text-rose-600 dark:text-rose-400',
    badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  },
  pensioners: {
    gradient: 'from-purple-600 via-violet-600 to-purple-800',
    iconBg: 'bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300',
    textAccent: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  },
  'rti-corner': {
    gradient: 'from-red-600 via-rose-600 to-red-800',
    iconBg: 'bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-300',
    textAccent: 'text-red-600 dark:text-red-400',
    badge: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
  },
};

export const CategoriesTab: React.FC<CategoriesTabProps> = ({
  posts,
  onSelectPost,
  platform,
}) => {
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);

  const getIcon = (name: string) => {
    switch (name) {
      case 'Mail':
        return <Mail className="w-5 h-5" />;
      case 'Truck':
        return <Truck className="w-5 h-5" />;
      case 'Users':
        return <Users className="w-5 h-5" />;
      case 'Shield':
        return <Shield className="w-5 h-5" />;
      case 'Award':
        return <Award className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getBranchPosts = (branchId: string) => {
    return posts.filter((post) => {
      const titleLower = post.title.toLowerCase();
      const catLower = post.categories.join(' ').toLowerCase();

      switch (branchId) {
        case 'group-c':
          return (
            catLower.includes('group - c') ||
            titleLower.includes('bonus') ||
            titleLower.includes('da') ||
            titleLower.includes('cpc') ||
            titleLower.includes('circle')
          );
        case 'postman-mts':
          return (
            catLower.includes('postman') ||
            titleLower.includes('postman') ||
            titleLower.includes('mts') ||
            titleLower.includes('group - d')
          );
        case 'aigdsu':
          return (
            catLower.includes('gds') ||
            titleLower.includes('gds') ||
            titleLower.includes('aigdsu') ||
            post.title.includes('ଗ୍ରାମୀଣ')
          );
        case 'women-committee':
          return (
            titleLower.includes('women') ||
            titleLower.includes('sub committee') ||
            titleLower.includes('female')
          );
        case 'pensioners':
          return (
            titleLower.includes('pension') ||
            titleLower.includes('aiprpa') ||
            titleLower.includes('dr')
          );
        case 'rti-corner':
          return (
            catLower.includes('circular') ||
            titleLower.includes('adalat') ||
            titleLower.includes('order') ||
            titleLower.includes('rti')
          );
        default:
          return true;
      }
    });
  };

  const isIOS = platform === 'ios';

  if (activeBranchId) {
    const branch = UNION_BRANCHES.find((b) => b.id === activeBranchId);
    const theme = BRANCH_THEMES[activeBranchId] || BRANCH_THEMES['group-c'];
    const branchPosts = getBranchPosts(activeBranchId);

    return (
      <div className="space-y-4 pb-12 animate-fade-in">
        {/* Back Button */}
        <button
          onClick={() => setActiveBranchId(null)}
          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Union Wings</span>
        </button>

        {/* Branch Header Card with rich gradient */}
        <div className={`p-5 rounded-3xl bg-gradient-to-r ${theme.gradient} text-white shadow-lg`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-sm">
              {branch && getIcon(branch.iconName)}
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black tracking-tight">{branch?.name}</h2>
              <p className="text-xs text-white/90 font-medium">{branch?.subtitle}</p>
            </div>
          </div>
          <div className="text-xs text-white/90 mt-2 pt-2 border-t border-white/20 font-semibold flex items-center justify-between">
            <span>Archived Notices</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px]">
              {branchPosts.length} Circulars
            </span>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-3">
          {branchPosts.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 font-medium">
              No specific circulars archived for this wing yet. Check the main feed.
            </div>
          ) : (
            branchPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => onSelectPost(post)}
                className={`p-4 bg-white dark:bg-slate-900 border transition-all cursor-pointer active:scale-[0.99] shadow-sm hover:shadow-md ${
                  isIOS
                    ? 'rounded-2xl border-slate-200/80 dark:border-slate-800/80 hover:border-blue-400'
                    : 'rounded-2xl border-slate-200 dark:border-slate-800 hover:border-blue-500'
                }`}
              >
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {post.published
                      ? new Date(post.published).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : ''}
                  </span>
                  {post.driveLinks && post.driveLinks.length > 0 && (
                    <>
                      <span>·</span>
                      <span className="text-red-600 dark:text-red-400 font-bold">PDF Order</span>
                    </>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 mb-1 leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {post.snippet}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      {/* Intro */}
      <div>
        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
          Union Wings & Departments
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Dedicated portals for all postal divisions, cadres, and committees
        </p>
      </div>

      {/* Grid of Branches with vibrant colorful identities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {UNION_BRANCHES.map((branch) => {
          const count = getBranchPosts(branch.id).length;
          const theme = BRANCH_THEMES[branch.id] || BRANCH_THEMES['group-c'];

          return (
            <div
              key={branch.id}
              onClick={() => setActiveBranchId(branch.id)}
              className={`p-4 bg-white dark:bg-slate-900 border transition-all cursor-pointer active:scale-[0.99] hover:shadow-md flex items-start justify-between gap-3 shadow-sm ${
                isIOS
                  ? 'rounded-2xl border-slate-200/80 dark:border-slate-800/80 hover:border-blue-400'
                  : 'rounded-2xl border-slate-200 dark:border-slate-800 hover:border-blue-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${theme.iconBg}`}
                >
                  {getIcon(branch.iconName)}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {branch.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed font-normal">
                    {branch.subtitle}
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${theme.badge}`}
                    >
                      {branch.badge}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {count} Circulars
                    </span>
                  </div>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 self-center shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
