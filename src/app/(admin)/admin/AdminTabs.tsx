'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import { ROLE_LABELS, type UserRole } from '@/types/database';
import {
  Users, FileText, AlertTriangle, BarChart2,
  CheckCircle, XCircle, ExternalLink, Shield,
  ShieldCheck, Clock, Link2, SendHorizonal,
  MapPin, CalendarDays, Briefcase, Loader2, Download,
  Eye, Building2, Mail,
} from 'lucide-react';

type TabId = 'stats' | 'matching' | 'contracts' | 'offers' | 'requests' | 'verifications' | 'users' | 'docs' | 'violations';

interface Props {
  users: any[];
  pendingDocs: any[];
  violations: any[];
  pendingVerifications: any[];
  verificationDocs: any[];
  openOffers: any[];
  openRequests: any[];
  activeMatches: any[];
  stats: {
    total: number; premium: number; verified: number;
    pendingDocs: number; pendingVerifications: number;
    openOffers: number; openRequests: number; activeMatches: number;
  };
}

export default function AdminTabs({
  users: initialUsers,
  pendingDocs: initialDocs,
  violations,
  pendingVerifications: initialVerifications,
  verificationDocs,
  openOffers: initialOffers,
  openRequests: initialRequests,
  activeMatches: initialMatches,
  stats,
}: Props) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabId>('stats');
  const [users, setUsers]              = useState(initialUsers);
  const [docs, setDocs]                = useState(initialDocs);
  const [verifications, setVerifications] = useState(initialVerifications);
  const [offers, setOffers]            = useState(initialOffers);
  const [requests, setRequests]        = useState(initialRequests);
  const [matches, setMatches]          = useState(initialMatches);
  const [search, setSearch]            = useState('');
  // Match creation state
  const [selectedOffer,    setSelectedOffer]    = useState<string>('');
  const [selectedRequest,  setSelectedRequest]  = useState<string>('');
  const [matchNotes,       setMatchNotes]       = useState('');
  const [matchTechRate,    setMatchTechRate]     = useState('');
  const [matchClientFee,   setMatchClientFee]   = useState('');
  const [matchLocation,    setMatchLocation]    = useState('');
  const [matchAssignment,  setMatchAssignment]  = useState('');
  const [creatingMatch,    setCreatingMatch]    = useState(false);

  const supabase = createClient();

  const verifyDoc = async (docId: string, userId: string, docType: string, fileUrl: string) => {
    const res = await fetch('/api/admin/verify-doc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docId, action: 'approve', userId, docType, fileUrl }),
    });
    if (!res.ok) { const j = await res.json(); toast.error(j.error ?? 'Fehler'); return; }

    if (docType === 'GALLERY_IMAGE') {
      toast.success('Galeriebild freigegeben ✓');
    } else if (docType === 'AVATAR') {
      toast.success('Profilbild freigegeben ✓');
    } else {
      toast.success(t('admin.docs.verify'));
    }
    setDocs(prev => prev.filter(d => d.id !== docId));
  };

  const rejectDoc = async (docId: string) => {
    const note = prompt(t('admin.docs.rejectionPrompt')) ?? '';
    const res = await fetch('/api/admin/verify-doc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docId, action: 'reject', reviewNote: note }),
    });
    if (!res.ok) { const j = await res.json(); toast.error(j.error ?? 'Fehler'); return; }
    setDocs(prev => prev.filter(d => d.id !== docId));
    toast.success(t('admin.docs.reject'));
  };

  const toggleBlock = async (userId: string, currentlyBlocked: boolean) => {
    const { error } = await supabase.from('users').update({ is_blocked: !currentlyBlocked }).eq('id', userId);
    if (error) { toast.error(error.message); return; }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_blocked: !currentlyBlocked } : u));
    toast.success(currentlyBlocked ? t('admin.users.unblock') : t('admin.users.block'));
  };

  const togglePremium = async (userId: string, current: boolean) => {
    await supabase.from('users').update({ is_premium: !current }).eq('id', userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_premium: !current } : u));
    toast.success(t('premium.active'));
  };

  const changeRole = async (userId: string, newRole: UserRole) => {
    const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId);
    if (error) { toast.error(error.message); return; }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    toast.success(`Rolle geändert: ${ROLE_LABELS[newRole]}`);
  };

  const deleteUser = async (userId: string, fullName: string) => {
    const confirmed = window.confirm(
      `Nutzer "${fullName}" wirklich dauerhaft löschen?\n\nDies löscht:\n• Profil & Auth-Account\n• Alle Dokumente & Dateien\n• Alle Angebote, Anfragen & Matches\n\nDiese Aktion kann NICHT rückgängig gemacht werden!`
    );
    if (!confirmed) return;

    const res = await fetch('/api/admin/delete-user', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      const j = await res.json();
      toast.error(j.error ?? 'Fehler beim Löschen');
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast.success(`Nutzer "${fullName}" wurde gelöscht`);
  };

  const handleCreateMatch = async () => {
    if (!selectedOffer || !selectedRequest) {
      toast.error('Please select both an offer and a request');
      return;
    }
    setCreatingMatch(true);
    const res = await fetch('/api/admin/create-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offerId: selectedOffer,
        requestId: selectedRequest,
        notes: matchNotes,
        techRate: matchTechRate,
        clientFee: matchClientFee,
        location: matchLocation,
        assignment: matchAssignment,
      }),
    });
    setCreatingMatch(false);
    if (!res.ok) { const j = await res.json(); toast.error(j.error ?? 'Error'); return; }
    toast.success(t('admin.matching.matchCreated'));
    setOffers(prev => prev.filter(o => o.id !== selectedOffer));
    setRequests(prev => prev.filter(r => r.id !== selectedRequest));
    setSelectedOffer('');
    setSelectedRequest('');
    setMatchNotes('');
    setMatchTechRate('');
    setMatchClientFee('');
    setMatchLocation('');
    setMatchAssignment('');
  };

  const handleVerifyUser = async (userId: string, action: 'approve' | 'reject') => {
    const res = await fetch('/api/admin/verify-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action }),
    });
    const j = await res.json();
    if (!res.ok) {
      toast.error(j.error ?? 'Error');
      return;
    }
    setVerifications(prev => prev.filter(v => v.id !== userId));
    if (action === 'approve') {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_verified: true, verification_requested_at: null } : u));
      if (j.emailError) {
        toast.success(t('admin.verifications.approved'));
        toast.error(`⚠️ E-Mail fehlgeschlagen: ${j.emailError}`, { duration: 8000 });
      } else {
        toast.success(`${t('admin.verifications.approved')} — E-Mail gesendet ✓`);
      }
    } else {
      if (j.emailError) {
        toast.success(t('admin.verifications.rejected'));
        toast.error(`⚠️ E-Mail fehlgeschlagen: ${j.emailError}`, { duration: 8000 });
      } else {
        toast.success(t('admin.verifications.rejected'));
      }
    }
  };

  const [sendingBulkEmail,    setSendingBulkEmail]    = useState(false);
  const [sendingReminderEmail, setSendingReminderEmail] = useState(false);

  const handleSendProfileUpdateEmail = async () => {
    if (!window.confirm(`Profil-Update-E-Mail an ALLE ${users.filter(u => !u.is_admin).length} Nutzer senden?\n\nJeder Nutzer erhält eine E-Mail mit der Bitte, sein Profil zu vervollständigen.`)) return;
    setSendingBulkEmail(true);
    try {
      const res = await fetch('/api/admin/send-profile-update-email', { method: 'POST' });
      const j = await res.json();
      if (!res.ok) { toast.error(j.error ?? 'Fehler'); return; }
      toast.success(`✅ E-Mail gesendet an ${j.sent} Nutzer${j.failed > 0 ? ` · ${j.failed} fehlgeschlagen` : ''}`, { duration: 6000 });
    } catch {
      toast.error('Netzwerkfehler');
    } finally {
      setSendingBulkEmail(false);
    }
  };

  const handleSendReminderEmail = async () => {
    const count = users.filter(u => !u.is_admin).length;
    if (!window.confirm(
      `⚠️ Erinnerungs-E-Mail an ALLE ${count} Nutzer senden?\n\n` +
      `Inhalt: Fehlende Pflichtangaben\n` +
      `  • Mindestens 1 verfügbares Land\n` +
      `  • Fehlende Unterlagen & Dokumente\n\n` +
      `Die E-Mail wird in der jeweiligen Nutzer-Sprache versendet.`
    )) return;
    setSendingReminderEmail(true);
    try {
      const res = await fetch('/api/admin/send-reminder-email', { method: 'POST' });
      const j = await res.json();
      if (!res.ok) { toast.error(j.error ?? 'Fehler'); return; }
      toast.success(
        `✅ Erinnerung gesendet an ${j.sent} Nutzer${j.failed > 0 ? ` · ${j.failed} fehlgeschlagen` : ''}`,
        { duration: 6000 }
      );
    } catch {
      toast.error('Netzwerkfehler');
    } finally {
      setSendingReminderEmail(false);
    }
  };

  const filteredUsers = users.filter(u =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs: { id: TabId; label: string; icon: React.ElementType; highlight?: boolean }[] = [
    { id: 'stats',         label: t('admin.tabs.stats'),                                                icon: BarChart2 },
    { id: 'matching',      label: t('admin.tabs.matching', { count: offers.length + requests.length }), icon: Link2, highlight: true },
    { id: 'contracts',     label: t('admin.tabs.contracts', { count: matches.length }),                 icon: FileText },
    { id: 'offers',        label: t('admin.tabs.offers', { count: offers.length }),                    icon: SendHorizonal },
    { id: 'requests',      label: t('admin.tabs.requests', { count: requests.length }),                icon: Briefcase },
    { id: 'verifications', label: t('admin.tabs.verifications', { count: verifications.length }),      icon: ShieldCheck },
    { id: 'users',         label: t('admin.tabs.users', { count: users.length }),                      icon: Users },
    { id: 'docs',          label: t('admin.tabs.docs', { count: docs.length }),                        icon: FileText },
    { id: 'violations',    label: t('admin.tabs.violations', { count: violations.length }),             icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-red-600" />
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.title')}</h1>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon, highlight }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px whitespace-nowrap ${
              tab === id
                ? highlight ? 'border-orange-500 text-orange-600' : 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {/* STATS */}
      {tab === 'stats' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t('admin.stats.totalUsers'),           value: stats.total,                 color: 'text-brand-600' },
            { label: t('admin.stats.openOffers'),           value: stats.openOffers,            color: 'text-orange-500' },
            { label: t('admin.stats.openRequests'),         value: stats.openRequests,          color: 'text-blue-600' },
            { label: t('admin.stats.activeMatches'),        value: stats.activeMatches,         color: 'text-purple-600' },
            { label: t('admin.stats.verifiedProfiles'),     value: stats.verified,              color: 'text-green-600' },
            { label: t('admin.stats.pendingVerifications'), value: stats.pendingVerifications,  color: 'text-indigo-600' },
            { label: t('admin.stats.premiumMembers'),       value: stats.premium,               color: 'text-yellow-500' },
            { label: t('admin.stats.pendingDocs'),          value: stats.pendingDocs,           color: 'text-red-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card">
              <p className={`text-4xl font-extrabold ${color}`}>{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* USERS */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <input
              className="input max-w-sm"
              placeholder={t('admin.users.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button
              onClick={handleSendProfileUpdateEmail}
              disabled={sendingBulkEmail}
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 text-sm transition disabled:opacity-60"
            >
              {sendingBulkEmail
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Sende…</>
                : <><Mail className="h-4 w-4" /> Profil-Update-Mail an alle senden</>
              }
            </button>
            <button
              onClick={handleSendReminderEmail}
              disabled={sendingReminderEmail}
              className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2.5 text-sm transition disabled:opacity-60"
            >
              {sendingReminderEmail
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Sende…</>
                : <><Mail className="h-4 w-4" /> Erinnerung: Länder + Dokumente</>
              }
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="pb-2 pr-4">{t('admin.users.name')}</th>
                  <th className="pb-2 pr-4">{t('admin.users.role')}</th>
                  <th className="pb-2 pr-4 text-red-500">📧 Email / 📞 Phone</th>
                  <th className="pb-2 pr-4">{t('admin.users.status')}</th>
                  <th className="pb-2 pr-4">{t('admin.users.bypass')}</th>
                  <th className="pb-2 pr-4">{t('admin.users.joined')}</th>
                  <th className="pb-2">{t('admin.users.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(u => (
                  <tr key={u.id} className={u.is_blocked ? 'bg-red-50' : 'hover:bg-gray-50 transition'}>
                    <td className="py-3 pr-4">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="font-medium text-brand-700 hover:text-brand-900 hover:underline"
                      >
                        {u.full_name}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-gray-500">{ROLE_LABELS[u.role as keyof typeof ROLE_LABELS]}</td>
                    <td className="py-3 pr-4">
                      <div className="text-xs text-gray-700 font-mono">{u.email ?? '—'}</div>
                      {u.phone && <div className="text-xs text-gray-500 font-mono">{u.phone}</div>}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {u.is_premium && <span className="badge-premium">Premium</span>}
                        {u.is_verified && <span className="badge-verified">{t('dashboard.verified')}</span>}
                        {u.is_blocked && <span className="badge-rejected">{t('admin.users.blocked')}</span>}
                        {u.verification_requested_at && !u.is_verified && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                            <Clock className="h-3 w-3" /> {t('admin.verifications.requestedAt')}
                          </span>
                        )}
                        {u.is_admin && (
                          <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
                            {t('admin.users.admin')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      {u.bypass_count > 0 && (
                        <span className="text-orange-600 font-bold">{u.bypass_count}x</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-gray-400">{formatDate(u.created_at)}</td>
                    <td className="py-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-1">
                          <button
                            onClick={() => toggleBlock(u.id, u.is_blocked)}
                            className={`rounded px-2 py-1 text-xs font-medium ${u.is_blocked ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                          >
                            {u.is_blocked ? t('admin.users.unblock') : t('admin.users.block')}
                          </button>
                          <button
                            onClick={() => togglePremium(u.id, u.is_premium)}
                            className="rounded px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          >
                            {u.is_premium ? t('admin.users.removePremium') : t('admin.users.grantPremium')}
                          </button>
                        </div>
                        <div className="flex gap-1 items-center">
                          <select
                            value={u.role}
                            onChange={e => changeRole(u.id, e.target.value as UserRole)}
                            className="rounded border border-gray-200 px-1.5 py-0.5 text-xs text-gray-700 bg-white hover:border-gray-400 cursor-pointer"
                          >
                            {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => deleteUser(u.id, u.full_name)}
                            className="rounded px-2 py-0.5 text-xs font-medium bg-red-600 text-white hover:bg-red-700"
                            title="Nutzer dauerhaft löschen"
                          >
                            🗑 Löschen
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MATCHING */}
      {tab === 'matching' && (
        <div className="space-y-6">
          <div className="rounded-xl bg-orange-50 border border-orange-200 p-4 text-sm text-orange-800">
            <strong>{t('admin.matching.infoTitle')}: </strong>{t('admin.matching.infoDesc')}
          </div>

          {/* Selection grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Open Offers */}
            <div>
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <SendHorizonal className="h-4 w-4 text-orange-500" />
                {t('admin.matching.openOffers')} ({offers.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {offers.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">{t('admin.matching.noOffers')}</p>
                ) : offers.map((o: any) => (
                  <div
                    key={o.id}
                    onClick={() => setSelectedOffer(o.id === selectedOffer ? '' : o.id)}
                    className={`rounded-xl border-2 p-3 cursor-pointer transition ${
                      selectedOffer === o.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-gray-900">{o.users?.full_name}</span>
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{o.users?.role}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      📅 {new Date(o.available_from).toLocaleDateString('de-DE')} – {new Date(o.available_until).toLocaleDateString('de-DE')}
                    </p>
                    <p className="text-xs text-gray-500">{o.countries?.join(', ')}</p>
                    {o.daily_rate && <p className="text-xs font-medium text-gray-700 mt-1">€ {o.daily_rate}/day</p>}
                    {selectedOffer === o.id && <p className="text-xs text-orange-600 font-bold mt-1">✓ Selected</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Open Requests */}
            <div>
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-500" />
                {t('admin.matching.openRequests')} ({requests.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {requests.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">{t('admin.matching.noRequests')}</p>
                ) : requests.map((r: any) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRequest(r.id === selectedRequest ? '' : r.id)}
                    className={`rounded-xl border-2 p-3 cursor-pointer transition ${
                      selectedRequest === r.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-gray-900">{r.users?.full_name}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{r.role_needed}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      <MapPin className="h-3 w-3 inline mr-0.5" />
                      {r.location_city}, {r.location_country}
                    </p>
                    {(r.start_date || r.end_date) && (
                      <p className="text-xs text-gray-500">
                        📅 {r.start_date ? new Date(r.start_date).toLocaleDateString('de-DE') : '?'} – {r.end_date ? new Date(r.end_date).toLocaleDateString('de-DE') : '?'}
                      </p>
                    )}
                    {r.budget && <p className="text-xs font-medium text-gray-700 mt-1">💶 {r.budget}</p>}
                    {selectedRequest === r.id && <p className="text-xs text-blue-600 font-bold mt-1">✓ Selected</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Match creation */}
          {(selectedOffer || selectedRequest) && (
            <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-5 space-y-4">
              <h3 className="font-bold text-purple-900 flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                {t('admin.matching.createMatch')}
              </h3>

              {/* Selected parties */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg bg-orange-100 p-3 text-sm">
                  <p className="font-semibold text-orange-800 mb-1">🔧 Technician (Offer):</p>
                  {selectedOffer
                    ? <p className="text-orange-700 font-medium">{offers.find(o => o.id === selectedOffer)?.users?.full_name ?? '—'}</p>
                    : <p className="text-gray-400 italic">{t('admin.matching.selectOffer')}</p>
                  }
                </div>
                <div className="rounded-lg bg-blue-100 p-3 text-sm">
                  <p className="font-semibold text-blue-800 mb-1">🏢 Workshop (Request):</p>
                  {selectedRequest
                    ? <p className="text-blue-700 font-medium">{requests.find(r => r.id === selectedRequest)?.users?.full_name ?? '—'}</p>
                    : <p className="text-gray-400 italic">{t('admin.matching.selectRequest')}</p>
                  }
                </div>
              </div>

              {/* Assignment details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-purple-700 mb-1 uppercase tracking-wide">{t('admin.matching.assignment')}</label>
                  <input value={matchAssignment} onChange={e => setMatchAssignment(e.target.value)}
                    placeholder={t('admin.matching.assignmentPlaceholder')}
                    className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-purple-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-purple-700 mb-1 uppercase tracking-wide">{t('admin.matching.location')}</label>
                  <input value={matchLocation} onChange={e => setMatchLocation(e.target.value)}
                    placeholder="Munich, Germany"
                    className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-purple-400" />
                </div>
              </div>

              {/* Rates + margin */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-orange-700 mb-1 uppercase tracking-wide">{t('admin.matching.techRate')} (€)</label>
                  <input type="number" value={matchTechRate} onChange={e => setMatchTechRate(e.target.value)}
                    placeholder="320"
                    className="w-full rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-blue-700 mb-1 uppercase tracking-wide">{t('admin.matching.clientFee')} (€)</label>
                  <input type="number" value={matchClientFee} onChange={e => setMatchClientFee(e.target.value)}
                    placeholder="420"
                    className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div className="rounded-lg bg-green-50 border border-green-200 p-3 flex flex-col justify-center">
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-0.5">{t('admin.matching.margin')}</p>
                  <p className="text-xl font-extrabold text-green-700">
                    {matchTechRate && matchClientFee && parseFloat(matchClientFee) > parseFloat(matchTechRate)
                      ? `+€${(parseFloat(matchClientFee) - parseFloat(matchTechRate)).toFixed(0)}`
                      : '—'}
                  </p>
                  <p className="text-xs text-green-600">{t('admin.matching.marginDesc')}</p>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-purple-700 mb-1 uppercase tracking-wide">{t('admin.matching.notes')}</label>
                <textarea value={matchNotes} onChange={e => setMatchNotes(e.target.value)} rows={2}
                  placeholder={t('admin.matching.notesPlaceholder')}
                  className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-purple-400" />
              </div>

              <button
                onClick={handleCreateMatch}
                disabled={creatingMatch || !selectedOffer || !selectedRequest}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-purple-700 transition disabled:opacity-60"
              >
                {creatingMatch ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                {t('admin.matching.proposeBtn')}
              </button>
            </div>
          )}

          {/* Active matches */}
          {matches.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-700 mb-3">{t('admin.matching.activeMatches')} ({matches.length})</h3>
              <div className="space-y-3">
                {matches.map((m: any) => (
                  <div key={m.id} className="rounded-xl border border-purple-200 bg-white p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-purple-600 uppercase tracking-wide">{m.status}</span>
                      <span className="text-xs text-gray-400">{formatDate(m.created_at)}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="text-sm">
                        <p className="text-xs text-gray-400 mb-0.5">Technician</p>
                        <p className="font-medium text-gray-900">{m.offers?.available_from ? `${new Date(m.offers.available_from).toLocaleDateString('de-DE')} – ${new Date(m.offers.available_until).toLocaleDateString('de-DE')}` : '—'}</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-xs text-gray-400 mb-0.5">Workshop</p>
                        <p className="font-medium text-gray-900">
                          {m.job_requests ? `${m.job_requests.role_needed} — ${m.job_requests.location_city}, ${m.job_requests.location_country}` : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTRACTS */}
      {tab === 'contracts' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4 text-sm text-indigo-800">
            <strong>{t('admin.contracts.modelTitle')}: </strong>{t('admin.contracts.modelDesc')}
          </div>
          {matches.length === 0 ? (
            <div className="card text-center py-10 text-gray-400">{t('admin.contracts.none')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-900 text-left text-xs font-bold text-white uppercase tracking-wider">
                    <th className="px-4 py-3 rounded-tl-lg">{t('admin.contracts.ref')}</th>
                    <th className="px-4 py-3">{t('admin.contracts.type')}</th>
                    <th className="px-4 py-3">{t('admin.contracts.party')}</th>
                    <th className="px-4 py-3">{t('admin.contracts.assignment')}</th>
                    <th className="px-4 py-3">{t('admin.contracts.value')}</th>
                    <th className="px-4 py-3 rounded-tr-lg">{t('admin.contracts.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {matches.map((m: any, idx: number) => {
                    const ref = `PDR-${new Date(m.created_at).getFullYear()}-${(idx + 1).toString().padStart(4, '0')}`;
                    const margin = m.tech_rate && m.client_fee
                      ? (parseFloat(m.client_fee) - parseFloat(m.tech_rate))
                      : null;
                    return (
                      <>
                        {/* Technician contract row */}
                        <tr key={`${m.id}-t`} className="bg-orange-50/40">
                          <td className="px-4 py-3 font-mono text-xs text-gray-600">{ref}-T</td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-orange-100 text-orange-700 px-2 py-0.5 text-xs font-bold">🔧 Technician</span>
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">{m.tech_user_id?.slice(0, 8) ?? '—'}</td>
                          <td className="px-4 py-3 text-xs text-gray-600">
                            {m.job_requests ? `${m.job_requests.role_needed} — ${m.job_requests.location_city}` : (m.notes ?? '—')}
                          </td>
                          <td className="px-4 py-3 font-semibold text-orange-700">
                            {m.tech_rate ? `€${m.tech_rate}` : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                              m.status === 'both_signed' ? 'bg-green-100 text-green-700' :
                              m.status === 'tech_signed' ? 'bg-blue-100 text-blue-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>{m.status}</span>
                          </td>
                        </tr>
                        {/* Workshop contract row */}
                        <tr key={`${m.id}-w`} className="bg-blue-50/40">
                          <td className="px-4 py-3 font-mono text-xs text-gray-600">{ref}-W</td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs font-bold">🏢 Workshop</span>
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">{m.client_user_id?.slice(0, 8) ?? '—'}</td>
                          <td className="px-4 py-3 text-xs text-gray-600">
                            {m.job_requests ? `${m.job_requests.role_needed} — ${m.job_requests.location_city}` : (m.notes ?? '—')}
                          </td>
                          <td className="px-4 py-3 font-semibold text-blue-700">
                            {m.client_fee ? `€${m.client_fee}` : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                              m.status === 'both_signed' ? 'bg-green-100 text-green-700' :
                              m.status === 'client_signed' ? 'bg-blue-100 text-blue-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>{m.status}</span>
                          </td>
                        </tr>
                        {/* Margin row */}
                        {margin !== null && (
                          <tr key={`${m.id}-m`} className="bg-green-50/60 border-b-2 border-green-200">
                            <td colSpan={4} className="px-4 py-2 text-xs text-green-700 font-medium">{t('admin.contracts.marginRow')}</td>
                            <td className="px-4 py-2 font-extrabold text-green-700">+€{margin.toFixed(0)}</td>
                            <td />
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-xs text-gray-600">
            <strong>{t('admin.contracts.noteTitle')}:</strong> {t('admin.contracts.noteDesc')}
          </div>
        </div>
      )}

      {/* OFFERS TABLE */}
      {tab === 'offers' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">{t('admin.offersList.desc')}</p>
          {offers.length === 0 ? (
            <div className="card text-center py-10 text-gray-400">{t('admin.offersList.none')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="pb-2 pr-4">{t('admin.users.name')}</th>
                    <th className="pb-2 pr-4">{t('admin.offersList.dates')}</th>
                    <th className="pb-2 pr-4">{t('admin.offersList.services')}</th>
                    <th className="pb-2 pr-4">{t('admin.offersList.countries')}</th>
                    <th className="pb-2 pr-4">{t('admin.offersList.rate')}</th>
                    <th className="pb-2">{t('admin.users.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {offers.map((o: any) => (
                    <tr key={o.id}>
                      <td className="py-3 pr-4 font-medium text-gray-900">{o.users?.full_name}</td>
                      <td className="py-3 pr-4 text-gray-500 text-xs">
                        {new Date(o.available_from).toLocaleDateString('de-DE')} – {new Date(o.available_until).toLocaleDateString('de-DE')}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-1">
                          {o.services?.slice(0, 3).map((s: string) => (
                            <span key={s} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-xs text-gray-500">{o.countries?.join(', ')}</td>
                      <td className="py-3 pr-4 text-gray-700 font-medium">{o.daily_rate ? `€${o.daily_rate}` : '—'}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          o.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>{o.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* REQUESTS TABLE */}
      {tab === 'requests' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">{t('admin.requestsList.desc')}</p>
          {requests.length === 0 ? (
            <div className="card text-center py-10 text-gray-400">{t('admin.requestsList.none')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="pb-2 pr-4">{t('admin.users.name')}</th>
                    <th className="pb-2 pr-4">{t('admin.requestsList.roleNeeded')}</th>
                    <th className="pb-2 pr-4">{t('admin.requestsList.location')}</th>
                    <th className="pb-2 pr-4">{t('admin.requestsList.dates')}</th>
                    <th className="pb-2 pr-4">{t('admin.requestsList.budget')}</th>
                    <th className="pb-2">{t('admin.users.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((r: any) => (
                    <tr key={r.id}>
                      <td className="py-3 pr-4 font-medium text-gray-900">{r.users?.full_name}</td>
                      <td className="py-3 pr-4">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{r.role_needed}</span>
                      </td>
                      <td className="py-3 pr-4 text-gray-500 text-xs">{r.location_city}, {r.location_country}</td>
                      <td className="py-3 pr-4 text-gray-500 text-xs">
                        {r.start_date ? new Date(r.start_date).toLocaleDateString('de-DE') : '?'} – {r.end_date ? new Date(r.end_date).toLocaleDateString('de-DE') : '?'}
                      </td>
                      <td className="py-3 pr-4 text-gray-700 font-medium">{r.budget ?? '—'}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          r.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
                        }`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VERIFICATIONS / APPROVAL QUEUE */}
      {tab === 'verifications' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
            <strong>⚠️ Freigabe-Warteschlange:</strong> Alle hochgeladenen Dokumente sind hier vollständig
            einsehbar, bevor Sie eine Entscheidung treffen. Kontaktdaten sind nur für Admins sichtbar.
          </div>

          {verifications.length === 0 && (
            <div className="card text-center py-12 text-gray-400">
              <ShieldCheck className="h-10 w-10 mx-auto mb-2 text-green-400" />
              Keine ausstehenden Registrierungen
            </div>
          )}
          {verifications.map((v: any) => {
            const userDocs = verificationDocs.filter((d: any) => d.user_id === v.id);
            return (
              <div key={v.id} className="card border-amber-200 bg-amber-50/20 space-y-4">
                {/* Header row */}
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {v.avatar_url ? (
                      <img src={v.avatar_url} alt="" className="h-14 w-14 rounded-xl object-cover border border-amber-200" />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100 flex-shrink-0">
                        <Clock className="h-7 w-7 text-amber-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900 text-lg">{v.full_name}</p>
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        {ROLE_LABELS[v.role as keyof typeof ROLE_LABELS] ?? v.role}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        <Clock className="h-3 w-3 mr-1"/> Wartet auf Freigabe
                      </span>
                    </div>

                    {/* Contact + bio */}
                    <div className="mt-1.5 space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400 text-xs w-14">📧</span>
                        <a href={`mailto:${v.email}`} className="text-brand-600 hover:underline font-medium">{v.email}</a>
                      </div>
                      {v.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-400 text-xs w-14">📞</span>
                          <a href={`tel:${v.phone}`} className="text-gray-700 hover:underline">{v.phone}</a>
                        </div>
                      )}
                      {v.company_name && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-400 text-xs w-14">🏢</span>
                          <span className="text-gray-700">{v.company_name}</span>
                        </div>
                      )}
                      {v.bio && (
                        <p className="text-xs text-gray-500 mt-1 italic">"{v.bio}"</p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3"/>Registriert: {formatDate(v.created_at)}</span>
                      <span>Anfrage: {formatDate(v.verification_requested_at)}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleVerifyUser(v.id, 'approve')}
                      className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition shadow-sm"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Freigeben
                    </button>
                    <button
                      onClick={() => handleVerifyUser(v.id, 'reject')}
                      className="flex items-center gap-1.5 rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200 transition"
                    >
                      <XCircle className="h-4 w-4" />
                      Ablehnen
                    </button>
                    <Link
                      href={`/admin/users/${v.id}`}
                      className="flex items-center gap-1.5 rounded-lg bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-200 transition text-center"
                    >
                      <Eye className="h-4 w-4" />
                      Vollprofil
                    </Link>
                  </div>
                </div>

                {/* Documents section */}
                {userDocs.length === 0 ? (
                  <div className="rounded-lg bg-gray-50 border border-dashed border-gray-200 px-4 py-3 text-xs text-gray-400 flex items-center gap-2">
                    <FileText className="h-4 w-4"/>
                    Keine Dokumente hochgeladen
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      📎 Hochgeladene Dokumente ({userDocs.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {userDocs.map((doc: any) => (
                        <a
                          key={doc.id}
                          href={doc.signed_url ?? doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2.5 hover:bg-indigo-100 transition group"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-200 flex-shrink-0 group-hover:bg-indigo-300 transition">
                            <FileText className="h-4 w-4 text-indigo-700"/>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-indigo-800">{doc.type}</p>
                            <p className="text-xs text-indigo-500">{formatDate(doc.created_at)}</p>
                          </div>
                          <Download className="h-3.5 w-3.5 text-indigo-400 group-hover:text-indigo-700 transition flex-shrink-0"/>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* DOCS */}
      {tab === 'docs' && (
        <div className="space-y-4">
          {docs.length === 0 && (
            <div className="card text-center py-12 text-gray-400">
              <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-400" />
              {t('admin.docs.noPending')}
            </div>
          )}
          {docs.map((doc: any) => {
            const isImage = doc.type === 'GALLERY_IMAGE' || doc.type === 'AVATAR';
            const viewUrl = doc.signed_url ?? doc.file_url;
            return (
              <div key={doc.id} className="card flex items-start gap-4">
                {/* Image preview for gallery / avatar */}
                {isImage && viewUrl && (
                  <a href={viewUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                    <img
                      src={viewUrl}
                      alt={doc.type}
                      className="w-24 h-24 rounded-xl object-cover border border-gray-200 hover:opacity-90 transition"
                    />
                  </a>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">{doc.users?.full_name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      isImage ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {doc.type === 'GALLERY_IMAGE' ? '🖼 Galeriebild' :
                       doc.type === 'AVATAR'        ? '👤 Profilbild' : doc.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    📧 {doc.users?.email} · {t('admin.docs.uploaded')} {formatDate(doc.created_at)}
                  </p>
                  {/* View link for non-image documents */}
                  {!isImage && viewUrl && (
                    <a
                      href={viewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {t('admin.docs.viewDocument')}
                    </a>
                  )}
                  {!viewUrl && (
                    <p className="text-xs text-red-500 mt-1">⚠️ Kein gültiger Dokument-Link</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => verifyDoc(doc.id, doc.user_id, doc.type, doc.file_url)}
                    className="flex items-center gap-1 rounded-lg bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-200"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Freigeben
                  </button>
                  <button
                    onClick={() => rejectDoc(doc.id)}
                    className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Ablehnen
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIOLATIONS */}
      {tab === 'violations' && (
        <div className="space-y-3">
          {violations.length === 0 && (
            <div className="card text-center py-12 text-gray-400">{t('admin.violations.none')}</div>
          )}
          {violations.map((v: any) => (
            <div key={v.id} className="card border-orange-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{v.users?.full_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(v.created_at)}</p>
                  <p className="text-sm text-orange-700 mt-1 font-mono bg-orange-50 rounded px-2 py-1 mt-2">
                    {v.detected_pattern}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold text-orange-500">{v.bypass_count_at_time}x</p>
                  <p className="text-xs text-gray-400">{t('admin.violations.violationCount')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
