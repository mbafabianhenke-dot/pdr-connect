'use client';

import { useTranslation } from 'react-i18next';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = (i18n.language?.split('-')[0] as Locale) || 'en';

  return (
    <div className="px-3 pb-2">
      <select
        value={locales.includes(current) ? current : 'en'}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="w-full text-xs rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
      >
        {locales.map((code) => (
          <option key={code} value={code}>
            {localeFlags[code]} {localeNames[code]}
          </option>
        ))}
      </select>
    </div>
  );
}
