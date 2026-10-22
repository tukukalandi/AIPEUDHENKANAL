import React from 'react';
import {
  Users,
  Send,
  ExternalLink,
  Award,
  Sparkles,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import { AppLanguage } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { UNION_AFFILIATION } from '../data/unionInfo';
import { UNION_LOGOS, PRIMARY_BRAND_LOGO } from '../data/logos';

interface SocialAndVisitorSectionProps {
  language?: AppLanguage;
  onSelectWing?: (wingId: string) => void;
}

export const SocialAndVisitorSection: React.FC<SocialAndVisitorSectionProps> = ({
  language = 'en',
  onSelectWing,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // 5 Official Social Media Channels styled with the website logo identity
  const socialChannels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp Community Group',
      subname: 'Direct Comrades Discussion',
      badge: 'Official WhatsApp',
      tagline: 'Follow this link to join my WhatsApp group',
      actionText: 'Join WhatsApp Group',
      url: 'https://chat.whatsapp.com/LWdnfVy9ZGGAaR1Ltr1iF2?s=sh&p=a&mlu=4&ilr=4&iam=0',
      badgeAccent: 'from-emerald-500 to-green-600',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.075-2.222-.559-1.826-.759-3.003-2.617-3.094-2.738-.09-.12-1.203-1.603-1.203-3.056 0-1.455.764-2.17.1.034-2.463.272-.293.593-.367.791-.367.199 0 .399.002.573.011.185.01.433-.07.677.518.25.602.85 2.079.924 2.23.075.15.125.326.025.526-.1.2-.15.325-.298.499-.15.174-.315.39-.45.524-.15.149-.307.311-.132.611.174.3 1.258 2.062 2.709 3.354 1.868 1.662 3.447 2.179 3.937 2.421.491.242.778.201 1.066-.129.288-.33 1.238-1.442 1.57-1.936.331-.495.662-.413 1.114-.247.452.165 2.871 1.353 3.364 1.599.492.247.82.37.941.576.12.206.12 1.196-.024 1.601z" />
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.527 3.66 1.443 5.176L2 22l4.981-1.416C8.423 21.492 10.155 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.062c-1.642 0-3.167-.47-4.461-1.278l-.32-.198-2.964.842.842-2.915-.218-.344C4.015 14.82 3.5 13.454 3.5 12c0-4.687 3.813-8.5 8.5-8.5s8.5 3.813 8.5 8.5-3.813 8.562-8.5 8.562z" />
        </svg>
      ),
    },
    {
      id: 'facebook-page',
      name: 'Official Facebook Page',
      subname: 'AIPEU Dhenkanal Division Updates',
      badge: 'Facebook Page',
      tagline: 'Official press releases, photo bulletins & notices',
      actionText: 'Follow Facebook Page',
      url: 'https://www.facebook.com/share/1C1e9fHijV/',
      badgeAccent: 'from-blue-600 to-indigo-700',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
      ),
    },
    {
      id: 'facebook-group',
      name: 'Facebook Members Group',
      subname: 'Postal Staff & Comrades Forum',
      badge: 'Community Group',
      tagline: 'Connect and exchange ideas with Dhenkanal postal staff',
      actionText: 'Join Facebook Group',
      url: 'https://www.facebook.com/share/g/1Fbi1km9XA/',
      badgeAccent: 'from-indigo-600 to-sky-700',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'twitter',
      name: 'X (Formerly Twitter)',
      subname: '@aipeup3dkl',
      badge: 'Official Handle',
      tagline: 'Follow live postal notifications, CPC developments & alerts',
      actionText: 'Follow @aipeup3dkl on X',
      url: 'https://x.com/aipeup3dkl',
      badgeAccent: 'from-neutral-700 to-black',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      id: 'telegram',
      name: 'Telegram Broadcast Channel',
      subname: 'Instant Circulars & PDF Orders',
      badge: 'Telegram Channel',
      tagline: 'Instant downloads of gazette orders, DOPT & CHQ circulars',
      actionText: 'Join Telegram Channel',
      url: 'https://t.me/+RgcDu9IJaBwgGW66',
      badgeAccent: 'from-sky-500 to-blue-600',
      icon: <Send className="w-5 h-5" />,
    },
  ];

  return (
    <section className="w-full space-y-10 my-8 pt-4">
      {/* 🏛️ Prominent Affiliation Banner matching user exact mandate */}
      <div className="w-full rounded-3xl bg-gradient-to-r from-[#4A0808] via-[#7B1313] to-[#961A1A] text-white p-6 sm:p-8 shadow-2xl border-2 border-amber-400/50 relative overflow-hidden">
        {/* Subtle decorative watermark */}
        <div className="absolute right-0 top-0 bottom-0 w-72 opacity-10 pointer-events-none flex items-center justify-center">
          <img
            src={PRIMARY_BRAND_LOGO}
            alt=""
            className="w-80 h-80 object-contain filter invert"
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-4xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>OFFICIAL AFFILIATION</span>
              </span>
              <span className="text-xs text-amber-200 font-bold uppercase tracking-wider">
                TRADE UNION CREED
              </span>
            </div>

            <h3 className="text-base sm:text-xl md:text-2xl font-black text-white leading-snug drop-shadow-sm">
              {UNION_AFFILIATION.text}
            </h3>

            <p className="text-xs sm:text-sm text-amber-100/90 font-medium leading-relaxed">
              A Federal trade union movement safeguarding legitimate rights, service conditions, pension security, and welfare of all postal employees across Dhenkanal Division.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2 w-full sm:w-auto">
            <div className="px-5 py-3 rounded-2xl bg-black/50 backdrop-blur-md border border-amber-400/40 text-center shadow-lg">
              <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Division Headquarters</div>
              <div className="text-sm font-black text-white mt-0.5">Dhenkanal HO, Odisha</div>
            </div>
          </div>
        </div>
      </div>

      {/* 🏅 OFFICIAL CONSTITUENT UNIONS & ASSOCIATIONS LOGO SHOWCASE */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                Official Crests & Emblems
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                7 Constituent Wings
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-1">
              <ShieldCheck className="w-6 h-6 text-red-600 dark:text-red-400" />
              <span>Constituent Unions & Fraternal Associations</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Recognized federal trade union bodies and pensioner organizations functioning across Dhenkanal Division
            </p>
          </div>
        </div>

        {/* Responsive Grid of all 7 Official Logos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {UNION_LOGOS.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectWing && onSelectWing(item.id)}
              className="group relative rounded-3xl p-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-400 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
            >
              {/* Decorative top red accent hairline */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-400 to-red-600" />

              <div>
                {/* Logo Image in prominent round gold-ring medallion */}
                <div className="flex items-center gap-3.5 mb-3.5">
                  <div className="relative w-16 h-16 rounded-full bg-white p-1 shadow-lg ring-3 ring-amber-400/80 group-hover:ring-amber-400 group-hover:scale-105 transition-all overflow-hidden shrink-0 flex items-center justify-center">
                    <img
                      src={item.imagePath}
                      alt={item.name}
                      className="w-full h-full object-contain rounded-full"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 mb-1">
                      {item.shortName}
                    </span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight group-hover:text-red-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                      {item.name}
                    </h4>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <span>Representing:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold truncate">
                      {item.cadre}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal line-clamp-3">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-red-600 dark:text-amber-400">
                <span className="group-hover:underline">Affiliated Wing</span>
                <span className="text-xs group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 📱 OFFICIAL SOCIAL MEDIA CHANNELS
          Styled with the Website Logo visual identity (user request: "Social media cards should be looked as the website logo") */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800">
                Union Connect
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Direct Comrades Network
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-1">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>{t.socialHeading}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              {t.socialSubheading}
            </p>
          </div>
          <span className="text-xs font-black text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-300 dark:border-amber-800 w-fit flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5" />
            <span>Official Union Channels</span>
          </span>
        </div>

        {/* 5 Distinct Cards styled with the website logo crest, deep red union gradient and gold accents */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {socialChannels.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-3xl p-5 sm:p-6 text-white bg-gradient-to-br from-[#4A0707] via-[#751111] to-[#380404] hover:from-[#5A0A0A] hover:via-[#8A1515] hover:to-[#450505] shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between border-2 border-amber-400/50 hover:border-amber-300 overflow-hidden"
            >
              {/* Watermark of Website Logo in Card Background */}
              <div className="absolute -right-6 -bottom-6 w-36 h-36 opacity-10 pointer-events-none group-hover:scale-110 group-hover:opacity-15 transition-all">
                <img
                  src={PRIMARY_BRAND_LOGO}
                  alt=""
                  className="w-full h-full object-contain filter invert"
                />
              </div>

              {/* Decorative top gold accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500" />

              <div className="relative z-10 space-y-4">
                {/* Card Header: Official Website Crest Badge + Platform Icon */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {/* Website Logo Crest Badge */}
                    <div className="w-12 h-12 rounded-full bg-white p-0.5 shadow-md ring-2 ring-amber-400 overflow-hidden shrink-0 flex items-center justify-center">
                      <img
                        src={PRIMARY_BRAND_LOGO}
                        alt="NFPE AIPEU Logo"
                        className="w-full h-full object-contain rounded-full"
                      />
                    </div>

                    {/* Platform Brand Badge */}
                    <div
                      className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${item.badgeAccent} p-0.5 flex items-center justify-center text-white shadow-md ring-1 ring-white/30`}
                    >
                      {item.icon}
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/40 text-amber-300 border border-amber-400/40 shadow-sm backdrop-blur-sm">
                    {item.badge}
                  </span>
                </div>

                {/* Card Body */}
                <div className="space-y-1">
                  <h4 className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-amber-200 transition-colors flex items-center gap-1.5">
                    <span>{item.name}</span>
                  </h4>
                  <div className="text-xs font-bold text-amber-300/90 tracking-wide">
                    {item.subname}
                  </div>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed pt-1">
                    {item.tagline}
                  </p>
                </div>
              </div>

              {/* Card Footer Action Button - Gold & Red Union Style */}
              <div className="relative z-10 mt-5 pt-3.5 border-t border-amber-400/30 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 group-hover:bg-amber-300 text-slate-950 font-black shadow-md transition-colors">
                  <span>{item.actionText}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
                <span className="text-[11px] font-bold text-amber-200 opacity-90 group-hover:opacity-100 flex items-center gap-1">
                  <span>Open</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
