import en from './locales/en';
import es from './locales/es';
import hi from './locales/hi';
import ta from './locales/ta';
import te from './locales/te';
import bn from './locales/bn';
import mr from './locales/mr';
import gu from './locales/gu';
import kn from './locales/kn';
import ml from './locales/ml';
import pa from './locales/pa';
import or_ from './locales/or';

export type Language = 'en' | 'es' | 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'gu' | 'kn' | 'ml' | 'pa' | 'or';

export const languages = [
  { code: 'en' as const, label: 'English', flag: '🇬🇧' },
  { code: 'hi' as const, label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta' as const, label: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te' as const, label: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn' as const, label: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr' as const, label: 'मराठी', flag: '🇮🇳' },
  { code: 'gu' as const, label: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn' as const, label: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml' as const, label: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa' as const, label: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'or' as const, label: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'es' as const, label: 'Español', flag: '🇪🇸' },
];

export const localeMap: Record<Language, string> = {
  en: 'en-US',
  es: 'es-ES',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  bn: 'bn-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  pa: 'pa-IN',
  or: 'or-IN',
};

const translations: Record<Language, Record<string, string>> = {
  en, es, hi, ta, te, bn, mr, gu, kn, ml, pa, or: or_,
};

export function t(key: string, lang: Language = 'en'): string {
  return translations[lang]?.[key] ?? translations.en[key] ?? key;
}
