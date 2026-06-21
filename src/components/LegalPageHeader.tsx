'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Globe, ChevronDown, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type LegalHeaderVariant = 'agb' | 'privacy' | 'legal' | 'contracts';

const VARIANT_STYLES: Record<LegalHeaderVariant, {
  gradient: string;
  badge: string;
  badgeText: Record<string, string>;
}> = {
  agb: {
    gradient: 'from-brand-700 via-brand-800 to-brand-900',
    badge: 'bg-brand-500/30 text-brand-100 border-brand-400/40',
    badgeText: {
      de: '📋 Allgemeine Geschäftsbedingungen',
      en: '📋 Terms & Conditions',
      es: '📋 Términos y Condiciones',
      el: '📋 Γενικοί Όροι & Προϋποθέσεις',
    },
  },
  privacy: {
    gradient: 'from-purple-700 via-purple-800 to-purple-900',
    badge: 'bg-purple-500/30 text-purple-100 border-purple-400/40',
    badgeText: {
      de: '🔒 Datenschutzerklärung (DSGVO)',
      en: '🔒 Privacy Policy (GDPR)',
      es: '🔒 Política de Privacidad (RGPD)',
      el: '🔒 Πολιτική Απορρήτου (ΓΚΠΔ)',
    },
  },
  legal: {
    gradient: 'from-slate-700 via-slate-800 to-slate-900',
    badge: 'bg-slate-500/30 text-slate-100 border-slate-400/40',
    badgeText: {
      de: '⚖️ Impressum',
      en: '⚖️ Legal Notice',
      es: '⚖️ Aviso Legal',
      el: '⚖️ Νομική Σημείωση',
    },
  },
  contracts: {
    gradient: 'from-brand-700 via-brand-800 to-indigo-900',
    badge: 'bg-brand-500/30 text-brand-100 border-brand-400/40',
    badgeText: {
      de: '📝 Plattform-Verträge',
      en: '📝 Platform Contracts',
      es: '📝 Contratos de Plataforma',
      el: '📝 Συμβόλαια Πλατφόρμας',
    },
  },
};

const LANG_OPTIONS = [
  { code: 'de', label: 'Deutsch',   flag: '🇩🇪' },
  { code: 'en', label: 'English',   flag: '🇬🇧' },
  { code: 'es', label: 'Español',   flag: '🇪🇸' },
  { code: 'el', label: 'Ελληνικά', flag: '🇬🇷' },
];

interface Props {
  variant:       LegalHeaderVariant;
  /** Show language switcher */
  showLangSwitch?: boolean;
  /** Show logout button */
  showLogout?:     boolean;
  /** Show back-to-home link */
  backHref?:       string;
  backLabel?:      string;
  /** Optional subtitle override */
  subtitle?:       string;
  onLogout?:       () => void;
}

export default function LegalPageHeader({
  variant,
  showLangSwitch = false,
  showLogout = false,
  backHref,
  backLabel,
  subtitle,
  onLogout,
}: Props) {
  const { i18n } = useTranslation();
  const lang = (['de','en','es','el'].includes(i18n.language?.split('-')[0] ?? ''))
    ? i18n.language.split('-')[0]
    : 'en';

  const [showLangs, setShowLangs] = useState(false);
  const styles = VARIANT_STYLES[variant];

  return (
    <header className={`bg-gradient-to-r ${styles.gradient} text-white shadow-xl`}>
      {/* ── Top utility bar ── */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-4 pb-2 flex items-center justify-between gap-4">

        {/* Back link */}
        {backHref ? (
          <Link
            href={backHref}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{backLabel ?? (lang === 'de' ? 'Zurück' : lang === 'es' ? 'Volver' : lang === 'el' ? 'Πίσω' : 'Back')}</span>
          </Link>
        ) : <div />}

        {/* Right-side controls */}
        <div className="flex items-center gap-2">

          {/* Language switcher */}
          {showLangSwitch && (
            <div className="relative">
              <button
                onClick={() => setShowLangs(v => !v)}
                className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 text-xs font-medium text-white transition"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{LANG_OPTIONS.find(l => l.code === lang)?.flag} {lang.toUpperCase()}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              {showLangs && (
                <div className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-gray-200 bg-white shadow-xl z-50 overflow-hidden">
                  {LANG_OPTIONS.map(opt => (
                    <button
                      key={opt.code}
                      onClick={() => { i18n.changeLanguage(opt.code); setShowLangs(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-gray-50 transition ${
                        lang === opt.code ? 'font-bold text-brand-700 bg-brand-50' : 'text-gray-700'
                      }`}
                    >
                      <span>{opt.flag}</span> {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Logout */}
          {showLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-red-500/30 border border-white/20 px-3 py-1.5 text-xs font-medium text-white transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:block">
                {lang === 'de' ? 'Abmelden' : lang === 'es' ? 'Salir' : lang === 'el' ? 'Αποσύνδεση' : 'Sign out'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ── Logo + title ── */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-4 pb-6">
        {/* Logo image */}
        <div className="mb-4">
          <div className="inline-block bg-white rounded-xl px-4 py-2 shadow-lg">
            <Image
              src="/images/logo-header.png"
              alt="PDR Connect by Cybratech Solutions"
              width={220}
              height={52}
              quality={100}
              priority
              className="h-10 w-auto object-contain"
            />
          </div>
        </div>

        {/* Document type badge */}
        <span className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold mb-3 ${styles.badge}`}>
          {styles.badgeText[lang] ?? styles.badgeText.en}
        </span>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-white/70 text-sm mt-1">{subtitle}</p>
        )}

        {/* Divider */}
        <div className="mt-4 h-px bg-white/10" />
      </div>
    </header>
  );
}
