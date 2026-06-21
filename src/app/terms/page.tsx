'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import AGB_CONTENT from '@/lib/agb-content';
import LegalPageHeader from '@/components/LegalPageHeader';

const LINKS: Record<string, { privacy: string; legal: string; home: string }> = {
  en: { privacy: 'Privacy Policy',        legal: 'Legal Notice',    home: 'Back to Home'        },
  de: { privacy: 'Datenschutzerklärung',  legal: 'Impressum',       home: 'Zur Startseite'      },
  el: { privacy: 'Πολιτική Απορρήτου',    legal: 'Νομική Σημείωση', home: 'Επιστροφή στην Αρχική' },
  es: { privacy: 'Política de Privacidad',legal: 'Aviso Legal',     home: 'Volver al Inicio'    },
};

const LAST_UPDATED: Record<string, string> = {
  en: 'Last updated',
  de: 'Zuletzt aktualisiert',
  el: 'Τελευταία ενημέρωση',
  es: 'Última actualización',
};

export default function TermsPage() {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.split('-')[0] ?? 'en') in AGB_CONTENT
    ? (i18n.language?.split('-')[0] as string)
    : 'en';

  const c = AGB_CONTENT[lang];
  const links = LINKS[lang] ?? LINKS.en;
  const lastUpdated = LAST_UPDATED[lang] ?? LAST_UPDATED.en;

  const dateStr = new Date().toLocaleDateString(
    lang === 'de' ? 'de-DE' : lang === 'el' ? 'el-GR' : lang === 'es' ? 'es-ES' : 'en-GB',
    { day: '2-digit', month: 'long', year: 'numeric' }
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <LegalPageHeader
        variant="agb"
        backHref="/"
        backLabel={links.home}
        subtitle={`${c.subtitle} · ${lastUpdated}: ${dateStr}`}
      />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="card prose prose-sm max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{c.title}</h1>
          <p className="text-brand-600 font-medium mb-1">{c.subtitle}</p>
          <p className="text-gray-400 text-sm mb-8">{lastUpdated}: {dateStr}</p>

          {c.sections.map((s) => (
            <div key={s.h}>
              <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">{s.h}</h2>
              {s.p && (
                <p className="text-gray-700 leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                  {s.p}
                </p>
              )}
              {s.list && (
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  {s.list.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
              {s.p2 && (
                <p className="text-gray-700 leading-relaxed mt-2">{s.p2}</p>
              )}
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-12 py-6 text-center text-sm text-gray-400">
        <div className="flex justify-center gap-6">
          <Link href="/privacy" className="hover:text-gray-600">{links.privacy}</Link>
          <Link href="/legal" className="hover:text-gray-600">{links.legal}</Link>
          <Link href="/" className="hover:text-gray-600">{links.home}</Link>
        </div>
      </footer>
    </div>
  );
}
