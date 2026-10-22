import React, { useState, useEffect } from 'react';
import {
  Users,
  Phone,
  MapPin,
  FileText,
  ExternalLink,
  MessageCircle,
  Send,
  Mail,
  Shield,
  Download,
  CheckCircle,
} from 'lucide-react';
import { PlatformStyle, OfficeBearer } from '../types';
import {
  OFFICE_BEARERS,
  UNION_CONTACT_INFO,
  IMPORTANT_DOCUMENTS,
} from '../data/unionInfo';
import { getExecutiveMembersFromFirestore } from '../services/firebase';

interface DirectoryTabProps {
  platform: PlatformStyle;
}

export const DirectoryTab: React.FC<DirectoryTabProps> = ({ platform }) => {
  const [activeSection, setActiveSection] = useState<'bearers' | 'documents' | 'contact'>(
    'bearers'
  );
  const [bearers, setBearers] = useState<OfficeBearer[]>(OFFICE_BEARERS);

  useEffect(() => {
    getExecutiveMembersFromFirestore()
      .then((data) => {
        if (data && data.length > 0) setBearers(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const isIOS = platform === 'ios';

  return (
    <div className="space-y-4 pb-12 animate-fade-in">
      {/* Tab Header */}
      <div>
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
          Union Directory & Documents
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Executive body, statutory filings, and grievance formats
        </p>
      </div>

      {/* Segmented Control Bar */}
      <div className="flex p-1 bg-slate-200/70 dark:bg-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveSection('bearers')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeSection === 'bearers'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Office Bearers
        </button>
        <button
          onClick={() => setActiveSection('documents')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeSection === 'documents'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Documents & Rulings
        </button>
        <button
          onClick={() => setActiveSection('contact')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeSection === 'contact'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Headquarters
        </button>
      </div>

      {/* Section 1: Office Bearers */}
      {activeSection === 'bearers' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-blue-500/10 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between flex-wrap gap-2">
            <div>
              <strong className="text-red-700 dark:text-red-400 font-extrabold">Dhenkanal Division Executive Leadership:</strong> Serving all Postal Assistants, Sorting Assistants, Postmen, MTS, and GDS staff across Dhenkanal & Angul postal division.
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-600 text-white shadow-sm">
              {bearers.length} Office Bearers
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {bearers.map((bearer, idx) => {
              const branchLower = (bearer.branch || '').toLowerCase();
              const desigLower = (bearer.designation || '').toLowerCase();
              const roleType = bearer.roleType;

              // Distinct vibrant theme based on leadership role & division wing
              let theme = {
                cardBorder: 'border-2 border-blue-300 dark:border-blue-600/60 hover:border-blue-500',
                cardShadow: 'shadow-md shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/15',
                topAccent: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500',
                badgeBg: 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white',
                ringBorder: 'ring-4 ring-blue-400/30 border-2 border-blue-600',
                avatarFallback: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800',
                callBtn: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 shadow-blue-500/30',
                cardBg: 'bg-white dark:bg-slate-900',
                tagBg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60',
                iconColor: 'text-blue-600 dark:text-blue-400',
                crownColor: 'text-blue-500',
              };

              if (desigLower.includes('president') || roleType === 'president') {
                theme = {
                  cardBorder: 'border-2 border-amber-400 dark:border-amber-500/70 hover:border-amber-500',
                  cardShadow: 'shadow-md shadow-amber-500/10 hover:shadow-xl hover:shadow-amber-500/25',
                  topAccent: 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600',
                  badgeBg: 'bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white',
                  ringBorder: 'ring-4 ring-amber-400/40 border-2 border-amber-600',
                  avatarFallback: 'bg-gradient-to-br from-amber-500 via-orange-600 to-red-700',
                  callBtn: 'bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-700 hover:to-red-700 shadow-amber-500/30',
                  cardBg: 'bg-white dark:bg-slate-900',
                  tagBg: 'bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60',
                  iconColor: 'text-amber-600 dark:text-amber-400',
                  crownColor: 'text-amber-500',
                };
              } else if (branchLower.includes('women') || desigLower.includes('women')) {
                theme = {
                  cardBorder: 'border-2 border-pink-400 dark:border-pink-500/70 hover:border-pink-500',
                  cardShadow: 'shadow-md shadow-pink-500/10 hover:shadow-xl hover:shadow-pink-500/25',
                  topAccent: 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600',
                  badgeBg: 'bg-gradient-to-r from-pink-600 to-rose-600 text-white',
                  ringBorder: 'ring-4 ring-pink-400/40 border-2 border-pink-600',
                  avatarFallback: 'bg-gradient-to-br from-pink-500 via-rose-600 to-fuchsia-700',
                  callBtn: 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 shadow-pink-500/30',
                  cardBg: 'bg-white dark:bg-slate-900',
                  tagBg: 'bg-pink-50 text-pink-800 dark:bg-pink-950/70 dark:text-pink-300 border border-pink-200 dark:border-pink-900/60',
                  iconColor: 'text-pink-600 dark:text-pink-400',
                  crownColor: 'text-pink-500',
                };
              } else if (desigLower.includes('financial') || desigLower.includes('treasurer') || roleType === 'treasurer') {
                theme = {
                  cardBorder: 'border-2 border-emerald-400 dark:border-emerald-500/70 hover:border-emerald-500',
                  cardShadow: 'shadow-md shadow-emerald-500/10 hover:shadow-xl hover:shadow-emerald-500/25',
                  topAccent: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600',
                  badgeBg: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white',
                  ringBorder: 'ring-4 ring-emerald-400/40 border-2 border-emerald-600',
                  avatarFallback: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800',
                  callBtn: 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-emerald-500/30',
                  cardBg: 'bg-white dark:bg-slate-900',
                  tagBg: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60',
                  iconColor: 'text-emerald-600 dark:text-emerald-400',
                  crownColor: 'text-emerald-500',
                };
              } else if (branchLower.includes('postmen') || branchLower.includes('mts')) {
                theme = {
                  cardBorder: 'border-2 border-purple-400 dark:border-purple-500/70 hover:border-purple-500',
                  cardShadow: 'shadow-md shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/25',
                  topAccent: 'bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-600',
                  badgeBg: 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white',
                  ringBorder: 'ring-4 ring-purple-400/40 border-2 border-purple-600',
                  avatarFallback: 'bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800',
                  callBtn: 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 shadow-purple-500/30',
                  cardBg: 'bg-white dark:bg-slate-900',
                  tagBg: 'bg-purple-50 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60',
                  iconColor: 'text-purple-600 dark:text-purple-400',
                  crownColor: 'text-purple-500',
                };
              } else if (branchLower.includes('aigdsu') || branchLower.includes('gds')) {
                theme = {
                  cardBorder: 'border-2 border-orange-400 dark:border-orange-500/70 hover:border-orange-500',
                  cardShadow: 'shadow-md shadow-orange-500/10 hover:shadow-xl hover:shadow-orange-500/25',
                  topAccent: 'bg-gradient-to-r from-orange-500 via-amber-500 to-red-600',
                  badgeBg: 'bg-gradient-to-r from-orange-600 to-amber-700 text-white',
                  ringBorder: 'ring-4 ring-orange-400/40 border-2 border-orange-600',
                  avatarFallback: 'bg-gradient-to-br from-orange-600 via-amber-600 to-red-700',
                  callBtn: 'bg-gradient-to-r from-orange-600 to-amber-700 hover:from-orange-700 hover:to-amber-800 shadow-orange-500/30',
                  cardBg: 'bg-white dark:bg-slate-900',
                  tagBg: 'bg-orange-50 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 border border-orange-200 dark:border-orange-900/60',
                  iconColor: 'text-orange-600 dark:text-orange-400',
                  crownColor: 'text-orange-500',
                };
              } else if (desigLower.includes('assistant divisional') || desigLower.includes('assistant')) {
                theme = {
                  cardBorder: 'border-2 border-teal-400 dark:border-teal-500/70 hover:border-teal-500',
                  cardShadow: 'shadow-md shadow-teal-500/10 hover:shadow-xl hover:shadow-teal-500/25',
                  topAccent: 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600',
                  badgeBg: 'bg-gradient-to-r from-teal-600 to-cyan-700 text-white',
                  ringBorder: 'ring-4 ring-teal-400/40 border-2 border-teal-600',
                  avatarFallback: 'bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700',
                  callBtn: 'bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 shadow-teal-500/30',
                  cardBg: 'bg-white dark:bg-slate-900',
                  tagBg: 'bg-teal-50 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300 border border-teal-200 dark:border-teal-900/60',
                  iconColor: 'text-teal-600 dark:text-teal-400',
                  crownColor: 'text-teal-500',
                };
              } else if (branchLower.includes('odisha circle') || desigLower.includes('circle')) {
                theme = {
                  cardBorder: 'border-2 border-violet-400 dark:border-violet-500/70 hover:border-violet-500',
                  cardShadow: 'shadow-md shadow-violet-500/10 hover:shadow-xl hover:shadow-violet-500/25',
                  topAccent: 'bg-gradient-to-r from-violet-500 via-purple-600 to-indigo-700',
                  badgeBg: 'bg-gradient-to-r from-violet-600 to-purple-800 text-white',
                  ringBorder: 'ring-4 ring-violet-400/40 border-2 border-violet-600',
                  avatarFallback: 'bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-800',
                  callBtn: 'bg-gradient-to-r from-violet-600 to-purple-800 hover:from-violet-700 hover:to-purple-900 shadow-violet-500/30',
                  cardBg: 'bg-white dark:bg-slate-900',
                  tagBg: 'bg-violet-50 text-violet-800 dark:bg-violet-950/70 dark:text-violet-300 border border-violet-200 dark:border-violet-900/60',
                  iconColor: 'text-violet-600 dark:text-violet-400',
                  crownColor: 'text-violet-500',
                };
              }

              // Extract initials for fallback
              const cleanName = bearer.name.replace(/^(Com\.|Shri|Sri|Smt\.)\s*/i, '').trim();
              const nameParts = cleanName.split(' ').filter(Boolean);
              const initials = nameParts.length >= 2 
                ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
                : cleanName.slice(0, 2).toUpperCase();

              return (
                <div
                  key={bearer.id || idx}
                  className={`overflow-hidden transition-all duration-300 flex flex-col justify-between rounded-3xl ${theme.cardBorder} ${theme.cardBg} ${theme.cardShadow} hover:-translate-y-1`}
                >
                  {/* Colorful Top Accent Stripe */}
                  <div className={`h-2.5 w-full ${theme.topAccent}`} />

                  <div className="p-4 sm:p-5 flex-1 flex flex-col">
                    {/* Header Wing & Location */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${theme.badgeBg} shadow-xs`}>
                        {bearer.branch.replace(/,.*$/, '')}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        <MapPin className="w-2.5 h-2.5 text-red-500 shrink-0" />
                        <span className="truncate max-w-[110px]">{bearer.location}</span>
                      </span>
                    </div>

                    {/* Member Portrait Photo & Identity */}
                    <div className="flex items-center gap-3.5 mb-3.5">
                      <div className="relative shrink-0">
                        {bearer.photoUrl ? (
                          <img
                            src={bearer.photoUrl}
                            alt={bearer.name}
                            className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover shadow-md ${theme.ringBorder}`}
                            onError={(e) => {
                              // Fallback to avatar if image fails to load
                              const target = e.target as HTMLElement;
                              target.style.display = 'none';
                              const next = target.nextElementSibling as HTMLElement;
                              if (next) next.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          style={{ display: bearer.photoUrl ? 'none' : 'flex' }}
                          className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl ${theme.avatarFallback} text-white flex-col items-center justify-center font-black shadow-md ${theme.ringBorder}`}
                        >
                          <span className="text-lg font-black tracking-wider leading-none">
                            {initials}
                          </span>
                          <span className="text-[9px] opacity-90 uppercase tracking-widest mt-1">
                            AIPEU
                          </span>
                        </div>
                        {/* Verified Union Seal */}
                        <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white dark:bg-slate-900 shadow">
                          <CheckCircle className={`w-4 h-4 ${theme.iconColor}`} />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-2">
                          {bearer.name}
                        </h3>
                        <div className="mt-1">
                          <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-lg ${theme.tagBg}`}>
                            {bearer.designation}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Full Branch Name Tag */}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-2 font-medium">
                      🏛️ {bearer.branch}
                    </p>
                  </div>

                  {/* Phone & Call CTA */}
                  <div className="px-4 py-3 sm:px-5 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    {bearer.phone ? (
                      <>
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            Phone / Contact
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate block">
                            {bearer.phone}
                          </span>
                        </div>
                        <a
                          href={`tel:${bearer.phone.replace(/[^0-9+]/g, '')}`}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-xs font-black shadow-md active:scale-95 transition-all ${theme.callBtn}`}
                          title={`Call ${bearer.name}`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </a>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Official Division Line</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 2: Important Documents & Rulings */}
      {activeSection === 'documents' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300">
            Official trade union rulings, Form 'B' register entries, and grievance representation templates.
          </div>

          <div className="space-y-2.5">
            {IMPORTANT_DOCUMENTS.map((doc, idx) => (
              <a
                key={idx}
                href={doc.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-4 bg-white dark:bg-slate-900 border flex items-center justify-between gap-3 transition-all hover:border-blue-400 dark:hover:border-blue-600 active:scale-[0.99] ${
                  isIOS
                    ? 'rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-sm'
                    : 'rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      {doc.type}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {doc.desc}
                    </p>
                  </div>
                </div>

                <div className="min-h-[38px] min-w-[38px] rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Headquarters & Contact */}
      {activeSection === 'contact' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                Official Division Office
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {UNION_CONTACT_INFO.organization}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {UNION_CONTACT_INFO.division}
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{UNION_CONTACT_INFO.headquarters}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href={`mailto:${UNION_CONTACT_INFO.email}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {UNION_CONTACT_INFO.email}
                </a>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
                Join Postal Union Groups
              </span>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={UNION_CONTACT_INFO.whatsappGroup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Group</span>
                </a>

                <a
                  href={UNION_CONTACT_INFO.telegramChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Telegram Channel</span>
                </a>
              </div>
            </div>
          </div>

          {/* Union Subscription Information (from the blog's side banner) */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs space-y-1.5">
            <h4 className="font-bold text-amber-900 dark:text-amber-200">
              Union Subscription & Check-Off
            </h4>
            <p className="text-amber-800 dark:text-amber-300">
              As per Directorate guidelines, membership subscription is deducted through monthly salary roll. Members can contact the Financial Secretary for receipt and check-off verification.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
