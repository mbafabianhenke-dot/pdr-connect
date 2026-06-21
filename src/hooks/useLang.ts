'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const SUPPORTED_LANGS = ['en', 'de', 'es', 'el'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];
export const LS_KEY = 'pdrconnect-lang';

/**
 * Read language DIRECTLY from localStorage or browser.
 * Must only be called client-side.
 */
export function readStoredLang(): SupportedLang {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(LS_KEY)?.split('-')[0];
  if (stored && (SUPPORTED_LANGS as readonly string[]).includes(stored)) {
    return stored as SupportedLang;
  }
  const nav = navigator.language?.split('-')[0];
  if (nav && (SUPPORTED_LANGS as readonly string[]).includes(nav)) {
    return nav as SupportedLang;
  }
  return 'en';
}

/**
 * useLang() — reliable language hook.
 *
 * Reads from localStorage on first render (client-only).
 * Stays in sync with i18n when user changes language via switcher.
 * 100% independent of i18n initialization timing.
 */
export function useLang(): SupportedLang {
  const { i18n } = useTranslation();

  const [lang, setLang] = useState<SupportedLang>(() => {
    // useState initializer runs on client only (after hydration)
    return readStoredLang();
  });

  useEffect(() => {
    // Sync on mount — pick up correct language immediately
    const current = i18n.language?.split('-')[0];
    if (current && (SUPPORTED_LANGS as readonly string[]).includes(current)) {
      setLang(current as SupportedLang);
    } else {
      // i18n doesn't have the right language yet — read from localStorage
      setLang(readStoredLang());
    }

    // Keep in sync when user changes language
    const onLangChange = (lng: string) => {
      const l = lng.split('-')[0];
      if ((SUPPORTED_LANGS as readonly string[]).includes(l)) {
        setLang(l as SupportedLang);
      }
    };

    i18n.on('languageChanged', onLangChange);
    return () => { i18n.off('languageChanged', onLangChange); };
  }, [i18n]);

  return lang;
}
