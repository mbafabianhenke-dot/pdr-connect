'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CloudLightning, Search, Download, Mail, Phone, Globe,
  MapPin, RefreshCw, CheckCircle, XCircle, Clock, Building2,
  Filter, ChevronDown, AlertTriangle,
} from 'lucide-react';

/* ─── Types ────────────────────────────────────────────────────── */

interface Lead {
  id: string;
  hail_date: string;
  region: string;
  city: string;
  state: string;
  business_name: string;
  business_type: 'autohaus' | 'kl_betrieb' | 'werkstatt';
  address: string;
  zip: string;
  phone: string;
  email: string;
  website: string;
  status: 'new' | 'contacted' | 'replied' | 'not_interested' | 'converted';
  notes: string;
  contacted_at: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  new:            'bg-blue-100 text-blue-700',
  contacted:      'bg-yellow-100 text-yellow-700',
  replied:        'bg-purple-100 text-purple-700',
  not_interested: 'bg-red-100 text-red-700',
  converted:      'bg-green-100 text-green-700',
};

const TYPE_LABELS: Record<string, string> = {
  autohaus:  '🚗 Autohaus',
  kl_betrieb: '🎨 K+L Betrieb',
  werkstatt:  '🔧 Werkstatt',
};

const EMAIL_TEMPLATE = (name: string) => `Subject: PDR Specialists Available After the Hailstorm — Immediate Support

Dear ${name || 'Sir or Madam'},

Following the recent hailstorm in your region, many vehicles are likely in need of professional dent repair.

Through PDR Connect (https://pdrconnect.eu) you can quickly and easily find qualified PDR technicians near you — free of charge and without obligation.

PDR Connect is the first international platform built exclusively for PDR professionals:
✅ 1,000+ verified technicians from 48+ countries
✅ Direct contact — no middleman
✅ 100% free for dealerships and workshops

Register for free now: https://pdrconnect.eu/register

Best regards,
The PDR Connect Team

---
You are receiving this email because your business is located in a hail-affected region.
To unsubscribe, reply with "UNSUBSCRIBE".`;

/* ─── Page Component ────────────────────────────────────────────── */

