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
} from 'lucide-react';
import { UNION_CONTACT_INFO } from '../data/unionInfo';

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
            {/* White rounded card with postal envelope icon matching attached image */}
            <div className="w-13 h-13 rounded-2xl bg-white p-2 flex items-center justify-center shadow-lg border border-amber-300/30 shrink-0">
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white text-xl font-bold">
                📮
              </div>
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5 leading-none">
                <span>डाक संघ</span>
                <span className="text-amber-400">·</span>
                <span className="text-amber-400">AIPEU DKL</span>
              </div>
              <p className="text-[11px] font-bold text-amber-200 mt-1 uppercase tracking-wider">
                All India Postal Employees Union
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
                href={`mailto:${UNION_CONTACT_INFO.email}`}
                className="hover:text-amber-300 transition-colors truncate"
              >
                {UNION_CONTACT_INFO.email}
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <a href="tel:+919437071492" className="hover:text-amber-300 transition-colors">
                +91 94370 71492 / +91 94372 45812
              </a>
            </div>
          </div>

          {/* Social Icons row */}
          <div className="flex items-center gap-3 pt-2">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              title="Twitter"
            >
              <span className="text-xs font-bold font-mono">X</span>
            </a>
            <a
              href={UNION_CONTACT_INFO.whatsappGroup}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center text-white transition-colors shadow-sm"
              title="WhatsApp"
            >
              <span className="text-xs font-bold">WA</span>
            </a>
            <a
              href={UNION_CONTACT_INFO.telegramChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-sky-500 hover:bg-sky-600 flex items-center justify-center text-white transition-colors shadow-sm"
              title="Telegram"
            >
              <Send className="w-3.5 h-3.5" />
            </a>
            <a
              href={`mailto:${UNION_CONTACT_INFO.email}`}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              title="Email"
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
            {/* Admin Panel button matching image row */}
            <li className="pt-2">
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <p>© 2026 AIPEU Group C, Postman, MTS & AIGDSU Dhenkanal Division. All Rights Reserved.</p>
        <p className="flex items-center gap-3">
          <span>Affiliated to NFPE & AIGDSU</span>
          <span>·</span>
          <a
            href="https://aipeup3dkl.blogspot.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-300 transition-colors flex items-center gap-1"
          >
            <span>Original Blogspot Site</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </p>
      </div>
    </footer>
  );
};
