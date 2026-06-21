'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { createClient } from '@/lib/supabase/client';
import { COUNTRIES } from '@/types/database';
import { formatDate } from '@/lib/utils';
import {
  Plus, Send, Clock, CheckCircle, XCircle, AlertTriangle,
  ChevronUp, Info, Loader2, MapPin, Search, Users,
} from 'lucide-react';

const ROLE_OPTIONS = [
  'PDR Technician',
  'Car Painter',
  'Preparer',
  'Dismantler',
  'Multiple roles',
];

const COUNTRIES_LIST = COUNTRIES.map(c => c.name);

const URGENCY_OPTIONS = [
  { value: 'standard', label: 'Standard (48h)' },
  { value: 'urgent',   label: 'Urgent (24h)' },
  { value: 'flexible', label: 'Flexible (1 week)' },
];

const STATUS_STYLES: Record<string, { cls: string; label: string }> = {
  open:      { cls: 'bg-amber-100 text-amber-700',   label: 'Open' },
  reviewing: { cls: 'bg-blue-100 text-blue-700',     label: 'Under Review' },
  matched:   { cls: 'bg-purple-100 text-purple-700', label: 'Matched' },
  contract:  { cls: 'bg-indigo-100 text-indigo-700', label: 'Contract Sent' },
  completed: { cls: 'bg-green-100 text-green-700',   label: 'Completed' },
  cancelled: { cls: 'bg-gray-100 text-gray-500',     label: 'Cancelled' },
};

interface JobRequest {
  id: string;
  role_needed: string;
  location_city: string;
  location_country: string;
  start_date: string | null;
  end_date: string | null;
  volume: string | null;
  budget: string | null;
  description: string | null;
  urgency: string;
  status: string;
  created_at: string;
}

interface CustomerInquiry {
  id: string;
  message: string;
  location: string | null;
  start_date: string | null;
  budget: string | null;
  selected_technicians: Array<{ id: string; full_name: string; role: string }>;
  status: string;
  created_at: string;
}

const INQUIRY_STATUS: Record<string, { cls: string; label: string; icon: string }> = {
  new:         { cls: 'bg-amber-100 text-amber-700',   label: 'Pending Review',  icon: '⏳' },
  in_progress: { cls: 'bg-blue-100 text-blue-700',     label: 'In Progress',     icon: '🔄' },
  matched:     { cls: 'bg-green-100 text-green-700',   label: 'Match Found!',    icon: '✅' },
  closed:      { cls: 'bg-gray-100 text-gray-500',     label: 'Closed',          icon: '🔒' },
};

