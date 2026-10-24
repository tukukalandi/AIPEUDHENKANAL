import React from 'react';
import {
  Search,
  Building,
  ShieldCheck,
  Package,
  Fingerprint,
  Smartphone,
  MapPin,
  Calculator,
  Info,
  BookOpen,
  FileDown,
  Hammer,
  Briefcase,
  Bell,
  Image as ImageIcon,
  FileQuestion,
  AlertCircle,
  Users,
  HelpCircle,
  Phone,
  Calendar,
  Lock,
  Mail,
  Send,
  ExternalLink,
  Settings as SettingsIcon,
} from 'lucide-react';
import { UNION_CONTACT_INFO } from '../data/unionInfo';
import { UNION_LOGOS, PRIMARY_BRAND_LOGO } from '../data/logos';

interface FooterProps {
  onOpenAdmin: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onNavigateSection }) => {
  return (
    <footer className="w-full bg-[#2C0707] text-white border-t border-[#4E1212] pt-12 pb-16 px-4 sm:px-6 lg:px-12 mt-12 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 xl:gap-12">
        {/* Brand & Contact Column (Takes 2 cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            {/* Official NFPE federation crest emblem */}
            <div className="w-14 h-14 rounded-2xl bg-white p-1 flex items-center justify-center shadow-lg ring-2 ring-amber-400 shrink-0 overflow-hidden">
              <img
                src={PRIMARY_BRAND_LOGO}
                alt="NFPE AIPEU Logo"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5 leading-none">
                <span>डाक संघ</span>
                <span className="text-amber-400">·</span>
                <span className="text-amber-400">NFPE · AIPEU</span>
              </div>
              <p className="text-[11px] font-bold text-amber-200 mt-1 uppercase tracking-wider">
                NFPE AIPEU Unions AIGDSU AIPRPA AIPCPCCWF - Dhenkanal Division
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-md">
            A Federal Attempt to Ensure Service Security of All the Employees with Mutual Benefit for All the Staffs and Members. Dhenkanal Division, Odisha Circle.
          </p>

          <div className="space-y-2 pt-1 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <a
                href="mailto:aipeup3dhenkanaldivn@gmail.com"
                className="hover:text-amber-300 transition-colors truncate font-medium"
              >
                aipeup3dhenkanaldivn@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <a href="tel:9861184651" className="hover:text-amber-300 transition-colors font-mono font-bold">
                Mob - 9861184651
              </a>
            </div>
          </div>

          {/* Social Icons row */}
          <div className="flex items-center flex-wrap gap-2.5 pt-2">
            <a
              href={UNION_CONTACT_INFO.whatsappGroup}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 px-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1.5 text-white transition-all shadow-sm text-xs font-bold"
              title="Join WhatsApp Group"
            >
              <span>WhatsApp Group</span>
            </a>
            <a
              href={UNION_CONTACT_INFO.facebookPage}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white transition-colors shadow-sm"
              title="Official Facebook Page"
            >
              <span className="text-xs font-black">f</span>
            </a>
            <a
              href={UNION_CONTACT_INFO.facebookGroup}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white transition-colors shadow-sm"
              title="Facebook Members Group"
            >
              <Users className="w-4 h-4" />
            </a>
            <a
              href={UNION_CONTACT_INFO.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-slate-900 hover:bg-black border border-white/20 flex items-center justify-center text-white transition-colors"
              title="Twitter / X (@aipeup3dkl)"
            >
              <span className="text-xs font-bold font-mono">X</span>
            </a>
            <a
              href={UNION_CONTACT_INFO.telegramChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-sky-500 hover:bg-sky-400 flex items-center justify-center text-white transition-colors shadow-sm"
              title="Telegram Channel"
            >
              <Send className="w-3.5 h-3.5" />
            </a>
            <a
              href={`mailto:${UNION_CONTACT_INFO.email}`}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              title="Email Us"
            >
              <Mail className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Column 1: SERVICES (Matching attached image) */}
        <div className="space-y-3">
          <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-400">
            SERVICES
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            <li>
              <a
                href="https://www.indiapost.gov.in/_layouts/15/dpt.ptc.trackandtrace/tracking.aspx"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-amber-300 transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Track & Trace</span>
              </a>
            </li>
            <li>
              <a
                href="https://www.ippbonline.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-amber-300 transition-colors"
              >
                <Building className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Banking & Savings</span>
              </a>
            </li>
            <li>
              <a
                href="https://postallifeinsurance.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-amber-300 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Insurance (PLI/RPLI)</span>
              </a>
            </li>
            <li>
              <a
                href="https://www.indiapost.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-amber-300 transition-colors"
              >
                <Package className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Speed Post / Parcels</span>
              </a>
            </li>
            <li>
              <a
                href="https://uidai.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-amber-300 transition-colors"
              >
                <Fingerprint className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Aadhaar Services</span>
              </a>
            </li>
            <li>
              <a
                href="https://postallifeinsurance.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-amber-300 transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>PLI Online</span>
              </a>
            </li>
            <li>
              <a
                href="https://www.indiapost.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-amber-300 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Know Your DIGIPIN</span>
              </a>
            </li>
            <li>
              <a
                href="https://www.indiapost.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-amber-300 transition-colors"
              >
                <Calculator className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Postage Calculator</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Column 2: INFORMATION (Matching attached image) */}
        <div className="space-y-3">
          <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-400">
            INFORMATION
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            <li>
              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateSection && onNavigateSection('directory');
                }}
                className="flex items-center gap-2 hover:text-amber-300 transition-colors"
              >
                <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>About Division</span>
              </a>
            </li>
            <li>
              <a
                href="#directory"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateSection && onNavigateSection('directory');
                }}
                className="flex items-center gap-2 hover:text-amber-300 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Post Office Directory</span>
              </a>
            </li>
            <li>
              <a
                href="#forms"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateSection && onNavigateSection('directory');
                }}
                className="flex items-center gap-2 hover:text-amber-300 transition-colors"
              >
                <FileDown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Forms & Downloads</span>
              </a>
            </li>
            <li>
              <a
                href="https://aipeup3dkl.blogspot.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-amber-300 transition-colors"
              >
                <Hammer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Tenders</span>
              </a>
            </li>
            <li>
              <a
                href="https://aipeup3dkl.blogspot.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-amber-300 transition-colors"
              >
                <Briefcase className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Vacancies & 8th CPC</span>
              </a>
            </li>
            <li>
              <a
                href="#feed"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateSection && onNavigateSection('feed');
                }}
                className="flex items-center gap-2 hover:text-amber-300 transition-colors"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>News & Updates</span>
              </a>
            </li>
            <li>
              <a
                href="https://aipeup3dkl.blogspot.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-amber-300 transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Photo Gallery</span>
              </a>
            </li>
            <li>
              <a
                href="#rti"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateSection && onNavigateSection('categories');
                }}
                className="flex items-center gap-2 hover:text-amber-300 transition-colors"
              >
                <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>RTI Corner</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: GRIEVANCE & HELP (Matching attached image + Admin Panel link) */}
        <div className="space-y-3">
          <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-400">
            GRIEVANCE & HELP
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            <li>
              <a
                href="https://www.indiapost.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-amber-300 transition-colors"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>File Complaint / Adalat</span>
              </a>
            </li>
            <li>
              <a
                href="https://www.indiapost.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-amber-300 transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Corporate Complaints</span>
              </a>
            </li>
            <li>
              <a
                href="#faq"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateSection && onNavigateSection('directory');
                }}
                className="flex items-center gap-2 hover:text-amber-300 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>FAQs & Rules</span>
              </a>
            </li>
            <li>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateSection && onNavigateSection('directory');
                }}
                className="flex items-center gap-2 hover:text-amber-300 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Contact Us</span>
              </a>
            </li>
            <li>
              <a
                href="https://aipeup3dkl.blogspot.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-amber-300 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Holiday List 2026</span>
              </a>
            </li>
            <li>
              <button
                onClick={() => onNavigateSection && onNavigateSection('settings')}
                className="flex items-center gap-2 hover:text-amber-300 transition-colors text-xs text-slate-300 cursor-pointer"
              >
                <SettingsIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Settings & Preferences</span>
              </button>
            </li>
            {/* Admin Panel & Settings buttons row */}
            <li className="pt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                title="Open Union Admin Panel"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </button>

              <button
                onClick={() => onNavigateSection && onNavigateSection('settings')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/90 text-amber-300 hover:text-white border border-amber-400/40 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                title="Open Application Settings"
              >
                <SettingsIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Settings</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Constituent Unions Logo Gallery Strip */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10">
        <div className="text-center mb-6">
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 bg-black/40 px-3.5 py-1 rounded-full border border-amber-400/30">
            CONSTITUENT UNIONS & ASSOCIATIONS · DHENKANAL DIVISION
          </span>
          <p className="text-xs text-slate-300 mt-2">
            NFPE & AIPEU Unions · AIGDSU · AIPRPA · AIPCPCCWF
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 items-center">
          {UNION_LOGOS.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center text-center p-3 rounded-2xl bg-black/30 hover:bg-black/50 border border-amber-400/20 hover:border-amber-400/60 transition-all group"
              title={`${item.name} - ${item.cadre}`}
            >
              <div className="w-12 h-12 rounded-full bg-white p-0.5 shadow-md ring-2 ring-amber-400/70 group-hover:ring-amber-300 group-hover:scale-105 transition-all overflow-hidden flex items-center justify-center mb-2">
                <img
                  src={item.imagePath}
                  alt={item.name}
                  className="w-full h-full object-contain rounded-full"
                  loading="lazy"
                />
              </div>
              <span className="text-[10px] font-bold text-amber-200 leading-tight line-clamp-2">
                {item.shortName}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Copyright & Official Affiliation Bar (Visitor counter removed) */}
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/10 flex flex-col gap-3 text-xs text-slate-300">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <p>© 2026 NFPE AIPEU Unions AIGDSU AIPRPA AIPCPCCWF - Dhenkanal Division. All Rights Reserved.</p>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md bg-amber-400/20 text-amber-300 text-[11px] font-semibold border border-amber-400/30">
              🇮🇳 Department of Posts · Odisha Circle
            </span>
            <span>·</span>
            <button
              onClick={() => onNavigateSection && onNavigateSection('settings')}
              className="hover:text-amber-300 transition-colors flex items-center gap-1 font-bold text-amber-200 cursor-pointer"
              title="Open App Settings"
            >
              <SettingsIcon className="w-3 h-3 text-amber-400" />
              <span>Settings</span>
            </button>
            <span>·</span>
            <a
              href="https://aipeup3dkl.blogspot.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-300 transition-colors flex items-center gap-1 font-bold text-amber-200"
            >
              <span>Original Blogspot Site</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Affiliation Callout */}
        <div className="p-3.5 rounded-2xl bg-black/50 border border-amber-400/30 text-center md:text-left text-[11px] text-amber-200">
          <strong className="text-amber-400 uppercase tracking-wider font-black">Affiliated to: </strong>
          <span>National JCM - Staff Side, Confederation of Central Government Employees and Workers, National Federation of Postal Employees - CHQ - New Delhi</span>
        </div>
      </div>
    </footer>
  );
};
