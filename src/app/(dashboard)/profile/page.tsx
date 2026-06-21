'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { createClient } from '@/lib/supabase/client';
import { COUNTRIES, PHONE_CODES, EUROPEAN_COUNTRY_CODES, parsePhone, plzToBundesland } from '@/types/database';
import type { ExperienceEntry, ReferenceEntry } from '@/types/database';
import {
  Building2, FileText, Briefcase, Camera, Star,
  Settings, Globe, Eye, EyeOff, Upload, CheckCircle, Clock,
  Plus, Pencil, Trash2, Check, AlertTriangle, X, Languages, CreditCard,
  Download,
} from 'lucide-react';
import { getProfileCompletion, type ProfileLang } from '@/lib/profile-completion';

const CRAFT_ROLE_KEYS: { value: string; icon: string; isImg?: boolean; grad?: string }[] = [
  { value: 'PDR_TECHNICIAN', icon: '/icons/pdr-technician.png', isImg: true, grad: 'from-brand-600 to-brand-800' },
  { value: 'CAR_PAINTER',    icon: '/icons/car-painter.png',    isImg: true, grad: 'from-slate-600 to-brand-700' },
  { value: 'PREPARER',       icon: '/icons/preparer.png',       isImg: true, grad: 'from-brand-700 to-slate-700' },
  { value: 'DISMANTLER',     icon: '/icons/dismantler.png',     isImg: true, grad: 'from-slate-500 to-slate-700' },
];

/* ── role metadata ─────────────────────────────────────── */
const ROLE_LABELS: Record<string, string> = {
  PDR_TECHNICIAN: 'PDR Technician',
  CAR_PAINTER: 'Car Painter',
  PREPARER: 'Preparer',
  DISMANTLER: 'Dismantler',
  CUSTOMER: 'Client',
};

const SERVICES_BY_ROLE: Record<string, string[]> = {
  PDR_TECHNICIAN: ['Hail Damage', 'Door Dings', 'Large Dents', 'Glue Pull', 'Blending'],
  CAR_PAINTER: ['Full Respray', 'Panel Repair', 'Blending', 'Bumper Painting', 'Color Matching'],
  PREPARER: ['Sanding', 'Masking', 'Priming', 'Polishing', 'Surface Cleaning'],
  DISMANTLER: ['Engine Removal', 'Body Parts', 'Interior', 'Electrical', 'Full Strip'],
  CUSTOMER: ['Hail Repair', 'Paint Correction', 'Full Restoration', 'Fleet Maintenance'],
};

/** Maps English service-name (stored in DB) → i18n key suffix */
const SERVICE_KEY_MAP: Record<string, string> = {
  'Hail Damage':      'hailDamage',
  'Door Dings':       'doorDings',
  'Large Dents':      'largeDents',
  'Glue Pull':        'gluePull',
  'Blending':         'blending',
  'Full Respray':     'fullRespray',
  'Panel Repair':     'panelRepair',
  'Bumper Painting':  'bumperPainting',
  'Color Matching':   'colorMatching',
  'Sanding':          'sanding',
  'Masking':          'masking',
  'Priming':          'priming',
  'Polishing':        'polishing',
  'Surface Cleaning': 'surfaceCleaning',
  'Engine Removal':   'engineRemoval',
  'Body Parts':       'bodyParts',
  'Interior':         'interior',
  'Electrical':       'electrical',
  'Full Strip':       'fullStrip',
  'Hail Repair':      'hailRepair',
  'Paint Correction': 'paintCorrection',
  'Full Restoration': 'fullRestoration',
  'Fleet Maintenance':'fleetMaintenance',
};