export default function RequestsPage() {
  const { t } = useTranslation();
  const [requests,   setRequests]   = useState<JobRequest[]>([]);
  const [inquiries,  setInquiries]  = useState<CustomerInquiry[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [roleNeeded,  setRoleNeeded]  = useState('PDR Technician');
  const [city,        setCity]        = useState('');
  const [country,     setCountry]     = useState('Germany');
  const [startDate,   setStartDate]   = useState('');
  const [endDate,     setEndDate]     = useState('');
  const [volume,      setVolume]      = useState('');
  const [budget,      setBudget]      = useState('');
  const [description, setDescription] = useState('');
  const [urgency,     setUrgency]     = useState('standard');

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [jobReqRes, inquiryRes] = await Promise.all([
      supabase.from('job_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('customer_inquiries').select('*').eq('customer_id', user.id).order('created_at', { ascending: false }),
    ]);

    setRequests(jobReqRes.data ?? []);
    setInquiries(inquiryRes.data ?? []);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!city.trim()) { toast.error(t('requests.errors.cityRequired')); return; }

    setSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); return; }

    const { error } = await supabase.from('job_requests').insert({
      user_id: user.id,
      role_needed: roleNeeded,
      location_city: city.trim(),
      location_country: country,
      start_date: startDate || null,
      end_date: endDate || null,
      volume: volume || null,
      budget: budget || null,
      description: description || null,
      urgency,
      status: 'open',
    });

    setSubmitting(false);
    if (error) { toast.error(error.message); return; }

    toast.success(t('requests.submitted'));
    setShowForm(false);
    setCity(''); setStartDate(''); setEndDate(''); setVolume(''); setBudget(''); setDescription('');
    loadRequests();
  };

  if (loading) return <div className="text-center py-20 text-gray-400">{t('common.loading')}</div>;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('requests.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('requests.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition shadow-sm"
        >
          {showForm ? <ChevronUp className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? t('requests.hideForm') : t('requests.newRequest')}
        </button>
      </div>

      {/* Info */}
      <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex gap-3">
        <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-semibold mb-1">{t('requests.infoTitle')}</p>
          <p>{t('requests.infoDesc')}</p>
        </div>
      </div>

      <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex gap-3">
        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 font-medium">{t('requests.warningNoContact')}</p>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card border-2 border-gray-200 space-y-5">
          <h2 className="font-bold text-gray-900 text-base">{t('requests.formTitle')}</h2>

          {/* Role needed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('requests.roleNeeded')}</label>
            <select value={roleNeeded} onChange={e => setRoleNeeded(e.target.value)} className="input max-w-sm">
              {ROLE_OPTIONS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('requests.city')}</label>
              <input type="text" value={city} onChange={e => setCity(e.target.value)}
                placeholder="Munich" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('requests.country')}</label>
              <select value={country} onChange={e => setCountry(e.target.value)} className="input">
                {COUNTRIES_LIST.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('requests.startDate')}</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('requests.endDate')}</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input" />
            </div>
          </div>

          {/* Volume + Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('requests.volume')}</label>
              <input type="text" value={volume} onChange={e => setVolume(e.target.value)}
                placeholder={t('requests.volumePlaceholder')} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('requests.budget')}</label>
              <input type="text" value={budget} onChange={e => setBudget(e.target.value)}
                placeholder={t('requests.budgetPlaceholder')} className="input" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('requests.description')}</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
              placeholder={t('requests.descriptionPlaceholder')} className="input" />
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('requests.urgency')}</label>
            <div className="flex gap-3 flex-wrap">
              {URGENCY_OPTIONS.map(u => (
                <label key={u.value} className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition text-sm font-medium ${
                  urgency === u.value ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}>
                  <input type="radio" className="hidden" value={u.value} checked={urgency === u.value} onChange={() => setUrgency(u.value)} />
                  {u.label}
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-xs text-red-700 font-medium">{t('requests.warningNoContactForm')}</p>
          </div>

          <button onClick={handleSubmit} disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white hover:bg-gray-800 transition disabled:opacity-60">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {submitting ? t('requests.submitting') : t('requests.submitBtn')}
          </button>
        </div>
      )}

      {/* ── PDR Connect Inquiries (new system via Find Pros) ── */}
      {inquiries.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-brand-600" />
            <h2 className="font-semibold text-gray-900">My Inquiries via PDR Connect</h2>
            <span className="text-xs bg-brand-100 text-brand-700 rounded-full px-2 py-0.5 font-medium">
              {inquiries.length} inquiry{inquiries.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
            ℹ️ These are inquiries you sent to the PDR Connect team via the "Find Pros" page.
            Our team reviews each request and will contact you within 24 hours.
          </div>

          {inquiries.map(inq => {
            const st = INQUIRY_STATUS[inq.status] ?? INQUIRY_STATUS.new;
            return (
              <div key={inq.id} className={`card border-l-4 ${
                inq.status === 'matched'     ? 'border-l-green-500' :
                inq.status === 'in_progress' ? 'border-l-blue-500' :
                inq.status === 'new'         ? 'border-l-amber-400' :
                'border-l-gray-300'
              } space-y-3`}>
                {/* Status + date */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${st.cls}`}>
                      {st.icon} {st.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      Sent {new Date(inq.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {inq.status === 'matched' && (
                    <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                      🎉 PDR Connect found a match for you!
                    </span>
                  )}
                </div>

                {/* Details */}
                {(inq.location || inq.start_date || inq.budget) && (
                  <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                    {inq.location  && <span>📍 {inq.location}</span>}
                    {inq.start_date && <span>📅 From {new Date(inq.start_date).toLocaleDateString('en-GB')}</span>}
                    {inq.budget    && <span>💶 {inq.budget}</span>}
                  </div>
                )}

                {/* Message */}
                <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
                  <p className="text-xs font-medium text-gray-500 mb-1">Your message:</p>
                  <p className="text-sm text-gray-700 line-clamp-3">{inq.message}</p>
                </div>

                {/* Selected technicians */}
                {inq.selected_technicians?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      Technicians you selected ({inq.selected_technicians.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {inq.selected_technicians.map((tech: any) => (
                        <div key={tech.id} className="flex items-center gap-1.5 bg-brand-50 border border-brand-200 rounded-full px-3 py-1 text-xs text-brand-700 font-medium">
                          <div className="h-5 w-5 rounded-full bg-brand-200 flex items-center justify-center font-bold text-xs">
                            {tech.full_name?.charAt(0)}
                          </div>
                          {tech.full_name}
                          <span className="text-brand-400">· {tech.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status message based on status */}
                {inq.status === 'in_progress' && (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-700">
                    🔄 <strong>Update:</strong> The PDR Connect team is working on finding the best match for your request.
                  </div>
                )}
                {inq.status === 'matched' && (
                  <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700">
                    ✅ <strong>Great news!</strong> A technician has been matched to your request. The PDR Connect team will contact you shortly with details.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Requests list */}
      <div className="space-y-4">
        <h2 className="font-semibold text-gray-900">{t('requests.myRequests')}</h2>

        {requests.length === 0 ? (
          <div className="card text-center py-12">
            <MapPin className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">{t('requests.noRequests')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('requests.noRequestsHint')}</p>
            <button onClick={() => setShowForm(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition">
              <Plus className="h-4 w-4" /> {t('requests.newRequest')}
            </button>
          </div>
        ) : (
          requests.map(req => {
            const s = STATUS_STYLES[req.status] ?? STATUS_STYLES.open;
            return (
              <div key={req.id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${s.cls}`}>
                        {t(`requests.status.${req.status}`)}
                      </span>
                      <span className="text-sm font-bold text-gray-800">{req.role_needed}</span>
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {req.location_city}, {req.location_country}
                      </span>
                    </div>
                    {(req.start_date || req.end_date) && (
                      <p className="text-sm text-gray-600 mb-1">
                        📅 {req.start_date ? new Date(req.start_date).toLocaleDateString('de-DE') : '?'}
                        {' – '}
                        {req.end_date ? new Date(req.end_date).toLocaleDateString('de-DE') : '?'}
                      </p>
                    )}
                    {req.budget && <p className="text-sm text-gray-500">💶 {req.budget}</p>}
                    {req.description && (
                      <p className="text-xs text-gray-500 mt-2 italic line-clamp-2">"{req.description}"</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">{t('requests.submittedOn')} {formatDate(req.created_at)}</p>
                  </div>
                </div>

                {req.status === 'matched' && (
                  <div className="mt-3 rounded-lg bg-purple-50 border border-purple-200 p-3 text-xs text-purple-700">
                    <strong>✓ {t('requests.matchedInfo')}</strong>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
