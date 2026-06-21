'use client';

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

const SUPPORTED = ['en', 'de', 'el', 'es'] as const;
const LS_KEY = 'pdrconnect-lang';

/**
 * Read the user's preferred language from localStorage or browser.
 * MUST only be called client-side (inside useEffect).
 */
function getClientLang(): string {
  // 1. Explicit user preference (set by LanguageSwitcher)
  const stored = localStorage.getItem(LS_KEY);
  if (stored && (SUPPORTED as readonly string[]).includes(stored)) return stored;

  // 2. Browser / OS language
  const nav = navigator.language?.split('-')[0];
  if (nav && (SUPPORTED as readonly string[]).includes(nav)) return nav;

  return 'en';
}

// Create i18n instance — initialized with default 'en'.
// The REAL language is applied client-side in useEffect before children render.
const i18nInstance = i18next.createInstance();

i18nInstance
  .use(initReactI18next)
  .use(resourcesToBackend((language: string, namespace: string) =>
    import(`../../public/locales/${language}/${namespace}.json`)
  ))
  .init({
    lng:          'en',          // safe server-side default — overridden client-side
    fallbackLng:  'en',
    supportedLngs: SUPPORTED,
    defaultNS:    'common',
    ns:           ['common'],
    interpolation: { escapeValue: false },
    react:        { useSuspense: false },
  });

// Persist language changes to localStorage
i18nInstance.on('languageChanged', (lng: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_KEY, lng);
  }
});

export { i18nInstance };

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Keep children hidden until language is correctly set
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // This runs CLIENT-SIDE ONLY — window/localStorage are available here
    const setup = async () => {
      const targetLang = getClientLang(); // reads localStorage correctly

      // Wait for i18n to be initialized first
      if (!i18nInstance.isInitialized) {
        await new Promise<void>(resolve => {
          i18nInstance.on('initialized', resolve);
        });
      }

      // Switch to the user's actual language (loads translations async)
      if (i18nInstance.language !== targetLang) {
        await i18nInstance.changeLanguage(targetLang);
      }

      // NOW children render — correct language is guaranteed
      setReady(true);
    };

    setup();
  }, []);

  return (
    <I18nextProvider i18n={i18nInstance}>
      {ready ? children : null}
    </I18nextProvider>
  );
}
