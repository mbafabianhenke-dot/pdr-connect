'use client';

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';

const i18nInstance = i18next.createInstance();

i18nInstance
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(resourcesToBackend((language: string, namespace: string) =>
    import(`../../public/locales/${language}/${namespace}.json`)
  ))
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'de', 'el', 'es'],
    defaultNS: 'common',
    ns: ['common'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'pdrconnect-lang',
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export { i18nInstance };

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (i18nInstance.isInitialized) {
      setReady(true);
    } else {
      i18nInstance.on('initialized', () => setReady(true));
    }
  }, []);

  return (
    <I18nextProvider i18n={i18nInstance}>
      {ready ? children : null}
    </I18nextProvider>
  );
}
