'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { createClient } from '@/lib/supabase/client';
import { COUNTRIES } from '@/types/database';
import { formatDate } from '@/lib/utils';
import {
  Plus, Send, Clock, CheckCircle, XCircle, AlertTriangle,
  ChevronDown, ChevronUp, Info, Loader2, Globe,
} from 'lucide-react';

const PLATFORM_SERVICES = [
  'PDR / Dent Repair',
  'Hail Damage',
  'Smart Repair',
  'Car Painting',
  'Surface Preparation',
  'Dismantling',
];

const STATUS_STYLES: Record<string, { cls: string; icon: React.ElementType; label: string }> = {
  open:      { cls: 'bg-amber-100 text-amber-700',  icon: Clock,         label: 'Open' },
  matched:   { cls: 'bg-blue-100 text-blue-700',    icon: CheckCircle,   label: 'Matched' },
  contract:  { cls: 'bg-purple-100 text-purple-700', icon: CheckCircle,  label: 'Contract Sent' },
  completed: { cls: 'bg-green-100 text-green-700',  icon: CheckCircle,   label: 'Completed' },
  withdrawn: { cls: 'bg-gray-100 text-gray-500',    icon: XCircle,       label: 'Withdrawn' },
};

interface Offer {
  id: string;
  available_from: string;
  available_until: string;
  services: string[];
  countries: string[];
  daily_rate: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

export default function OffersPage() {
  const { t } = useTranslation();
  const [offers, setOffers]         = useState<Offer[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [fromDate,    setFromDate]   = useState('');
  const [untilDate,   setUntilDate]  = useState('');
  const [services,    setServices]   = useState<string[]>([]);
  const [countries,   setCountries]  = useState<string[]>([]);
  const [dailyRate,   setDailyRate]  = useState('');
  const [notes,       setNotes]      = useState('');

  useEffect(() => { loadOffers(); }, []);

  const loadOffers = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('offers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setOffers(data ?? []);
    setLoading(false);
  };

  const toggleService = (s: string) =>
    setServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const toggleCountry = (c: string) =>
    setCountries(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const handleSubmit = async () => {
    if (!fromDate || !untilDate) { toast.error(t('offers.errors.datesRequired')); return; }
    if (services.length === 0)   { toast.error(t('offers.errors.servicesRequired')); return; }
    if (countries.length === 0)  { toast.error(t('offers.errors.countriesRequired')); return; }

    setSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); return; }

    const { error } = await supabase.from('offers').insert({
      user_id: user.id,
      available_from: fromDate,
      available_until: untilDate,
      services,
      countries,
      daily_rate: dailyRate || null,
      notes: notes || null,
      status: 'open',
    });

    setSubmitting(false);
    if (error) { toast.error(error.message); return; }

    toast.success(t('offers.submitted'));
    setShowForm(false);
    setFromDate(''); setUntilDate(''); setServices([]); setCountries([]); setDailyRate(''); setNotes('');
    loadOffers();
  };

  const handleWithdraw = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('offers').update({ status: 'withdrawn' }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success(t('offers.withdrawn'));
    loadOffers();
  };

  if (loading) return <div className="text-center py-20 text-gray-400">{t('common.loading')}</div>;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('offers.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('offers.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition shadow-sm"
        >
          {showForm ? <ChevronUp className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? t('offers.hideForm') : t('offers.newOffer')}
        </button>
      </div>

      {/* Info box */}
      <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex gap-3">
        <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-semibold mb-1">{t('offers.infoTitle')}</p>
          <p>{t('offers.infoDesc')}</p>
        </div>
      </div>

      {/* Warning: no direct contact */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex gap-3">
        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 font-medium">{t('offers.warningNoContact')}</p>
      </div>

      {/* New Offer Form */}
      {showForm && (
        <div className="card border-2 border-brand-200 space-y-5">
          <h2 className="font-bold text-gray-900 text-base">{t('offers.formTitle')}</h2>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('offers.availableFrom')}</label>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                className="input" min={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('offers.availableUntil')}</label>
              <input type="date" value={untilDate} onChange={e => setUntilDate(e.target.value)}
                className="input" min={fromDate || new Date().toISOString().split('T')[0]} />
            </div>
          </div>

          {/* Services */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('offers.servicesOffered')}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PLATFORM_SERVICES.map(s => (
                <label key={s} className={`flex items-center gap-2 rounded-lg border p-2.5 cursor-pointer transition text-sm font-medium ${
                  services.includes(s) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                  <input type="checkbox" className="hidden" checked={services.includes(s)} onChange={() => toggleService(s)} />
                  <div className={`h-4 w-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    services.includes(s) ? 'border-brand-600 bg-brand-600' : 'border-gray-300'
                  }`}>
                    {services.includes(s) && <CheckCircle className="h-3 w-3 text-white" />}
                  </div>
                  {s}
                </label>
              ))}
            </div>
          </div>

          {/* Countries */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="h-4 w-4 inline mr-1" />
              {t('offers.availableCountries')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
              {COUNTRIES.map(c => (
                <label key={c.code} className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 cursor-pointer transition text-xs font-medium ${
                  countries.includes(c.name) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                  <input type="checkbox" className="hidden" checked={countries.includes(c.name)} onChange={() => toggleCountry(c.name)} />
                  <div className={`h-3.5 w-3.5 rounded border-2 flex-shrink-0 ${countries.includes(c.name) ? 'border-brand-600 bg-brand-600' : 'border-gray-300'}`} />
                  {c.name}
                </label>
              ))}
            </div>
          </div>

          {/* Daily rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('offers.dailyRate')}</label>
            <input type="text" value={dailyRate} onChange={e => setDailyRate(e.target.value)}
              placeholder={t('offers.dailyRatePlaceholder')} className="input max-w-xs" />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('offers.notes')}</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder={t('offers.notesPlaceholder')} className="input" />
            <p className="text-xs text-red-500 mt-1 font-medium">{t('offers.notesWarning')}</p>
          </div>

          <button onClick={handleSubmit} disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white hover:bg-brand-700 transition disabled:opacity-60">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {submitting ? t('offers.submitting') : t('offers.submitBtn')}
          </button>
        </div>
      )}

      {/* Offers list */}
      <div className="space-y-4">
        <h2 className="font-semibold text-gray-900">{t('offers.myOffers')}</h2>

        {offers.length === 0 ? (
          <div className="card text-center py-12">
            <Globe className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">{t('offers.noOffers')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('offers.noOffersHint')}</p>
            <button onClick={() => setShowForm(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition">
              <Plus className="h-4 w-4" /> {t('offers.newOffer')}
            </button>
          </div>
        ) : (
          offers.map(offer => {
            const s = STATUS_STYLES[offer.status] ?? STATUS_STYLES.open;
            const Icon = s.icon;
            return (
              <div key={offer.id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Status + dates */}
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${s.cls}`}>
                        <Icon className="h-3.5 w-3.5" /> {t(`offers.status.${offer.status}`)}
                      </span>
                      <span className="text-sm font-semibold text-gray-700">
                        {new Date(offer.available_from).toLocaleDateString('de-DE')} – {new Date(offer.available_until).toLocaleDateString('de-DE')}
                      </span>
                      {offer.daily_rate && (
                        <span className="text-sm text-gray-500 font-medium">€ {offer.daily_rate}</span>
                      )}
                    </div>

                    {/* Services */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {offer.services.map(s => (
                        <span key={s} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{s}</span>
                      ))}
                    </div>

                    {/* Countries */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {offer.countries.map(c => (
                        <span key={c} className="rounded-md bg-brand-50 border border-brand-200 px-2 py-0.5 text-xs text-brand-700">🌍 {c}</span>
                      ))}
                    </div>

                    {offer.notes && (
                      <p className="text-xs text-gray-500 mt-2 italic">"{offer.notes}"</p>
                    )}

                    <p className="text-xs text-gray-400 mt-2">{t('offers.submittedOn')} {formatDate(offer.created_at)}</p>
                  </div>

                  {offer.status === 'open' && (
                    <button onClick={() => handleWithdraw(offer.id)}
                      className="flex-shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition">
                      {t('offers.withdraw')}
                    </button>
                  )}
                </div>

                {offer.status === 'matched' && (
                  <div className="mt-3 rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700">
                    <strong>✓ {t('offers.matchedInfo')}</strong>
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
