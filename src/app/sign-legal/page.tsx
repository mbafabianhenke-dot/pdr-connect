'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import AGB_CONTENT from '@/lib/agb-content';
import PRIVACY_CONTENT from '@/lib/privacy-content';
import { generateLegalPDF } from '@/lib/generate-legal-pdf';
import { CheckCircle, FileText, Shield, ChevronDown, Loader2, Globe, LogOut } from 'lucide-react';
import LegalPageHeader from '@/components/LegalPageHeader';

const SUPPORTED_LANGS = ['en', 'de', 'es', 'el'] as const;
const LS_KEY = 'pdrconnect-lang';
const LANG_LABELS: Record<string, { label: string; flag: string }> = {
  de: { label: 'Deutsch',    flag: '🇩🇪' },
  en: { label: 'English',   flag: '🇬🇧' },
  es: { label: 'Español',   flag: '🇪🇸' },
  el: { label: 'Ελληνικά',  flag: '🇬🇷' },
};

/** Read language directly from localStorage — bypasses all i18n timing issues */
function readLang(): string {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(LS_KEY)?.split('-')[0];
  if (stored && (SUPPORTED_LANGS as readonly string[]).includes(stored)) return stored;
  const nav = navigator.language?.split('-')[0];
  if (nav && (SUPPORTED_LANGS as readonly string[]).includes(nav)) return nav;
  return 'en';
}

