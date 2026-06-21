'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Document, DocType } from '@/types/database';
import { formatDate } from '@/lib/utils';
import {
  Upload, FileText, CheckCircle, Clock, XCircle,
  ExternalLink, Info, Building2, Wrench, Download,
  ShieldCheck, Loader2, ClipboardCheck, Trash2, Shield, Eye,
} from 'lucide-react';

/** Extract the storage object path from a full Supabase Storage URL */
function getStoragePath(fileUrl: string): string | null {
  try {
    const url = new URL(fileUrl);
    const marker = '/storage/v1/object/';
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return null;
    const parts = url.pathname.slice(idx + marker.length).split('/');
    // parts[0]='public'|'sign', parts[1]=bucket, rest=path
    return parts.slice(2).join('/');
  } catch { return null; }
}

const DOC_TYPE_KEYS: DocType[] = ['EU_ID', 'A1', 'TRAVEL_DOC', 'COMPANY_DOC'];
const REQUIRED_TYPES: DocType[] = ['EU_ID'];

/** Public download URLs for the Australia Subclass 400 invitation templates. */
const VISA_TEMPLATES = [
  {
    key: 'adr',
    url: 'https://spmbtjynxbqpecgumadv.supabase.co/storage/v1/object/public/visa-templates/ADR-Subclass-400-Visa-Invitation-Template.docx',
  },
  {
    key: 'pdrTeam',
    url: 'https://spmbtjynxbqpecgumadv.supabase.co/storage/v1/object/public/visa-templates/PDR-Team-Visa-Invitation-Template.docx',
  },
] as const;

