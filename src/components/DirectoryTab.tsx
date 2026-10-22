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
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200">
            <strong>Dhenkanal Division Executive Body:</strong> Serving all Postal Assistants, Sorting Assistants, Postmen, MTS, and GDS staff across Dhenkanal & Angul postal circle.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {bearers.map((bearer, idx) => (
              <div
                key={idx}
                className={`p-4 bg-white dark:bg-slate-900 border flex flex-col justify-between ${
                  isIOS
                    ? 'rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-sm'
                    : 'rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      {bearer.branch}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5" />
                      {bearer.location}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {bearer.name}
                  </h3>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                    {bearer.designation}
                  </p>
                </div>

                {bearer.phone && (
                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                      {bearer.phone}
                    </span>
                    <a
                      href={`tel:${bearer.phone.replace(/\s+/g, '')}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold active:scale-95 transition-all shadow-sm"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
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