export default function HailLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [date, setDate] = useState(() => {
    const d = new Date(Date.now() - 86400000);
    return d.toISOString().split('T')[0];
  });
  const [customRegions, setCustomRegions] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [searchResult, setSearchResult] = useState<{ regions: string[]; total: number } | null>(null);
  const [showTemplate, setShowTemplate] = useState(false);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (filterRegion) params.set('region', filterRegion);
      const res = await fetch(`/api/admin/hail-leads?${params}`);
      const data = await res.json();
      setLeads(data.leads ?? []);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterRegion]);

  useEffect(() => { loadLeads(); }, [loadLeads]);

  // ── Client-side search: browser calls Overpass directly (avoids cloud IP blocks) ──
  const geocodeRegion = async (regionName: string) => {
    const q = encodeURIComponent(regionName);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=de,be,nl,fr,at,ch,pl,es,it,gb,lu`,
      { headers: { 'User-Agent': 'PDRConnect/1.0' } },
    );
    const data = await res.json();
    if (!data?.length) return null;
    const r = data[0];
    return {
      lat: parseFloat(r.lat), lng: parseFloat(r.lon),
      city: r.display_name?.split(',')[0]?.trim() ?? regionName,
      state: r.display_name?.split(',').slice(-2, -1)[0]?.trim() ?? '',
    };
  };

  const findBusinesses = async (lat: number, lng: number, radius = 30000) => {
    const q = `[out:json][timeout:25];(node["shop"="car"](around:${radius},${lat},${lng});way["shop"="car"](around:${radius},${lat},${lng});node["amenity"="car_repair"](around:${radius},${lat},${lng});way["amenity"="car_repair"](around:${radius},${lat},${lng});node["craft"="car_painter"](around:${radius},${lat},${lng});way["craft"="car_painter"](around:${radius},${lat},${lng});node["craft"="bodywork"](around:${radius},${lat},${lng});way["craft"="bodywork"](around:${radius},${lat},${lng}););out center;`;
    const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: q });
    const data = await res.json();
    return data.elements ?? [];
  };

  const classifyType = (tags: Record<string, string>) => {
    const name = (tags.name ?? '').toLowerCase();
    const shop = tags.shop ?? '';
    if (name.includes('autohaus') || name.includes('automobil') || shop === 'car') return 'autohaus';
    if (name.includes('karosserie') || name.includes('lackier') || name.includes('carrosserie') || tags.craft === 'car_painter') return 'kl_betrieb';
    return 'werkstatt';
  };

  const runSearch = async () => {
    setSearching(true);
    setSearchResult(null);
    try {
      const regions = customRegions.split('\n').map((r) => r.trim()).filter(Boolean);
      const allLeads: Record<string, unknown>[] = [];
      const processedRegions: string[] = [];

      for (const regionName of regions.slice(0, 10)) {
        const geo = await geocodeRegion(regionName);
        if (!geo) continue;
        processedRegions.push(regionName);

        const elements = await findBusinesses(geo.lat, geo.lng);

        for (const el of elements) {
          const tags = el.tags ?? {};
          const name = tags.name || tags['name:fr'] || tags['name:nl'] || tags['name:de'];
          if (!name && !tags.phone && !tags.website && !tags.email) continue;

          const parts = [tags['addr:street'], tags['addr:housenumber'], tags['addr:city']].filter(Boolean);
          allLeads.push({
            hail_date: date,
            region: regionName,
            city: tags['addr:city'] ?? geo.city,
            state: tags['addr:state'] ?? geo.state,
            lat: el.lat ?? el.center?.lat ?? geo.lat,
            lng: el.lon ?? el.center?.lon ?? geo.lng,
            business_name: name || `Business ${el.type}/${el.id}`,
            business_type: classifyType(tags),
            address: parts.join(', ') || null,
            zip: tags['addr:postcode'] ?? null,
            phone: tags.phone ?? tags['contact:phone'] ?? null,
            email: tags.email ?? tags['contact:email'] ?? null,
            website: tags.website ?? tags['contact:website'] ?? null,
            osm_id: `${el.type}/${el.id}`,
            status: 'new',
          });
        }
        await new Promise((r) => setTimeout(r, 300));
      }

      // Save to DB via server API
      if (allLeads.length > 0) {
        await fetch('/api/admin/hail-leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date, regions: processedRegions, preloadedLeads: allLeads }),
        });
      }

      setSearchResult({ regions: processedRegions, total: allLeads.length });
      await loadLeads();
    } finally {
      setSearching(false);
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    await fetch('/api/admin/hail-leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    await loadLeads();
    setSelectedLead(null);
  };

  const downloadCsv = () => {
    const params = new URLSearchParams({ format: 'csv' });
    if (filterStatus) params.set('status', filterStatus);
    if (filterRegion) params.set('region', filterRegion);
    window.open(`/api/admin/hail-leads?${params}`, '_blank');
  };

  const stats = {
    total:    leads.length,
    new:      leads.filter((l) => l.status === 'new').length,
    contacted: leads.filter((l) => l.status === 'contacted').length,
    converted: leads.filter((l) => l.status === 'converted').length,
    withEmail: leads.filter((l) => l.email).length,
    withPhone: leads.filter((l) => l.phone).length,
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CloudLightning className="h-7 w-7 text-yellow-500" />
            Hagel-Lead Finder
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Autohäuser &amp; K+L-Betriebe in Hagelschadenregionen für Kaltakquise
          </p>
        </div>
        <button
          onClick={downloadCsv}
          className="flex items-center gap-2 rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-semibold hover:bg-green-700 transition"
        >
          <Download className="h-4 w-4" /> CSV Export
        </button>
      </div>

      {/* Search Panel */}
      <div className="card border-yellow-200 bg-yellow-50 space-y-4">
        <h2 className="font-semibold text-yellow-800 flex items-center gap-2 text-sm">
          <CloudLightning className="h-4 w-4" />
          Hagel-Suche starten
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Datum (Hageltag)</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Regionen manuell eingeben (optional, eine pro Zeile)
            </label>
            <textarea
              value={customRegions}
              onChange={(e) => setCustomRegions(e.target.value)}
              placeholder={'München\nAugsburg\nIngolstadt'}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
            />
          </div>
        </div>
        <button
          onClick={runSearch}
          disabled={searching}
          className="flex items-center gap-2 rounded-lg bg-yellow-500 text-white px-5 py-2.5 text-sm font-bold hover:bg-yellow-600 transition disabled:opacity-60"
        >
          {searching
            ? <><RefreshCw className="h-4 w-4 animate-spin" /> Suche läuft...</>
            : <><Search className="h-4 w-4" /> Jetzt suchen</>
          }
        </button>
        {searchResult && (
          <div className="rounded-lg bg-white border border-yellow-200 p-3 text-sm">
            <p className="font-semibold text-yellow-800">
              ✅ {searchResult.total} Betriebe gefunden in {searchResult.regions.length} Regionen
            </p>
            <p className="text-gray-500 text-xs mt-1">{searchResult.regions.join(', ')}</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Gesamt', value: stats.total, color: 'text-gray-700' },
          { label: 'Neu', value: stats.new, color: 'text-blue-600' },
          { label: 'Kontaktiert', value: stats.contacted, color: 'text-yellow-600' },
          { label: 'Gewonnen', value: stats.converted, color: 'text-green-600' },
          { label: 'Mit Email', value: stats.withEmail, color: 'text-purple-600' },
          { label: 'Mit Tel.', value: stats.withPhone, color: 'text-orange-600' },
        ].map((s) => (
          <div key={s.label} className="card text-center py-3">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500">Filter:</span>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none"
        >
          <option value="">Alle Status</option>
          <option value="new">Neu</option>
          <option value="contacted">Kontaktiert</option>
          <option value="replied">Antwort erhalten</option>
          <option value="not_interested">Kein Interesse</option>
          <option value="converted">Gewonnen</option>
        </select>
        <input
          type="text"
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
          placeholder="Region filtern..."
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none w-40"
        />
        <button onClick={loadLeads} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50 flex items-center gap-1">
          <RefreshCw className="h-3.5 w-3.5" /> Aktualisieren
        </button>

        {/* Email Template Button */}
        <button
          onClick={() => setShowTemplate(!showTemplate)}
          className="ml-auto flex items-center gap-2 rounded-lg bg-brand-600 text-white px-4 py-1.5 text-sm font-semibold hover:bg-brand-700 transition"
        >
          <Mail className="h-4 w-4" /> Email-Vorlage
        </button>
      </div>

      {/* Email Template */}
      {showTemplate && (
        <div className="card border-brand-200 bg-brand-50 space-y-2">
          <h3 className="font-semibold text-brand-800 text-sm flex items-center gap-2">
            <Mail className="h-4 w-4" /> Kaltakquise E-Mail Vorlage
          </h3>
          <pre className="text-xs bg-white rounded-lg border p-4 overflow-x-auto whitespace-pre-wrap text-gray-700 font-mono leading-relaxed">
            {EMAIL_TEMPLATE('[Betriebsname]')}
          </pre>
        </div>
      )}

      {/* Leads Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" /> Lade Leads...
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <AlertTriangle className="h-8 w-8 mb-2 text-yellow-300" />
            <p className="font-medium">Keine Leads gefunden</p>
            <p className="text-sm mt-1">Starte eine Suche oben um Betriebe zu finden</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Betrieb</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Typ</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Region</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Kontakt</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Hageldatum</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{lead.business_name}</p>
                      {lead.address && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {lead.address}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs">{TYPE_LABELS[lead.business_type] ?? lead.business_type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{lead.city || lead.region}</p>
                      <p className="text-xs text-gray-400">{lead.state}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {lead.phone && (
                          <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-xs text-gray-600 hover:text-brand-600">
                            <Phone className="h-3 w-3" /> {lead.phone}
                          </a>
                        )}
                        {lead.email && (
                          <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
                            <Mail className="h-3 w-3" /> {lead.email}
                          </a>
                        )}
                        {lead.website && (
                          <a href={lead.website} target="_blank" rel="noopener" className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                            <Globe className="h-3 w-3" /> Website
                          </a>
                        )}
                        {!lead.phone && !lead.email && !lead.website && (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[lead.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {lead.hail_date}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setEditEmail(lead.email ?? '');
                          setEditNotes(lead.notes ?? '');
                        }}
                        className="text-xs text-brand-600 hover:text-brand-800 font-medium"
                      >
                        Bearbeiten
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-gray-900">{selectedLead.business_name}</h3>
                <p className="text-sm text-gray-500">{selectedLead.city} · {selectedLead.hail_date}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="info@autohaus.de"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Status</label>
              <select
                defaultValue={selectedLead.status}
                id="status-select"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none"
              >
                <option value="new">Neu</option>
                <option value="contacted">Kontaktiert</option>
                <option value="replied">Antwort erhalten</option>
                <option value="not_interested">Kein Interesse</option>
                <option value="converted">Gewonnen 🎉</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Notizen</label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  const sel = document.getElementById('status-select') as HTMLSelectElement;
                  updateLead(selectedLead.id, {
                    email: editEmail,
                    notes: editNotes,
                    status: sel?.value as Lead['status'],
                  });
                }}
                className="flex-1 rounded-lg bg-brand-600 text-white px-4 py-2 text-sm font-semibold hover:bg-brand-700 transition"
              >
                Speichern
              </button>
              {selectedLead.email || editEmail ? (
                <a
                  href={`mailto:${editEmail || selectedLead.email}?subject=${encodeURIComponent('PDR Specialists Available After the Hailstorm')}&body=${encodeURIComponent(EMAIL_TEMPLATE(selectedLead.business_name))}`}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition"
                >
                  <Mail className="h-4 w-4" /> Email öffnen
                </a>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
