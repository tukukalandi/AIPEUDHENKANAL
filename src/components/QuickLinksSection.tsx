import React from 'react';
import {
  ScrollText,
  FileText,
  Search,
  Landmark,
  ShieldCheck,
  Calculator,
  Fingerprint,
  MapPin,
  Smartphone,
  PiggyBank,
  BookOpen,
  RefreshCw,
  Percent,
  UserCheck,
  Scale,
  ExternalLink,
} from 'lucide-react';

interface QuickLinksSectionProps {
  onNavigateTab?: (tab: any) => void;
}

interface QuickLinkItem {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  cardBorder: string;
  topStripe: string;
  iconBg: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const QuickLinksSection: React.FC<QuickLinksSectionProps> = () => {
  // 15 Important Web Portals as requested
  const quickLinks: QuickLinkItem[] = [
    {
      id: 'circulars',
      title: 'Circulars',
      subtitle: 'QUICK ACCESS',
      url: 'https://circulars.vercel.app/',
      cardBorder: 'border-2 border-rose-200 dark:border-rose-900/70 hover:border-rose-500 hover:shadow-rose-500/25',
      topStripe: 'bg-rose-600',
      iconBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 ring-2 ring-rose-200 dark:ring-rose-800',
      icon: ScrollText,
    },
    {
      id: 'forms',
      title: 'Forms',
      subtitle: 'QUICK ACCESS',
      url: 'https://indiapost-repository.vercel.app/',
      cardBorder: 'border-2 border-indigo-200 dark:border-indigo-900/70 hover:border-indigo-500 hover:shadow-indigo-500/25',
      topStripe: 'bg-indigo-600',
      iconBg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 ring-2 ring-indigo-200 dark:ring-indigo-800',
      icon: FileText,
    },
    {
      id: 'track-consignment',
      title: 'Track Consignment',
      subtitle: 'QUICK ACCESS',
      url: 'https://www.indiapost.gov.in/',
      cardBorder: 'border-2 border-emerald-200 dark:border-emerald-900/70 hover:border-emerald-500 hover:shadow-emerald-500/25',
      topStripe: 'bg-emerald-600',
      iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 ring-2 ring-emerald-200 dark:ring-emerald-800',
      icon: Search,
    },
    {
      id: 'internet-banking',
      title: 'Internet banking',
      subtitle: 'QUICK ACCESS',
      url: 'https://ebanking.indiapost.gov.in/corp/AuthenticationController?FORMSGROUP_ID__=AuthenticationFG&__START_TRAN_FLAG__=Y&__FG_BUTTONS__=LOAD&ACTION.LOAD=Y&AuthenticationFG.LOGIN_FLAG=1&BANK_ID=DOP',
      cardBorder: 'border-2 border-amber-200 dark:border-amber-900/70 hover:border-amber-500 hover:shadow-amber-500/25',
      topStripe: 'bg-amber-500',
      iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 ring-2 ring-amber-200 dark:ring-amber-800',
      icon: Landmark,
    },
    {
      id: 'pli-rpli',
      title: 'PLI/RPLI',
      subtitle: 'QUICK ACCESS',
      url: 'https://pli.indiapost.gov.in/CustomerPortal/Home.action',
      cardBorder: 'border-2 border-sky-200 dark:border-sky-900/70 hover:border-sky-500 hover:shadow-sky-500/25',
      topStripe: 'bg-sky-500',
      iconBg: 'bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 ring-2 ring-sky-200 dark:ring-sky-800',
      icon: ShieldCheck,
    },
    {
      id: 'postage-calculator',
      title: 'Postage Calculator',
      subtitle: 'QUICK ACCESS',
      url: 'https://www.indiapost.gov.in/calculate-postage',
      cardBorder: 'border-2 border-orange-200 dark:border-orange-900/70 hover:border-orange-500 hover:shadow-orange-500/25',
      topStripe: 'bg-orange-500',
      iconBg: 'bg-orange-100 text-orange-700 dark:bg-orange-950/80 dark:text-orange-300 ring-2 ring-orange-200 dark:ring-orange-800',
      icon: Calculator,
    },
    {
      id: 'aadhaar',
      title: 'Aadhaar',
      subtitle: 'QUICK ACCESS',
      url: 'https://uidai.gov.in/en',
      cardBorder: 'border-2 border-purple-200 dark:border-purple-900/70 hover:border-purple-500 hover:shadow-purple-500/25',
      topStripe: 'bg-purple-600',
      iconBg: 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 ring-2 ring-purple-200 dark:ring-purple-800',
      icon: Fingerprint,
    },
    {
      id: 'digipin',
      title: 'Digipin',
      subtitle: 'QUICK ACCESS',
      url: 'https://dac.indiapost.gov.in/mydigipin/home',
      cardBorder: 'border-2 border-pink-200 dark:border-pink-900/70 hover:border-pink-500 hover:shadow-pink-500/25',
      topStripe: 'bg-pink-600',
      iconBg: 'bg-pink-100 text-pink-700 dark:bg-pink-950/80 dark:text-pink-300 ring-2 ring-pink-200 dark:ring-pink-800',
      icon: MapPin,
    },
    {
      id: 'ippb',
      title: 'IPPB',
      subtitle: 'QUICK ACCESS',
      url: 'https://ippbonline.bank.in/en/web/ippb',
      cardBorder: 'border-2 border-cyan-200 dark:border-cyan-900/70 hover:border-cyan-500 hover:shadow-cyan-500/25',
      topStripe: 'bg-cyan-600',
      iconBg: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300 ring-2 ring-cyan-200 dark:ring-cyan-800',
      icon: Smartphone,
    },
    {
      id: 'posb-savings-scheme',
      title: 'Post Office savings Scheme',
      subtitle: 'QUICK ACCESS',
      url: 'https://www.indiapost.gov.in/banking-services/savings',
      cardBorder: 'border-2 border-teal-200 dark:border-teal-900/70 hover:border-teal-500 hover:shadow-teal-500/25',
      topStripe: 'bg-teal-600',
      iconBg: 'bg-teal-100 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300 ring-2 ring-teal-200 dark:ring-teal-800',
      icon: PiggyBank,
    },
    {
      id: 'finacle-assistant',
      title: 'Finacle Assistant',
      subtitle: 'QUICK ACCESS',
      url: 'https://finacle-user-guide.vercel.app/',
      cardBorder: 'border-2 border-violet-200 dark:border-violet-900/70 hover:border-violet-500 hover:shadow-violet-500/25',
      topStripe: 'bg-violet-600',
      iconBg: 'bg-violet-100 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300 ring-2 ring-violet-200 dark:ring-violet-800',
      icon: BookOpen,
    },
    {
      id: 'file-convertor',
      title: 'File Convertor',
      subtitle: 'QUICK ACCESS',
      url: 'https://multi-receipt.vercel.app/',
      cardBorder: 'border-2 border-fuchsia-200 dark:border-fuchsia-900/70 hover:border-fuchsia-500 hover:shadow-fuchsia-500/25',
      topStripe: 'bg-fuchsia-600',
      iconBg: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/80 dark:text-fuchsia-300 ring-2 ring-fuchsia-200 dark:ring-fuchsia-800',
      icon: RefreshCw,
    },
    {
      id: 'interest-rates',
      title: 'Interest Rates',
      subtitle: 'QUICK ACCESS',
      url: 'https://interest-rates-nine.vercel.app/',
      cardBorder: 'border-2 border-yellow-200 dark:border-yellow-900/70 hover:border-yellow-500 hover:shadow-yellow-500/25',
      topStripe: 'bg-yellow-500',
      iconBg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/80 dark:text-yellow-300 ring-2 ring-yellow-200 dark:ring-yellow-800',
      icon: Percent,
    },
    {
      id: 'customer-login',
      title: 'Customer Login',
      subtitle: 'QUICK ACCESS',
      url: 'https://app.indiapost.gov.in/customer-selfservice/login',
      cardBorder: 'border-2 border-blue-200 dark:border-blue-900/70 hover:border-blue-500 hover:shadow-blue-500/25',
      topStripe: 'bg-blue-600',
      iconBg: 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 ring-2 ring-blue-200 dark:ring-blue-800',
      icon: UserCheck,
    },
    {
      id: 'tariff-calculator',
      title: 'Tariff Calculator',
      subtitle: 'QUICK ACCESS',
      url: 'https://tariff-calculator-nu.vercel.app/',
      cardBorder: 'border-2 border-red-200 dark:border-red-900/70 hover:border-red-500 hover:shadow-red-500/25',
      topStripe: 'bg-red-600',
      iconBg: 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 ring-2 ring-red-200 dark:ring-red-800',
      icon: Scale,
    },
  ];

  return (
    <section className="w-full space-y-6 pt-4" id="quick-links">
      {/* Header: Title, Subtitle & Decorative Amber Bar */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0B2545] dark:text-white tracking-tight">
          Quick links section
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-semibold tracking-wide">
          Important Web Portals & Online Postal Services
        </p>
        <div className="w-20 h-1.5 bg-amber-400 rounded-full mx-auto shadow-sm" />
      </div>

      {/* 15 Card Tiles Grid with Distinct Colorful Borders & Smooth Hover */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4 md:gap-5">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 ${item.cardBorder} shadow-[0_4px_20px_-4px_rgba(0,0,0,0.07)] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 flex flex-col items-center justify-between text-center group cursor-pointer w-full relative overflow-hidden`}
              title={`Open ${item.title} (${item.url})`}
            >
              {/* Top Accent Stripe */}
              <div
                className={`w-12 h-1.5 ${item.topStripe} rounded-full mb-3 group-hover:w-20 transition-all duration-300`}
              />

              {/* External Link subtle indicator in top-right */}
              <div className="absolute top-3 right-3 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
              </div>

              {/* Icon Container with Colorful Pill */}
              <div
                className={`w-13 h-13 sm:w-15 sm:h-15 rounded-2xl ${item.iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200 shadow-sm`}
              >
                <Icon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
              </div>

              {/* Title with Clear, Legible Font */}
              <h3 className="text-xs sm:text-sm md:text-base font-black text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 min-h-[2.4rem] flex items-center justify-center leading-snug">
                {item.title}
              </h3>

              {/* Subtitle Badge */}
              <span className="text-[10px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400 mt-2 block">
                {item.subtitle}
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
};
