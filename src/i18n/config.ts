export const defaultLocale = 'en';
export const locales = ['en', 'de', 'el', 'es'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  el: 'Ελληνικά',
  es: 'Español',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  de: '🇩🇪',
  el: '🇬🇷',
  es: '🇪🇸',
};