/* ── helpers ───────────────────────────────────────────── */
type Tab = 'overview' | 'experience' | 'gallery' | 'references' | 'settings';

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          className={`text-2xl leading-none transition ${
            n <= value ? 'text-amber-400' : 'text-gray-300'
          } ${onChange ? 'hover:text-amber-300 cursor-pointer' : 'cursor-default'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, text, hint }: { icon: any; text: string; hint: string }) {
  return (
    <div className="card flex flex-col items-center justify-center py-14 text-center">
      <Icon className="h-12 w-12 text-gray-200 mb-4" />
      <p className="text-sm font-medium text-gray-500">{text}</p>
      <p className="text-xs text-gray-400 mt-1">{hint}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE COMPONENT
═══════════════════════════════════════════════════════════ */
export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabRef = useRef<HTMLDivElement>(null);

  /* loading / profile */
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>(() => {
    const t = searchParams?.get('tab') as Tab | null;
    return t && ['overview','experience','gallery','references','settings'].includes(t) ? t : 'overview';
  });

  /* delete account */
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0); // 0=hidden,1=warn,2=confirm
  const [deletingAccount, setDeletingAccount] = useState(false);

  /* per-section saving flags */
  const [savingOverview, setSavingOverview]     = useState(false);
  const [savingExperience, setSavingExperience] = useState(false);
  const [savingReferences, setSavingReferences] = useState(false);
  const [savingSettings, setSavingSettings]     = useState(false);
  const [avatarUploading, setAvatarUploading]   = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);

  /* ── pending media awaiting admin approval ── */
  const [pendingGallery, setPendingGallery]     = useState<import('@/types/database').Document[]>([]);
  const [pendingAvatar,  setPendingAvatar]      = useState<import('@/types/database').Document | null>(null);
  const [deletingAvatar, setDeletingAvatar]     = useState(false);

  /* ── identity document ── */
  const [hasIdentityDoc, setHasIdentityDoc]     = useState(false);
  const [identityDocUploading, setIdentityDocUploading] = useState(false);

  /* ── Australia work visa document ── */
  const [hasWorkVisaDoc, setHasWorkVisaDoc]     = useState(false);
  const [workVisaDocUploading, setWorkVisaDocUploading] = useState(false);

  /* ── all docs (for completion check) ── */
  const [allDocuments, setAllDocuments]         = useState<any[]>([]);

  /* ── overview fields ── */
  const [fullName, setFullName]                 = useState('');
  const [phoneCode, setPhoneCode]               = useState('+49');
  const [phoneNumber, setPhoneNumber]           = useState('');
  const [preferredLang, setPreferredLang]       = useState('en');
  const [companyName, setCompanyName]           = useState('');
  const [companyAddress, setCompanyAddress]     = useState('');
  const [companyStreet, setCompanyStreet]       = useState('');
  const [companyHouseNumber, setCompanyHouseNumber] = useState('');
  const [companyZip, setCompanyZip]             = useState('');
  const [companyCountry, setCompanyCountry]     = useState('');
  const [vatId, setVatId]                       = useState('');
  const [hasCompanyDoc, setHasCompanyDoc]       = useState(false);
  const [companyDocUploading, setCompanyDocUploading] = useState(false);
  const [bio, setBio]                           = useState('');

  // Auto-derive Bundesland from company ZIP when country is DE
  const companyBundesland = companyCountry === 'DE' ? plzToBundesland(companyZip) : '';

  /* ── experience ── */
  const [experiences, setExperiences]           = useState<ExperienceEntry[]>([]);
  const [expForm, setExpForm]                   = useState<ExperienceEntry | null>(null);

  /* ── gallery ── */
  const [galleryUrls, setGalleryUrls]           = useState<string[]>([]);

  /* ── references ── */
  const [references, setReferences]             = useState<ReferenceEntry[]>([]);
  const [refForm, setRefForm]                   = useState<ReferenceEntry | null>(null);

  /* ── settings ── */
  const [services, setServices]                 = useState<string[]>([]);
  const [countries, setCountries]               = useState<string[]>([]);
  const [visiblePublic, setVisiblePublic]       = useState(false);
  const [secondaryRoles, setSecondaryRoles]     = useState<string[]>([]);
  const [savingSkills, setSavingSkills]         = useState(false);

  /* ── load ─────────────────────────────────────────────── */
  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
    if (data) {
      setProfile(data);
      setFullName(data.full_name ?? '');
      const parsed = parsePhone(data.phone ?? '');
      setPhoneCode(parsed.code);
      setPhoneNumber(parsed.num);
      setPreferredLang(['en','de','el','es'].includes(data.preferred_language) ? data.preferred_language : 'en');
      setCompanyName(data.company_name ?? '');
      setCompanyAddress(data.company_address ?? '');
      setCompanyStreet(data.company_street ?? '');
      setCompanyHouseNumber(data.company_house_number ?? '');
      setCompanyZip(data.company_zip ?? '');
      setCompanyCountry(data.company_country ?? '');
      setVatId(data.vat_id ?? '');
      setBio(data.bio ?? '');
      setExperiences(Array.isArray(data.work_experience) ? data.work_experience : []);
      setGalleryUrls(Array.isArray(data.gallery_urls) ? data.gallery_urls : []);
      setReferences(Array.isArray(data.profile_references) ? data.profile_references : []);
      setServices(data.services ?? []);
      setCountries(data.available_countries ?? []);
      setVisiblePublic(data.visible_public ?? false);
      setSecondaryRoles(Array.isArray(data.secondary_roles) ? data.secondary_roles : []);
    }
    // Load ALL documents in one query — used for completion check + pending media
    const { data: allDocs } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    const docs = allDocs ?? [];
    setAllDocuments(docs);
    setHasCompanyDoc(docs.some((d: any) => d.type === 'COMPANY_DOC'));
    setHasIdentityDoc(docs.some((d: any) => d.type === 'IDENTITY_DOC'));
    setHasWorkVisaDoc(docs.some((d: any) => d.type === 'WORK_VISA'));
    const pm = docs.filter((d: any) =>
      ['GALLERY_IMAGE', 'AVATAR'].includes(d.type) && d.status === 'pending',
    );
    setPendingGallery(pm.filter((d: any) => d.type === 'GALLERY_IMAGE'));
    setPendingAvatar(pm.find((d: any) => d.type === 'AVATAR') ?? null);

    // Self-heal: if avatar_url is missing but a verified AVATAR document exists,
    // repair it via the server-side API (uses service-role to bypass RLS).
    if (!data?.avatar_url) {
      fetch('/api/profile/fix-avatar', { method: 'POST' })
        .then(r => r.json())
        .then(({ fixed, avatar_url }) => {
          if (fixed && avatar_url) {
            setProfile((p: any) => ({ ...p, avatar_url }));
          }
        })
        .catch(() => {});
    }

    setLoading(false);
  };

  const userId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  };

  /* ── save helpers ─────────────────────────────────────── */
  const saveOverview = async () => {
    if (!fullName.trim()) { toast.error(t('profile.errNameRequired')); return; }
    if (!phoneNumber.trim()) { toast.error(t('profile.errPhoneRequired')); return; }

    // Company fields — all mandatory
    if (!companyName.trim()) { toast.error(t('profile.errCompanyRequired')); return; }
    if (!companyStreet.trim()) { toast.error(t('profile.errStreetRequired')); return; }
    if (!companyHouseNumber.trim()) { toast.error(t('profile.errHouseRequired')); return; }
    if (!companyZip.trim()) { toast.error(t('profile.errZipRequired')); return; }
    if (!companyCountry) { toast.error(t('profile.errCountryRequired')); return; }
    if (EUROPEAN_COUNTRY_CODES.has(companyCountry) && !vatId.trim()) {
      toast.error(t('profile.errVatRequired')); return;
    }
    if (!hasCompanyDoc) {
      toast.error(t('profile.errCompanyDocRequired')); return;
    }

    setSavingOverview(true);
    const uid = await userId();
    if (!uid) return;
    const fullPhone = `${phoneCode} ${phoneNumber.trim()}`;
    // Auto-derive Bundesland from company ZIP for German companies
    const derivedPlz = companyCountry === 'DE' ? companyZip.trim() : null;
    const derivedBl  = derivedPlz ? (plzToBundesland(derivedPlz) || null) : null;

    // If the user was previously verified, any company/identity data change
    // requires admin re-verification before going back live in search.
    const wasVerified = profile?.is_verified === true;

    const overviewUpdate: Record<string, unknown> = {
      full_name: fullName.trim(),
      phone: fullPhone,
      preferred_language: preferredLang,
      company_name: companyName.trim() || null,
      company_street: companyStreet.trim() || null,
      company_house_number: companyHouseNumber.trim() || null,
      company_zip: companyZip.trim() || null,
      company_country: companyCountry || null,
      vat_id: vatId.trim() || null,
      bio: bio.trim() || null,
      postal_code: derivedPlz,
      bundesland: derivedBl,
    };
    if (wasVerified) {
      overviewUpdate.is_verified = false;
      overviewUpdate.verification_requested_at = null;
    }

    const { error } = await supabase.from('users').update(overviewUpdate).eq('id', uid);
    setSavingOverview(false);
    if (error) toast.error(error.message);
    else {
      i18n.changeLanguage(preferredLang);
      setProfile((p: any) => ({
        ...p,
        full_name: fullName,
        phone: fullPhone,
        preferred_language: preferredLang,
        company_name: companyName,
        company_street: companyStreet,
        company_house_number: companyHouseNumber,
        company_zip: companyZip,
        company_country: companyCountry,
        vat_id: vatId,
        bio,
        ...(wasVerified ? { is_verified: false, verification_requested_at: null } : {}),
      }));
      if (wasVerified) {
        toast.success(t('profile.savedNeedsReverification'), { duration: 6000 });
      } else {
        toast.success(t('profile.saved'));
      }
    }
  };

  const persistExperiences = async (exps: ExperienceEntry[]) => {
    setSavingExperience(true);
    const uid = await userId();
    if (!uid) return;
    const { error } = await supabase.from('users').update({ work_experience: exps }).eq('id', uid);
    setSavingExperience(false);
    if (error) toast.error(error.message);
    else toast.success(t('profile.saved'));
  };

  const persistReferences = async (refs: ReferenceEntry[]) => {
    setSavingReferences(true);
    const uid = await userId();
    if (!uid) return;
    const { error } = await supabase.from('users').update({ profile_references: refs }).eq('id', uid);
    setSavingReferences(false);
    if (error) toast.error(error.message);
    else toast.success(t('profile.saved'));
  };

  const saveSettings = async () => {
    if (countries.length === 0) {
      toast.error(t('profile.countriesRequired'));
      return;
    }
    setSavingSettings(true);
    const uid = await userId();
    if (!uid) return;

    // If the user was verified and their available countries changed,
    // they need admin re-verification (countries are a core prerequisite).
    const wasVerified = profile?.is_verified === true;
    const prevCountries = [...(profile?.available_countries ?? [])].sort().join(',');
    const newCountries  = [...countries].sort().join(',');
    const countriesChanged = prevCountries !== newCountries;

    const settingsUpdate: Record<string, unknown> = {
      services,
      available_countries: countries,
      visible_public: visiblePublic,
      preferred_language: preferredLang,
    };
    if (wasVerified && countriesChanged) {
      settingsUpdate.is_verified = false;
      settingsUpdate.verification_requested_at = null;
    }

    const { error } = await supabase.from('users').update(settingsUpdate).eq('id', uid);
    setSavingSettings(false);
    if (error) toast.error(error.message);
    else {
      i18n.changeLanguage(preferredLang);
      if (wasVerified && countriesChanged) {
        setProfile((p: any) => ({
          ...p,
          available_countries: countries,
          is_verified: false,
          verification_requested_at: null,
        }));
        toast.success(t('profile.savedNeedsReverification'), { duration: 6000 });
      } else {
        toast.success(t('profile.saved'));
      }
    }
  };

  const saveSkills = async () => {
    setSavingSkills(true);
    const uid = await userId();
    if (!uid) return;
    const { error } = await supabase.from('users').update({ secondary_roles: secondaryRoles }).eq('id', uid);
    setSavingSkills(false);
    if (error) toast.error(error.message);
    else toast.success(t('profile.skillsSaved'));
  };

  /* ── delete account ──────────────────────────────────── */
  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' });
      if (!res.ok) {
        const { error } = await res.json();
        toast.error(error ?? t('profile.deleteError'));
        setDeletingAccount(false);
        return;
      }
      setDeleteStep(0);
      toast.success(t('profile.deleteSuccess'));
      router.push('/login');
    } catch {
      toast.error(t('profile.networkError'));
      setDeletingAccount(false);
    }
  };

  /* ── avatar remove ───────────────────────────────────── */
  const handleAvatarRemove = async () => {
    setDeletingAvatar(true);
    const res = await fetch('/api/profile/fix-avatar', { method: 'DELETE' });
    setDeletingAvatar(false);
    if (!res.ok) { toast.error('Failed to remove photo'); return; }
    setProfile((p: any) => ({ ...p, avatar_url: null }));
    toast.success(t('profile.avatarRemoved'));
  };

  /* ── avatar upload ────────────────────────────────────── */
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error(t('profile.avatarTooLarge')); return; }
    setAvatarUploading(true);
    const uid = await userId();
    if (!uid) return;
    const ext = file.name.split('.').pop();
    const path = `${uid}/avatar_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: false });
    if (error) { toast.error(error.message); setAvatarUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    // Directly update avatar_url — no admin approval needed for profile photos
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', uid);
    setAvatarUploading(false);
    if (updateError) { toast.error(updateError.message); return; }
    setProfile((p: any) => ({ ...p, avatar_url: publicUrl }));
    toast.success(t('profile.avatarUploaded'));
  };

  /* ── gallery upload ───────────────────────────────────── */
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (galleryUrls.length + pendingGallery.length >= 6) { toast.error(t('profile.galleryFull')); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5 MB per image'); return; }
    setGalleryUploading(true);
    const uid = await userId();
    if (!uid) return;
    const ext = file.name.split('.').pop();
    const path = `${uid}/gallery/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: false });
    if (error) { toast.error(error.message); setGalleryUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    // Insert pending document row — admin must approve before image appears in gallery
    const { error: dbError } = await supabase.from('documents').insert({
      user_id: uid,
      type: 'GALLERY_IMAGE',
      file_url: publicUrl,
      status: 'pending',
    });
    setGalleryUploading(false);
    if (dbError) { toast.error(dbError.message); return; }
    toast.success(t('profile.imageUploadedPending'));
    fetch('/api/admin/notify-new-doc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docType: 'GALLERY_IMAGE' }),
    }).catch(() => {});
    load();
    e.target.value = '';
  };

  /* ── company document upload ─────────────────────────────── */
  const handleCompanyDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error(t('documents.errors.tooLarge')); return; }
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) { toast.error(t('documents.errors.invalidType')); return; }

    setCompanyDocUploading(true);
    const uid = await userId();
    if (!uid) { setCompanyDocUploading(false); return; }

    const ext = file.name.split('.').pop();
    const path = `${uid}/COMPANY_DOC_${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('documents').upload(path, file);
    if (uploadError) { toast.error(uploadError.message); setCompanyDocUploading(false); return; }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const fileUrl = `${supabaseUrl}/storage/v1/object/public/documents/${path}`;

    const { error: dbError } = await supabase.from('documents').insert({
      user_id: uid,
      type: 'COMPANY_DOC',
      file_url: fileUrl,
      status: 'pending',
    });

    setCompanyDocUploading(false);
    if (dbError) { toast.error(dbError.message); return; }
    setHasCompanyDoc(true);
    toast.success(t('profile.companyDocUploadedToast'));
    fetch('/api/admin/notify-new-doc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docType: 'COMPANY_DOC' }),
    }).catch(() => {});
    e.target.value = '';
  };

  /* ── identity document upload ──────────────────────────── */
  const handleIdentityDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error(t('documents.errors.tooLarge')); return; }
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) { toast.error(t('documents.errors.invalidType')); return; }

    setIdentityDocUploading(true);
    const uid = await userId();
    if (!uid) { setIdentityDocUploading(false); return; }

    const ext = file.name.split('.').pop();
    const path = `${uid}/IDENTITY_DOC_${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('documents').upload(path, file);
    if (uploadError) { toast.error(uploadError.message); setIdentityDocUploading(false); return; }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const fileUrl = `${supabaseUrl}/storage/v1/object/public/documents/${path}`;

    const { error: dbError } = await supabase.from('documents').insert({
      user_id: uid,
      type: 'IDENTITY_DOC',
      file_url: fileUrl,
      status: 'pending',
    });

    setIdentityDocUploading(false);
    if (dbError) { toast.error(dbError.message); return; }
    setHasIdentityDoc(true);
    setAllDocuments(prev => [...prev, { type: 'IDENTITY_DOC', status: 'pending' }]);
    toast.success(t('profile.identityDocUploadedToast'));
    fetch('/api/admin/notify-new-doc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docType: 'IDENTITY_DOC' }),
    }).catch(() => {});
    e.target.value = '';
  };

  /* ── Australia work visa upload ────────────────────────── */
  const handleWorkVisaDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error(t('documents.errors.tooLarge')); return; }
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) { toast.error(t('documents.errors.invalidType')); return; }

    setWorkVisaDocUploading(true);
    const uid = await userId();
    if (!uid) { setWorkVisaDocUploading(false); return; }

    const ext = file.name.split('.').pop();
    const path = `${uid}/WORK_VISA_${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('documents').upload(path, file);
    if (uploadError) { toast.error(uploadError.message); setWorkVisaDocUploading(false); return; }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const fileUrl = `${supabaseUrl}/storage/v1/object/public/documents/${path}`;

    const { error: dbError } = await supabase.from('documents').insert({
      user_id: uid,
      type: 'WORK_VISA',
      file_url: fileUrl,
      status: 'pending',
    });

    setWorkVisaDocUploading(false);
    if (dbError) { toast.error(dbError.message); return; }
    setHasWorkVisaDoc(true);
    setAllDocuments(prev => [...prev, { type: 'WORK_VISA', status: 'pending' }]);
    toast.success(t('profile.workVisaDocUploadedToast', 'Work visa uploaded — awaiting review'));
    fetch('/api/admin/notify-new-doc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docType: 'WORK_VISA' }),
    }).catch(() => {});
    e.target.value = '';
  };

  const removeGalleryImage = async (url: string) => {
    const newUrls = galleryUrls.filter(u => u !== url);
    const uid = await userId();
    if (!uid) return;
    await supabase.from('users').update({ gallery_urls: newUrls }).eq('id', uid);
    setGalleryUrls(newUrls);
    toast.success(t('profile.imageRemoved'));
  };

  /** Cancel a pending gallery image or avatar upload before admin reviews it */
  const cancelPendingMedia = async (docId: string) => {
    await supabase.from('documents').delete().eq('id', docId);
    setPendingGallery(prev => prev.filter(d => d.id !== docId));
    if (pendingAvatar?.id === docId) setPendingAvatar(null);
    toast.success(t('profile.uploadCanceled'));
  };

  /* ── early returns ────────────────────────────────────── */
  if (loading) return <div className="flex items-center justify-center py-24 text-gray-400">{t('common.loading')}</div>;

  const roleServices = SERVICES_BY_ROLE[profile?.role] ?? [];
  const currentYear  = new Date().getFullYear();

  /* ── profile completion ──────────────────────────────── */
  const completion = getProfileCompletion(profile, allDocuments);
  const langKey = (['en','de','es','el'].includes(i18n.language.slice(0,2))
    ? i18n.language.slice(0,2) : 'en') as ProfileLang;

  /** Map completion step key → in-page section id */
  const STEP_SECTION: Record<string, string | undefined> = {
    company_info: undefined,           // first section in overview — tab scroll is enough
    company_doc:  'section-company-doc',
    services:     undefined,           // first section in settings — tab scroll is enough
    countries:    'section-countries',
    identity_doc: 'section-identity-doc',
  };

  /** Switch tab AND scroll to the specific section */
  const goToTab = (targetTab: Tab, sectionId?: string) => {
    setTab(targetTab);
    setTimeout(() => {
      const el = sectionId
        ? document.getElementById(sectionId)
        : tabRef.current;
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  /** Translate a role key → localised label */
  const tRole = (key?: string) =>
    key ? t(`profile.roles.${key}`, { defaultValue: ROLE_LABELS[key] ?? key }) : '—';

  /** Translate an English service name stored in DB → localised label */
  const tSvc = (svc: string) => {
    const k = SERVICE_KEY_MAP[svc];
    return k ? t(`profile.services.${k}`, { defaultValue: svc }) : svc;
  };

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview',    label: t('profile.tabs.overview'),    icon: Building2 },
    { id: 'experience',  label: t('profile.tabs.experience'),  icon: Briefcase },
    { id: 'gallery',     label: t('profile.tabs.gallery'),     icon: Camera },
    { id: 'references',  label: t('profile.tabs.references'),  icon: Star },
    { id: 'settings',    label: t('profile.tabs.settings'),    icon: Settings },
  ];

  /* ══════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6 pb-12">

      {/* ── page title ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('profile.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('profile.subtitle')}</p>
      </div>

      {/* ── verification banner ── */}
      {!profile?.is_verified && (
        <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800">
          {t('profile.notVerifiedWarning')}
        </div>
      )}

      {/* ── Profile Completion Tracker ── */}
      {!profile?.is_admin && !completion.complete && (
        <div className="card border-orange-200 bg-orange-50">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <h3 className="font-semibold text-orange-800 flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                {t('profile.completion.title', 'Complete your profile')}
              </h3>
              <p className="text-xs text-orange-600 mt-0.5">
                {t('profile.completion.subtitle', 'Profiles that are not complete are not shown in the search.')}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-xl font-bold text-orange-600">{completion.doneCount}</span>
              <span className="text-sm text-orange-400 font-medium"> / 5</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-orange-200 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${(completion.doneCount / 5) * 100}%` }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-1.5">
            {completion.steps.map(step => (
              <div
                key={step.key}
                className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 ${
                  step.done ? 'bg-green-50 border border-green-100' : 'bg-white border border-orange-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {step.done
                    ? <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    : <AlertTriangle className="h-4 w-4 text-orange-400 flex-shrink-0" />
                  }
                  <span className={`text-sm font-medium ${step.done ? 'text-green-700' : 'text-gray-700'}`}>
                    {step.labels[langKey]}
                  </span>
                </div>
                {!step.done && (
                  <button
                    type="button"
                    onClick={() => goToTab(step.tab as Tab, STEP_SECTION[step.key])}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-800 underline flex-shrink-0 whitespace-nowrap"
                  >
                    {t('profile.completion.goTo', 'Go to')} {t(`profile.tabs.${step.tab}`, step.tab)} →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Profile Complete ── (show briefly when all done) */}
      {!profile?.is_admin && completion.complete && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-3 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          <p className="text-sm font-medium text-green-700">
            {t('profile.completion.complete', 'Your profile is complete and visible in the search!')}
          </p>
        </div>
      )}

      {/* ── Profile Header Card ────────────────────────────── */}
      <div className="card overflow-hidden">
        {/* coloured top strip */}
        <div className="h-2 -mx-6 -mt-6 mb-5 bg-gradient-to-r from-brand-600 to-brand-400 rounded-t-xl" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">

          {/* avatar + always-visible action buttons */}
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <div className="relative">
              {/* Show approved avatar, OR pending avatar with amber ring, OR initials */}
              {(profile?.avatar_url || pendingAvatar?.file_url) ? (
                <img
                  src={profile?.avatar_url ?? pendingAvatar!.file_url}
                  alt="Avatar"
                  className={`h-24 w-24 rounded-full object-cover shadow-md ring-4 ${
                    profile?.avatar_url ? 'ring-white' : 'ring-amber-400'
                  }`}
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-100 text-4xl font-bold text-brand-700 shadow-md ring-4 ring-white">
                  {fullName?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
              )}
              {profile?.is_verified && (
                <CheckCircle className="absolute -bottom-1 -right-1 h-6 w-6 text-green-500 bg-white rounded-full shadow" />
              )}
              {/* Pending badge on the image itself */}
              {pendingAvatar && !profile?.avatar_url && (
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-amber-400 flex items-center justify-center shadow" title={t('profile.avatarPending')}>
                  <Clock className="h-3.5 w-3.5 text-white" />
                </div>
              )}
            </div>

            {/* Action buttons — always visible, work on mobile too */}
            <div className="flex gap-1.5 flex-wrap justify-center">
              {pendingAvatar ? (
                /* Pending state: show cancel option and allow replacing */
                <>
                  <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                    <Clock className="h-3 w-3" /> {t('profile.avatarPending')}
                  </span>
                  <button
                    type="button"
                    onClick={() => cancelPendingMedia(pendingAvatar.id)}
                    className="flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-500 transition hover:bg-red-50 shadow-sm"
                  >
                    <Trash2 className="h-3 w-3" /> {t('profile.cancelUpload')}
                  </button>
                </>
              ) : (
                /* No pending: upload/change/remove */
                <>
                  <label className={`flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 cursor-pointer transition hover:bg-gray-50 shadow-sm ${avatarUploading ? 'opacity-50 cursor-wait' : ''}`}>
                    <Upload className="h-3 w-3" />
                    {avatarUploading ? t('profile.uploading') : (profile?.avatar_url ? t('profile.changePhoto') : t('profile.uploadPhoto'))}
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={avatarUploading} />
                  </label>
                  {profile?.avatar_url && (
                    <button
                      type="button"
                      onClick={handleAvatarRemove}
                      disabled={deletingAvatar}
                      className="flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-500 transition hover:bg-red-50 shadow-sm disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      {deletingAvatar ? '…' : t('profile.removePhoto')}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* name + role + badges + bio preview */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-900 truncate">{fullName || '—'}</h2>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {profile?.is_admin ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                  🛡 Administrator
                </span>
              ) : (
                <>
                  <span className="text-xs font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                    {tRole(profile?.role)}
                  </span>
                  {secondaryRoles.map(sr => (
                    <span key={sr} className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                      {tRole(sr)}
                    </span>
                  ))}
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
              {profile?.is_verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  <CheckCircle className="h-3 w-3" /> {t('dashboard.verified')}
                </span>
              )}
              {profile?.is_premium && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                  ★ Premium
                </span>
              )}
              {companyName && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  <Building2 className="h-3 w-3" /> {companyName}
                </span>
              )}
            </div>

            {bio && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2 italic">"{bio}"</p>
            )}

            {/* Pending avatar notice */}
            {pendingAvatar && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs text-amber-700">
                <Clock className="h-3 w-3 flex-shrink-0" />
                {t('profile.avatarPending')}
                <button
                  type="button"
                  onClick={() => cancelPendingMedia(pendingAvatar.id)}
                  className="ml-1 text-amber-500 hover:text-red-500 transition"
                  title={t('profile.cancelUpload')}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* quick-stat column */}
          <div className="flex sm:flex-col gap-5 sm:gap-3 text-center flex-shrink-0">
            {[
              { count: experiences.length, label: t('profile.tabs.experience') },
              { count: references.length,  label: t('profile.tabs.references') },
              { count: galleryUrls.length, label: t('profile.tabs.gallery') },
            ].map(({ count, label }) => (
              <div key={label}>
                <div className="text-lg font-bold text-brand-600">{count}</div>
                <div className="text-xs text-gray-400">{label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Tab Navigation ────────────────────────────────── */}
      <div ref={tabRef} className="flex overflow-x-auto gap-1 rounded-xl bg-gray-100 p-1 no-scrollbar">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition flex-1 justify-center ${
              tab === id
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════
          OVERVIEW TAB — Firmendaten
      ═════════════════════════════════════════════════════ */}
      {tab === 'overview' && (
        <div className="space-y-5">

          {/* ── Firmendaten ── */}
          <div className="card space-y-5">
            <div>
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-base">
                <Building2 className="h-5 w-5 text-brand-600" />
                {t('profile.companySection')}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {t('profile.allRequired')} <span className="text-red-400 font-medium">*</span>
              </p>
            </div>

            {/* Firmenname */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('profile.companyName')} <span className="text-red-400">*</span>
              </label>
              <input
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="input"
                placeholder={t('profile.companyNameEx')}
              />
            </div>

            {/* Ansprechpartner */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('profile.contactName')} <span className="text-red-400">*</span>
              </label>
              <input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="input"
                placeholder={t('profile.contactNameEx')}
              />
            </div>

            {/* Telefon mit Ländervorwahl */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('profile.phone')} <span className="text-red-400">*</span>
              </label>
              <div className="flex">
                <select
                  value={phoneCode}
                  onChange={e => setPhoneCode(e.target.value)}
                  className="rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 px-2 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 flex-shrink-0"
                  style={{ minWidth: '90px' }}
                >
                  {PHONE_CODES.map(({ code, flag }) => (
                    <option key={code} value={code}>{flag} {code}</option>
                  ))}
                </select>
                <input
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value.replace(/[^\d\s\-().]/g, ''))}
                  type="tel"
                  className="flex-1 rounded-r-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 min-w-0"
                  placeholder="123 456789"
                />
              </div>
            </div>

            {/* Straße + Hausnummer */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('profile.street')} <span className="text-red-400">*</span>
                </label>
                <input
                  value={companyStreet}
                  onChange={e => setCompanyStreet(e.target.value)}
                  className="input"
                  placeholder={t('profile.streetEx')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('profile.houseNumber')} <span className="text-red-400">*</span>
                </label>
                <input
                  value={companyHouseNumber}
                  onChange={e => setCompanyHouseNumber(e.target.value)}
                  className="input"
                  placeholder={t('profile.houseNumberEx')}
                />
              </div>
            </div>

            {/* PLZ + Land */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('profile.zip')} <span className="text-red-400">*</span>
                </label>
                <input
                  value={companyZip}
                  onChange={e => setCompanyZip(e.target.value)}
                  className="input"
                  placeholder={t('profile.zipEx')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('profile.country')} <span className="text-red-400">*</span>
                </label>
                <select
                  value={companyCountry}
                  onChange={e => setCompanyCountry(e.target.value)}
                  className="input"
                >
                  <option value="">{t('profile.countryPlaceholder')}</option>
                  {COUNTRIES.map(({ code, name }) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Auto-detected Bundesland for German companies */}
            {companyCountry === 'DE' && companyBundesland && (
              <div className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-200 px-4 py-2.5">
                <span className="text-lg">🗺️</span>
                <div>
                  <p className="text-xs text-blue-500 font-medium">{t('profile.bundeslandAuto')}</p>
                  <p className="text-sm font-semibold text-blue-800">{companyBundesland}</p>
                </div>
              </div>
            )}

            {/* IVA / USt-IdNr. — required for all European companies */}
            {companyCountry && EUROPEAN_COUNTRY_CODES.has(companyCountry) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('profile.vatLabel')} <span className="text-red-400">*</span>
                </label>
                <input
                  value={vatId}
                  onChange={e => setVatId(e.target.value)}
                  className="input font-mono tracking-wide"
                  placeholder={t('profile.vatEx')}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {t('profile.vatHint')}
                </p>
              </div>
            )}

            {/* Company Document Upload */}
            <div id="section-company-doc">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.companyDocLabel')} <span className="text-red-400">*</span>
              </label>
              {hasCompanyDoc ? (
                <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-700">{t('profile.companyDocUploaded')}</p>
                    <p className="text-xs text-green-600">{t('profile.companyDocPending')}</p>
                  </div>
                  <label className={`flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 cursor-pointer transition hover:bg-gray-50 flex-shrink-0 ${companyDocUploading ? 'opacity-50 cursor-wait' : ''}`}>
                    <Upload className="h-3.5 w-3.5" />
                    {companyDocUploading ? t('profile.companyDocUploading') : t('profile.companyDocReplace')}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      disabled={companyDocUploading}
                      onChange={handleCompanyDocUpload}
                    />
                  </label>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-7 cursor-pointer transition ${
                  companyDocUploading
                    ? 'opacity-50 cursor-wait border-gray-200 bg-gray-50'
                    : 'border-orange-300 bg-orange-50 hover:border-orange-400 hover:bg-orange-100'
                }`}>
                  <Building2 className="h-9 w-9 text-orange-400" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-orange-700">
                      {companyDocUploading ? t('profile.companyDocUploading') : t('profile.companyDocUpload')}
                    </p>
                    <p className="text-xs text-orange-500 mt-0.5">
                      {t('profile.companyDocHint')}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    disabled={companyDocUploading}
                    onChange={handleCompanyDocUpload}
                  />
                </label>
              )}
            </div>

            {/* Identity Document Upload (Passport / EU ID) */}
            <div id="section-identity-doc">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.identityDocLabel', 'Passport or EU ID')} <span className="text-red-400">*</span>
              </label>
              <p className="text-xs text-gray-400 mb-2">
                {t('profile.identityDocHint', 'Required for identity verification. Accepted: PDF, JPG, PNG · max 10 MB')}
              </p>
              {hasIdentityDoc ? (
                <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-700">{t('profile.identityDocUploaded', 'Identity document uploaded')}</p>
                    <p className="text-xs text-green-600">{t('profile.identityDocPending', 'Awaiting admin review')}</p>
                  </div>
                  <label className={`flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 cursor-pointer transition hover:bg-gray-50 flex-shrink-0 ${identityDocUploading ? 'opacity-50 cursor-wait' : ''}`}>
                    <Upload className="h-3.5 w-3.5" />
                    {identityDocUploading ? t('profile.companyDocUploading') : t('profile.companyDocReplace', 'Replace')}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      disabled={identityDocUploading}
                      onChange={handleIdentityDocUpload}
                    />
                  </label>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-7 cursor-pointer transition ${
                  identityDocUploading
                    ? 'opacity-50 cursor-wait border-gray-200 bg-gray-50'
                    : 'border-red-300 bg-red-50 hover:border-red-400 hover:bg-red-100'
                }`}>
                  <CreditCard className="h-9 w-9 text-red-400" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-red-700">
                      {identityDocUploading ? t('profile.companyDocUploading') : t('profile.identityDocUpload', 'Upload Passport or EU ID')}
                    </p>
                    <p className="text-xs text-red-500 mt-0.5">
                      {t('profile.identityDocHint', 'PDF, JPG or PNG · max 10 MB')}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    disabled={identityDocUploading}
                    onChange={handleIdentityDocUpload}
                  />
                </label>
              )}
            </div>

            {/* Australia Work Visa — invitation templates (download for everyone) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.workVisaTemplatesLabel', '🇦🇺 Australia Work Visa — invitation templates')}
              </label>
              <p className="text-xs text-gray-400 mb-2">
                {t('profile.workVisaTemplatesHint', 'Download the official Subclass 400 invitation-letter templates, fill in your applicant details, and send them back to start your visa application.')}
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href="https://spmbtjynxbqpecgumadv.supabase.co/storage/v1/object/public/visa-templates/ADR-Subclass-400-Visa-Invitation-Template.docx"
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex flex-1 items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-sky-400 hover:bg-sky-50"
                >
                  <FileText className="h-5 w-5 text-sky-500 flex-shrink-0" />
                  <span className="flex-1">{t('profile.workVisaTemplateAdr', 'ADR — Subclass 400 Invitation Template')}</span>
                  <Download className="h-4 w-4 text-gray-400 flex-shrink-0" />
                </a>
                <a
                  href="https://spmbtjynxbqpecgumadv.supabase.co/storage/v1/object/public/visa-templates/PDR-Team-Visa-Invitation-Template.docx"
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex flex-1 items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-sky-400 hover:bg-sky-50"
                >
                  <FileText className="h-5 w-5 text-sky-500 flex-shrink-0" />
                  <span className="flex-1">{t('profile.workVisaTemplatePdr', 'PDR-Team — Subclass 400 Invitation Template')}</span>
                  <Download className="h-4 w-4 text-gray-400 flex-shrink-0" />
                </a>
              </div>
            </div>

            {/* Australia Work Visa Upload */}
            <div id="section-work-visa-doc">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.workVisaDocLabel', '🇦🇺 Upload your Australia Work Visa')}
              </label>
              <p className="text-xs text-gray-400 mb-2">
                {t('profile.workVisaDocHint', 'Upload your approved Subclass 400 work visa once it is granted. Accepted: PDF, JPG, PNG · max 10 MB')}
              </p>
              {hasWorkVisaDoc ? (
                <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-700">{t('profile.workVisaDocUploaded', 'Work visa uploaded')}</p>
                    <p className="text-xs text-green-600">{t('profile.identityDocPending', 'Awaiting admin review')}</p>
                  </div>
                  <label className={`flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 cursor-pointer transition hover:bg-gray-50 flex-shrink-0 ${workVisaDocUploading ? 'opacity-50 cursor-wait' : ''}`}>
                    <Upload className="h-3.5 w-3.5" />
                    {workVisaDocUploading ? t('profile.companyDocUploading') : t('profile.companyDocReplace', 'Replace')}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      disabled={workVisaDocUploading}
                      onChange={handleWorkVisaDocUpload}
                    />
                  </label>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-7 cursor-pointer transition ${
                  workVisaDocUploading
                    ? 'opacity-50 cursor-wait border-gray-200 bg-gray-50'
                    : 'border-sky-300 bg-sky-50 hover:border-sky-400 hover:bg-sky-100'
                }`}>
                  <Globe className="h-9 w-9 text-sky-400" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-sky-700">
                      {workVisaDocUploading ? t('profile.companyDocUploading') : t('profile.workVisaDocUpload', 'Upload your Australia Work Visa')}
                    </p>
                    <p className="text-xs text-sky-500 mt-0.5">
                      {t('profile.workVisaDocHintShort', 'PDF, JPG or PNG · max 10 MB')}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    disabled={workVisaDocUploading}
                    onChange={handleWorkVisaDocUpload}
                  />
                </label>
              )}
            </div>
          </div>

          {/* About / Firmenbeschreibung */}
          <div className="card space-y-5">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-brand-600" />
              {t('profile.aboutSection')}
            </h2>
            <div>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value.slice(0, 1000))}
                rows={5}
                className="input resize-none"
                placeholder={t('profile.aboutPlaceholder')}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{bio.length} / 1000</p>
            </div>
          </div>

          <button
            onClick={saveOverview}
            disabled={
              savingOverview ||
              !fullName.trim() ||
              !phoneNumber.trim() ||
              !companyName.trim() ||
              !companyStreet.trim() ||
              !companyHouseNumber.trim() ||
              !companyZip.trim() ||
              !companyCountry ||
              (EUROPEAN_COUNTRY_CODES.has(companyCountry) && !vatId.trim()) ||
              !hasCompanyDoc
            }
            className="btn-primary w-full sm:w-auto"
          >
            {savingOverview ? t('profile.saving') : t('profile.saveChanges')}
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          EXPERIENCE TAB
      ═════════════════════════════════════════════════════ */}
      {tab === 'experience' && (
        <div className="space-y-4">

          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-gray-900">{t('profile.experienceSection')}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{t('profile.experienceDesc')}</p>
            </div>
            {!expForm && (
              <button
                onClick={() => setExpForm({
                  id: crypto.randomUUID(),
                  company: '', position: '',
                  from_year: '', to_year: '',
                  is_current: false, description: '',
                })}
                className="btn-primary flex items-center gap-1.5 flex-shrink-0"
              >
                <Plus className="h-4 w-4" /> {t('profile.addExperience')}
              </button>
            )}
          </div>

          {/* ── Experience Form ── */}
          {expForm && (
            <div className="card border-2 border-brand-200 space-y-4">
              <h3 className="font-semibold text-gray-900">
                {experiences.find(e => e.id === expForm.id) ? t('profile.editExperience') : t('profile.addExperience')}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('profile.expCompany')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={expForm.company}
                    onChange={e => setExpForm(f => f ? { ...f, company: e.target.value } : f)}
                    className="input"
                    placeholder="e.g. CarFix GmbH"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('profile.expPosition')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={expForm.position}
                    onChange={e => setExpForm(f => f ? { ...f, position: e.target.value } : f)}
                    className="input"
                    placeholder="e.g. Senior PDR Technician"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('profile.expFrom')}</label>
                  <input
                    type="number"
                    min="1980"
                    max={currentYear}
                    value={expForm.from_year}
                    onChange={e => setExpForm(f => f ? { ...f, from_year: e.target.value } : f)}
                    className="input"
                    placeholder={String(currentYear - 3)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('profile.expTo')}</label>
                  <input
                    type="number"
                    min="1980"
                    max={currentYear}
                    value={expForm.to_year}
                    onChange={e => setExpForm(f => f ? { ...f, to_year: e.target.value } : f)}
                    className="input"
                    placeholder={String(currentYear)}
                    disabled={expForm.is_current}
                  />
                  <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={expForm.is_current}
                      onChange={e => setExpForm(f => f ? { ...f, is_current: e.target.checked, to_year: e.target.checked ? '' : f.to_year } : f)}
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    {t('profile.expCurrent')}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('profile.expDescription')}</label>
                <textarea
                  value={expForm.description}
                  onChange={e => setExpForm(f => f ? { ...f, description: e.target.value.slice(0, 500) } : f)}
                  rows={3}
                  className="input resize-none"
                  placeholder={t('profile.expDescPlaceholder')}
                />
                <p className="text-xs text-gray-400 text-right mt-1">{expForm.description.length}/500</p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  disabled={savingExperience}
                  onClick={async () => {
                    if (!expForm.company.trim() || !expForm.position.trim()) {
                      toast.error('Company and position are required');
                      return;
                    }
                    const exists = experiences.some(e => e.id === expForm.id);
                    const next = exists
                      ? experiences.map(e => e.id === expForm.id ? expForm : e)
                      : [...experiences, expForm];
                    setExperiences(next);
                    setExpForm(null);
                    await persistExperiences(next);
                  }}
                  className="btn-primary"
                >
                  {savingExperience ? t('profile.saving') : t('profile.saveSection')}
                </button>
                <button onClick={() => setExpForm(null)} className="btn-secondary">
                  {t('profile.cancelBtn')}
                </button>
              </div>
            </div>
          )}

          {/* ── Experience List ── */}
          {experiences.length === 0 && !expForm && (
            <EmptyState icon={Briefcase} text={t('profile.noExperience')} hint={t('profile.addFirst')} />
          )}

          {experiences.map(exp => (
            <div key={exp.id} className="card hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-11 w-11 rounded-xl bg-brand-50 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">{exp.position}</p>
                      <p className="text-sm font-medium text-brand-600">{exp.company}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {exp.from_year}
                        {(exp.from_year && (exp.to_year || exp.is_current)) && ' – '}
                        {exp.is_current ? t('profile.present') : exp.to_year}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => setExpForm(exp)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
                        title={t('profile.editExperience')}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={async () => {
                          const next = experiences.filter(e => e.id !== exp.id);
                          setExperiences(next);
                          await persistExperiences(next);
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {exp.description && (
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{exp.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          GALLERY TAB
      ═════════════════════════════════════════════════════ */}
      {tab === 'gallery' && (
        <div className="space-y-5">
          <div>
            <h2 className="font-semibold text-gray-900">{t('profile.gallerySection')}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{t('profile.galleryDesc')}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Approved gallery images */}
            {galleryUrls.map((url, i) => (
              <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <button
                    onClick={() => removeGalleryImage(url)}
                    className="rounded-full bg-red-500 hover:bg-red-600 p-2 text-white transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Pending gallery images — waiting for admin approval */}
            {pendingGallery.map(doc => (
              <div key={doc.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm border-2 border-amber-300">
                <img src={doc.file_url} alt="Pending" className="w-full h-full object-cover opacity-50" />
                {/* Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-amber-50/80">
                  <Clock className="h-6 w-6 text-amber-500" />
                  <span className="text-xs font-semibold text-amber-700 text-center px-2 leading-tight">{t('profile.imagePending')}</span>
                  <button
                    type="button"
                    onClick={() => cancelPendingMedia(doc.id)}
                    className="mt-1 rounded-full bg-red-100 hover:bg-red-200 p-1 text-red-500 transition"
                    title={t('profile.cancelUpload')}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Upload slot */}
            {galleryUrls.length + pendingGallery.length < 6 && (
              <label className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition cursor-pointer ${
                galleryUploading
                  ? 'opacity-50 cursor-wait border-gray-200'
                  : 'border-gray-300 hover:border-brand-400 hover:bg-brand-50'
              }`}>
                <Camera className="h-8 w-8 text-gray-400" />
                <span className="text-xs text-gray-400 text-center px-2">
                  {galleryUploading ? t('profile.uploading') : t('profile.uploadImage')}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleGalleryUpload}
                  disabled={galleryUploading}
                />
              </label>
            )}
          </div>

          <p className="text-xs text-gray-400">
            {galleryUrls.length} {t('profile.galleryApproved')} · {pendingGallery.length} {t('profile.galleryPending')} · 6 max · {t('profile.galleryMaxSize')}
          </p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          REFERENCES TAB
      ═════════════════════════════════════════════════════ */}
      {tab === 'references' && (
        <div className="space-y-4">

          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-gray-900">{t('profile.referencesSection')}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{t('profile.referencesDesc')}</p>
            </div>
            {!refForm && (
              <button
                onClick={() => setRefForm({
                  id: crypto.randomUUID(),
                  referee_name: '', referee_company: '',
                  ref_text: '', rating: 5,
                })}
                className="btn-primary flex items-center gap-1.5 flex-shrink-0"
              >
                <Plus className="h-4 w-4" /> {t('profile.addReference')}
              </button>
            )}
          </div>

          {/* ── Reference Form ── */}
          {refForm && (
            <div className="card border-2 border-brand-200 space-y-4">
              <h3 className="font-semibold text-gray-900">
                {references.find(r => r.id === refForm.id) ? t('profile.editReference') : t('profile.addReference')}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('profile.refName')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={refForm.referee_name}
                    onChange={e => setRefForm(f => f ? { ...f, referee_name: e.target.value } : f)}
                    className="input"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('profile.refCompany')}</label>
                  <input
                    value={refForm.referee_company}
                    onChange={e => setRefForm(f => f ? { ...f, referee_company: e.target.value } : f)}
                    className="input"
                    placeholder="ACME Workshop"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('profile.refText')}</label>
                <textarea
                  value={refForm.ref_text}
                  onChange={e => setRefForm(f => f ? { ...f, ref_text: e.target.value.slice(0, 500) } : f)}
                  rows={3}
                  className="input resize-none"
                  placeholder={t('profile.refTextPlaceholder')}
                />
                <p className="text-xs text-gray-400 text-right mt-1">{refForm.ref_text.length}/500</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.refRating')}</label>
                <StarRating value={refForm.rating} onChange={v => setRefForm(f => f ? { ...f, rating: v } : f)} />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  disabled={savingReferences}
                  onClick={async () => {
                    if (!refForm.referee_name.trim()) {
                      toast.error(t('profile.refName') + ' required');
                      return;
                    }
                    const exists = references.some(r => r.id === refForm.id);
                    const next = exists
                      ? references.map(r => r.id === refForm.id ? refForm : r)
                      : [...references, refForm];
                    setReferences(next);
                    setRefForm(null);
                    await persistReferences(next);
                  }}
                  className="btn-primary"
                >
                  {savingReferences ? t('profile.saving') : t('profile.saveSection')}
                </button>
                <button onClick={() => setRefForm(null)} className="btn-secondary">
                  {t('profile.cancelBtn')}
                </button>
              </div>
            </div>
          )}

          {/* ── References List ── */}
          {references.length === 0 && !refForm && (
            <EmptyState icon={Star} text={t('profile.noReferences')} hint={t('profile.addFirst')} />
          )}

          {references.map(ref => (
            <div key={ref.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <StarRating value={ref.rating} />
                  {ref.ref_text && (
                    <p className="text-sm text-gray-700 mt-3 italic leading-relaxed">
                      "{ref.ref_text}"
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-sm font-bold text-brand-700 flex-shrink-0">
                      {ref.referee_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{ref.referee_name}</p>
                      {ref.referee_company && (
                        <p className="text-xs text-gray-400">{ref.referee_company}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => setRefForm(ref)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={async () => {
                      const next = references.filter(r => r.id !== ref.id);
                      setReferences(next);
                      await persistReferences(next);
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          SETTINGS TAB — Services · Countries · Visibility
      ═════════════════════════════════════════════════════ */}
      {tab === 'settings' && (
        <div className="space-y-5">

          {/* Skills / Roles — hidden for admin */}
          {profile?.role !== 'CUSTOMER' && !profile?.is_admin && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-brand-600" />
                {t('profile.skillsSection')}
              </h2>
              <p className="text-xs text-gray-400 mb-4">{t('profile.skillsHint')}</p>

              {/* Primary role — read only */}
              <div className="mb-3 p-3 rounded-xl bg-brand-50 border border-brand-200 flex items-center gap-3">
                {(() => {
                  const r = CRAFT_ROLE_KEYS.find(cr => cr.value === profile?.role);
                  if (r?.isImg && r.grad) return (
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow flex-shrink-0">
                      <img src={r.icon} alt={r.value} className="absolute inset-0 w-full h-full object-cover" />
                      <div className={`absolute inset-0 bg-gradient-to-br ${r.grad} opacity-20`} />
                    </div>
                  );
                  return <span className="text-xl">{r?.icon ?? '🔧'}</span>;
                })()}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-brand-700">{tRole(profile?.role)}</p>
                  <p className="text-xs text-brand-500">{t('profile.skillsPrimary')}</p>
                </div>
                <span className="h-5 w-5 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-white" />
                </span>
              </div>

              {/* Secondary roles — toggleable */}
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('profile.skillsAdditional')}</p>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 mb-4">
                {CRAFT_ROLE_KEYS.filter(r => r.value !== profile?.role).map(({ value, icon, isImg, grad }) => {
                  const active = secondaryRoles.includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSecondaryRoles(prev =>
                        active ? prev.filter(r => r !== value) : [...prev, value]
                      )}
                      className={`rounded-xl border-2 p-3 text-left transition relative ${
                        active
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {active && (
                        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-brand-600 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <div className="mb-1">
                        {isImg && grad ? (
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow">
                            <img src={icon} alt={value} className="absolute inset-0 w-full h-full object-cover" />
                            <div className={`absolute inset-0 bg-gradient-to-br ${grad} opacity-20`} />
                          </div>
                        ) : (
                          <span className="text-xl">{icon}</span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-gray-900">{tRole(value)}</div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={saveSkills}
                disabled={savingSkills}
                className="btn-primary w-full sm:w-auto"
              >
                {savingSkills ? t('profile.saving') : t('profile.saveChanges')}
              </button>
            </div>
          )}

          {/* Preferred Language */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <Languages className="h-4 w-4 text-brand-600" />
              {t('profile.preferredLanguage')}
            </h2>
            <p className="text-xs text-gray-400 mb-4">{t('profile.langDesc')}</p>
            <select value={preferredLang} onChange={e => setPreferredLang(e.target.value)} className="input w-auto">
              <option value="en">🇬🇧 English</option>
              <option value="de">🇩🇪 Deutsch</option>
              <option value="el">🇬🇷 Ελληνικά</option>
              <option value="es">🇪🇸 Español</option>
            </select>
          </div>

          {/* Services */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-1">{t('profile.servicesOffered')}</h2>
            <p className="text-xs text-gray-400 mb-4">{t('profile.servicesHint')}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {roleServices.map(svc => {
                const active = services.includes(svc);
                return (
                  <button
                    key={svc}
                    type="button"
                    onClick={() => setServices(prev =>
                      active ? prev.filter(s => s !== svc) : [...prev, svc]
                    )}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition border ${
                      active
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-brand-400'
                    }`}
                  >
                    {tSvc(svc)}
                  </button>
                );
              })}
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('profile.customServices')}</label>
            <input
              value={services.filter(s => !roleServices.includes(s)).join(', ')}
              onChange={e => {
                const custom = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                setServices([...roleServices.filter(s => services.includes(s)), ...custom]);
              }}
              className="input"
              placeholder="e.g. Motorcycle Dent Repair, Aluminium Panels"
            />
          </div>

          {/* Available Countries */}
          <div id="section-countries" className={`card ${countries.length === 0 ? 'border-red-300 ring-1 ring-red-200' : ''}`}>
            <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <Globe className="h-4 w-4 text-brand-600" />
              {t('profile.availableCountries')}
              <span className="text-red-400 text-sm">*</span>
            </h2>
            <p className="text-xs text-gray-400 mb-1">{t('profile.countriesHint')}</p>
            {countries.length === 0 && (
              <p className="text-xs text-red-500 font-medium mb-3 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {t('profile.countriesRequired')}
              </p>
            )}
            {countries.length > 0 && (
              <p className="text-xs text-brand-600 font-medium mb-3">
                {t('profile.countriesSelected', { count: countries.length })}
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {COUNTRIES.map(({ code, name }) => {
                const selected = countries.includes(code);
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setCountries(prev =>
                      selected ? prev.filter(c => c !== code) : [...prev, code]
                    )}
                    className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition ${
                      selected
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

          {/* Visibility toggle */}
          <div className="card">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  {visiblePublic
                    ? <Eye className="h-4 w-4 text-green-500" />
                    : <EyeOff className="h-4 w-4 text-gray-400" />}
                  {t('profile.visibility')}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {visiblePublic ? t('profile.visibleOn') : t('profile.visibleOff')}
                </p>
                {!profile?.is_verified && visiblePublic && (
                  <p className="text-xs text-yellow-600 mt-1">{t('profile.notVerifiedVisible')}</p>
                )}
              </div>
              <label className="relative inline-flex cursor-pointer items-center flex-shrink-0">
                <input
                  type="checkbox"
                  checked={visiblePublic}
                  onChange={e => setVisiblePublic(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-600 peer-checked:after:translate-x-full" />
              </label>
            </div>
          </div>

          <button
            onClick={saveSettings}
            disabled={savingSettings || countries.length === 0}
            className="btn-primary w-full sm:w-auto"
          >
            {savingSettings ? t('profile.saving') : t('profile.saveChanges')}
          </button>

          {/* ── Danger Zone ── */}
          <div className="card border-red-200 bg-red-50">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h2 className="font-semibold text-red-700">{t('profile.dangerZone')}</h2>
            </div>
            <p className="text-sm text-red-600 mb-4">
              {t('profile.dangerDesc')}
            </p>
            <button
              type="button"
              onClick={() => setDeleteStep(1)}
              className="rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold px-5 py-2.5 text-sm transition"
            >
              {t('profile.deleteProfile')}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          DELETE MODAL — STEP 1: Warning
      ═════════════════════════════════════════════════════ */}
      {deleteStep === 1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setDeleteStep(0)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              aria-label="Schließen"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-amber-100 p-3">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">{t('profile.deleteModalTitle')}</h2>
            </div>

            <p className="text-gray-700 text-sm mb-3">
              {t('profile.deleteModalDesc')}
            </p>
            <ul className="text-sm text-gray-600 space-y-1.5 mb-5 list-none">
              {[
                t('profile.deleteModalBenefit1'),
                t('profile.deleteModalBenefit2'),
                t('profile.deleteModalBenefit3'),
                t('profile.deleteModalBenefit4'),
                t('profile.deleteModalBenefit5'),
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-5">
              {t('profile.deleteModalWarn')}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteStep(0)}
                className="flex-1 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold px-4 py-2.5 text-sm hover:bg-gray-50 transition"
              >
                {t('profile.deleteModalCancel')}
              </button>
              <button
                type="button"
                onClick={() => setDeleteStep(2)}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 text-sm transition"
              >
                {t('profile.deleteModalProceed')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          DELETE MODAL — STEP 2: Final Confirmation
      ═════════════════════════════════════════════════════ */}
      {deleteStep === 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => !deletingAccount && setDeleteStep(0)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              aria-label="Schließen"
              disabled={deletingAccount}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-red-100 p-3">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">{t('profile.deleteFinalTitle')}</h2>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
              <p className="text-sm font-semibold text-red-700 mb-2">
                {t('profile.deleteFinalWarn')}
              </p>
              <p className="text-sm text-red-600 mb-3">
                {t('profile.deleteFinalDesc')}
              </p>
              <ul className="text-sm text-red-600 space-y-1">
                <li>• {t('profile.deleteFinalItem1')}</li>
                <li>• {t('profile.deleteFinalItem2')}</li>
                <li>• {t('profile.deleteFinalItem3')}</li>
                <li>• {t('profile.deleteFinalItem4')}</li>
                <li>• {t('profile.deleteFinalItem5')}</li>
                <li>• {t('profile.deleteFinalItem6')}</li>
              </ul>
            </div>

            <p className="text-sm text-gray-600 mb-5">
              {t('profile.deleteFinalEmail', { email: profile?.email ?? '...' })}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteStep(1)}
                disabled={deletingAccount}
                className="flex-1 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold px-4 py-2.5 text-sm hover:bg-gray-50 transition disabled:opacity-50"
              >
                {t('profile.deleteBack')}
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingAccount ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {t('profile.deleting')}
                  </>
                ) : (
                  t('profile.deleteFinalBtn')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