type VisaLang = 'en' | 'de' | 'es' | 'el' | 'pt';
/** Self-contained copy for the Work Visa section (independent of the i18n JSON files). */
const VISA_COPY: Record<VisaLang, {
  title: string; subtitle: string; intro: string;
  downloadTitle: string; adr: string; pdr: string; download: string;
  uploadTitle: string; uploadHint: string; upload: string; uploading: string; replace: string;
  approvedNotice: string; uploadedOn: string; viewFile: string; delete: string;
}> = {
  en: {
    title: 'Work Visa for Australia',
    subtitle: 'Subclass 400 (Temporary Work – Short Stay Specialist)',
    intro: 'Download the official invitation-letter templates below, complete your applicant details (full name as in passport, passport number, date of birth, nationality) and send them back so your Letter of Invitation can be issued. Typical engagement: 3–4 months, approx. AUD $2,000–$4,000 per week.',
    downloadTitle: 'Invitation templates',
    adr: 'ADR — Subclass 400 Invitation Template',
    pdr: 'PDR-Team — Subclass 400 Invitation Template',
    download: 'Download',
    uploadTitle: 'Upload your approved Work Visa',
    uploadHint: 'Once your Subclass 400 visa is approved, upload the grant letter / visa here so it is saved to your profile. PDF, JPG or PNG.',
    upload: 'Upload Work Visa',
    uploading: 'Uploading…',
    replace: 'Upload another',
    approvedNotice: 'Visa approved? Upload it here.',
    uploadedOn: 'Uploaded on',
    viewFile: 'View file',
    delete: 'Delete',
  },
  de: {
    title: 'Arbeitsvisum für Australien',
    subtitle: 'Subklasse 400 (Temporary Work – Short Stay Specialist)',
    intro: 'Laden Sie unten die offiziellen Einladungsschreiben-Vorlagen herunter, ergänzen Sie Ihre Antragsdaten (vollständiger Name wie im Reisepass, Reisepassnummer, Geburtsdatum, Staatsangehörigkeit) und senden Sie diese zurück, damit Ihr Einladungsschreiben ausgestellt werden kann. Typischer Einsatz: 3–4 Monate, ca. AUD 2.000–4.000 pro Woche.',
    downloadTitle: 'Einladungsvorlagen',
    adr: 'ADR — Subclass 400 Einladungsvorlage',
    pdr: 'PDR-Team — Subclass 400 Einladungsvorlage',
    download: 'Herunterladen',
    uploadTitle: 'Genehmigtes Arbeitsvisum hochladen',
    uploadHint: 'Sobald Ihr Subclass-400-Visum genehmigt ist, laden Sie das Bewilligungsschreiben / Visum hier hoch, damit es in Ihrem Profil gespeichert wird. PDF, JPG oder PNG.',
    upload: 'Visum hochladen',
    uploading: 'Lädt hoch…',
    replace: 'Weiteres hochladen',
    approvedNotice: 'Visum genehmigt? Hier hochladen.',
    uploadedOn: 'Hochgeladen am',
    viewFile: 'Datei ansehen',
    delete: 'Löschen',
  },
  es: {
    title: 'Visa de trabajo para Australia',
    subtitle: 'Subclass 400 (Trabajo Temporal – Especialista de Estancia Corta)',
    intro: 'Descarga abajo las plantillas oficiales de carta de invitación, completa tus datos (nombre completo como en el pasaporte, número de pasaporte, fecha de nacimiento, nacionalidad) y envíalas de vuelta para que se pueda emitir tu Carta de Invitación. Compromiso típico: 3–4 meses, aprox. AUD 2.000–4.000 por semana.',
    downloadTitle: 'Plantillas de invitación',
    adr: 'ADR — Plantilla de invitación Subclass 400',
    pdr: 'PDR-Team — Plantilla de invitación Subclass 400',
    download: 'Descargar',
    uploadTitle: 'Sube tu Visa de Trabajo aprobada',
    uploadHint: 'Una vez aprobada tu visa Subclass 400, sube aquí la carta de concesión / visa para guardarla en tu perfil. PDF, JPG o PNG.',
    upload: 'Subir Visa',
    uploading: 'Subiendo…',
    replace: 'Subir otra',
    approvedNotice: '¿Visa aprobada? Súbela aquí.',
    uploadedOn: 'Subido el',
    viewFile: 'Ver archivo',
    delete: 'Eliminar',
  },
  el: {
    title: 'Άδεια εργασίας για Αυστραλία',
    subtitle: 'Subclass 400 (Προσωρινή Εργασία – Ειδικός Σύντομης Διαμονής)',
    intro: 'Κατεβάστε παρακάτω τα επίσημα πρότυπα επιστολής πρόσκλησης, συμπληρώστε τα στοιχεία σας (πλήρες όνομα όπως στο διαβατήριο, αριθμός διαβατηρίου, ημερομηνία γέννησης, υπηκοότητα) και στείλτε τα πίσω ώστε να εκδοθεί η Επιστολή Πρόσκλησής σας. Τυπική απασχόληση: 3–4 μήνες, περίπου AUD 2.000–4.000 την εβδομάδα.',
    downloadTitle: 'Πρότυπα πρόσκλησης',
    adr: 'ADR — Πρότυπο πρόσκλησης Subclass 400',
    pdr: 'PDR-Team — Πρότυπο πρόσκλησης Subclass 400',
    download: 'Λήψη',
    uploadTitle: 'Ανεβάστε την εγκεκριμένη άδεια εργασίας σας',
    uploadHint: 'Μόλις εγκριθεί η βίζα σας Subclass 400, ανεβάστε εδώ την επιστολή έγκρισης / βίζα ώστε να αποθηκευτεί στο προφίλ σας. PDF, JPG ή PNG.',
    upload: 'Ανέβασμα βίζας',
    uploading: 'Μεταφόρτωση…',
    replace: 'Ανέβασμα άλλου',
    approvedNotice: 'Εγκρίθηκε η βίζα; Ανεβάστε την εδώ.',
    uploadedOn: 'Ανέβηκε στις',
    viewFile: 'Προβολή αρχείου',
    delete: 'Διαγραφή',
  },
  pt: {
    title: 'Visto de trabalho para a Austrália',
    subtitle: 'Subclass 400 (Trabalho Temporário – Especialista de Curta Duração)',
    intro: 'Baixe abaixo os modelos oficiais de carta-convite, preencha seus dados (nome completo como no passaporte, número do passaporte, data de nascimento, nacionalidade) e devolva-os para que sua Carta-Convite seja emitida. Engajamento típico: 3–4 meses, aprox. AUD 2.000–4.000 por semana.',
    downloadTitle: 'Modelos de convite',
    adr: 'ADR — Modelo de convite Subclass 400',
    pdr: 'PDR-Team — Modelo de convite Subclass 400',
    download: 'Baixar',
    uploadTitle: 'Envie seu Visto de Trabalho aprovado',
    uploadHint: 'Assim que seu visto Subclass 400 for aprovado, envie aqui a carta de concessão / visto para que fique salvo no seu perfil. PDF, JPG ou PNG.',
    upload: 'Enviar Visto',
    uploading: 'Enviando…',
    replace: 'Enviar outro',
    approvedNotice: 'Visto aprovado? Envie aqui.',
    uploadedOn: 'Enviado em',
    viewFile: 'Ver arquivo',
    delete: 'Excluir',
  },
};

