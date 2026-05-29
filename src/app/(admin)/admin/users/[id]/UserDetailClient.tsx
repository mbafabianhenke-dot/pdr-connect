'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Mail, Phone, Shield, ShieldCheck, Star, Ban,
  Trash2, ExternalLink, CheckCircle, XCircle, User,
  FileText, AlertTriangle, Clock, Save, Eye, ImageIcon,
  Calendar, Globe, Briefcase, Lock, Unlock, MapPin,
  Building2, Tag, Award, BookOpen, Download,
} from 'lucide-react';
import { ROLE_LABELS, CRAFT_ROLES, COUNTRIES, BUNDESLAENDER, plzToBundesland } from '@/types/database';
import { formatDate } from '@/lib/utils';

const ALL_ROLES = ['PDR_TECHNICIAN', 'CAR_PAINTER', 'PREPARER', 'DISMANTLER', 'CUSTOMER'] as const;

interface Props {
  profile: any;
  documents: any[];
  violations: any[];
  offers: any[];
  requests: any[];
  contracts: any[];
}

export default function UserDetailClient({
  profile: initialProfile,
  documents: initialDocs,
  violations, offers, requests, contracts,
}: Props) {
  const { t } = useTranslation();
  const [profile, setProfile]     = useState(initialProfile);
  const [documents, setDocuments] = useState(initialDocs);
  const [saving, setSaving]       = useState(false);

  // ── Basic fields ─────────────────────────────────────────────────────────
  const [editName,    setEditName]    = useState(profile.full_name ?? '');
  const [editPhone,   setEditPhone]   = useState(profile.phone ?? '');
  const [editBio,     setEditBio]     = useState(profile.bio ?? '');
  const [editRole,    setEditRole]    = useState(profile.role ?? 'PDR_TECHNICIAN');

  // ── Location ─────────────────────────────────────────────────────────────
  const [editPlz,        setEditPlz]        = useState(profile.postal_code ?? '');
  const [editBundesland, setEditBundesland] = useState(profile.bundesland ?? '');

  // Auto-derive Bundesland from PLZ
  useEffect(() => {
    const derived = plzToBundesland(editPlz);
    if (derived) setEditBundesland(derived);
  }, [editPlz]);

  // ── Company ───────────────────────────────────────────────────────────────
  const [editCompanyName,        setEditCompanyName]        = useState(profile.company_name ?? '');
  const [editCompanyAddress,     setEditCompanyAddress]     = useState(profile.company_address ?? '');
  const [editCompanyStreet,      setEditCompanyStreet]      = useState(profile.company_street ?? '');
  const [editCompanyHouseNumber, setEditCompanyHouseNumber] = useState(profile.company_house_number ?? '');
  const [editCompanyZip,         setEditCompanyZip]         = useState(profile.company_zip ?? '');
  const [editCompanyCountry,     setEditCompanyCountry]     = useState(profile.company_country ?? '');
  const [editVatId,              setEditVatId]              = useState(profile.vat_id ?? '');

  // ── Multi-value fields ────────────────────────────────────────────────────
  const [editSecondaryRoles, setEditSecondaryRoles] = useState<string[]>(profile.secondary_roles ?? []);
  const [editCountries,      setEditCountries]      = useState<string[]>(profile.available_countries ?? []);
  // Services: stored as string (newline-separated) for easy editing
  const [editServices, setEditServices] = useState((profile.services ?? []).join('\n'));

  /* ─── helpers ──────────────────────────────────────────────────────────── */
  const patchUser = async (fields: Record<string, any>) => {
    const res = await fetch(`/api/admin/users/${profile.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    });
    if (!res.ok) { const j = await res.json(); throw new Error(j.error ?? 'Error'); }
    return res.json();
  };

  const toggle = async (field: string, current: boolean) => {
    try {
      await patchUser({ [field]: !current });
      setProfile((p: any) => ({ ...p, [field]: !current }));
      toast.success(`${field} aktualisiert`);
    } catch (e: any) { toast.error(e.message); }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const servicesArray = editServices.split('\n').map((s: string) => s.trim()).filter(Boolean);
      await patchUser({
        full_name: editName,
        phone: editPhone,
        bio: editBio,
        role: editRole,
        secondary_roles: editSecondaryRoles,
        services: servicesArray,
        available_countries: editCountries,
        company_name: editCompanyName,
        company_address: editCompanyAddress,
        company_street: editCompanyStreet,
        company_house_number: editCompanyHouseNumber,
        company_zip: editCompanyZip,
        company_country: editCompanyCountry,
        vat_id: editVatId,
        postal_code: editPlz,
        bundesland: editBundesland,
      });
      setProfile((p: any) => ({
        ...p,
        full_name: editName,
        phone: editPhone,
        bio: editBio,
        role: editRole,
        secondary_roles: editSecondaryRoles,
        services: servicesArray,
        available_countries: editCountries,
        company_name: editCompanyName,
        company_address: editCompanyAddress,
        company_street: editCompanyStreet,
        company_house_number: editCompanyHouseNumber,
        company_zip: editCompanyZip,
        company_country: editCompanyCountry,
        vat_id: editVatId,
        postal_code: editPlz,
        bundesland: editBundesland,
      }));
      toast.success('Profil gespeichert ✓');
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  const deleteFile = async (fileUrl: string, bucket: string, docId?: string) => {
    if (!confirm('Datei wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return;
    try {
      const res = await fetch('/api/admin/delete-file', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl, bucket, docId, userId: profile.id }),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error ?? 'Error'); }
      if (docId) {
        setDocuments((d: any[]) => d.filter(doc => doc.id !== docId));
      } else if (bucket === 'avatars') {
        setProfile((p: any) => ({ ...p, avatar_url: null }));
      }
      toast.success('Datei gelöscht');
    } catch (e: any) { toast.error(e.message); }
  };

  const deleteGalleryImage = async (imgUrl: string) => {
    if (!confirm('Bild wirklich löschen?')) return;
    try {
      const res = await fetch('/api/admin/delete-file', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl: imgUrl, bucket: 'avatars', userId: profile.id, galleryUrl: imgUrl }),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error ?? 'Error'); }
      setProfile((p: any) => ({ ...p, gallery_urls: (p.gallery_urls ?? []).filter((u: string) => u !== imgUrl) }));
      toast.success('Bild gelöscht');
    } catch (e: any) { toast.error(e.message); }
  };

  const verifyDoc = async (doc: any, action: 'approve' | 'reject') => {
    // Use verify-doc so that AVATAR → avatar_url and GALLERY_IMAGE → gallery_urls
    // get updated on the user record, not just the document status.
    const res = await fetch('/api/admin/verify-doc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        docId:   doc.id,
        action,
        userId:  profile.id,
        docType: doc.type,
        fileUrl: doc.file_url,
      }),
    });
    if (!res.ok) { const j = await res.json(); toast.error(j.error ?? 'Fehler'); return; }
    const newStatus = action === 'approve' ? 'verified' : 'rejected';
    setDocuments((d: any[]) => d.map(d => d.id === doc.id ? { ...d, status: newStatus } : d));
    // Immediately reflect a newly approved avatar in the header
    if (action === 'approve' && doc.type === 'AVATAR') {
      setProfile((p: any) => ({ ...p, avatar_url: doc.file_url }));
    }
    toast.success(action === 'approve' ? 'Dokument verifiziert' : 'Dokument abgelehnt');
  };

  const toggleRole = (role: string) => {
    setEditSecondaryRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const toggleCountry = (code: string) => {
    setEditCountries(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  /* ─── UI helpers ────────────────────────────────────────────────────────── */
  const Badge = ({ color, children }: { color: string; children: React.ReactNode }) => (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      {children}
    </span>
  );

  const SectionTitle = ({ icon, children, extra }: { icon: React.ReactNode; children: React.ReactNode; extra?: React.ReactNode }) => (
    <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
      {icon}{children}{extra}
    </h2>
  );

  const docStatusColor = (s: string) =>
    s === 'verified' ? 'bg-green-100 text-green-700'
    : s === 'rejected' ? 'bg-red-100 text-red-700'
    : 'bg-amber-100 text-amber-700';

  /* ─── RENDER ────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6 pb-12">
      {/* Back + header */}
      <div className="flex items-center gap-4">
        <Link href="/admin" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
          <ArrowLeft className="h-4 w-4" /> Admin-Panel
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-700">{profile.full_name}</span>
      </div>

      {/* Hero card */}
      <div className="card">
        <div className="flex items-start gap-5 flex-wrap">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-20 w-20 rounded-2xl object-cover border border-gray-200" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 font-bold text-3xl border border-brand-200">
                {profile.full_name?.charAt(0)}
              </div>
            )}
            {profile.avatar_url && (
              <button
                onClick={() => deleteFile(profile.avatar_url, 'avatars')}
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition shadow"
                title="Avatar löschen"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
              {profile.is_admin    && <Badge color="bg-purple-100 text-purple-700"><Shield className="h-3 w-3"/>Admin</Badge>}
              {profile.is_verified && <Badge color="bg-green-100 text-green-700"><ShieldCheck className="h-3 w-3"/>Verifiziert</Badge>}
              {profile.is_premium  && <Badge color="bg-yellow-100 text-yellow-700"><Star className="h-3 w-3"/>Premium</Badge>}
              {profile.is_blocked  && <Badge color="bg-red-100 text-red-700"><Ban className="h-3 w-3"/>Gesperrt</Badge>}
              {!profile.is_verified && <Badge color="bg-amber-100 text-amber-700"><Clock className="h-3 w-3"/>Ausstehend</Badge>}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{ROLE_LABELS[profile.role as keyof typeof ROLE_LABELS] ?? profile.role}</p>
            <p className="text-xs text-gray-400 mt-1">ID: <span className="font-mono">{profile.id}</span></p>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => toggle('is_blocked', profile.is_blocked)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${profile.is_blocked ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
              {profile.is_blocked ? <><Unlock className="h-3.5 w-3.5"/>Entsperren</> : <><Lock className="h-3.5 w-3.5"/>Sperren</>}
            </button>
            <button onClick={() => toggle('is_verified', profile.is_verified)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${profile.is_verified ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
              {profile.is_verified ? <><XCircle className="h-3.5 w-3.5"/>Freigabe entziehen</> : <><CheckCircle className="h-3.5 w-3.5"/>Freigeben</>}
            </button>
            <button onClick={() => toggle('is_premium', profile.is_premium)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${profile.is_premium ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}>
              <Star className="h-3.5 w-3.5"/>
              {profile.is_premium ? 'Premium entfernen' : 'Premium vergeben'}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-400 border-t border-gray-100 pt-4">
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3"/>Registriert: {formatDate(profile.created_at)}</span>
          {profile.verification_requested_at && (
            <span className="flex items-center gap-1"><Clock className="h-3 w-3"/>Verifizierungsanfrage: {formatDate(profile.verification_requested_at)}</span>
          )}
          <span className="flex items-center gap-1"><Globe className="h-3 w-3"/>Sichtbar: {profile.visible_public ? 'Ja' : 'Nein'}</span>
          {profile.postal_code && (
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3"/>PLZ: {profile.postal_code} {profile.bundesland ? `· ${profile.bundesland}` : ''}</span>
          )}
          {profile.bypass_count > 0 && (
            <span className="flex items-center gap-1 text-orange-500 font-semibold"><AlertTriangle className="h-3 w-3"/>Bypass-Verstöße: {profile.bypass_count}</span>
          )}
        </div>
      </div>

      {/* ── ROW 1: Kontaktdaten + Profil bearbeiten ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Kontaktdaten (read-only, private) */}
        <div className="card">
          <SectionTitle
            icon={<Mail className="h-4 w-4 text-red-500"/>}
            extra={<span className="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">🔒 NUR ADMIN</span>}
          >
            Kontaktdaten
          </SectionTitle>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0"/>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400">E-Mail</p>
                <p className="text-sm font-semibold text-gray-900 break-all">{profile.email}</p>
              </div>
              <a href={`mailto:${profile.email}`} className="flex-shrink-0 rounded-lg bg-brand-50 p-2 text-brand-600 hover:bg-brand-100 transition">
                <ExternalLink className="h-3.5 w-3.5"/>
              </a>
            </div>
            {profile.phone && (
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                <Phone className="h-4 w-4 text-gray-400 flex-shrink-0"/>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">Telefon</p>
                  <p className="text-sm font-semibold text-gray-900">{profile.phone}</p>
                </div>
                <a href={`tel:${profile.phone}`} className="flex-shrink-0 rounded-lg bg-brand-50 p-2 text-brand-600 hover:bg-brand-100 transition">
                  <Phone className="h-3.5 w-3.5"/>
                </a>
              </div>
            )}
            {profile.gdpr_consent && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2">
                <CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0"/>
                <p className="text-xs text-green-700">DSGVO akzeptiert {profile.gdpr_consent_at ? `am ${formatDate(profile.gdpr_consent_at)}` : ''}</p>
              </div>
            )}
            {profile.preferred_language && (
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2">
                <Globe className="h-3.5 w-3.5 text-gray-400"/>
                <p className="text-xs text-gray-600">Sprache: <span className="font-semibold uppercase">{profile.preferred_language}</span></p>
              </div>
            )}
            {profile.stripe_customer_id && (
              <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-4 py-2">
                <Star className="h-3.5 w-3.5 text-indigo-400"/>
                <p className="text-xs text-indigo-700 font-mono">Stripe: {profile.stripe_customer_id}</p>
              </div>
            )}
          </div>
        </div>

        {/* Profil bearbeiten – Basis */}
        <div className="card">
          <SectionTitle icon={<User className="h-4 w-4 text-brand-600"/>}>
            Basis-Informationen
          </SectionTitle>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Name</label>
              <input value={editName} onChange={e => setEditName(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Telefon</label>
              <input value={editPhone} onChange={e => setEditPhone(e.target.value)} className="input" placeholder="+49 123 456789" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Hauptrolle</label>
              <select value={editRole} onChange={e => setEditRole(e.target.value)} className="input">
                {ALL_ROLES.map(r => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Bio</label>
              <textarea rows={3} value={editBio} onChange={e => setEditBio(e.target.value)} className="input resize-none" placeholder="Kurze Beschreibung..." />
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 2: Standort + Unternehmen ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Standort */}
        <div className="card">
          <SectionTitle icon={<MapPin className="h-4 w-4 text-blue-500"/>}>
            Standort (Deutschland)
          </SectionTitle>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Postleitzahl (PLZ)</label>
              <input
                value={editPlz}
                onChange={e => setEditPlz(e.target.value)}
                className="input"
                placeholder="z.B. 80331"
                maxLength={5}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Bundesland</label>
              <select value={editBundesland} onChange={e => setEditBundesland(e.target.value)} className="input">
                <option value="">— kein Bundesland —</option>
                {BUNDESLAENDER.map(bl => (
                  <option key={bl} value={bl}>{bl}</option>
                ))}
              </select>
              {editPlz && plzToBundesland(editPlz) && (
                <p className="text-xs text-blue-600 mt-1">🗺️ Auto-erkannt: {plzToBundesland(editPlz)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Unternehmen */}
        <div className="card">
          <SectionTitle icon={<Building2 className="h-4 w-4 text-orange-500"/>}>
            {t('profile.companySection')}
          </SectionTitle>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{t('profile.companyName')}</label>
              <input value={editCompanyName} onChange={e => setEditCompanyName(e.target.value)} className="input" placeholder={t('profile.companyNameEx')} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{t('profile.street')}</label>
                <input value={editCompanyStreet} onChange={e => setEditCompanyStreet(e.target.value)} className="input" placeholder={t('profile.streetEx')} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{t('profile.houseNumber')}</label>
                <input value={editCompanyHouseNumber} onChange={e => setEditCompanyHouseNumber(e.target.value)} className="input" placeholder={t('profile.houseNumberEx')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{t('profile.zip')}</label>
                <input value={editCompanyZip} onChange={e => setEditCompanyZip(e.target.value)} className="input" placeholder={t('profile.zipEx')} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{t('profile.country')}</label>
                <select value={editCompanyCountry} onChange={e => setEditCompanyCountry(e.target.value)} className="input">
                  <option value="">{t('profile.countryPlaceholder')}</option>
                  {COUNTRIES.map(({ code, name }) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{t('profile.vatLabel')}</label>
              <input value={editVatId} onChange={e => setEditVatId(e.target.value)} className="input font-mono text-sm" placeholder={t('profile.vatEx')} />
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 3: Weitere Rollen + Dienstleistungen ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Weitere Rollen */}
        <div className="card">
          <SectionTitle icon={<Briefcase className="h-4 w-4 text-teal-600"/>}>
            Weitere Rollen
          </SectionTitle>
          <p className="text-xs text-gray-400 mb-3">Zusätzliche Berufsrollen (ohne Hauptrolle)</p>
          <div className="space-y-2">
            {CRAFT_ROLES.map(r => (
              <label key={r} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition ${
                editSecondaryRoles.includes(r) ? 'bg-teal-50 border border-teal-200' : 'bg-gray-50 border border-transparent hover:bg-gray-100'
              }`}>
                <input
                  type="checkbox"
                  checked={editSecondaryRoles.includes(r)}
                  onChange={() => toggleRole(r)}
                  className="h-4 w-4 rounded text-teal-600"
                />
                <span className="text-sm font-medium text-gray-700">{ROLE_LABELS[r]}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Dienstleistungen */}
        <div className="card">
          <SectionTitle icon={<Tag className="h-4 w-4 text-pink-500"/>}>
            Dienstleistungen
          </SectionTitle>
          <p className="text-xs text-gray-400 mb-3">Eine Dienstleistung pro Zeile</p>
          <textarea
            rows={8}
            value={editServices}
            onChange={e => setEditServices(e.target.value)}
            className="input resize-none font-mono text-xs"
            placeholder={"PDR Reparatur\nHagel­schaden­beseitigung\nBeulendoktor"}
          />
          <p className="text-xs text-gray-400 mt-1">
            {editServices.split('\n').filter(Boolean).length} Einträge
          </p>
        </div>
      </div>

      {/* ── Verfügbare Länder ── */}
      <div className="card">
        <SectionTitle icon={<Globe className="h-4 w-4 text-indigo-500"/>}>
          Verfügbare Länder
          <span className="ml-2 text-xs font-normal text-gray-400">({editCountries.length} ausgewählt)</span>
        </SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {COUNTRIES.map(({ code, name }) => (
            <label key={code} className={`flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition text-sm ${
              editCountries.includes(code) ? 'bg-indigo-50 border border-indigo-200 text-indigo-800 font-semibold' : 'bg-gray-50 border border-transparent text-gray-600 hover:bg-gray-100'
            }`}>
              <input
                type="checkbox"
                checked={editCountries.includes(code)}
                onChange={() => toggleCountry(code)}
                className="h-3.5 w-3.5 rounded text-indigo-600"
              />
              <span className="text-xs">{name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ── SAVE BUTTON ── */}
      <div className="sticky bottom-4 z-10">
        <div className="card bg-white/95 backdrop-blur border border-brand-200 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-brand-700">Alle Änderungen</span> werden beim Speichern sofort aktiv.
            </p>
            <button
              onClick={saveProfile}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white hover:bg-brand-700 transition disabled:opacity-60 shadow-sm"
            >
              <Save className="h-4 w-4"/>
              {saving ? 'Speichern...' : 'Alle Änderungen speichern'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Gallery Images ── */}
      {(profile.gallery_urls ?? []).length > 0 && (
        <div className="card">
          <SectionTitle icon={<ImageIcon className="h-4 w-4 text-purple-600"/>}>
            Galerie-Bilder ({(profile.gallery_urls ?? []).length})
            <span className="ml-2 text-xs font-normal text-gray-400">Hover → ✕ zum Löschen verbotener Inhalte</span>
          </SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {(profile.gallery_urls ?? []).map((url: string, idx: number) => (
              <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-100">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <a href={url} target="_blank" rel="noopener noreferrer"
                    className="rounded-lg bg-white/20 p-2 text-white hover:bg-white/30 transition">
                    <Eye className="h-4 w-4"/>
                  </a>
                  <button onClick={() => deleteGalleryImage(url)}
                    className="rounded-lg bg-red-500/80 p-2 text-white hover:bg-red-600 transition">
                    <Trash2 className="h-4 w-4"/>
                  </button>
                </div>
                <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-xs text-white font-mono">#{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Documents ── */}
      <div className="card">
        <SectionTitle icon={<FileText className="h-4 w-4 text-indigo-600"/>}>
          Dokumente ({documents.length})
        </SectionTitle>
        {documents.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Keine Dokumente hochgeladen</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {documents.map((doc: any) => (
              <div key={doc.id} className="py-3 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 flex-shrink-0">
                  <FileText className="h-5 w-5 text-indigo-600"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">{doc.type}</p>
                  <p className="text-xs text-gray-400">{formatDate(doc.created_at)}</p>
                  {doc.review_note && <p className="text-xs text-red-600 mt-0.5">Notiz: {doc.review_note}</p>}
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${docStatusColor(doc.status)}`}>
                  {doc.status}
                </span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Use signed_url for private bucket access */}
                  <a href={doc.signed_url ?? doc.file_url} target="_blank" rel="noopener noreferrer"
                    className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 transition" title="Öffnen / Herunterladen">
                    <Download className="h-3.5 w-3.5"/>
                  </a>
                  {doc.status !== 'verified' && (
                    <button onClick={() => verifyDoc(doc, 'approve')}
                      className="rounded-lg bg-green-100 p-2 text-green-700 hover:bg-green-200 transition" title="Verifizieren">
                      <CheckCircle className="h-3.5 w-3.5"/>
                    </button>
                  )}
                  {doc.status !== 'rejected' && (
                    <button onClick={() => verifyDoc(doc, 'reject')}
                      className="rounded-lg bg-amber-100 p-2 text-amber-700 hover:bg-amber-200 transition" title="Ablehnen">
                      <XCircle className="h-3.5 w-3.5"/>
                    </button>
                  )}
                  <button onClick={() => deleteFile(doc.file_url, 'documents', doc.id)}
                    className="rounded-lg bg-red-100 p-2 text-red-700 hover:bg-red-200 transition" title="Löschen">
                    <Trash2 className="h-3.5 w-3.5"/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Contracts ── */}
      {contracts.length > 0 && (
        <div className="card">
          <SectionTitle icon={<BookOpen className="h-4 w-4 text-green-600"/>}>
            Verträge ({contracts.length})
          </SectionTitle>
          <div className="divide-y divide-gray-100">
            {contracts.map((c: any) => (
              <div key={c.id} className="py-3 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-green-600"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">Version {c.version} · {c.language?.toUpperCase()}</p>
                  <p className="text-xs text-gray-400">{formatDate(c.created_at)}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${c.signed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {c.signed ? `Unterzeichnet ${c.signed_at ? formatDate(c.signed_at) : ''}` : 'Ausstehend'}
                </span>
                {c.pdf_url && (
                  <a href={c.pdf_url} target="_blank" rel="noopener noreferrer"
                    className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 transition" title="PDF öffnen">
                    <Download className="h-3.5 w-3.5"/>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Work Experience ── */}
      {(profile.work_experience ?? []).length > 0 && (
        <div className="card">
          <SectionTitle icon={<Award className="h-4 w-4 text-cyan-600"/>}>
            Berufserfahrung ({(profile.work_experience ?? []).length})
          </SectionTitle>
          <div className="space-y-3">
            {(profile.work_experience ?? []).map((exp: any, idx: number) => (
              <div key={exp.id ?? idx} className="rounded-lg bg-gray-50 p-4 border border-gray-100">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{exp.position}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{exp.company}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {exp.from_year} – {exp.is_current ? 'heute' : exp.to_year}
                  </span>
                </div>
                {exp.description && (
                  <p className="text-xs text-gray-500 mt-2">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── References ── */}
      {(profile.profile_references ?? []).length > 0 && (
        <div className="card">
          <SectionTitle icon={<Star className="h-4 w-4 text-yellow-500"/>}>
            Referenzen ({(profile.profile_references ?? []).length})
          </SectionTitle>
          <div className="space-y-3">
            {(profile.profile_references ?? []).map((ref: any, idx: number) => (
              <div key={ref.id ?? idx} className="rounded-lg bg-yellow-50 border border-yellow-100 p-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{ref.referee_name}</p>
                    {ref.referee_company && <p className="text-xs text-gray-500">{ref.referee_company}</p>}
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < ref.rating ? 'text-yellow-500 fill-yellow-400' : 'text-gray-300'}`}/>
                    ))}
                  </div>
                </div>
                {ref.ref_text && <p className="text-xs text-gray-600 italic">"{ref.ref_text}"</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Offers & Requests ── */}
      {(offers.length > 0 || requests.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {offers.length > 0 && (
            <div className="card">
              <SectionTitle icon={<Globe className="h-4 w-4 text-orange-500"/>}>
                Angebote ({offers.length})
              </SectionTitle>
              <div className="space-y-2">
                {offers.map((o: any) => (
                  <div key={o.id} className="rounded-lg bg-gray-50 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">
                        {new Date(o.available_from).toLocaleDateString('de-DE')} – {new Date(o.available_until).toLocaleDateString('de-DE')}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 font-bold ${o.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{o.status}</span>
                    </div>
                    <p className="text-gray-500 mt-1">{o.countries?.join(', ')}{o.daily_rate ? ` · €${o.daily_rate}/Tag` : ''}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {requests.length > 0 && (
            <div className="card">
              <SectionTitle icon={<Briefcase className="h-4 w-4 text-blue-600"/>}>
                Anfragen ({requests.length})
              </SectionTitle>
              <div className="space-y-2">
                {requests.map((r: any) => (
                  <div key={r.id} className="rounded-lg bg-gray-50 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{r.role_needed} — {r.location_city}, {r.location_country}</span>
                      <span className={`rounded-full px-2 py-0.5 font-bold ${r.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{r.status}</span>
                    </div>
                    {r.budget && <p className="text-gray-500 mt-1">Budget: {r.budget}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Violations ── */}
      {violations.length > 0 && (
        <div className="card border-orange-200">
          <SectionTitle icon={<AlertTriangle className="h-4 w-4 text-orange-500"/>}>
            Bypass-Verstöße ({violations.length})
          </SectionTitle>
          <div className="space-y-2">
            {violations.map((v: any) => (
              <div key={v.id} className="rounded-lg bg-orange-50 border border-orange-200 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{formatDate(v.created_at)}</span>
                  <span className="text-sm font-bold text-orange-600">{v.bypass_count_at_time}. Verstoß</span>
                </div>
                <p className="text-sm font-mono text-orange-800 mt-1 bg-orange-100 rounded px-2 py-1">{v.detected_pattern}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
