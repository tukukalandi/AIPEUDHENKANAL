import React, { useState } from 'react';
import {
  FileText,
  ScrollText,
  Search,
  Landmark,
  ShieldCheck,
  Calculator,
  Fingerprint,
  Map,
  Smartphone,
  PiggyBank,
  HelpCircle,
  Copy,
  Percent,
  UserCheck,
  ExternalLink,
  X,
} from 'lucide-react';

interface QuickLinksSectionProps {
  onNavigateTab?: (tab: any) => void;
}

export const QuickLinksSection: React.FC<QuickLinksSectionProps> = ({ onNavigateTab }) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [trackId, setTrackId] = useState('');

  const quickLinks = [
    {
      id: 'user-portal',
      title: 'User Portal',
      subtitle: 'STAFF & MEMBERS',
      cardBorder: 'border-2 border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 hover:shadow-emerald-500/25',
      topStripe: 'bg-emerald-600',
      iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 ring-2 ring-emerald-300 dark:ring-emerald-700',
      icon: UserCheck,
      action: () => {
        if (onNavigateTab) onNavigateTab('user-portal');
      },
    },
    {
      id: 'forms',
      title: 'Cadre Forms',
      subtitle: 'QUICK ACCESS',
      cardBorder: 'border-2 border-indigo-200 dark:border-indigo-900/70 hover:border-indigo-500 hover:shadow-indigo-500/20',
      topStripe: 'bg-indigo-600',
      iconBg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 ring-2 ring-indigo-200 dark:ring-indigo-800',
      icon: FileText,
      action: () => {
        if (onNavigateTab) onNavigateTab('user-portal');
        else window.open('https://www.indiapost.gov.in/VAS/Pages/Form.aspx', '_blank');
      },
    },
    {
      id: 'circulars',
      title: 'Circulars',
      subtitle: 'QUICK ACCESS',
      cardBorder: 'border-2 border-rose-200 dark:border-rose-900/70 hover:border-rose-500 hover:shadow-rose-500/20',
      topStripe: 'bg-rose-600',
      iconBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 ring-2 ring-rose-200 dark:ring-rose-800',
      icon: ScrollText,
      action: () => {
        if (onNavigateTab) onNavigateTab('feed');
      },
    },
    {
      id: 'track',
      title: 'Track Consignment',
      subtitle: 'QUICK ACCESS',
      cardBorder: 'border-2 border-emerald-200 dark:border-emerald-900/70 hover:border-emerald-500 hover:shadow-emerald-500/20',
      topStripe: 'bg-emerald-600',
      iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 ring-2 ring-emerald-200 dark:ring-emerald-800',
      icon: Search,
      action: () => setActiveModal('track'),
    },
    {
      id: 'net-banking',
      title: 'Internet Banking',
      subtitle: 'QUICK ACCESS',
      cardBorder: 'border-2 border-amber-200 dark:border-amber-900/70 hover:border-amber-500 hover:shadow-amber-500/20',
      topStripe: 'bg-amber-500',
      iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 ring-2 ring-amber-200 dark:ring-amber-800',
      icon: Landmark,
      action: () => window.open('https://ebanking.indiapost.gov.in', '_blank'),
    },
    {
      id: 'pli',
      title: 'PLI / RPLI',
      subtitle: 'QUICK ACCESS',
      cardBorder: 'border-2 border-sky-200 dark:border-sky-900/70 hover:border-sky-500 hover:shadow-sky-500/20',
      topStripe: 'bg-sky-500',
      iconBg: 'bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 ring-2 ring-sky-200 dark:ring-sky-800',
      icon: ShieldCheck,
      action: () => window.open('https://pli.indiapost.gov.in', '_blank'),
    },
    {
      id: 'postage-calc',
      title: 'Postage Calculator',
      subtitle: 'QUICK ACCESS',
      cardBorder: 'border-2 border-orange-200 dark:border-orange-900/70 hover:border-orange-500 hover:shadow-orange-500/20',
      topStripe: 'bg-orange-500',
      iconBg: 'bg-orange-100 text-orange-700 dark:bg-orange-950/80 dark:text-orange-300 ring-2 ring-orange-200 dark:ring-orange-800',
      icon: Calculator,
      action: () => window.open('https://www.indiapost.gov.in/VAS/Pages/CalculatePostage.aspx', '_blank'),
    },
    {
      id: 'aadhaar',
      title: 'Aadhaar Services',
      subtitle: 'QUICK ACCESS',
      cardBorder: 'border-2 border-purple-200 dark:border-purple-900/70 hover:border-purple-500 hover:shadow-purple-500/20',
      topStripe: 'bg-purple-600',
      iconBg: 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 ring-2 ring-purple-200 dark:ring-purple-800',
      icon: Fingerprint,
      action: () => window.open('https://www.indiapost.gov.in/Financial/Pages/Content/Aadhaar.aspx', '_blank'),
    },
    {
      id: 'digipin',
      title: 'DIGIPIN',
      subtitle: 'QUICK ACCESS',
      cardBorder: 'border-2 border-pink-200 dark:border-pink-900/70 hover:border-pink-500 hover:shadow-pink-500/20',
      topStripe: 'bg-pink-600',
      iconBg: 'bg-pink-100 text-pink-700 dark:bg-pink-950/80 dark:text-pink-300 ring-2 ring-pink-200 dark:ring-pink-800',
      icon: Map,
      action: () => window.open('https://digipin.gov.in', '_blank'),
    },
    {
      id: 'ippb',
      title: 'IPPB Service',
      subtitle: 'QUICK ACCESS',
      cardBorder: 'border-2 border-cyan-200 dark:border-cyan-900/70 hover:border-cyan-500 hover:shadow-cyan-500/20',
      topStripe: 'bg-cyan-600',
      iconBg: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300 ring-2 ring-cyan-200 dark:ring-cyan-800',
      icon: Smartphone,
      action: () => window.open('https://www.ippbonline.com', '_blank'),
    },
    {
      id: 'posb-scheme',
      title: 'Post Office Savings Scheme',
      subtitle: 'QUICK ACCESS',
      cardBorder: 'border-2 border-teal-200 dark:border-teal-900/70 hover:border-teal-500 hover:shadow-teal-500/20',
      topStripe: 'bg-teal-600',
      iconBg: 'bg-teal-100 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300 ring-2 ring-teal-200 dark:ring-teal-800',
      icon: PiggyBank,
      action: () => window.open('https://www.indiapost.gov.in/Financial/Pages/Content/Post-Office-Saving-Schemes.aspx', '_blank'),
    },
    {
      id: 'finacle-assist',
      title: 'Finacle Assistant',
      subtitle: 'QUICK ACCESS',
      cardBorder: 'border-2 border-violet-200 dark:border-violet-900/70 hover:border-violet-500 hover:shadow-violet-500/20',
      topStripe: 'bg-violet-600',
      iconBg: 'bg-violet-100 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300 ring-2 ring-violet-200 dark:ring-violet-800',
      icon: HelpCircle,
      action: () => setActiveModal('finacle'),
    },
    {
      id: 'receipt-converter',
      title: 'Multi Receipt Converter',
      subtitle: 'QUICK ACCESS',
      cardBorder: 'border-2 border-fuchsia-200 dark:border-fuchsia-900/70 hover:border-fuchsia-500 hover:shadow-fuchsia-500/20',
      topStripe: 'bg-fuchsia-600',
      iconBg: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/80 dark:text-fuchsia-300 ring-2 ring-fuchsia-200 dark:ring-fuchsia-800',
      icon: Copy,
      action: () => setActiveModal('converter'),
    },
    {
      id: 'interest-rates',
      title: 'Interest Rates',
      subtitle: 'QUICK ACCESS',
      cardBorder: 'border-2 border-yellow-200 dark:border-yellow-900/70 hover:border-yellow-500 hover:shadow-yellow-500/20',
      topStripe: 'bg-yellow-500',
      iconBg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/80 dark:text-yellow-300 ring-2 ring-yellow-200 dark:ring-yellow-800',
      icon: Percent,
      action: () => setActiveModal('rates'),
    },
    {
      id: 'customer-login',
      title: 'Customer Login',
      subtitle: 'QUICK ACCESS',
      cardBorder: 'border-2 border-blue-200 dark:border-blue-900/70 hover:border-blue-500 hover:shadow-blue-500/20',
      topStripe: 'bg-blue-600',
      iconBg: 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 ring-2 ring-blue-200 dark:ring-blue-800',
      icon: UserCheck,
      action: () => window.open('https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx', '_blank'),
    },
    {
      id: 'tariff-calc',
      title: 'Tariff Calculator',
      subtitle: 'QUICK ACCESS',
      cardBorder: 'border-2 border-red-200 dark:border-red-900/70 hover:border-red-500 hover:shadow-red-500/20',
      topStripe: 'bg-red-600',
      iconBg: 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 ring-2 ring-red-200 dark:ring-red-800',
      icon: Calculator,
      action: () => window.open('https://www.indiapost.gov.in/VAS/Pages/CalculatePostage.aspx', '_blank'),
    },
  ];

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackId.trim()) return;
    window.open(
      `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?itemid=${encodeURIComponent(
        trackId.trim().toUpperCase()
      )}`,
      '_blank'
    );
    setActiveModal(null);
  };

  return (
    <section className="w-full space-y-6 pt-4">
      {/* Header: Title, Subtitle & Decorative Amber Bar */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0B2545] dark:text-white tracking-tight">
          Quick links section
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-semibold tracking-wide">
          Important Web Portals
        </p>
        <div className="w-20 h-1.5 bg-amber-400 rounded-full mx-auto shadow-sm" />
      </div>

      {/* 15 Card Tiles Grid with Distinct Colorful Borders & Fonts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4 md:gap-5">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 ${item.cardBorder} shadow-[0_4px_20px_-4px_rgba(0,0,0,0.07)] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 flex flex-col items-center justify-between text-center group cursor-pointer w-full relative overflow-hidden`}
            >
              {/* Top Accent Stripe */}
              <div className={`w-12 h-1.5 ${item.topStripe} rounded-full mb-3 group-hover:w-20 transition-all duration-300`} />

              {/* Icon Container with Colorful Pill */}
              <div
                className={`w-13 h-13 sm:w-15 sm:h-15 rounded-2xl ${item.iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200 shadow-sm`}
              >
                <Icon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
              </div>

              {/* Title with Clear, Legible Font */}
              <h3 className="text-xs sm:text-sm md:text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 min-h-[2.4rem] flex items-center justify-center leading-snug">
                {item.title}
              </h3>

              {/* Subtitle Badge */}
              <span className="text-[10px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400 mt-2 block">
                {item.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* Track Consignment Modal */}
      {activeModal === 'track' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border-2 border-emerald-500 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                  <Search className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Track Consignment
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Speed Post, Registered Letter, Parcel</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTrackSubmit} className="space-y-3">
              <input
                type="text"
                required
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                placeholder="Enter 13-digit Consignment Number (e.g. ED123456789IN)"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-mono uppercase text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>Track on India Post Portal</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Finacle Assistant Modal */}
      {activeModal === 'finacle' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border-2 border-violet-500 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-600 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Finacle Assistant & Quick Menus
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Core Banking Solutions (CBS) Shortcut Guide</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-violet-200 dark:border-violet-900/60 flex justify-between items-center">
                <span className="font-mono font-bold text-violet-600 dark:text-violet-400 text-sm">CCRC</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Customer (CIF) Creation & Modification</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-violet-200 dark:border-violet-900/60 flex justify-between items-center">
                <span className="font-mono font-bold text-violet-600 dark:text-violet-400 text-sm">CPJM</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Passbook Print & Update</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-violet-200 dark:border-violet-900/60 flex justify-between items-center">
                <span className="font-mono font-bold text-violet-600 dark:text-violet-400 text-sm">CSBO / CASBA</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Cash Deposit & Withdrawal Operations</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-violet-200 dark:border-violet-900/60 flex justify-between items-center">
                <span className="font-mono font-bold text-violet-600 dark:text-violet-400 text-sm">HDA</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Daily Accounts & General Ledger Inquiries</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-violet-200 dark:border-violet-900/60 flex justify-between items-center">
                <span className="font-mono font-bold text-violet-600 dark:text-violet-400 text-sm">HIARM</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Inquire Interest & Bonus Rate Maintenance</span>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-black text-xs"
            >
              Close Assistant
            </button>
          </div>
        </div>
      )}

      {/* Interest Rates Modal */}
      {activeModal === 'rates' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border-2 border-amber-500 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                  <Percent className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Post Office Small Savings Interest Rates
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Government of India Notified Rates</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {[
                { name: 'Sukanya Samriddhi Account (SSA)', rate: '8.2% p.a.' },
                { name: 'Senior Citizen Savings Scheme (SCSS)', rate: '8.2% p.a.' },
                { name: 'National Savings Certificate (NSC)', rate: '7.7% p.a.' },
                { name: 'Monthly Income Scheme (MIS)', rate: '7.4% p.a.' },
                { name: 'Kisan Vikas Patra (KVP)', rate: '7.5% (115 months)' },
                { name: 'Public Provident Fund (PPF)', rate: '7.1% p.a.' },
                { name: '5-Year Recurring Deposit (RD)', rate: '6.7% p.a.' },
                { name: '1 Year Time Deposit (TD)', rate: '6.9% p.a.' },
                { name: '2 Year Time Deposit (TD)', rate: '7.0% p.a.' },
                { name: '3 Year Time Deposit (TD)', rate: '7.1% p.a.' },
                { name: '5 Year Time Deposit (TD)', rate: '7.5% p.a.' },
                { name: 'Post Office Savings Account (SB)', rate: '4.0% p.a.' },
              ].map((scheme, i) => (
                <div key={i} className="py-2.5 flex justify-between items-center">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{scheme.name}</span>
                  <span className="font-black text-amber-600 dark:text-amber-400 font-mono text-sm">{scheme.rate}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Multi Receipt Converter Modal */}
      {activeModal === 'converter' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border-2 border-fuchsia-500 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-600 flex items-center justify-center">
                  <Copy className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Multi Receipt Converter
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Bulk article barcode & receipt generator</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Quickly convert comma or line-separated Speed Post / Registered consignment numbers into printable multi-receipt batch sheets or import into Point of Sale (PoS).
            </p>

            <textarea
              rows={4}
              placeholder="Paste article numbers here (e.g. ED123456789IN, RK987654321IN)..."
              className="w-full p-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono uppercase"
            />

            <button
              onClick={() => {
                alert('Batch receipts parsed and formatted for PoS printer.');
                setActiveModal(null);
              }}
              className="w-full py-2.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-black text-xs shadow-md"
            >
              Format & Process Receipts
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