export default function SignLegalPage() {
  const { i18n } = useTranslation();

  // Read from localStorage directly — completely reliable, no i18n timing issue
  const [lang, setLang] = useState<string>(() => readLang());
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Keep in sync when user switches language
  useEffect(() => {
    const update = (lng: string) => {
      const l = lng.split('-')[0];
      if ((SUPPORTED_LANGS as readonly string[]).includes(l)) setLang(l);
    };
    i18n.on('languageChanged', update);
    // Sync on mount too
    const cur = i18n.language?.split('-')[0];
    if (cur && (SUPPORTED_LANGS as readonly string[]).includes(cur) && cur !== lang) setLang(cur);
    return () => { i18n.off('languageChanged', update); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n]);

  const agbContent  = AGB_CONTENT[lang]  ?? AGB_CONTENT.en;
  const privContent = PRIVACY_CONTENT[lang] ?? PRIVACY_CONTENT.en;

  const [userId,     setUserId]     = useState('');
  const [signerName, setSignerName] = useState('');
  const [signedAGB,  setSignedAGB]  = useState(false);
  const [signedPriv, setSignedPriv] = useState(false);
  const [saving,     setSaving]     = useState<'agb' | 'privacy' | null>(null);
  const [activeDoc,  setActiveDoc]  = useState<'agb' | 'privacy' | null>(null);
  const [checkedAGB,  setCheckedAGB]  = useState(false);
  const [checkedPriv, setCheckedPriv] = useState(false);
  const [readAGB,     setReadAGB]     = useState(false);
  const [readPriv,    setReadPriv]    = useState(false);
  const agbScrollRef  = useRef<HTMLDivElement>(null);
  const privScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }
      setUserId(user.id);

      // Fetch profile including preferred_language — this is the most reliable source
      const { data: profile } = await supabase
        .from('users')
        .select('full_name, preferred_language')
        .eq('id', user.id)
        .single();

      setSignerName(profile?.full_name ?? '');

      // Set language from DB first (most reliable), then sync i18n
      const dbLang = profile?.preferred_language;
      if (dbLang && (SUPPORTED_LANGS as readonly string[]).includes(dbLang)) {
        setLang(dbLang);
        i18n.changeLanguage(dbLang);  // also update i18n so UI text matches
        localStorage.setItem(LS_KEY, dbLang); // keep localStorage in sync
      }

      // Check existing signatures
      const { data: existing } = await supabase
        .from('contracts')
        .select('version')
        .eq('user_id', user.id)
        .eq('signed', true);
      for (const c of existing ?? []) {
        if (c.version === 'agb')     setSignedAGB(true);
        if (c.version === 'privacy') setSignedPriv(true);
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signDocument = async (type: 'agb' | 'privacy', checked: boolean) => {
    if (!checked) {
      toast.error(lang === 'de' ? 'Bitte zuerst bestätigen' : 'Please confirm first');
      return;
    }
    setSaving(type);
    try {
      const supabase = createClient();
      const signedAt = new Date().toISOString();

      // ── Step 1: Insert contract record (initially without pdf_url) ──
      const { data: inserted, error } = await supabase
        .from('contracts')
        .insert({
          user_id:   userId,
          version:   type,
          signed:    true,
          signed_at: signedAt,
          language:  lang,
          pdf_url:   '',
        })
        .select('id')
        .single();
      if (error) throw error;

      // ── Step 2: Generate PDF client-side ───────────────────────────
      const { data: profile } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();

      const pdfBlob = await generateLegalPDF({
        type,
        lang,
        signerName:  signerName || 'PDR Connect User',
        signerEmail: profile?.email ?? '',
        signedAt,
        contractId:  inserted.id,
      });

      // ── Step 3: Upload PDF to Supabase Storage ─────────────────────
      const filename = `${type.toUpperCase()}_${lang.toUpperCase()}_${Date.now()}.pdf`;
      const storagePath = `${userId}/legal/${filename}`;

      const { error: uploadErr } = await supabase.storage
        .from('documents')
        .upload(storagePath, pdfBlob, { contentType: 'application/pdf', upsert: false });

      let pdfUrl = '';
      if (!uploadErr) {
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(storagePath);
        pdfUrl = urlData?.publicUrl ?? '';

        // ── Step 4: Update contracts record with PDF URL ───────────────
        await supabase
          .from('contracts')
          .update({ pdf_url: pdfUrl })
          .eq('id', inserted.id);
      }
      // If upload fails, contract is still saved — pdf_url stays empty, view API generates on demand

      const newSignedAGB  = type === 'agb'     ? true : signedAGB;
      const newSignedPriv = type === 'privacy'  ? true : signedPriv;

      if (type === 'agb')     setSignedAGB(true);
      if (type === 'privacy') setSignedPriv(true);
      setActiveDoc(null);

      toast.success(type === 'agb'
        ? (lang === 'de' ? '✅ AGB akzeptiert!' : '✅ Terms accepted!')
        : (lang === 'de' ? '✅ Datenschutz akzeptiert!' : '✅ Privacy Policy accepted!')
      );

      // Both signed → redirect to onboarding (company data) or dashboard
      if (newSignedAGB && newSignedPriv) {
        toast.success(lang === 'de' ? '🎉 Alle Dokumente akzeptiert! Weiterleitung...' : '🎉 All documents accepted! Redirecting...');
        setTimeout(() => { window.location.href = '/onboarding'; }, 1500);
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(null);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const signLegalSubtitle =
    lang === 'de' ? 'Bitte lesen und akzeptieren Sie beide Dokumente, um PDR Connect nutzen zu können.' :
    lang === 'es' ? 'Por favor lea y acepte ambos documentos para usar PDR Connect.' :
    lang === 'el' ? 'Παρακαλώ διαβάστε και αποδεχτείτε και τα δύο έγγραφα για να χρησιμοποιήσετε το PDR Connect.' :
    'Please read and accept both documents to use PDR Connect.';

  return (
    <div className="pb-20">
      {/* Consistent header with real logo + language + logout */}
      <LegalPageHeader
        variant="agb"
        showLangSwitch
        showLogout
        onLogout={handleLogout}
        subtitle={signLegalSubtitle}
      />

      <div className="max-w-3xl mx-auto px-4 pt-6 space-y-6">

      {/* Progress */}
      <div className="grid grid-cols-2 gap-4">
        {/* AGB Card */}
        <button
          onClick={() => !signedAGB && setActiveDoc(activeDoc === 'agb' ? null : 'agb')}
          className={`rounded-2xl border-2 p-5 text-left transition ${signedAGB ? 'border-green-400 bg-green-50 cursor-default' : activeDoc === 'agb' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white hover:border-brand-300 cursor-pointer'}`}
        >
          <div className="flex items-start gap-3">
            <div className="text-3xl">{signedAGB ? '✅' : '📋'}</div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">
                {lang === 'de' ? 'AGB' : lang === 'es' ? 'Términos (AGB)' : lang === 'el' ? 'ΓΟΣ (AGB)' : 'Terms & Conditions (AGB)'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {lang === 'de' ? 'Nutzungsbedingungen' : lang === 'es' ? 'Condiciones de uso' : lang === 'el' ? 'Όροι χρήσης' : 'Platform usage rules'}
              </p>
              {signedAGB
                ? <p className="text-xs text-green-600 font-semibold mt-1">✓ {lang === 'de' ? 'Akzeptiert' : 'Accepted'}</p>
                : <p className="text-xs text-brand-600 font-semibold mt-2 flex items-center gap-1">
                    <ChevronDown className="h-3 w-3" />
                    {activeDoc === 'agb' ? (lang === 'de' ? 'Schließen' : 'Close') : (lang === 'de' ? 'Lesen & Akzeptieren' : 'Read & Accept')}
                  </p>
              }
            </div>
          </div>
        </button>

        {/* Privacy Card */}
        <button
          onClick={() => !signedPriv && setActiveDoc(activeDoc === 'privacy' ? null : 'privacy')}
          className={`rounded-2xl border-2 p-5 text-left transition ${signedPriv ? 'border-green-400 bg-green-50 cursor-default' : activeDoc === 'privacy' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-purple-300 cursor-pointer'}`}
        >
          <div className="flex items-start gap-3">
            <div className="text-3xl">{signedPriv ? '✅' : '🔒'}</div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">
                {lang === 'de' ? 'Datenschutzerklärung' : lang === 'es' ? 'Política de Privacidad' : lang === 'el' ? 'Πολιτική Απορρήτου' : 'Privacy Policy'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {lang === 'de' ? 'DSGVO-konforme Datenverarbeitung' : lang === 'es' ? 'Protección RGPD' : lang === 'el' ? 'Προστασία ΓΚΠΔ' : 'GDPR data handling'}
              </p>
              {signedPriv
                ? <p className="text-xs text-green-600 font-semibold mt-1">✓ {lang === 'de' ? 'Akzeptiert' : 'Accepted'}</p>
                : <p className="text-xs text-purple-600 font-semibold mt-2 flex items-center gap-1">
                    <ChevronDown className="h-3 w-3" />
                    {activeDoc === 'privacy' ? (lang === 'de' ? 'Schließen' : 'Close') : (lang === 'de' ? 'Lesen & Akzeptieren' : 'Read & Accept')}
                  </p>
              }
            </div>
          </div>
        </button>
      </div>

      {/* AGB Document Viewer */}
      {activeDoc === 'agb' && !signedAGB && (
        <div className="rounded-2xl border-2 border-brand-300 bg-white overflow-hidden">
          <div className="bg-brand-600 px-6 py-4">
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" /> {agbContent.title}
            </h2>
            <p className="text-brand-200 text-sm">{agbContent.subtitle}</p>
          </div>
          <div
            ref={agbScrollRef}
            className="p-6 max-h-96 overflow-y-auto space-y-4"
            onScroll={e => {
              const el = e.currentTarget;
              if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) setReadAGB(true);
            }}
          >
            {agbContent.sections.map((s: any, i: number) => (
              <div key={i}>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{s.h}</h3>
                {s.p && <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{s.p}</p>}
                {s.list && <ul className="space-y-1 mt-1">{s.list.map((item: string, j: number) => <li key={j} className="text-sm text-gray-700 flex gap-2"><span className="text-brand-500 mt-1 flex-shrink-0">•</span>{item}</li>)}</ul>}
                {s.p2 && <p className="text-xs text-gray-500 italic mt-1 whitespace-pre-line">{s.p2}</p>}
              </div>
            ))}
          </div>
          <div className="px-6 py-4 bg-brand-50 border-t border-brand-200 space-y-3">
            {!readAGB && (
              <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs font-medium">
                <ChevronDown className="h-4 w-4 animate-bounce flex-shrink-0" />
                {lang === 'de' ? 'Bitte scrollen Sie bis zum Ende des Dokuments, bevor Sie akzeptieren können.' :
                 'Please scroll to the end of the document before you can accept.'}
              </div>
            )}
            <label className={`flex items-start gap-3 ${readAGB ? 'cursor-pointer' : 'opacity-40 pointer-events-none'}`}>
              <input type="checkbox" checked={checkedAGB} onChange={e => setCheckedAGB(e.target.checked)} disabled={!readAGB} className="h-5 w-5 rounded border-gray-300 text-brand-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-800 font-medium">
                {lang === 'de'
                  ? `Ich, ${signerName || '...'}, habe die AGB gelesen und akzeptiere sie vollständig.`
                  : `I, ${signerName || '...'}, have read and fully accept the Terms & Conditions.`}
              </span>
            </label>
            <button
              onClick={() => signDocument('agb', checkedAGB)}
              disabled={!checkedAGB || !readAGB || saving === 'agb'}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 text-white py-3 font-bold text-sm hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving === 'agb'
                ? <><Loader2 className="h-4 w-4 animate-spin" /> {lang === 'de' ? 'Speichern...' : 'Saving...'}</>
                : <><CheckCircle className="h-4 w-4" /> {lang === 'de' ? 'AGB akzeptieren & bestätigen' : 'Accept & Confirm'}</>}
            </button>
          </div>
        </div>
      )}

      {/* Privacy Document Viewer */}
      {activeDoc === 'privacy' && !signedPriv && (
        <div className="rounded-2xl border-2 border-purple-300 bg-white overflow-hidden">
          <div className="bg-purple-600 px-6 py-4">
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" /> {privContent.title}
            </h2>
          </div>
          <div
            ref={privScrollRef}
            className="p-6 max-h-96 overflow-y-auto space-y-4"
            onScroll={e => {
              const el = e.currentTarget;
              if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) setReadPriv(true);
            }}
          >
            {privContent.sections.map((s, i) => (
              <div key={i}>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{s.h}</h3>
                {s.p && <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{s.p}</p>}
                {s.list && <ul className="space-y-1 mt-1">{s.list.map((item, j) => <li key={j} className="text-sm text-gray-700 flex gap-2"><span className="text-purple-500 mt-1 flex-shrink-0">•</span>{item}</li>)}</ul>}
                {s.p2 && <p className="text-xs text-gray-500 italic mt-1">{s.p2}</p>}
              </div>
            ))}
          </div>
          <div className="px-6 py-4 bg-purple-50 border-t border-purple-200 space-y-3">
            {!readPriv && (
              <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs font-medium">
                <ChevronDown className="h-4 w-4 animate-bounce flex-shrink-0" />
                {lang === 'de' ? 'Bitte scrollen Sie bis zum Ende des Dokuments, bevor Sie akzeptieren können.' :
                 'Please scroll to the end of the document before you can accept.'}
              </div>
            )}
            <label className={`flex items-start gap-3 ${readPriv ? 'cursor-pointer' : 'opacity-40 pointer-events-none'}`}>
              <input type="checkbox" checked={checkedPriv} onChange={e => setCheckedPriv(e.target.checked)} disabled={!readPriv} className="h-5 w-5 rounded border-gray-300 text-purple-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-800 font-medium">
                {lang === 'de'
                  ? `Ich, ${signerName || '...'}, habe die Datenschutzerklärung gelesen und akzeptiere die Datenverarbeitung gemäß DSGVO.`
                  : `I, ${signerName || '...'}, have read and accept the Privacy Policy and GDPR data processing.`}
              </span>
            </label>
            <button
              onClick={() => signDocument('privacy', checkedPriv)}
              disabled={!checkedPriv || !readPriv || saving === 'privacy'}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 text-white py-3 font-bold text-sm hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving === 'privacy'
                ? <><Loader2 className="h-4 w-4 animate-spin" /> {lang === 'de' ? 'Speichern...' : 'Saving...'}</>
                : <><CheckCircle className="h-4 w-4" /> {lang === 'de' ? 'Datenschutz akzeptieren' : 'Accept Privacy Policy'}</>}
            </button>
          </div>
        </div>
      )}

      {/* All signed */}
      {signedAGB && signedPriv && (
        <div className="rounded-2xl bg-green-50 border-2 border-green-400 p-6 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <p className="font-bold text-green-800 text-lg">
            {lang === 'de' ? 'Alle Dokumente akzeptiert!' : 'All documents accepted!'}
          </p>
          <p className="text-green-700 text-sm mt-1">
            {lang === 'de' ? 'Sie werden jetzt weitergeleitet...' : 'You will be redirected now...'}
          </p>
          <button
            onClick={() => window.location.href = '/onboarding'}
            className="mt-4 rounded-xl bg-green-600 text-white px-8 py-3 font-bold text-sm hover:bg-green-700 transition"
          >
            {lang === 'de' ? '→ Weiter' : '→ Continue'}
          </button>
        </div>
      )}

      </div>
    </div>
  );
}
