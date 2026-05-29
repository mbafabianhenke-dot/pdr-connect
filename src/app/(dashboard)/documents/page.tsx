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
  ShieldCheck, Loader2, ClipboardCheck, Trash2,
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
  const { t } = useTranslation();
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
            {signedContracts.map(sc => (
              <div key={sc.id} className="card flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 ${
                  sc.version === 'client' ? 'bg-blue-100' : 'bg-orange-100'
                }`}>
                  {sc.version === 'client'
                    ? <Building2 className="h-5 w-5 text-blue-600" />
                    : <Wrench className="h-5 w-5 text-orange-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm">
                      {sc.version === 'client' ? t('contracts.clientContract') : t('contracts.workerContract')}
                    </p>
                    <span className="badge-verified text-xs">
                      <CheckCircle className="h-3 w-3 inline mr-0.5" />
                      {t('contracts.signedBadge')}
                    </span>
                    <span className="text-xs text-gray-400 uppercase tracking-wide">{sc.language}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {sc.signed_at ? formatDate(sc.signed_at) : formatDate(sc.created_at)}
                  </p>
                </div>
                <a
                  href={sc.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 flex items-center gap-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition px-3 py-2 text-sm font-medium text-gray-700"
                >
                  <Download className="h-4 w-4" />
                  {t('contracts.downloadSigned')}
                </a>
              </div>
            ))}
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
