'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import LegalPageHeader from '@/components/LegalPageHeader';
import PRIVACY_CONTENT from '@/lib/privacy-content';
import { useLang } from '@/hooks/useLang';

const FOOTER_LINKS: Record<string, { terms: string; legal: string; home: string }> = {
  de: { terms: 'Nutzungsbedingungen', legal: 'Impressum',    home: 'Zur Startseite' },
  en: { terms: 'Terms of Service',    legal: 'Legal Notice', home: 'Back to Home'   },
  es: { terms: 'Términos de Servicio',legal: 'Aviso Legal',  home: 'Volver al Inicio'},
  el: { terms: 'Όροι Χρήσης',         legal: 'Νομική Σημείωση', home: 'Αρχική'    },
};

export default function PrivacyPage() {
  const { i18n } = useTranslation();
  const lang = useLang();
  const c = PRIVACY_CONTENT[lang] ?? PRIVACY_CONTENT['en'];
  const links = FOOTER_LINKS[lang] ?? FOOTER_LINKS.en;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Shared header with real logo */}
      <LegalPageHeader
        variant="privacy"
        backHref="/"
        backLabel={links.home}
        subtitle={c.subtitle}
      />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-6">

        {/* Title + effective date */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">{c.title}</h1>
          <p className="text-sm text-gray-500">{c.subtitle}</p>
        </div>

        {/* Intro paragraph */}
        {c.intro && (
          <div className="rounded-xl bg-purple-50 border border-purple-200 p-5">
            <p className="text-sm text-purple-900 leading-relaxed">{c.intro}</p>
          </div>
        )}

        {/* Sections */}
        <div className="space-y-4">
          {c.sections.map((s) => (
            <div key={s.h} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Section header */}
              <div className="bg-purple-50 border-b border-purple-100 px-5 py-3">
                <h2 className="text-sm font-bold text-purple-900">{s.h}</h2>
              </div>

              {/* Section body */}
              <div className="px-5 py-4 space-y-3">
                {s.sub && (
                  <p className="text-sm text-gray-700 font-semibold">{s.sub}</p>
                )}
                {s.p && (
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{s.p}</p>
                )}
                {s.list && (
                  <ul className="space-y-2">
                    {s.list.map((item, i) => (
                      <li key={i} className="flex gap-2.5 text-sm text-gray-700">
                        <span className="text-purple-400 mt-1 flex-shrink-0">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {s.p2 && (
                  <p className="text-sm text-gray-600 leading-relaxed italic">{s.p2}</p>
                )}
                {s.note && (
                  <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-2.5 flex gap-2 text-xs text-green-800 font-medium">
                    <span className="flex-shrink-0">ℹ️</span>
                    <span>{s.note}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </main>

      <footer className="border-t border-gray-200 mt-12 py-8 text-center text-sm text-gray-400">
        <div className="flex justify-center gap-6 flex-wrap mb-3">
          <Link href="/terms" className="hover:text-gray-600 transition">{links.terms}</Link>
          <Link href="/legal" className="hover:text-gray-600 transition">{links.legal}</Link>
          <Link href="/"     className="hover:text-gray-600 transition">{links.home}</Link>
        </div>
        <p className="text-xs">
          © {new Date().getFullYear()} PDR Connect · Cybratech Solutions Ltd. · CY60015676H
        </p>
      </footer>
    </div>
  );
}
