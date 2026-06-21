'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { createClient } from '@/lib/supabase/client';
import {
  COUNTRIES, PHONE_CODES, EUROPEAN_COUNTRY_CODES, parsePhone,
} from '@/types/database';
import AGB_CONTENT from '@/lib/agb-content';
import {
  Building2, FileText, ShieldCheck,
  CheckCircle, Upload, Loader2, X, ScrollText, ChevronRight,
  Check, AlertTriangle, Globe, LogOut,
} from 'lucide-react';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';

/* ─── Step indicator ────────────────────────────────────── */
const STEP_ICONS = [Building2, FileText, ShieldCheck];

function StepIndicator({ current, labels }: { current: number; labels: [string, string, string] }) {
  return (
    <div className="flex items-center justify-between mb-8">
      {labels.map((label, i) => {
        const id = i + 1;
        const done   = current > id;
        const active = current === id;
        const Icon   = STEP_ICONS[i];
        return (
          <div key={id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                done   ? 'bg-green-500 border-green-500'  :
                active ? 'bg-brand-600 border-brand-600'  :
                         'bg-white border-gray-300'
              }`}>
                {done
                  ? <Check className="h-5 w-5 text-white" />
                  : <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-400'}`} />
                }
              </div>
              <span className={`mt-1.5 text-xs font-medium whitespace-nowrap ${
                active ? 'text-brand-700' : done ? 'text-green-600' : 'text-gray-400'
              }`}>{label}</span>
            </div>
            {i < labels.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 mb-4 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── AGB scroll-modal ──────────────────────────────────── */
function AgbModal({ onAccept, onClose, lang }: { onAccept: () => void; onClose: () => void; lang: string }) {
  const agb = AGB_CONTENT[lang] ?? AGB_CONTENT['de'] ?? AGB_CONTENT['en'];
  const [canAccept, setCanAccept] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 40) setCanAccept(true);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-brand-600" />
            <h2 className="text-xl font-bold text-gray-900">{agb.title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
            <X className="h-5 w-5" />
          </button>
        </div>
        {!canAccept && (
          <div className="px-6 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-700 flex items-center gap-2">
            <span>↓</span>
            <span>{agb.scrollHint}</span>
          </div>
        )}
        <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {agb.sections.map((s) => (
            <div key={s.h}>
              <h3 className="font-bold text-gray-900 text-sm mt-4 mb-1">{s.h}</h3>
              {s.p && <p className="text-sm text-gray-700 leading-relaxed" style={{ whiteSpace: 'pre-line' }}>{s.p}</p>}
              {s.list && (
                <ul className="list-disc pl-5 space-y-0.5 text-sm text-gray-700 mt-1">
                  {s.list.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
              {s.p2 && <p className="text-sm text-gray-700 leading-relaxed mt-1">{s.p2}</p>}
            </div>
          ))}
          <div className="h-4" />
        </div>
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button onClick={onClose}
            className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
            {agb.closeBtn}
          </button>
          <button onClick={() => { onAccept(); onClose(); }} disabled={!canAccept}
            className={`flex-grow-[2] rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              canAccept ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}>
            {canAccept ? '✓ ' : '↓ '}{agb.acceptBtn}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────── */
export default function OnboardingPage() {
  const router  = useRouter();
  const { t, i18n } = useTranslation();
  const supabase = createClient();

  const rawLang = i18n.language?.split('-')[0] ?? 'de';
  const currentLocale = (locales.includes(rawLang as Locale) ? rawLang : 'en') as Locale;

  const [step,    setStep]    = useState(1);
  const [uid,     setUid]     = useState('');
  const [loading, setLoading] = useState(true);

  /* ── Step 1: company data ── */
  const [fullName,           setFullName]           = useState('');
  const [phoneCode,          setPhoneCode]          = useState('+49');
  const [phoneNumber,        setPhoneNumber]        = useState('');
  const [companyName,        setCompanyName]        = useState('');
  const [companyStreet,      setCompanyStreet]      = useState('');
  const [companyHouseNumber, setCompanyHouseNumber] = useState('');
  const [companyZip,         setCompanyZip]         = useState('');
  const [companyCountry,     setCompanyCountry]     = useState('');
  const [vatId,              setVatId]              = useState('');
  const [countries,          setCountries]          = useState<string[]>([]);

  /* ── Step 2: document upload ── */
  const [hasCompanyDoc,  setHasCompanyDoc]  = useState(false);
  const [docUploading,   setDocUploading]   = useState(false);

  /* ── Step 3: AGB / GDPR ── */
  const [showAgbModal, setShowAgbModal] = useState(false);
  const [agbAccepted,  setAgbAccepted]  = useState(false);
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [submitting,   setSubmitting]   = useState(false);

  /* ── load current profile ── */
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUid(user.id);
      const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
      if (data) {
        setFullName(data.full_name ?? '');
        const parsed = parsePhone(data.phone ?? '');
        setPhoneCode(parsed.code);
        setPhoneNumber(parsed.num);
        setCompanyName(data.company_name ?? '');
        setCompanyStreet(data.company_street ?? '');
        setCompanyHouseNumber(data.company_house_number ?? '');
        setCompanyZip(data.company_zip ?? '');
        setCompanyCountry(data.company_country ?? '');
        setVatId(data.vat_id ?? '');
        setCountries(data.available_countries ?? []);
      }
      const { data: docs } = await supabase
        .from('documents').select('id')
        .eq('user_id', user.id).eq('type', 'COMPANY_DOC').limit(1);
      setHasCompanyDoc((docs?.length ?? 0) > 0);
      setLoading(false);
    })();
  }, []);

  const needsVat = companyCountry && EUROPEAN_COUNTRY_CODES.has(companyCountry);

  /* ── sign out ── */
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  /* ─── Step 1 save → direct to dashboard ─── */
  const saveStep1 = async () => {
    if (!fullName.trim())           { toast.error(t('onboarding.step1.errName'));     return; }
    if (!phoneNumber.trim())        { toast.error(t('onboarding.step1.errPhone'));    return; }
    if (!companyName.trim())        { toast.error(t('onboarding.step1.errCompany')); return; }
    if (!companyStreet.trim())      { toast.error(t('onboarding.step1.errStreet'));   return; }
    if (!companyHouseNumber.trim()) { toast.error(t('onboarding.step1.errHouse'));    return; }
    if (!companyZip.trim())         { toast.error(t('onboarding.step1.errZip'));      return; }
    if (!companyCountry)            { toast.error(t('onboarding.step1.errCountry'));  return; }
    // EU companies must provide VAT ID
    if (needsVat && !vatId.trim())  {
      toast.error(
        t('onboarding.step1.errVat') ||
        (companyCountry === 'DE' ? 'Pflichtfeld für EU-Unternehmen: USt-IdNr.' :
         companyCountry === 'AT' ? 'Pflichtfeld für EU-Unternehmen: UID-Nummer' :
         'VAT ID is required for EU companies')
      );
      return;
    }

    setLoading(true);
    const fullPhone = `${phoneCode} ${phoneNumber.trim()}`;
    const { error } = await supabase.from('users').update({
      full_name:            fullName.trim(),
      phone:                fullPhone,
      company_name:         companyName.trim(),
      company_street:       companyStreet.trim(),
      company_house_number: companyHouseNumber.trim(),
      company_zip:          companyZip.trim(),
      company_country:      companyCountry,
      vat_id:               vatId.trim() || null,
      available_countries:  countries.length > 0 ? countries : [companyCountry],
    }).eq('id', uid);
    setLoading(false);
    if (error) { toast.error(error.message); return; }

    // Profile complete → go to dashboard (documents can be uploaded later)
    toast.success(t('onboarding.step1.saved') || '✅ Profile saved! Welcome to PDR Connect.');
    setTimeout(() => router.push('/dashboard'), 1000);
  };

  /* ─── Step 2: company doc upload ─── */
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Max. 10 MB'); return; }
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) { toast.error('PDF, JPG, PNG'); return; }

    setDocUploading(true);
    const ext  = file.name.split('.').pop();
    const path = `${uid}/COMPANY_DOC_${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('documents').upload(path, file);
    if (uploadError) { toast.error(uploadError.message); setDocUploading(false); return; }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const fileUrl = `${supabaseUrl}/storage/v1/object/public/documents/${path}`;
    const { error: dbError } = await supabase.from('documents').insert({
      user_id: uid, type: 'COMPANY_DOC', file_url: fileUrl, status: 'pending',
    });
    setDocUploading(false);
    if (dbError) { toast.error(dbError.message); return; }
    setHasCompanyDoc(true);
    toast.success(`${t('onboarding.step2.docUploaded')} ✓`);
    fetch('/api/admin/notify-new-doc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docType: 'COMPANY_DOC' }),
    }).catch(() => {});
    e.target.value = '';
  };

  /* ─── Step 3: submit for verification ─── */
  const submitForVerification = async () => {
    if (!agbAccepted)  { toast.error(t('onboarding.step3.errAgb'));  return; }
    if (!gdprAccepted) { toast.error(t('onboarding.step3.errGdpr')); return; }

    setSubmitting(true);
    await supabase.from('users').update({
      agb_accepted:    true,
      agb_accepted_at: new Date().toISOString(),
      gdpr_consent:    true,
    }).eq('id', uid);

    const res  = await fetch('/api/verification/request', { method: 'POST' });
    const json = await res.json();
    setSubmitting(false);
    if (!res.ok) { toast.error(json.error ?? 'Error'); return; }
    // Redirect to dashboard — users can browse freely while verification is pending.
    // The pending-approval gate has been removed; verified status is shown as a banner.
    router.push('/dashboard');
    router.refresh();
  };

  if (loading && step === 1) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <>
      {showAgbModal && (
        <AgbModal
          onAccept={() => setAgbAccepted(true)}
          onClose={() => setShowAgbModal(false)}
          lang={currentLocale}
        />
      )}

      {/* Top bar: language switcher + sign out */}
      <div className="flex items-center justify-between mb-6">
        <select
          value={currentLocale}
          onChange={e => i18n.changeLanguage(e.target.value)}
          className="text-xs rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
        >
          {locales.map(code => (
            <option key={code} value={code}>{localeFlags[code]} {localeNames[code]}</option>
          ))}
        </select>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition"
        >
          <LogOut className="h-4 w-4" />
          {t('onboarding.signOut')}
        </button>
      </div>

      {/* Mandatory step banner */}
      <div className="rounded-xl bg-amber-50 border-2 border-amber-400 p-4 flex gap-3 items-start mb-2">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-amber-800 text-sm">
            {t('onboarding.mandatoryBanner') || 'Schritt 2 von 2 — Firmendaten erforderlich'}
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            {t('onboarding.mandatoryDesc') || 'Bitte füllen Sie alle Felder aus. Ohne vollständige Firmendaten erhalten Sie keinen Zugang zum Dashboard. EU-Unternehmen müssen ihre USt-IdNr. angeben.'}
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-semibold text-brand-700 mb-4">
          <ShieldCheck className="h-4 w-4" />
          {t('onboarding.badge')}
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">{t('onboarding.title')}</h1>
        <p className="text-gray-500 mt-2 text-sm">{t('onboarding.subtitle')}</p>
      </div>

      <StepIndicator
        current={step}
        labels={[
          t('onboarding.step1Label'),
          t('onboarding.step2Label'),
          t('onboarding.step3Label'),
        ]}
      />

      {/* ═══════════ STEP 1 — COMPANY DATA ═══════════ */}
      {step === 1 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-5 w-5 text-brand-600" />
            <h2 className="text-lg font-bold text-gray-900">{t('onboarding.step1.title')}</h2>
          </div>
          <p className="text-sm text-gray-500 -mt-3">{t('onboarding.step1.allRequired')}</p>

          {/* Contact name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('onboarding.step1.contactName')} <span className="text-red-400">*</span>
            </label>
            <input value={fullName} onChange={e => setFullName(e.target.value)}
              className="input" placeholder={t('profile.contactNameEx')} />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('onboarding.step1.phone')} <span className="text-red-400">*</span>
            </label>
            <div className="flex">
              <select value={phoneCode} onChange={e => setPhoneCode(e.target.value)}
                className="rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                style={{ minWidth: '90px' }}>
                {PHONE_CODES.map(({ code, flag, name }) => (
                  <option key={`${code}-${name}`} value={code}>{flag} {code}</option>
                ))}
              </select>
              <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/[^\d\s\-().]/g, ''))}
                type="tel"
                className="flex-1 rounded-r-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="123 456789" />
            </div>
          </div>

          {/* Company name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('onboarding.step1.companyName')} <span className="text-red-400">*</span>
            </label>
            <input value={companyName} onChange={e => setCompanyName(e.target.value)}
              className="input" placeholder={t('profile.companyNameEx')} />
          </div>

          {/* Address row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('onboarding.step1.street')} <span className="text-red-400">*</span>
              </label>
              <input value={companyStreet} onChange={e => setCompanyStreet(e.target.value)}
                className="input" placeholder={t('profile.streetEx')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('onboarding.step1.houseNumber')} <span className="text-red-400">*</span>
              </label>
              <input value={companyHouseNumber} onChange={e => setCompanyHouseNumber(e.target.value)}
                className="input" placeholder="42" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('onboarding.step1.zip')} <span className="text-red-400">*</span>
              </label>
              <input value={companyZip} onChange={e => setCompanyZip(e.target.value)}
                className="input" placeholder="10115" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('onboarding.step1.country')} <span className="text-red-400">*</span>
              </label>
              <select value={companyCountry} onChange={e => setCompanyCountry(e.target.value)} className="input">
                <option value="">{t('onboarding.step1.countryPlaceholder')}</option>
                {COUNTRIES.map(({ code, name }) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* VAT — only for European countries */}
          {needsVat && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('onboarding.step1.vatId')} <span className="text-red-400">*</span>
              </label>
              <input value={vatId} onChange={e => setVatId(e.target.value)}
                className="input font-mono tracking-wide" placeholder="DE123456789" />
              <p className="text-xs text-gray-400 mt-1">{t('onboarding.step1.vatHint')}</p>
            </div>
          )}

          {/* ── Available Countries ── */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-brand-600" />
              {t('onboarding.step1.availableCountries')}
              <span className="text-red-400">*</span>
            </p>
            <p className="text-xs text-gray-400 mb-2">{t('onboarding.step1.availableCountriesHint')}</p>
            {countries.length === 0 && (
              <p className="text-xs text-red-500 font-medium mb-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {t('onboarding.step1.noCountries')}
              </p>
            )}
            {countries.length > 0 && (
              <p className="text-xs text-brand-600 font-medium mb-2">
                {t('onboarding.step1.countriesSelected', { count: countries.length })}
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1 border border-gray-100 rounded-xl p-3 bg-gray-50">
              {COUNTRIES.map(({ code, name }) => {
                const sel = countries.includes(code);
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setCountries(prev =>
                      sel ? prev.filter(c => c !== code) : [...prev, code]
                    )}
                    className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition ${
                      sel
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={saveStep1} disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
            {t('onboarding.step1.next')}
          </button>
        </div>
      )}

      {/* ═══════════ STEP 2 — DOCUMENT UPLOAD ═══════════ */}
      {step === 2 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-5 w-5 text-brand-600" />
            <h2 className="text-lg font-bold text-gray-900">{t('onboarding.step2.title')}</h2>
          </div>
          <p className="text-sm text-gray-500 -mt-3">{t('onboarding.step2.subtitle')}</p>

          {hasCompanyDoc ? (
            <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-800 text-sm">{t('onboarding.step2.docUploaded')}</p>
                <p className="text-xs text-green-600">{t('onboarding.step2.docUploadedSub')}</p>
              </div>
              <label className="ml-auto cursor-pointer text-xs text-green-700 underline hover:text-green-900">
                {t('onboarding.step2.replace')}
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                  onChange={handleDocUpload} disabled={docUploading} />
              </label>
            </div>
          ) : (
            <label className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition cursor-pointer ${
              docUploading ? 'opacity-50 cursor-wait border-gray-200 bg-gray-50'
                           : 'border-gray-300 hover:border-brand-400 hover:bg-brand-50'
            }`}>
              {docUploading
                ? <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                : <Upload className="h-8 w-8 text-gray-400" />}
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  {docUploading ? t('onboarding.step2.uploading') : t('onboarding.step2.uploadLabel')}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{t('onboarding.step2.uploadHint')}</p>
              </div>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                onChange={handleDocUpload} disabled={docUploading} />
            </label>
          )}

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              <strong>{t('onboarding.step2.noticeBold')}:</strong>{' '}
              {t('onboarding.step2.noticeRest')}
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              {t('onboarding.step2.back')}
            </button>
            <button onClick={() => {
              if (!hasCompanyDoc) { toast.error(t('onboarding.step2.errDoc')); return; }
              setStep(3);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} className="flex-[2] btn-primary flex items-center justify-center gap-2">
              <ChevronRight className="h-4 w-4" />
              {t('onboarding.step2.next')}
            </button>
          </div>
        </div>
      )}

      {/* ═══════════ STEP 3 — AGB + SUBMIT ═══════════ */}
      {step === 3 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-5 w-5 text-brand-600" />
            <h2 className="text-lg font-bold text-gray-900">{t('onboarding.step3.title')}</h2>
          </div>

          {/* AGB Card */}
          <div className="rounded-xl border-2 border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-brand-600" />
              <span className="text-sm font-semibold text-gray-800">{t('onboarding.step3.agbTitle')}</span>
              <span className="ml-auto text-xs text-red-500 font-medium">{t('onboarding.step3.required')}</span>
            </div>
            {agbAccepted ? (
              <div className="px-4 py-3 flex items-center gap-3 bg-green-50">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-800">{t('onboarding.step3.agbAccepted')}</p>
                  <p className="text-xs text-green-600">{t('onboarding.step3.agbAcceptedSub')}</p>
                </div>
                <button onClick={() => setShowAgbModal(true)}
                  className="text-xs text-green-700 underline hover:text-green-900">
                  {t('onboarding.step3.agbReadAgain')}
                </button>
              </div>
            ) : (
              <div className="px-4 py-3">
                <p className="text-sm text-gray-600 mb-3">{t('onboarding.step3.agbPrompt')}</p>
                <button onClick={() => setShowAgbModal(true)}
                  className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition flex items-center justify-center gap-2">
                  <ScrollText className="h-4 w-4" />
                  {t('onboarding.step3.agbButton')}
                </button>
              </div>
            )}
          </div>

          {/* GDPR */}
          <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-gray-200 bg-gray-50 p-4">
            <input
              type="checkbox"
              checked={gdprAccepted}
              onChange={e => setGdprAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-600 leading-relaxed">
              {t('onboarding.step3.gdprPre')}{' '}
              <a href="/privacy" target="_blank" className="text-brand-600 hover:underline font-medium">
                {t('onboarding.step3.gdprLink')}
              </a>
              {' '}{t('onboarding.step3.gdprPost')}{' '}
              <span className="text-red-400">*</span>
            </span>
          </label>

          {/* Summary */}
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700 space-y-1">
            <p className="font-semibold">{t('onboarding.step3.whatNext')}</p>
            <ul className="list-disc pl-4 space-y-0.5 text-xs">
              <li>{t('onboarding.step3.whatNext1')}</li>
              <li>{t('onboarding.step3.whatNext2')}</li>
              <li>{t('onboarding.step3.whatNext3')}</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              {t('onboarding.step3.back')}
            </button>
            <button
              onClick={submitForVerification}
              disabled={submitting || !agbAccepted || !gdprAccepted}
              className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting
                ? <><Loader2 className="h-4 w-4 animate-spin" /> {t('onboarding.step3.submitting')}</>
                : <><ShieldCheck className="h-4 w-4" /> {t('onboarding.step3.submit')}</>
              }
            </button>
          </div>
        </div>
      )}
    </>
  );
}
