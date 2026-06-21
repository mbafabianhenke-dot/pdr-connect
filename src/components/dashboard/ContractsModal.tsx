'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import AGB_CONTENT from '@/lib/agb-content';
import PRIVACY_CONTENT from '@/lib/privacy-content';
import { generateLegalPDF } from '@/lib/generate-legal-pdf';
import { CheckCircle, FileText, Shield, ChevronDown, Loader2, LogOut, Globe } from 'lucide-react';

const LANGS = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'el', label: 'Ελληνικά', flag: '🇬🇷' },
];

const SUPPORTED_LANGS = ['en', 'de', 'es', 'el'] as const;
const LS_KEY = 'pdrconnect-lang';

/** Read language directly from localStorage — bypasses all i18n timing issues */
function readLang(): 'en'|'de'|'es'|'el' {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(LS_KEY)?.split('-')[0];
  if (stored && (SUPPORTED_LANGS as readonly string[]).includes(stored)) {
    return stored as 'en'|'de'|'es'|'el';
  }
  const nav = navigator.language?.split('-')[0];
  if (nav && (SUPPORTED_LANGS as readonly string[]).includes(nav)) {
    return nav as 'en'|'de'|'es'|'el';
  }
  return 'en';
}

export default function ContractsModal() {
  const { i18n } = useTranslation();

  // Use useState with initializer so it reads localStorage on first client render
  // This is 100% reliable — no i18n timing dependency
  const [lang, setLang] = useState<'en'|'de'|'es'|'el'>(() => readLang());

  // Keep lang in sync when user changes language via switcher
  useEffect(() => {
    const update = (lng: string) => {
      const l = lng.split('-')[0];
      if ((SUPPORTED_LANGS as readonly string[]).includes(l)) {
        setLang(l as 'en'|'de'|'es'|'el');
      }
    };
    i18n.on('languageChanged', update);
    // Also sync on mount in case i18n already has the right language
    const current = i18n.language?.split('-')[0];
    if (current && (SUPPORTED_LANGS as readonly string[]).includes(current) && current !== lang) {
      setLang(current as 'en'|'de'|'es'|'el');
    }
    return () => { i18n.off('languageChanged', update); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n]);

  const [loading,     setLoading]     = useState(true);
  const [show,        setShow]        = useState(false);
  const [userId,      setUserId]      = useState('');
  const [signerName,  setSignerName]  = useState('');
  const [signedAGB,   setSignedAGB]   = useState(false);
  const [signedPriv,  setSignedPriv]  = useState(false);
  const [step,        setStep]        = useState<'agb'|'privacy'>('agb');
  const [checked,     setChecked]     = useState(false);
  const [hasRead,     setHasRead]     = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [showLangs,   setShowLangs]   = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const agbContent  = AGB_CONTENT[lang]  ?? AGB_CONTENT.en;
  const privContent = PRIVACY_CONTENT[lang] ?? PRIVACY_CONTENT.en;

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from('users')
        .select('full_name, preferred_language')
        .eq('id', user.id)
        .single();

      setSignerName(profile?.full_name ?? '');

      // Set language from DB — most reliable source, persists across devices/sessions
      const dbLang = profile?.preferred_language;
      if (dbLang && (['en','de','es','el'] as string[]).includes(dbLang)) {
        setLang(dbLang as 'en'|'de'|'es'|'el');
        i18n.changeLanguage(dbLang);
        localStorage.setItem('pdrconnect-lang', dbLang);
      }

      const { data: existing, error } = await supabase
        .from('contracts')
        .select('version')
        .eq('user_id', user.id)
        .eq('signed', true);

      // If table doesn't exist yet, skip modal
      if (error) { setLoading(false); return; }

      let hasAGB = false, hasPriv = false;
      for (const c of existing ?? []) {
        if (c.version === 'agb')     hasAGB  = true;
        if (c.version === 'privacy') hasPriv = true;
      }
      setSignedAGB(hasAGB);
      setSignedPriv(hasPriv);

      if (!hasAGB || !hasPriv) {
        setStep(!hasAGB ? 'agb' : 'privacy');
        setShow(true);
      }
      setLoading(false);
    };
    init();
  }, []);

  // Reset scroll/read state when step changes
  useEffect(() => {
    setChecked(false);
    setHasRead(false);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [step]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const changeLang = (code: string) => {
    i18n.changeLanguage(code);
    setShowLangs(false);
  };

  const signDocument = async () => {
    if (!checked || !hasRead) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const signedAt = new Date().toISOString();

      // ── Step 1: Insert contract record ─────────────────────────────
      const { data: inserted, error } = await supabase
        .from('contracts')
        .insert({
          user_id:   userId,
          version:   step,
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
        type:        step,
        lang,
        signerName:  signerName || 'PDR Connect User',
        signerEmail: profile?.email ?? '',
        signedAt,
        contractId:  inserted.id,
      });

      // ── Step 3: Upload PDF ─────────────────────────────────────────
      const filename    = `${step.toUpperCase()}_${lang.toUpperCase()}_${Date.now()}.pdf`;
      const storagePath = `${userId}/legal/${filename}`;

      const { error: uploadErr } = await supabase.storage
        .from('documents')
        .upload(storagePath, pdfBlob, { contentType: 'application/pdf', upsert: false });

      if (!uploadErr) {
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(storagePath);
        if (urlData?.publicUrl) {
          await supabase
            .from('contracts')
            .update({ pdf_url: urlData.publicUrl })
            .eq('id', inserted.id);
        }
      }
      // Upload failure is non-blocking — contract is saved; view API generates HTML on-demand

      // ── Step 4: Update UI state ────────────────────────────────────
      if (step === 'agb') {
        setSignedAGB(true);
        if (!signedPriv) {
          setStep('privacy');
          toast.success(lang === 'de' ? '✅ AGB akzeptiert! Bitte jetzt die Datenschutzerklärung lesen.' : '✅ Terms accepted! Please read the Privacy Policy now.');
        } else {
          setShow(false);
          toast.success(lang === 'de' ? '🎉 Alle Dokumente akzeptiert!' : '🎉 All documents accepted!');
        }
      } else {
        setSignedPriv(true);
        if (!signedAGB) {
          setStep('agb');
          toast.success(lang === 'de' ? '✅ Datenschutz akzeptiert! Bitte jetzt die AGB lesen.' : '✅ Privacy accepted! Please read the Terms now.');
        } else {
          setShow(false);
          toast.success(lang === 'de' ? '🎉 Alle Dokumente akzeptiert!' : '🎉 All documents accepted!');
        }
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !show) return null;

  const currentContent  = step === 'agb' ? agbContent  : privContent;
  const isAgb           = step === 'agb';
  const accentColor     = isAgb ? 'brand' : 'purple';
  const stepNum         = (!signedAGB && !signedPriv) ? (isAgb ? 1 : 2) : (!signedAGB ? 1 : 2);
  const totalSteps      = (!signedAGB || !signedPriv) ? ((!signedAGB && !signedPriv) ? 2 : 1) : 0;

  const t = {
    title:     lang === 'de' ? 'Bitte Dokumente akzeptieren' : lang === 'es' ? 'Por favor acepte los documentos' : lang === 'el' ? 'Παρακαλώ αποδεχτείτε τα έγγραφα' : 'Please accept the documents',
    subtitle:  lang === 'de' ? 'Bevor Sie PDR Connect nutzen können, müssen Sie die AGB und Datenschutzerklärung lesen und akzeptieren.' : lang === 'es' ? 'Antes de usar PDR Connect, debe leer y aceptar los Términos y la Política de Privacidad.' : lang === 'el' ? 'Πριν χρησιμοποιήσετε το PDR Connect, πρέπει να διαβάσετε και να αποδεχτείτε τους Όρους και την Πολιτική Απορρήτου.' : 'Before using PDR Connect, you must read and accept the Terms & Conditions and Privacy Policy.',
    scrollHint:lang === 'de' ? 'Bitte bis zum Ende scrollen, um akzeptieren zu können.' : lang === 'es' ? 'Por favor desplácese hasta el final para poder aceptar.' : lang === 'el' ? 'Παρακαλώ κυλήστε μέχρι το τέλος για να αποδεχτείτε.' : 'Please scroll to the end to be able to accept.',
    accept:    lang === 'de' ? `Ich, ${signerName || '...'}, habe das Dokument vollständig gelesen und akzeptiere es.` : lang === 'es' ? `Yo, ${signerName || '...'}, he leído y acepto este documento.` : lang === 'el' ? `Εγώ, ${signerName || '...'}, έχω διαβάσει και αποδέχομαι αυτό το έγγραφο.` : `I, ${signerName || '...'}, have read and accept this document.`,
    btnSign:   lang === 'de' ? 'Akzeptieren & Weiter' : lang === 'es' ? 'Aceptar y Continuar' : lang === 'el' ? 'Αποδοχή & Συνέχεια' : 'Accept & Continue',
    btnSaving: lang === 'de' ? 'Speichern...' : 'Saving...',
    logout:    lang === 'de' ? 'Abmelden' : lang === 'es' ? 'Cerrar sesión' : lang === 'el' ? 'Αποσύνδεση' : 'Log out',
    step:      lang === 'de' ? `Schritt ${stepNum} von ${totalSteps}` : lang === 'es' ? `Paso ${stepNum} de ${totalSteps}` : lang === 'el' ? `Βήμα ${stepNum} από ${totalSteps}` : `Step ${stepNum} of ${totalSteps}`,
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black/60 backdrop-blur-sm">
      {/* Top bar: logo + lang + logout */}
      <div className="flex items-center justify-between bg-white/95 px-4 py-3 shadow-sm border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="text-white font-black text-xs">PDR</span>
          </div>
          <span className="font-bold text-gray-900 text-sm hidden sm:block">PDR Connect</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => setShowLangs(v => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              <Globe className="h-4 w-4" />
              <span>{LANGS.find(l => l.code === lang)?.flag} {lang.toUpperCase()}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            {showLangs && (
              <div className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-gray-200 bg-white shadow-lg z-10 overflow-hidden">
                {LANGS.map(l => (
                  <button
                    key={l.code}
                    onClick={() => changeLang(l.code)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition ${lang === l.code ? 'font-bold text-brand-700 bg-brand-50' : 'text-gray-700'}`}
                  >
                    <span>{l.flag}</span> {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:block">{t.logout}</span>
          </button>
        </div>
      </div>

      {/* Modal content */}
      <div className="flex flex-1 items-start justify-center overflow-y-auto p-4 pt-6">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className={`px-6 py-5 ${isAgb ? 'bg-brand-600' : 'bg-purple-600'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/80 text-xs font-medium uppercase tracking-wide">{t.step}</span>
              <div className="flex gap-1">
                <div className={`h-2 w-8 rounded-full ${!signedAGB ? 'bg-white' : 'bg-white/40'}`} />
                <div className={`h-2 w-8 rounded-full ${!signedPriv && signedAGB ? 'bg-white' : 'bg-white/40'}`} />
              </div>
            </div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              {isAgb ? <FileText className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
              {currentContent.title}
            </h2>
            <p className="text-white/80 text-sm mt-1">{t.subtitle}</p>
          </div>

          {/* Scrollable document */}
          <div
            ref={scrollRef}
            className="p-6 max-h-72 overflow-y-auto space-y-4 border-b border-gray-100"
            onScroll={e => {
              const el = e.currentTarget;
              if (el.scrollTop + el.clientHeight >= el.scrollHeight - 30) setHasRead(true);
            }}
          >
            {(currentContent as any).sections?.map((s: any, i: number) => (
              <div key={i}>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{s.h}</h3>
                {s.p  && <p  className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{s.p}</p>}
                {s.list && (
                  <ul className="space-y-1 mt-1">
                    {s.list.map((item: string, j: number) => (
                      <li key={j} className="text-sm text-gray-700 flex gap-2">
                        <span className={`mt-1 flex-shrink-0 ${isAgb ? 'text-brand-500' : 'text-purple-500'}`}>•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {s.p2 && <p className="text-xs text-gray-500 italic mt-1 whitespace-pre-line">{s.p2}</p>}
              </div>
            ))}
            {/* Invisible scroll anchor */}
            {!hasRead && <div className="h-4" />}
          </div>

          {/* Footer: scroll hint, checkbox, button */}
          <div className={`px-6 py-4 space-y-3 ${isAgb ? 'bg-brand-50' : 'bg-purple-50'}`}>
            {!hasRead && (
              <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs font-medium">
                <ChevronDown className="h-4 w-4 animate-bounce flex-shrink-0" />
                {t.scrollHint}
              </div>
            )}

            <label className={`flex items-start gap-3 ${hasRead ? 'cursor-pointer' : 'opacity-40 pointer-events-none'}`}>
              <input
                type="checkbox"
                checked={checked}
                onChange={e => setChecked(e.target.checked)}
                disabled={!hasRead}
                className={`h-5 w-5 rounded border-gray-300 mt-0.5 flex-shrink-0 ${isAgb ? 'text-brand-600' : 'text-purple-600'}`}
              />
              <span className="text-sm text-gray-800 font-medium">{t.accept}</span>
            </label>

            <button
              onClick={signDocument}
              disabled={!checked || !hasRead || saving}
              className={`w-full flex items-center justify-center gap-2 rounded-xl text-white py-3 font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${isAgb ? 'bg-brand-600 hover:bg-brand-700' : 'bg-purple-600 hover:bg-purple-700'}`}
            >
              {saving
                ? <><Loader2 className="h-4 w-4 animate-spin" /> {t.btnSaving}</>
                : <><CheckCircle className="h-4 w-4" /> {t.btnSign}</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