interface SignedContract {
  id: string;
  version: string;
  pdf_url: string;
  signed_at?: string;
  language: string;
  created_at: string;
}

const StatusBadge = ({ status, t }: { status: string; t: (k: string) => string }) => {
  const map = {
    verified: { cls: 'badge-verified', icon: CheckCircle },
    pending:  { cls: 'badge-pending',  icon: Clock },
    rejected: { cls: 'badge-rejected', icon: XCircle },
  } as const;
  const s = map[status as keyof typeof map];
  if (!s) return null;
  return (
    <span className={s.cls}>
      <s.icon className="h-3 w-3 inline mr-1" />
      {t(`documents.status.${status}`)}
    </span>
  );
};

export default function DocumentsPage() {
  const { t, i18n } = useTranslation();
  const [docs,              setDocs]              = useState<Document[]>([]);
  const [signedContracts,   setSignedContracts]   = useState<SignedContract[]>([]);
  const [loading,           setLoading]           = useState(true);
  const [uploading,         setUploading]         = useState<DocType | null>(null);
  const [uploadingContr,    setUploadingContr]    = useState(false);
  const [userId,            setUserId]            = useState('');
  const [isVerified,        setIsVerified]        = useState(false);
  const [verificationReqAt, setVerificationReqAt] = useState<string | null>(null);
  const [verifying,         setVerifying]         = useState(false);
  const [deletingDoc,       setDeletingDoc]       = useState<string | null>(null);
  const [deletingContract,  setDeletingContract]  = useState<string | null>(null);
  const [signedUrls,        setSignedUrls]        = useState<Record<string, string>>({});
  const [profile,           setProfile]           = useState<any>(null);
  const [termsAccepted,     setTermsAccepted]     = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const [docsRes, contractsRes, profileRes] = await Promise.all([
      supabase.from('documents').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('contracts').select('id, version, pdf_url, signed_at, language, created_at').eq('user_id', user.id).eq('signed', true).order('created_at', { ascending: false }),
      supabase.from('users').select('is_verified, verification_requested_at, full_name, phone, company_name, company_street, company_house_number, company_zip, company_country, available_countries, role, email').eq('id', user.id).single(),
    ]);

    const loadedDocs = docsRes.data ?? [];
    setDocs(loadedDocs);
    setSignedContracts(contractsRes.data ?? []);
    setIsVerified(profileRes.data?.is_verified ?? false);
    setVerificationReqAt(profileRes.data?.verification_requested_at ?? null);
    setProfile(profileRes.data ?? null);

    // Generate signed URLs for private document files (1 hour TTL)
    const urlMap: Record<string, string> = {};
    await Promise.all(
      loadedDocs.map(async (doc) => {
        const path = getStoragePath(doc.file_url);
        if (!path) return;
        const { data } = await supabase.storage
          .from('documents')
          .createSignedUrl(path, 3600);
        if (data?.signedUrl) urlMap[doc.id] = data.signedUrl;
      })
    );
    setSignedUrls(urlMap);
    setLoading(false);
  };

  const handleDeleteDoc = async (doc: Document) => {
    if (!confirm(t('documents.confirmDelete') || 'Dieses Dokument wirklich löschen?')) return;
    setDeletingDoc(doc.id);
    const supabase = createClient();
    // Delete from storage
    const path = getStoragePath(doc.file_url);
    if (path) {
      await supabase.storage.from('documents').remove([path]);
    }
    // Delete DB row
    const { error } = await supabase.from('documents').delete().eq('id', doc.id);
    setDeletingDoc(null);
    if (error) { toast.error(error.message); return; }
    toast.success(t('documents.deleted') || 'Dokument gelöscht');
    setDocs(prev => prev.filter(d => d.id !== doc.id));
    setSignedUrls(prev => { const n = { ...prev }; delete n[doc.id]; return n; });
  };

  const handleDeleteContract = async (contractId: string, label: string) => {
    if (!confirm(`"${label}" wirklich löschen?`)) return;
    setDeletingContract(contractId);
    try {
      const res = await fetch(`/api/contracts/${contractId}`, { method: 'DELETE' });
      const j = await res.json();
      if (!res.ok) { toast.error(j.error ?? 'Fehler'); return; }
      toast.success('Dokument gelöscht');
      setSignedContracts(prev => prev.filter(c => c.id !== contractId));
    } catch { toast.error('Netzwerkfehler'); }
    finally { setDeletingContract(null); }
  };

  const handleRequestVerification = async () => {
    setVerifying(true);
    try {
      const res = await fetch('/api/verification/request', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? t('common.error'));
        return;
      }
      setVerificationReqAt(new Date().toISOString());
      toast.success(t('verification.requestedToast'));
    } catch {
      toast.error(t('common.error'));
    } finally {
      setVerifying(false);
    }
  };

  const handleUpload = async (type: DocType, file: File) => {
    if (file.size > 10 * 1024 * 1024) { toast.error(t('documents.errors.tooLarge')); return; }
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) { toast.error(t('documents.errors.invalidType')); return; }

    setUploading(type);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const ext = file.name.split('.').pop();
    const path = `${user.id}/${type}_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from('documents').upload(path, file);
    if (uploadError) { toast.error(uploadError.message); setUploading(null); return; }

    // Store the path as a supabase URL (signed URL will be generated at read-time)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const fileUrl = `${supabaseUrl}/storage/v1/object/public/documents/${path}`;

    const { error: dbError } = await supabase.from('documents').insert({
      user_id: user.id,
      type,
      file_url: fileUrl,
      status: 'pending',
    });

    setUploading(null);
    if (dbError) toast.error(dbError.message);
    else {
      toast.success(t('documents.success'));
      // Notify admin (fire-and-forget)
      fetch('/api/admin/notify-new-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType: type }),
      }).catch(() => {});

      // If the user was verified and just uploaded/replaced the company doc,
      // their profile must be re-verified by an admin before going live again.
      if (isVerified && type === 'COMPANY_DOC') {
        await supabase.from('users').update({
          is_verified: false,
          verification_requested_at: null,
        }).eq('id', user.id);
        setIsVerified(false);
        setVerificationReqAt(null);
      }

      loadAll();
    }
  };

  /** Upload a manually-signed contract PDF */
  const handleContractUpload = async (file: File, version: 'client' | 'worker') => {
    if (file.size > 20 * 1024 * 1024) { toast.error(t('documents.errors.tooLarge')); return; }
    if (file.type !== 'application/pdf') { toast.error(t('documents.errors.pdfOnly')); return; }

    setUploadingContr(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploadingContr(false); return; }

    const filename = `SIGNED_CONTRACT_${version.toUpperCase()}_${Date.now()}.pdf`;
    const path = `${user.id}/contracts/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(path, file, { contentType: 'application/pdf' });

    if (uploadError) { toast.error(uploadError.message); setUploadingContr(false); return; }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const pdfUrl = `${supabaseUrl}/storage/v1/object/public/documents/${path}`;

    const { error: dbError } = await supabase.from('contracts').insert({
      user_id: user.id,
      pdf_url: pdfUrl,
      signed: true,
      signed_at: new Date().toISOString(),
      language: 'en',
      version,
    });

    setUploadingContr(false);
    if (dbError) toast.error(dbError.message);
    else { toast.success(t('contracts.uploadSuccess')); loadAll(); }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">{t('documents.loading')}</div>;

  return (
    <div className="space-y-8">

      {/* ── Identity & Compliance Documents ── */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('documents.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('documents.subtitle')}</p>
        </div>

        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex gap-3">
          <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-semibold mb-1">{t('documents.verificationRequired')}</p>
            <p>{t('documents.verificationInfo')}</p>
          </div>
        </div>

        {DOC_TYPE_KEYS.map((type) => {
          const required = REQUIRED_TYPES.includes(type);
          const existing = docs.filter(d => d.type === type);
          const latest   = existing[0];

          return (
            <div key={type} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                    <FileText className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{t(`documents.types.${type}`)}</h3>
                      {required && <span className="text-xs text-red-500 font-medium">{t('documents.required')}</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{t(`documents.types.${type}_desc`)}</p>

                    {latest && (
                      <div className="mt-2 space-y-1.5">
                        <StatusBadge status={latest.status} t={t} />
                        <p className="text-xs text-gray-400">{t('documents.uploadedOn')} {formatDate(latest.created_at)}</p>
                        {latest.status === 'rejected' && (
                          <p className="text-xs text-red-600">{t('documents.reupload')}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 pt-0.5">
                          {signedUrls[latest.id] && (
                            <a
                              href={signedUrls[latest.id]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
                            >
                              {t('documents.viewFile')} <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteDoc(latest)}
                            disabled={deletingDoc === latest.id}
                            className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition disabled:opacity-50"
                          >
                            {deletingDoc === latest.id
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <Trash2 className="h-3 w-3" />}
                            {t('documents.delete') || 'Löschen'}
                          </button>
                        </div>
                        {/* All uploads for this type */}
                        {existing.length > 1 && (
                          <p className="text-xs text-gray-400">{existing.length} {t('documents.versions') || 'Versionen'}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <label className="btn-secondary cursor-pointer flex-shrink-0">
                  <Upload className="h-4 w-4 mr-1.5" />
                  {uploading === type
                    ? t('documents.uploading')
                    : latest
                    ? t('documents.replace')
                    : t('documents.upload')}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    disabled={uploading === type}
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(type, f);
                    }}
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Work Visa for Australia ── */}
      {(() => {
        const vlang: VisaLang = (['en', 'de', 'es', 'el', 'pt'] as VisaLang[])
          .includes((i18n.language?.split('-')[0] ?? 'en') as VisaLang)
          ? (i18n.language.split('-')[0] as VisaLang)
          : 'en';
        const v = VISA_COPY[vlang];
        const workVisaDocs = docs.filter(d => d.type === 'WORK_VISA');
        const labelFor = (key: string) => (key === 'adr' ? v.adr : v.pdr);

        return (
          <div className="rounded-2xl border-2 border-emerald-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-emerald-50 border-b border-emerald-200 flex items-center gap-3">
              <span className="text-2xl leading-none">🇦🇺</span>
              <div>
                <h2 className="font-bold text-base text-emerald-900">{v.title}</h2>
                <p className="text-xs text-emerald-700">{v.subtitle}</p>
              </div>
            </div>

            <div className="px-5 py-5 bg-white space-y-5">
              <p className="text-sm text-gray-600">{v.intro}</p>

              {/* Template downloads */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">{v.downloadTitle}</p>
                <div className="space-y-2">
                  {VISA_TEMPLATES.map(tpl => (
                    <div key={tpl.key} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 flex-shrink-0">
                          <FileText className="h-5 w-5 text-emerald-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-800 truncate">{labelFor(tpl.key)}</p>
                      </div>
                      <a
                        href={tpl.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="btn-secondary flex-shrink-0 inline-flex items-center gap-1.5 text-sm"
                      >
                        <Download className="h-4 w-4" />
                        {v.download}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Approved visa upload */}
              <div className="rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-emerald-200 flex-shrink-0">
                      <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{v.uploadTitle}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{v.uploadHint}</p>
                    </div>
                  </div>
                  <label className="btn-secondary cursor-pointer flex-shrink-0">
                    <Upload className="h-4 w-4 mr-1.5" />
                    {uploading === 'WORK_VISA'
                      ? v.uploading
                      : workVisaDocs.length > 0
                      ? v.replace
                      : v.upload}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      disabled={uploading === 'WORK_VISA'}
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) handleUpload('WORK_VISA', f);
                      }}
                    />
                  </label>
                </div>

                {/* Uploaded approved visas */}
                {workVisaDocs.length > 0 && (
                  <div className="mt-4 space-y-2 border-t border-emerald-200 pt-4">
                    {workVisaDocs.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between gap-3 rounded-lg bg-white border border-gray-200 px-3 py-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={doc.status} t={t} />
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{v.uploadedOn} {formatDate(doc.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {signedUrls[doc.id] && (
                            <a
                              href={signedUrls[doc.id]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
                            >
                              {v.viewFile} <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteDoc(doc)}
                            disabled={deletingDoc === doc.id}
                            className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition disabled:opacity-50"
                          >
                            {deletingDoc === doc.id
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <Trash2 className="h-3 w-3" />}
                            {v.delete}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Profile Verification Request ── */}
      {(() => {
        // Compute which mandatory fields are missing
        const checks: { key: string; label: string; ok: boolean; hint?: string; link?: string }[] = [
          { key: 'name',        label: t('verification.checkName'),        ok: !!profile?.full_name?.trim(),
            link: '/profile', hint: t('verification.checkHintProfile') },
          { key: 'company',     label: t('verification.checkCompany'),     ok: !!profile?.company_name?.trim(),
            link: '/profile', hint: t('verification.checkHintProfile') },
          { key: 'street',      label: t('verification.checkStreet'),      ok: !!profile?.company_street?.trim() && !!profile?.company_house_number?.trim(),
            link: '/profile', hint: t('verification.checkHintProfile') },
          { key: 'zip',         label: t('verification.checkZip'),         ok: !!profile?.company_zip?.trim() && !!profile?.company_country,
            link: '/profile', hint: t('verification.checkHintProfile') },
          { key: 'phone',       label: t('verification.checkPhone'),       ok: !!profile?.phone?.trim(),
            link: '/profile', hint: t('verification.checkHintProfile') },
          { key: 'company_doc', label: t('verification.checkCompanyDoc'),  ok: docs.some(d => d.type === 'COMPANY_DOC' && d.status !== 'rejected'),
            link: '/documents', hint: t('verification.checkHintDoc') },
          { key: 'countries',   label: t('verification.checkCountries'),   ok: (profile?.available_countries?.length ?? 0) > 0,
            link: '/profile?tab=settings', hint: t('verification.checkHintCountries') },
          { key: 'role',        label: t('verification.checkRole'),        ok: !!profile?.role,
            link: '/profile', hint: t('verification.checkHintProfile') },
        ];
        const profileComplete = checks.every(c => c.ok);
        const canRequest = profileComplete && termsAccepted;

        return (
          <div className="rounded-2xl border-2 overflow-hidden shadow-sm">
            {/* Header */}
            <div className={`px-5 py-4 flex items-center gap-3 ${
              isVerified
                ? 'bg-green-50 border-b border-green-200'
                : verificationReqAt
                ? 'bg-amber-50 border-b border-amber-200'
                : 'bg-brand-50 border-b border-brand-200'
            }`}>
              {isVerified ? (
                <ShieldCheck className="h-6 w-6 text-green-600 flex-shrink-0" />
              ) : verificationReqAt ? (
                <Clock className="h-6 w-6 text-amber-500 flex-shrink-0" />
              ) : (
                <ClipboardCheck className="h-6 w-6 text-brand-600 flex-shrink-0" />
              )}
              <div>
                <h2 className={`font-bold text-base ${
                  isVerified ? 'text-green-800' : verificationReqAt ? 'text-amber-800' : 'text-brand-800'
                }`}>
                  {isVerified
                    ? t('verification.verifiedTitle')
                    : verificationReqAt
                    ? t('verification.requestedTitle')
                    : t('verification.title')}
                </h2>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-5 bg-white">
              {isVerified ? (
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700">{t('verification.verifiedDesc')}</p>
                </div>
              ) : verificationReqAt ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700">{t('verification.requestedDesc')}</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {t('verification.requestedAt')}: {formatDate(verificationReqAt)}
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <p className="text-sm text-gray-600">{t('verification.desc')}</p>

                  {/* ── Profile completion checklist ── */}
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-700">
                        {t('verification.reqFieldsTitle')}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {t('verification.reqFieldsHint')}
                      </p>
                    </div>
                    <ul className="divide-y divide-gray-100">
                      {checks.map(({ key, label, ok, hint, link }) => (
                        <li key={key} className={`flex items-center gap-3 px-4 py-2.5 text-sm ${ok ? 'text-gray-700' : 'text-red-600 bg-red-50'}`}>
                          {ok
                            ? <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            : <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                          }
                          <div className="flex-1 min-w-0">
                            <span className={ok ? '' : 'font-medium'}>{label}</span>
                            {!ok && hint && (
                              <p className="text-xs text-red-400 mt-0.5">→ {hint}</p>
                            )}
                          </div>
                          {!ok && link && (
                            <a
                              href={link}
                              className="ml-auto flex-shrink-0 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg px-2.5 py-1 transition"
                            >
                              {t('verification.fillBtn')}
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {!profileComplete && (
                    <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                      <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>{t('verification.fillIncomplete')}</span>
                    </div>
                  )}

                  {/* ── T&C + Privacy acceptance ── */}
                  <label className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition ${
                    termsAccepted ? 'border-brand-400 bg-brand-50' : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={e => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 flex-shrink-0"
                    />
                    <span className="text-sm text-gray-700 leading-relaxed">
                      {t('verification.termsLabelPre')}{' '}
                      <a href="/terms" target="_blank" className="text-brand-600 hover:underline font-medium">{t('verification.termsAgb')}</a>
                      {' '}{t('verification.termsLabelMid')}{' '}
                      <a href="/privacy" target="_blank" className="text-brand-600 hover:underline font-medium">{t('verification.termsPrivacy')}</a>
                      {t('verification.termsLabelPost')}{' '}
                      <span className="text-red-500">*</span>
                    </span>
                  </label>

                  <button
                    onClick={handleRequestVerification}
                    disabled={verifying || !canRequest}
                    title={!profileComplete ? t('verification.tooltipProfile') : !termsAccepted ? t('verification.tooltipTerms') : ''}
                    className="inline-flex items-center gap-2.5 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-brand-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('verification.requesting')}
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        {t('verification.requestBtn')}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── Signed Contracts ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t('contracts.signedContracts')}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{t('contracts.signedContractsDesc')}</p>
          </div>
          <Link href="/contracts" className="btn-secondary text-sm flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            {t('contracts.viewContracts')}
          </Link>
        </div>

        {/* Upload manually signed PDFs */}
        <div className="card border-dashed border-2 border-gray-300 bg-gray-50">
          <p className="font-semibold text-gray-700 mb-1 text-sm">{t('contracts.uploadSigned')}</p>
          <p className="text-xs text-gray-500 mb-4">{t('contracts.uploadSignedDesc')}</p>
          <div className="flex flex-wrap gap-3">
            {(['client', 'worker'] as const).map(version => (
              <label
                key={version}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium cursor-pointer transition ${
                  uploadingContr
                    ? 'opacity-50 cursor-not-allowed bg-white border-gray-200 text-gray-400'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-brand-400 hover:text-brand-700'
                }`}
              >
                {version === 'client' ? <Building2 className="h-4 w-4" /> : <Wrench className="h-4 w-4" />}
                <Upload className="h-3.5 w-3.5" />
                {t(`contracts.upload${version.charAt(0).toUpperCase() + version.slice(1)}`)}
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  disabled={uploadingContr}
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleContractUpload(f, version);
                  }}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Signed contract list */}
        {signedContracts.length === 0 ? (
          <div className="card text-center py-10">
            <FileText className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">{t('contracts.noSignedContracts')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('contracts.noSignedContractsHint')}</p>
            <Link href="/contracts" className="btn-primary mt-4 inline-flex items-center gap-2 text-sm">
              <PenLineIcon />
              {t('contracts.goSign')}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {signedContracts.map(sc => {
              const cfg: Record<string, { bg: string; iconColor: string; Icon: any; label: string }> = {
                agb:     { bg: 'bg-brand-100',  iconColor: 'text-brand-600',  Icon: FileText,  label: t('contracts.agbContract')     || 'AGB — Allgemeine Geschäftsbedingungen' },
                privacy: { bg: 'bg-purple-100', iconColor: 'text-purple-600', Icon: Shield,    label: t('contracts.privacyContract') || 'Datenschutzerklärung (DSGVO)' },
                client:  { bg: 'bg-blue-100',   iconColor: 'text-blue-600',   Icon: Building2, label: t('contracts.clientContract') },
                worker:  { bg: 'bg-orange-100', iconColor: 'text-orange-600', Icon: Wrench,    label: t('contracts.workerContract') },
              };
              const c = cfg[sc.version] ?? cfg.worker;

              // ALL contract types use the view API:
              // - agb/privacy: generates HTML document on-the-fly
              // - client/worker: generates a fresh signed URL (works even with private bucket)
              const hasContent = (sc.version === 'agb' || sc.version === 'privacy') || (sc.pdf_url && sc.pdf_url.length > 0);
              const viewUrl     = hasContent ? `/api/contracts/${sc.id}/view` : null;
              const downloadUrl = hasContent ? `/api/contracts/${sc.id}/view?download=1` : null;

              return (
                <div key={sc.id} className="card">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 ${c.bg}`}>
                      <c.Icon className={`h-5 w-5 ${c.iconColor}`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 text-sm">{c.label}</p>
                        <span className="badge-verified text-xs">
                          <CheckCircle className="h-3 w-3 inline mr-0.5" />
                          {t('contracts.signedBadge')}
                        </span>
                        {sc.language && (
                          <span className="text-xs text-gray-400 uppercase tracking-wide">{sc.language}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {t('contracts.signedOn') || 'Unterzeichnet am'}: {sc.signed_at ? formatDate(sc.signed_at) : formatDate(sc.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                    {/* View */}
                    {viewUrl && (
                      <a
                        href={viewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700 transition"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {t('documents.viewFile') || 'Ansehen'}
                      </a>
                    )}

                    {/* Download */}
                    {downloadUrl && (
                      <a
                        href={downloadUrl}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {t('contracts.downloadSigned') || 'Herunterladen'}
                      </a>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteContract(sc.id, c.label)}
                      disabled={deletingContract === sc.id}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition disabled:opacity-50 ml-auto"
                    >
                      {deletingContract === sc.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />
                      }
                      {t('documents.delete') || 'Löschen'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

// tiny inline icon component to avoid extra import overhead
function PenLineIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
    </svg>
  );
}
