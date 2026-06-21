'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { CRAFT_ROLES, COUNTRIES, BUNDESLAENDER } from '@/types/database';
import { Search, MapPin, Briefcase, ShieldCheck, Plus, Check, Send, X, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface SearchResult {
  id: string;
  full_name: string;
  role: string;
  secondary_roles: string[];
  available_countries: string[];
  services: string[];
  avatar_url: string | null;
  bio: string | null;
  is_premium: boolean;
  is_verified: boolean;
  postal_code: string | null;
  bundesland: string | null;
}

interface Props {
  results: SearchResult[];
  currentRole: string;
  currentCountry: string;
  currentBundesland: string;
  isAdmin?: boolean;
  isCustomer?: boolean; // customer/business role
}

export default function SearchClient({ results, currentRole, currentCountry, currentBundesland, isAdmin, isCustomer }: Props) {
  const { t } = useTranslation();

  // Shortlist state
  const [selected, setSelected] = useState<SearchResult[]>([]);
  const [showForm, setShowForm]   = useState(false);

  // Inquiry form
  const [message,   setMessage]   = useState('');
  const [location,  setLocation]  = useState('');
  const [startDate, setStartDate] = useState('');
  const [budget,    setBudget]    = useState('');
  const [sending,   setSending]   = useState(false);

  const toggle = (pro: SearchResult) => {
    setSelected(prev =>
      prev.some(p => p.id === pro.id)
        ? prev.filter(p => p.id !== pro.id)
        : [...prev, pro]
    );
  };

  const isSelected = (id: string) => selected.some(p => p.id === id);

  const sendInquiry = async () => {
    if (!message.trim()) { toast.error('Please write a message'); return; }
    setSending(true);
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, location, startDate, budget, selectedTechnicians: selected }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Error');
      toast.success(t('inquiry.success'));
      setShowForm(false);
      setSelected([]);
      setMessage(''); setLocation(''); setStartDate(''); setBudget('');
      // Redirect to requests page so customer can track their inquiry
      setTimeout(() => { window.location.href = '/requests'; }, 1500);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-32">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('search.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('search.found', { count: results.length })}</p>
      </div>

      {/* Info banner for customers */}
      {isCustomer && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            {t('inquiry.banner')}
          </div>
        </div>
      )}

      {/* Filters */}
      <form className="card space-y-3" method="GET">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('search.role')}</label>
            <select name="role" defaultValue={currentRole} className="input">
              <option value="">{t('search.allRoles')}</option>
              {CRAFT_ROLES.map(v => <option key={v} value={v}>{t(`roles.${v}`)}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('search.country')}</label>
            <select name="country" defaultValue={currentCountry} className="input">
              <option value="">{t('search.allCountries')}</option>
              {COUNTRIES.map(({ code, name }) => <option key={code} value={code}>{name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('search.bundesland')}</label>
            <select name="bundesland" defaultValue={currentBundesland} className="input">
              <option value="">{t('search.allBundeslaender')}</option>
              {BUNDESLAENDER.map(bl => <option key={bl} value={bl}>{bl}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <button type="submit" className="btn-primary">
            <Search className="h-4 w-4 mr-2" /> {t('search.searchBtn')}
          </button>
          {(currentRole || currentCountry || currentBundesland) && (
            <Link href="/search" className="btn-secondary">{t('search.clear')}</Link>
          )}
        </div>
      </form>

      {/* Results */}
      {results.length === 0 ? (
        <div className="card text-center py-16">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900">{t('search.noResults')}</h3>
          <p className="text-sm text-gray-500 mt-1">{t('search.noResultsHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map(pro => (
            <div
              key={pro.id}
              className={`card transition-all duration-200 ${
                isSelected(pro.id)
                  ? 'border-2 border-brand-500 bg-brand-50/30 shadow-md'
                  : 'hover:shadow-md border-2 border-transparent'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 relative">
                  {pro.avatar_url ? (
                    <img src={pro.avatar_url} alt="" className="h-14 w-14 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-xl">
                      {pro.full_name?.charAt(0)}
                    </div>
                  )}
                  {isSelected(pro.id) && (
                    <div className="absolute -top-1 -right-1 h-5 w-5 bg-brand-600 rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{pro.full_name}</h3>
                    <span className="badge-verified">✓ {t('dashboard.verified')}</span>
                  </div>

                  <div className="flex items-center gap-1 flex-wrap mt-1">
                    <Briefcase className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    <span className="text-xs font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                      {t(`roles.${pro.role}`)}
                    </span>
                    {(pro.secondary_roles ?? []).map(sr => (
                      <span key={sr} className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                        {t(`roles.${sr}`)}
                      </span>
                    ))}
                  </div>

                  {pro.bundesland && (
                    <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 rounded-full px-2 py-0.5 mt-0.5 w-fit">
                      🗺️ {pro.bundesland}
                      {pro.postal_code && <span className="text-blue-400 ml-0.5">· {pro.postal_code}</span>}
                    </div>
                  )}

                  {(pro.available_countries as string[]).length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {(pro.available_countries as string[]).slice(0, 4).join(', ')}
                      {(pro.available_countries as string[]).length > 4 && ` +${(pro.available_countries as string[]).length - 4}`}
                    </div>
                  )}

                  {pro.bio && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{pro.bio}</p>
                  )}

                  {(pro.services as string[]).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(pro.services as string[]).slice(0, 3).map(s => (
                        <span key={s} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{s}</span>
                      ))}
                      {(pro.services as string[]).length > 3 && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                          +{(pro.services as string[]).length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                    {/* Admin link */}
                    {isAdmin && (
                      <Link href={`/admin/users/${pro.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Admin: Profil öffnen
                      </Link>
                    )}

                    {/* Customer: Add to Request */}
                    {(isCustomer || (!isAdmin)) && (
                      <button
                        onClick={() => toggle(pro)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                          isSelected(pro.id)
                            ? 'bg-brand-600 text-white hover:bg-brand-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-brand-50 hover:text-brand-700 border border-gray-200'
                        }`}
                      >
                        {isSelected(pro.id)
                          ? <><Check className="h-3.5 w-3.5" /> {t('inquiry.added')}</>
                          : <><Plus className="h-3.5 w-3.5" /> {t('inquiry.addToRequest')}</>
                        }
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Sticky Request Bar ── */}
      {selected.length > 0 && !showForm && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4">
          <div className="mx-auto max-w-2xl bg-brand-700 text-white rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-4">
            <div className="flex -space-x-2 flex-shrink-0">
              {selected.slice(0, 4).map(p => (
                <div key={p.id}
                  className="h-9 w-9 rounded-full bg-brand-500 border-2 border-brand-700 flex items-center justify-center text-sm font-bold">
                  {p.full_name?.charAt(0)}
                </div>
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">
                {t('inquiry.selectedCount', { count: selected.length })}
              </p>
              <p className="text-xs text-brand-200 truncate">
                {selected.map(p => p.full_name).join(', ')}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setSelected([])}
                className="rounded-lg bg-brand-600 p-2 hover:bg-brand-500 transition">
                <X className="h-4 w-4" />
              </button>
              <button onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 rounded-lg bg-amber-400 text-brand-900 px-4 py-2 text-sm font-bold hover:bg-amber-300 transition">
                <Send className="h-4 w-4" /> {t('inquiry.sendBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Inquiry Form Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-700 to-brand-600 rounded-t-2xl px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-white text-lg">{t('inquiry.modalTitle')}</h2>
                <p className="text-brand-200 text-sm mt-0.5">{t('inquiry.modalSub')}</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-brand-200 hover:text-white p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Selected technicians */}
              {selected.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {t('inquiry.selectedTechs')} ({selected.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selected.map(p => (
                      <div key={p.id}
                        className="flex items-center gap-1.5 bg-brand-50 border border-brand-200 rounded-full px-3 py-1 text-xs font-medium text-brand-700">
                        <div className="h-5 w-5 rounded-full bg-brand-200 flex items-center justify-center text-xs font-bold">
                          {p.full_name?.charAt(0)}
                        </div>
                        {p.full_name}
                        <button onClick={() => toggle(p)} className="text-brand-400 hover:text-brand-700 ml-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {selected.length === 0 && (
                    <p className="text-xs text-gray-400 italic">{t('inquiry.noTechs')}</p>
                  )}
                </div>
              )}

              {/* Location + Date + Budget */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('inquiry.location')}</label>
                  <input value={location} onChange={e => setLocation(e.target.value)}
                    className="input text-sm" placeholder={t('inquiry.locationPlaceholder')} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('inquiry.startDate')}</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="input text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('inquiry.budget')}</label>
                <input value={budget} onChange={e => setBudget(e.target.value)}
                  className="input text-sm" placeholder={t('inquiry.budgetPlaceholder')} />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {t('inquiry.message')} <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={message} onChange={e => setMessage(e.target.value)}
                  rows={4} className="input resize-none text-sm"
                  placeholder={t('inquiry.messagePlaceholder')}
                />
              </div>

              {/* Notice */}
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
                ℹ️ {t('inquiry.notice')}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                  {t('inquiry.cancel')}
                </button>
                <button onClick={sendInquiry} disabled={sending || !message.trim()}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-600 text-white px-4 py-3 text-sm font-bold hover:bg-brand-700 transition disabled:opacity-60">
                  {sending ? <><Loader2 className="h-4 w-4 animate-spin" /> {t('inquiry.sending')}</> : <><Send className="h-4 w-4" /> {t('inquiry.send')}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
