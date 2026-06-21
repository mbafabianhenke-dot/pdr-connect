'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  FileText, Building2, Wrench, PenLine,
  CheckCircle, Download, ExternalLink, Upload,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import CONTRACTS from '@/lib/contract-content';
import { generateContractPDF } from '@/lib/generate-contract-pdf';
import SignatureModal from '@/components/contracts/SignatureModal';
import type { ContractDoc } from '@/lib/contract-content';

// ─────────────────────────────────────────────────────────────────────────────
// ContractView
// ─────────────────────────────────────────────────────────────────────────────
function ContractView({
  doc,
  contractType,
  signedUrl,
  onSign,
}: {
  doc: ContractDoc;
  contractType: 'client' | 'worker';
  signedUrl?: string;
  onSign: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">

      {/* Gradient header */}
      <div className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wide mb-3">
              {doc.badge}
            </span>
            <h2 className="text-2xl font-bold">{doc.title}</h2>
            <p className="mt-2 text-brand-200 text-sm max-w-xl">{doc.intro}</p>
          </div>

          <div className="flex flex-col gap-2 flex-shrink-0">
            {/* Sign button */}
            {!signedUrl ? (
              <button
                onClick={onSign}
                className="flex items-center gap-2 rounded-xl bg-white text-brand-700 hover:bg-brand-50 transition px-5 py-2.5 text-sm font-bold shadow"
              >
                <PenLine className="h-4 w-4" />
                {t('contracts.signBtn')}
              </button>
            ) : (
              <a
                href={signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-green-500 hover:bg-green-600 text-white transition px-5 py-2.5 text-sm font-bold shadow"
              >
                <Download className="h-4 w-4" />
                {t('contracts.downloadSigned')}
              </a>
            )}

            {/* Signed badge */}
            {signedUrl && (
              <span className="flex items-center justify-center gap-1 rounded-xl bg-green-400/20 border border-green-400/40 text-green-200 text-xs font-semibold px-3 py-1.5">
                <CheckCircle className="h-3.5 w-3.5" />
                {t('contracts.signedBadge')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Parties */}
      <div className="card">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide text-gray-500">
          <FileText className="h-4 w-4 text-brand-600" />
          {doc.parties.label}
        </h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="rounded-lg bg-brand-50 p-3 border-l-4 border-brand-500">
            <p className="font-semibold text-brand-800 text-xs uppercase tracking-wide mb-1">PDR Connect</p>
            <p className="leading-relaxed">{doc.parties.operator}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 border-l-4 border-gray-300">
            <p className="font-semibold text-gray-500 text-xs uppercase tracking-wide mb-1">
              {contractType === 'client' ? 'Client / Contractor' : 'Technician / Worker'}
            </p>
            <p className="leading-relaxed">{doc.parties.client}</p>
          </div>
        </div>
      </div>

      {/* Contract sections */}
      <div className="space-y-3">
        {doc.sections.map((s) => (
          <div key={s.h} className="card">
            <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">
              {s.h}
            </h3>
            {s.p && (
              <p className="text-sm text-gray-700 leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                {s.p}
              </p>
            )}
            {s.list && (
              <ul className="mt-2 space-y-1.5 text-sm text-gray-700">
                {s.list.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
            {s.p2 && (
              <p className="mt-3 text-sm text-gray-500 italic leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                {s.p2}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Bottom sign CTA */}
      {!signedUrl && (
        <div className="card bg-brand-50 border-brand-200 border">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-semibold text-brand-900">{t('contracts.readyToSign')}</p>
              <p className="text-sm text-brand-600 mt-0.5">{t('contracts.readyToSignDesc')}</p>
            </div>
            <button
              onClick={onSign}
              className="btn-primary flex items-center gap-2 flex-shrink-0"
            >
              <PenLine className="h-4 w-4" />
              {t('contracts.signBtn')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ContractsPage
// ─────────────────────────────────────────────────────────────────────────────
export default function ContractsPage() {
  const { i18n, t } = useTranslation();
  const lang = (i18n.language?.split('-')[0] ?? 'en') in CONTRACTS
    ? (i18n.language?.split('-')[0] as string)
    : 'en';

  const c = CONTRACTS[lang];

  // Check if this is a mandatory signing (came from dashboard gate)
  const isRequired = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('required') === '1'
    : false;

  const [activeTab,    setActiveTab]    = useState<'client' | 'worker' | 'privacy'>('client');
  const [showModal,    setShowModal]    = useState(false);
  const [signerName,   setSignerName]   = useState('');
  const [signerEmail,  setSignerEmail]  = useState('');
  const [uploading,    setUploading]    = useState(false);
  const [signedUrls,   setSignedUrls]   = useState<{ client?: string; worker?: string; privacy?: string }>({});
  const [userId,       setUserId]       = useState('');
  const [userRole,     setUserRole]     = useState<string>('worker');

  // Load user profile + existing signed contracts
  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      setSignerEmail(user.email ?? '');

      const { data: profile } = await supabase
        .from('users')
        .select('full_name, role')
        .eq('id', user.id)
        .single();
      setSignerName(profile?.full_name ?? '');

      // Auto-select the correct contract type based on user role
      const role = profile?.role ?? 'PDR_TECHNICIAN';
      setUserRole(role);
      const contractType = role === 'CUSTOMER' ? 'client' : 'worker';
      setActiveTab(contractType);

      // Load previously signed contracts
      const { data: contracts } = await supabase
        .from('contracts')
        .select('version, pdf_url')
        .eq('user_id', user.id)
        .eq('signed', true)
        .order('created_at', { ascending: false });

      if (contracts) {
        const urls: { client?: string; worker?: string; privacy?: string } = {};
        for (const ct of contracts) {
          if (ct.version === 'client'  && !urls.client)  urls.client  = ct.pdf_url;
          if (ct.version === 'worker'  && !urls.worker)  urls.worker  = ct.pdf_url;
          if (ct.version === 'privacy' && !urls.privacy) urls.privacy = ct.pdf_url;
        }
        setSignedUrls(urls);
      }
    };
    init();
  }, []);

  const handleSignComplete = async (signatureDataUrl: string, name: string) => {
    setUploading(true);

    try {
      // 1. Generate the PDF — privacy uses worker layout with privacy content
      const pdfContractType: 'client' | 'worker' = activeTab === 'privacy' ? 'worker' : (activeTab as 'client' | 'worker');
      const pdfBlob = await generateContractPDF({
        contractType: pdfContractType,
        signerName: name,
        signerEmail,
        signatureDataUrl,
      });

      // 2. Trigger immediate download for the user
      const blobUrl = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const docLabel = activeTab === 'privacy' ? 'Privacy-Policy' : activeTab === 'client' ? 'Client-AGB' : 'Worker-AGB';
      a.download = `PDR-Connect-${docLabel}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      // 3. Upload to Supabase Storage (documents bucket)
      const supabase = createClient();
      const filename = `SIGNED_CONTRACT_${activeTab.toUpperCase()}_${Date.now()}.pdf`;
      const storagePath = `${userId}/contracts/${filename}`;

      const { error: uploadErr } = await supabase.storage
        .from('documents')
        .upload(storagePath, pdfBlob, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(storagePath);

      // 4. Record in the contracts table
      const { error: dbErr } = await supabase.from('contracts').insert({
        user_id: userId,
        pdf_url: publicUrl,
        signed: true,
        signed_at: new Date().toISOString(),
        language: lang as any,
        version: activeTab,
      });

      if (dbErr) throw dbErr;

      // 5. Update local state
      setSignedUrls(prev => {
        const updated = { ...prev, [activeTab]: publicUrl };
        // Auto-redirect when BOTH required docs are signed
        const contractVersion = userRole === 'CUSTOMER' ? 'client' : 'worker';
        const bothSigned = updated[contractVersion as 'client' | 'worker'] && updated.privacy;
        if (isRequired && bothSigned) {
          toast.success(lang === 'de' ? '✅ Beide Dokumente unterzeichnet! Weiterleitung...' : '✅ Both documents signed! Redirecting...');
          setTimeout(() => { window.location.href = '/dashboard'; }, 2000);
        } else if (isRequired) {
          toast.success(t('contracts.signedSuccess'));
        } else {
          toast.success(t('contracts.signedSuccess'));
        }
        return updated;
      });
      setShowModal(false);

    } catch (err: any) {
      console.error('Contract signing error:', err);
      // PDF was already downloaded — just warn about the cloud save
      toast.error(t('contracts.uploadWarning'));
      setShowModal(false);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── MANDATORY SIGNING BANNER + ACTION CARDS ── */}
      {isRequired && (
        <div className="space-y-4">
          {/* Warning */}
          <div className="rounded-xl bg-red-50 border-2 border-red-400 p-5 flex gap-4 items-center">
            <div className="text-3xl flex-shrink-0">⚠️</div>
            <div>
              <p className="font-bold text-red-800 text-base">
                {lang === 'de' ? 'Pflicht: AGB & Datenschutz unterzeichnen' :
                 lang === 'es' ? 'Obligatorio: Firmar AGB y Protección de Datos' :
                 lang === 'el' ? 'Υποχρεωτικό: Υπογραφή ΓΟΣ & Προστασίας Δεδομένων' :
                 'Required: Sign Terms & Privacy Policy'}
              </p>
              <p className="text-red-700 text-sm mt-0.5">
                {lang === 'de'
                  ? 'Ohne beide Unterschriften haben Sie keinen Zugang zu PDR Connect.'
                  : lang === 'es'
                  ? 'Sin ambas firmas no puede acceder a PDR Connect.'
                  : lang === 'el'
                  ? 'Χωρίς και τις δύο υπογραφές δεν έχετε πρόσβαση στο PDR Connect.'
                  : 'Without both signatures you cannot access PDR Connect.'}
              </p>
            </div>
          </div>

          {/* TWO ACTION CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: AGB */}
            <div className={`rounded-2xl border-2 p-6 flex flex-col gap-4 ${signedUrls[activeTab as 'client' | 'worker'] ? 'border-green-400 bg-green-50' : 'border-brand-300 bg-brand-50'}`}>
              <div className="flex items-center gap-3">
                <div className="text-3xl">{signedUrls[activeTab as 'client' | 'worker'] ? '✅' : '📋'}</div>
                <div>
                  <p className="font-bold text-gray-900 text-base">
                    {lang === 'de' ? 'Allgemeine Geschäftsbedingungen' :
                     lang === 'es' ? 'Términos y Condiciones (AGB)' :
                     lang === 'el' ? 'Γενικοί Όροι (AGB)' :
                     'Terms & Conditions (AGB)'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {lang === 'de' ? 'Nutzungsregeln der Plattform' :
                     lang === 'es' ? 'Reglas de uso de la plataforma' :
                     lang === 'el' ? 'Κανόνες χρήσης πλατφόρμας' :
                     'Platform usage rules'}
                  </p>
                </div>
              </div>
              {signedUrls[activeTab as 'client' | 'worker']
                ? <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
                    <CheckCircle className="h-5 w-5" />
                    {lang === 'de' ? 'Unterzeichnet ✓' : lang === 'es' ? 'Firmado ✓' : lang === 'el' ? 'Υπογεγραμμένο ✓' : 'Signed ✓'}
                  </div>
                : <button
                    onClick={() => { setActiveTab(activeTab as 'client' | 'worker'); setShowModal(true); document.getElementById('contract-content')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 text-white px-5 py-3 font-bold text-sm hover:bg-brand-700 transition"
                  >
                    <PenLine className="h-4 w-4" />
                    {lang === 'de' ? 'Lesen & Unterzeichnen' : lang === 'es' ? 'Leer y Firmar' : lang === 'el' ? 'Ανάγνωση & Υπογραφή' : 'Read & Sign'}
                  </button>
              }
            </div>

            {/* Card 2: Datenschutz — uses 'privacy' version */}
            <div className={`rounded-2xl border-2 p-6 flex flex-col gap-4 ${signedUrls.privacy ? 'border-green-400 bg-green-50' : 'border-purple-300 bg-purple-50'}`}>
              <div className="flex items-center gap-3">
                <div className="text-3xl">{signedUrls.privacy ? '✅' : '🔒'}</div>
                <div>
                  <p className="font-bold text-gray-900 text-base">
                    {lang === 'de' ? 'Datenschutzerklärung' :
                     lang === 'es' ? 'Política de Privacidad' :
                     lang === 'el' ? 'Πολιτική Απορρήτου' :
                     'Privacy Policy'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {lang === 'de' ? 'Umgang mit Ihren persönlichen Daten' :
                     lang === 'es' ? 'Manejo de sus datos personales' :
                     lang === 'el' ? 'Χειρισμός προσωπικών δεδομένων' :
                     'How we handle your personal data'}
                  </p>
                </div>
              </div>
              {signedUrls.privacy
                ? <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
                    <CheckCircle className="h-5 w-5" />
                    {lang === 'de' ? 'Unterzeichnet ✓' : lang === 'es' ? 'Firmado ✓' : lang === 'el' ? 'Υπογεγραμμένο ✓' : 'Signed ✓'}
                  </div>
                : <button
                    onClick={() => { setActiveTab('privacy' as any); setShowModal(true); document.getElementById('contract-content')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 text-white px-5 py-3 font-bold text-sm hover:bg-purple-700 transition"
                  >
                    <PenLine className="h-4 w-4" />
                    {lang === 'de' ? 'Lesen & Unterzeichnen' : lang === 'es' ? 'Leer y Firmar' : lang === 'el' ? 'Ανάγνωση & Υπογραφή' : 'Read & Sign'}
                  </button>
              }
            </div>
          </div>

          {/* Progress indicator */}
          {(signedUrls[activeTab as 'client' | 'worker'] || signedUrls.privacy) && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              {signedUrls[activeTab as 'client' | 'worker'] && signedUrls.privacy
                ? <span className="font-bold text-green-700">✅ {lang === 'de' ? 'Beide Dokumente unterzeichnet! Sie werden weitergeleitet...' : 'Both documents signed! Redirecting...'}</span>
                : <span>
                    {lang === 'de'
                      ? `Noch ${[!signedUrls[activeTab as 'client' | 'worker'], !signedUrls.privacy].filter(Boolean).length} Dokument(e) ausstehend`
                      : `${[!signedUrls[activeTab as 'client' | 'worker'], !signedUrls.privacy].filter(Boolean).length} document(s) still pending`}
                  </span>
              }
            </div>
          )}
        </div>
      )}

      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileText className="h-5 w-5 text-brand-600" />
          <h1 className="text-2xl font-bold text-gray-900">{c.pageTitle}</h1>
        </div>
        <p className="text-sm text-gray-500">{c.pageSubtitle}</p>
      </div>

      {/* Info banner */}
      <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex gap-3 text-sm text-blue-800">
        <FileText className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-0.5">{t('contracts.infoTitle')}</p>
          <p className="text-blue-700">{t('contracts.infoDesc')}</p>
        </div>
      </div>

      {/* Signed contracts summary */}
      {(signedUrls.client || signedUrls.worker) && (
        <div className="card border-green-200 bg-green-50">
          <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            {t('contracts.mySignedContracts')}
          </h3>
          <div className="flex flex-wrap gap-3">
            {signedUrls.client && (
              <a
                href={signedUrls.client}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-white border border-green-300 px-4 py-2 text-sm text-green-800 font-medium hover:bg-green-100 transition"
              >
                <Building2 className="h-4 w-4" />
                {t('contracts.clientContract')}
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
            )}
            {signedUrls.worker && (
              <a
                href={signedUrls.worker}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-white border border-green-300 px-4 py-2 text-sm text-green-800 font-medium hover:bg-green-100 transition"
              >
                <Wrench className="h-4 w-4" />
                {t('contracts.workerContract')}
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
            )}
          </div>
          <p className="mt-3 text-xs text-green-700">
            {t('contracts.signedVisible')} <Link href="/documents" className="underline">{t('contracts.documentsPage')}</Link>
          </p>
        </div>
      )}

      {/* Tab switcher + Contract Content */}
      <div id="contract-content" className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        {(['client', 'worker'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
              activeTab === tab
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'client' ? <Building2 className="h-4 w-4" /> : <Wrench className="h-4 w-4" />}
            {tab === 'client' ? c.tabClient : c.tabWorker}
            {signedUrls[tab] && (
              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
            )}
          </button>
        ))}
      </div>

      {/* Active contract */}
      <ContractView
        doc={activeTab === 'client' ? c.client : c.worker}
        contractType={activeTab === 'privacy' ? 'worker' : activeTab}
        signedUrl={signedUrls[activeTab] ?? signedUrls[activeTab === 'privacy' ? 'privacy' : activeTab]}
        onSign={() => setShowModal(true)}
      />

      {/* Signature modal */}
      {showModal && (
        <SignatureModal
          contractType={activeTab === 'privacy' ? 'worker' : activeTab}
          signerName={signerName}
          onComplete={handleSignComplete}
          onClose={() => !uploading && setShowModal(false)}
          loading={uploading}
        />
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          aside, .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>
    </div>
  );
}
