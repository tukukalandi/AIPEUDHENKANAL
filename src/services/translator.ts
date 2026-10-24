/**
 * Google Language & Web Translator Service
 * Synchronizes with Google Translate Website Translator and manages language cookies & dropdown
 */

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇮🇳' },
];

/**
 * Triggers Google Language Translator for the whole page
 */
export const changeGoogleLanguage = (langCode: string): void => {
  try {
    // 1. Save in local storage
    localStorage.setItem('aipeu_lang', langCode);

    // 2. Set Google Translate Cookie (`googtrans=/en/<target>`)
    const targetCookie = langCode === 'en' ? '/en/en' : `/en/${langCode}`;
    document.cookie = `googtrans=${targetCookie}; path=/;`;
    if (window.location.hostname) {
      document.cookie = `googtrans=${targetCookie}; path=/; domain=${window.location.hostname};`;
      document.cookie = `googtrans=${targetCookie}; path=/; domain=.${window.location.hostname};`;
    }

    if (langCode === 'en') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      if (window.location.hostname) {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
      }
    }

    // 3. Dispatch to Google Translate combo selector if already mounted in DOM
    const triggerCombo = () => {
      const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
      if (select) {
        select.value = langCode;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      return false;
    };

    if (!triggerCombo()) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (triggerCombo() || attempts > 12) {
          clearInterval(interval);
        }
      }, 250);
    }
  } catch (err) {
    console.warn('Failed to switch language via Google Translate:', err);
  }
};
