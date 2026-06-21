'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Building2, Search, Download, RefreshCw, Mail, Phone,
  Globe, MapPin, Filter, ChevronDown, AlertTriangle,
  Car, Wrench, Pencil, Trash2, CheckCircle,
} from 'lucide-react';

/* ── Types ─────────────────────────────────────────────────── */
interface Business {
  id: string;
  business_name: string;
  business_type: 'autohaus' | 'kl_betrieb' | 'werkstatt';
  address: string;
  zip: string;
  city: string;
  bundesland: string;
  phone: string;
  email: string;
  website: string;
  status: string;
  notes: string;
  osm_id: string;
}

const BUNDESLAENDER = [
  'Baden-Württemberg','Bayern','Berlin','Brandenburg','Bremen',
  'Hamburg','Hessen','Mecklenburg-Vorpommern','Niedersachsen',
  'Nordrhein-Westfalen','Rheinland-Pfalz','Saarland','Sachsen',
  'Sachsen-Anhalt','Schleswig-Holstein','Thüringen',
];

const TYPE_LABEL: Record<string, string> = {
  autohaus:  '🚗 Autohaus',
  kl_betrieb: '🎨 K+L Betrieb',
  werkstatt:  '🔧 Werkstatt',
};

const STATUS_COLORS: Record<string, string> = {
  new:            'bg-blue-100 text-blue-700',
  contacted:      'bg-yellow-100 text-yellow-700',
  replied:        'bg-purple-100 text-purple-700',
  not_interested: 'bg-red-100 text-red-700',
  converted:      'bg-green-100 text-green-700',
};

/* ── Overpass query helper ──────────────────────────────────── */
async function fetchOverpass(lat: number, lng: number, radiusKm: number) {
  const r = radiusKm * 1000;
  const q = `[out:json][timeout:30];(node["shop"="car"](around:${r},${lat},${lng});way["shop"="car"](around:${r},${lat},${lng});node["amenity"="car_repair"](around:${r},${lat},${lng});way["amenity"="car_repair"](around:${r},${lat},${lng});node["craft"="car_painter"](around:${r},${lat},${lng});way["craft"="car_painter"](around:${r},${lat},${lng});node["craft"="bodywork"](around:${r},${lat},${lng});way["craft"="bodywork"](around:${r},${lat},${lng}););out center;`;
  const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: q });
  const data = await res.json();
  return data.elements ?? [];
}

function classifyType(tags: Record<string, string>): Business['business_type'] {
  const name = (tags.name ?? '').toLowerCase();
  if (name.includes('autohaus') || name.includes('automobil') || name.includes('automobile') || tags.shop === 'car') return 'autohaus';
  if (name.includes('karosserie') || name.includes('lackier') || tags.craft === 'car_painter' || tags.craft === 'bodywork') return 'kl_betrieb';
  return 'werkstatt';
}

function osmToRecord(el: Record<string, unknown>, bundesland: string) {
  const tags = (el.tags as Record<string, string>) ?? {};
  const name = tags.name || tags['name:de'] || `Betrieb ${el.type}/${el.id}`;
  if (!name && !tags.phone && !tags.website) return null;

  const center = (el.center as Record<string, number>) ?? {};
  const parts = [tags['addr:street'], tags['addr:housenumber']].filter(Boolean);

  return {
    business_name: name,
    business_type: classifyType(tags),
    address:       parts.join(' ') || null,
    zip:           tags['addr:postcode'] || null,
    city:          tags['addr:city'] || null,
    bundesland,
    phone:         tags.phone || tags['contact:phone'] || null,
    email:         tags.email || tags['contact:email'] || null,
    website:       tags.website || tags['contact:website'] || null,
    lat:           (el.lat as number) ?? center.lat ?? null,
    lng:           (el.lon as number) ?? center.lon ?? null,
    osm_id:        `${el.type}/${el.id}`,
    status:        'new',
  };
}

/* ── Page ───────────────────────────────────────────────────── */
export default function DEBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading]       = useState(false);
  const [importing, setImporting]   = useState(false);
  const [importStatus, setImportStatus] = useState('');

  // Import form
  const [selBL, setSelBL]         = useState('');
  const [zipFrom, setZipFrom]     = useState('');
  const [zipTo, setZipTo]         = useState('');
  const [radius, setRadius]       = useState(15);
  const [freeRegion, setFreeRegion] = useState(''); // international free-text (e.g. "Brussels, Belgium")

  // Filters
  const [filterZip, setFilterZip]   = useState('');
  const [filterBL, setFilterBL]     = useState('');
  const [filterType, setFilterType] = useState('');

  // Edit modal
  const [editing, setEditing]     = useState<Business | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Email finder (scraper)
  const [finding, setFinding]         = useState(false);
  const [findProgress, setFindProgress] = useState('');
  const [findResult, setFindResult]   = useState<{ found: number; processed: number } | null>(null);

  const findEmails = async () => {
    const noEmail = businesses.filter(b => !b.email && b.website).length;
    if (!noEmail) { alert('Keine Betriebe mit Website aber ohne E-Mail gefunden.'); return; }
    if (!confirm(`Automatisch E-Mails suchen für ${noEmail} Betriebe?\n\nDer Scraper besucht die jeweilige Website (inkl. Impressum/Kontakt) und sucht nach E-Mail-Adressen.\n\nDas kann je nach Anzahl einige Minuten dauern.`)) return;

    setFinding(true);
    setFindResult(null);
    setFindProgress('Suche läuft...');
    try {
      const res = await fetch('/api/admin/de-businesses/find-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bundesland: filterBL || undefined,
          zip: filterZip || undefined,
          limit: 50,
        }),
      });
      const data = await res.json();
      setFindResult({ found: data.found, processed: data.processed });
      setFindProgress('');
      await loadData();
    } catch {
      setFindProgress('Fehler beim Suchen');
    } finally {
      setFinding(false);
    }
  };

  // Mass email sending
  const [sending, setSending]       = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [emailSubject, setEmailSubject] = useState('PDR Connect – Qualifizierte PDR-Techniker für Ihren Betrieb');
  const [emailBody, setEmailBody]     = useState(`Sehr geehrte Damen und Herren von [Business Name],

mein Name ist Fabian Henke, Gründer von PDR Connect (https://pdrconnect.eu) – der ersten internationalen Plattform, die Autohäuser und Karosseriebetriebe mit verifizierten PDR-Technikern (Paintless Dent Repair) vernetzt.

Ob Hagelschäden, Parkdellen oder kleine Karosserieschäden – auf PDR Connect finden Sie schnell und unkompliziert qualifizierte PDR-Fachleute in Ihrer Nähe, kostenlos und unverbindlich.

Warum PDR Connect?
• Über 1.000 verifizierte PDR-Techniker aus ganz Europa
• Direkte Kontaktaufnahme, ohne Zwischenhändler
• Kostenlose Registrierung für Autohäuser und Werkstätten

Jetzt kostenlos registrieren:
https://pdrconnect.eu/register

Mit freundlichen Grüßen
Fabian Henke
PDR Connect
info@cybratech-solutions.com

---
Sie erhalten diese E-Mail, da Ihr Betrieb im Kfz-Bereich tätig ist.
Abmeldung: Antworten Sie mit „ABMELDEN"`);

  /* Stats */
  const stats = {
    total:   businesses.length,
    withEmail: businesses.filter(b => b.email).length,
    withPhone: businesses.filter(b => b.phone).length,
    autohaus: businesses.filter(b => b.business_type === 'autohaus').length,
    kl:       businesses.filter(b => b.business_type === 'kl_betrieb').length,
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ limit: '2000' });
      if (filterZip)  p.set('zip', filterZip);
      if (filterBL)   p.set('bundesland', filterBL);
      if (filterType) p.set('type', filterType);
      const res = await fetch(`/api/admin/de-businesses?${p}`);
      const d   = await res.json();
      setBusinesses(d.businesses ?? []);
    } finally { setLoading(false); }
  }, [filterZip, filterBL, filterType]);

  useEffect(() => { loadData(); }, [loadData]);

  /* Import by Bundesland or PLZ range */
  const runImport = async () => {
    if (!selBL && !zipFrom && !freeRegion) { alert('Bundesland, PLZ oder freie Region eingeben'); return; }
    setImporting(true);
    setImportStatus('Geocoding...');

    try {
      // International if freeRegion is set, otherwise Germany only
      const label = freeRegion || selBL || `${zipFrom} Germany`;
      const countryFilter = freeRegion ? '' : '&countrycodes=de';
      const geo   = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(label)}&format=json&limit=1${countryFilter}`, { headers: { 'User-Agent': 'PDRConnect/1.0' } });
      const geoD  = await geo.json();
      if (!geoD?.length) { alert(`Konnte "${label}" nicht geocoden`); return; }

      const lat = parseFloat(geoD[0].lat), lng = parseFloat(geoD[0].lon);
      // Use freeRegion as the region label (so we can filter later)
      const regionLabel = freeRegion || selBL || `PLZ ${zipFrom}`;
      setImportStatus(`Suche Betriebe um ${lat.toFixed(2)}, ${lng.toFixed(2)} (${radius}km)...`);

      const elements = await fetchOverpass(lat, lng, radius);
      setImportStatus(`${elements.length} Elemente gefunden — verarbeite...`);

      const records = elements
        .map((el: Record<string, unknown>) => osmToRecord(el, regionLabel))
        .filter(Boolean);

      // Filter by PLZ range if specified
      const filtered = (zipFrom || zipTo)
        ? records.filter((r: Record<string, unknown>) => {
            const z = parseInt(r.zip as string ?? '0');
            if (zipFrom && z < parseInt(zipFrom)) return false;
            if (zipTo   && z > parseInt(zipTo))   return false;
            return true;
          })
        : records;

      setImportStatus(`${filtered.length} Betriebe werden gespeichert...`);

      const save = await fetch('/api/admin/de-businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businesses: filtered }),
      });
      const result = await save.json();
      setImportStatus(`✅ ${result.inserted ?? filtered.length} neue Betriebe gespeichert!`);
      await loadData();
    } catch (e: any) {
      setImportStatus(`❌ Fehler: ${e.message}`);
    } finally {
      setImporting(false);
    }
  };

  // Step 1: open preview — auto-detect language from region
  const sendEmails = () => {
    const withEmail = businesses.filter(b => b.email && b.status === 'new').length;
    if (!withEmail) { alert('Keine Betriebe mit E-Mail-Adresse und Status "neu" gefunden.'); return; }

    // Auto-switch to English if Belgian/international businesses are visible
    const hasBelgium = businesses.some(b => b.bundesland?.toLowerCase().includes('belgi') || b.bundesland?.toLowerCase().includes('brussels') || b.bundesland?.toLowerCase().includes('antwerp') || b.bundesland?.toLowerCase().includes('gent') || b.bundesland?.toLowerCase().includes('hainaut'));
    if (hasBelgium) {
      setEmailSubject('PDR Connect - Professional PDR technicians for your workshop');
      setEmailBody(`Dear [Business Name],

We are reaching out from PDR Connect (https://pdrconnect.eu), the first international platform connecting car dealerships and body shops with verified PDR (Paintless Dent Repair) specialists.

Following the recent hailstorm in your region, many vehicles are likely in need of professional dent repair. Through PDR Connect you can quickly find qualified PDR technicians near you — free of charge.

Why PDR Connect?
• 1,000+ verified PDR professionals across Europe
• Direct contact, no middlemen
• Free registration for workshops and dealerships

Register your workshop for free:
https://pdrconnect.eu/register

Best regards,
Fabian Henke
PDR Connect
info@cybratech-solutions.com

---
To unsubscribe, reply with: UNSUBSCRIBE`);
    }

    setShowEmailPreview(true);
    setSendResult(null);
  };

  // Step 2: actually send after user confirmed content
  const confirmAndSend = async () => {
    setShowEmailPreview(false);
    setSending(true);
    try {
      const res = await fetch('/api/admin/de-businesses/send-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zip: filterZip || undefined,
          bundesland: filterBL || undefined,
          type: filterType || undefined,
          limit: 500,
          subject: emailSubject,
          body: emailBody,
        }),
      });
      const data = await res.json();
      setSendResult(data);
      await loadData();
    } finally {
      setSending(false);
    }
  };

  const updateBusiness = async () => {
    if (!editing) return;
    await fetch('/api/admin/de-businesses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editing.id, email: editEmail, notes: editNotes }),
    });
    await loadData();
    setEditing(null);
  };

  /* ── Delete helpers ── */
  const deleteFiltered = async () => {
    const label = filterBL || (filterZip ? `PLZ ${filterZip}*` : 'alle gefilterten Betriebe');
    if (!confirm(`⚠️ Wirklich ALLE Betriebe aus "${label}" löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden!`)) return;
    const res = await fetch('/api/admin/de-businesses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bundesland: filterBL || undefined,
        zip: filterZip || undefined,
        type: filterType || undefined,
      }),
    });
    if (res.ok) await loadData();
    else alert('Fehler beim Löschen');
  };

  const deleteAll = async () => {
    if (!confirm(`⚠️⚠️ ALLE ${businesses.length} importierten Betriebe löschen?\n\nDies löscht die gesamte Datenbank! Bitte nur wenn du wirklich neu starten willst.`)) return;
    if (!confirm('Nochmal bestätigen: Wirklich ALLE löschen?')) return;
    const res = await fetch('/api/admin/de-businesses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deleteAll: true }),
    });
    if (res.ok) await loadData();
    else alert('Fehler beim Löschen');
  };

  const exportCsv = () => {
    const p = new URLSearchParams({ format: 'csv', limit: '5000' });
    if (filterZip)  p.set('zip', filterZip);
    if (filterBL)   p.set('bundesland', filterBL);
    if (filterType) p.set('type', filterType);
    window.open(`/api/admin/de-businesses?${p}`, '_blank');
  };

  const EMAIL_TEMPLATE = (name: string) =>
`Subject: PDR Connect - Professional PDR technicians for your workshop

Dear ${name || 'Sir or Madam'},

We are reaching out from PDR Connect (pdrconnect.eu), the first international platform connecting car dealerships and workshops with verified PDR (Paintless Dent Repair) specialists.

Whether it's hail damage, parking dents or minor body repairs — find qualified PDR technicians near you, quickly and free of charge.

Register your workshop for free: https://pdrconnect.eu/register

Best regards,
PDR Connect Team

---
To unsubscribe: reply with UNSUBSCRIBE`;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-7 w-7 text-brand-600" />
            Betriebe-Verzeichnis Deutschland
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Autohäuser &amp; K+L-Betriebe — deutschlandweit, sortiert nach PLZ
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Find emails button */}
          <button onClick={findEmails} disabled={finding}
            className="flex items-center gap-2 rounded-lg bg-purple-600 text-white px-4 py-2 text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-60">
            {finding
              ? <><RefreshCw className="h-4 w-4 animate-spin" /> Suche E-Mails...</>
              : <><Search className="h-4 w-4" /> E-Mails suchen ({businesses.filter(b => !b.email && b.website).length} Websites)</>
            }
          </button>
          <button onClick={sendEmails} disabled={sending}
            className="flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60">
            {sending
              ? <><RefreshCw className="h-4 w-4 animate-spin" /> Sende...</>
              : <><Mail className="h-4 w-4" /> Alle emailen ({businesses.filter(b => b.email && b.status === 'new').length})</>
            }
          </button>
          <button onClick={exportCsv}
            className="flex items-center gap-2 rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-semibold hover:bg-green-700 transition">
            <Download className="h-4 w-4" /> CSV Export
          </button>
        </div>
      </div>

      {/* Import panel */}
      <div className="card border-brand-200 bg-brand-50 space-y-4">
        <h2 className="font-semibold text-brand-800 flex items-center gap-2 text-sm">
          <Search className="h-4 w-4" /> Betriebe importieren — 🇩🇪 Deutschland oder 🌍 International
        </h2>

        {/* International free region */}
        <div>
          <label className="text-xs font-bold text-brand-700 mb-1 block">
            🌍 Freie Region (International) — überschreibt Bundesland/PLZ
          </label>
          <input
            value={freeRegion}
            onChange={e => { setFreeRegion(e.target.value); if (e.target.value) { setSelBL(''); setZipFrom(''); } }}
            className="input text-sm"
            placeholder="z.B. Brussels Belgium  |  Charleroi Belgium  |  Hainaut Belgium"
          />
          {freeRegion && (
            <p className="text-xs text-brand-600 mt-1">🌍 Internationale Suche aktiv — sucht weltweit nach "{freeRegion}"</p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Bundesland (nur DE)</label>
            <select value={selBL} onChange={e => { setSelBL(e.target.value); if (e.target.value) setFreeRegion(''); }} className="input text-sm" disabled={!!freeRegion}>
              <option value="">— wählen —</option>
              {BUNDESLAENDER.map(bl => <option key={bl} value={bl}>{bl}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">PLZ von (nur DE)</label>
            <input value={zipFrom} onChange={e => { setZipFrom(e.target.value); if (e.target.value) setFreeRegion(''); }} className="input text-sm" placeholder="z.B. 80000" maxLength={5} disabled={!!freeRegion} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">PLZ bis (optional)</label>
            <input value={zipTo} onChange={e => setZipTo(e.target.value)} className="input text-sm" placeholder="z.B. 81999" maxLength={5} disabled={!!freeRegion} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Suchradius (km)</label>
            <select value={radius} onChange={e => setRadius(+e.target.value)} className="input text-sm">
              {[10,15,20,25,30,40,50].map(r => <option key={r} value={r}>{r} km</option>)}
            </select>
          </div>
        </div>
        <button onClick={runImport} disabled={importing}
          className="flex items-center gap-2 rounded-lg bg-brand-600 text-white px-5 py-2.5 text-sm font-bold hover:bg-brand-700 transition disabled:opacity-60">
          {importing ? <><RefreshCw className="h-4 w-4 animate-spin" />Suche läuft...</> : <><Search className="h-4 w-4" />Betriebe importieren</>}
        </button>
        {importStatus && (
          <div className={`text-sm font-medium rounded-lg px-3 py-2 ${importStatus.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-white text-brand-700 border border-brand-200'}`}>
            {importStatus}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Gesamt', value: stats.total, color: 'text-gray-700' },
          { label: 'Autohäuser', value: stats.autohaus, color: 'text-blue-600' },
          { label: 'K+L Betriebe', value: stats.kl, color: 'text-purple-600' },
          { label: 'Mit Email', value: stats.withEmail, color: 'text-green-600' },
          { label: 'Mit Tel.', value: stats.withPhone, color: 'text-orange-600' },
        ].map(s => (
          <div key={s.label} className="card text-center py-3">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Find emails result */}
      {(findResult || findProgress) && (
        <div className={`rounded-xl p-4 border flex items-center gap-4 ${findResult ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'}`}>
          <Search className="h-6 w-6 flex-shrink-0 text-purple-500" />
          <div>
            {findProgress && <p className="font-medium text-sm text-blue-700">{findProgress}</p>}
            {findResult && (
              <>
                <p className="font-bold text-sm text-purple-800">
                  🔍 {findResult.found} neue E-Mails gefunden von {findResult.processed} geprüften Websites
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Gefundene E-Mails wurden automatisch gespeichert.
                  {findResult.processed - findResult.found > 0 && ` ${findResult.processed - findResult.found} Websites hatten keine E-Mail.`}
                </p>
              </>
            )}
          </div>
          {findResult && <button onClick={() => setFindResult(null)} className="ml-auto text-gray-400 hover:text-gray-600">✕</button>}
        </div>
      )}

      {/* Send result */}
      {sendResult && (
        <div className={`rounded-xl p-4 border flex items-center gap-4 ${sendResult.sent > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <Mail className={`h-6 w-6 flex-shrink-0 ${sendResult.sent > 0 ? 'text-green-600' : 'text-red-500'}`} />
          <div>
            <p className={`font-bold text-sm ${sendResult.sent > 0 ? 'text-green-800' : 'text-red-800'}`}>
              ✅ {sendResult.sent} E-Mails erfolgreich gesendet
              {sendResult.failed > 0 && ` · ❌ ${sendResult.failed} fehlgeschlagen`}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Status aller gesendeten Betriebe wurde auf "kontaktiert" gesetzt.</p>
          </div>
          <button onClick={() => setSendResult(null)} className="ml-auto text-gray-400 hover:text-gray-600">✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="card border-gray-200 space-y-3">
        {/* Filter row */}
        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <input value={filterZip} onChange={e => setFilterZip(e.target.value)} placeholder="PLZ filtern..." className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none w-32" />
          <select value={filterBL} onChange={e => setFilterBL(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none">
            <option value="">Alle Bundesländer</option>
            {BUNDESLAENDER.map(bl => <option key={bl} value={bl}>{bl}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none">
            <option value="">Alle Typen</option>
            <option value="autohaus">🚗 Autohaus</option>
            <option value="kl_betrieb">🎨 K+L Betrieb</option>
            <option value="werkstatt">🔧 Werkstatt</option>
          </select>
          <button onClick={loadData} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50 flex items-center gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> Aktualisieren
          </button>
        </div>

        {/* Info box: how email filter works */}
        <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-2.5 text-xs text-blue-800">
          <strong>💡 Tipps:</strong>
          <ul className="mt-1 space-y-0.5 list-disc list-inside">
            <li><strong>E-Mails suchen</strong> (lila Button): Besucht automatisch die Website + Impressum + Kontakt-Seite und extrahiert E-Mail-Adressen. 50 Betriebe pro Durchlauf.</li>
            <li><strong>Alle emailen</strong> (blau): Sendet NUR an Betriebe mit Status "Neu" — bereits kontaktierte werden übersprungen</li>
            <li>Tipp: Erst Bundesland filtern → dann "E-Mails suchen" → dann "Alle emailen"</li>
          </ul>
        </div>

        {/* Delete actions */}
        <div className="flex flex-wrap gap-2 items-center pt-1 border-t border-gray-100">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Löschen:</span>
          <button
            onClick={deleteFiltered}
            disabled={!filterBL && !filterZip && !filterType}
            className="flex items-center gap-1.5 rounded-lg bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1.5 text-xs font-semibold hover:bg-orange-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {filterBL ? `"${filterBL}" löschen` : filterZip ? `PLZ ${filterZip}* löschen` : '← Filter setzen zum Löschen'}
          </button>
          <button
            onClick={deleteAll}
            className="flex items-center gap-1.5 rounded-lg bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 text-xs font-semibold hover:bg-red-200 transition"
          >
            <Trash2 className="h-3.5 w-3.5" /> Alle {businesses.length} löschen
          </button>
          <span className="text-xs text-gray-400 ml-1">← Vorsicht! Nicht rückgängig machbar.</span>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" /> Lade Betriebe...
          </div>
        ) : businesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Building2 className="h-10 w-10 mb-2 text-gray-200" />
            <p className="font-medium">Keine Betriebe gefunden</p>
            <p className="text-sm mt-1">Importiere Betriebe über das Formular oben</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">PLZ / Stadt</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Betrieb</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Typ</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Adresse</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kontakt</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {businesses.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 transition">
                    <td className="px-3 py-3 whitespace-nowrap">
                      <p className="font-bold text-brand-700 text-base">{b.zip}</p>
                      <p className="text-xs text-gray-400">{b.city}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-gray-900">{b.business_name}</p>
                      <p className="text-xs text-gray-400">{b.bundesland}</p>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs">{TYPE_LABEL[b.business_type] ?? b.business_type}</td>
                    <td className="px-3 py-3 text-xs text-gray-500 max-w-[180px]">
                      {b.address && <span className="flex items-center gap-1"><MapPin className="h-3 w-3 flex-shrink-0" />{b.address}</span>}
                    </td>
                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        {b.phone && <a href={`tel:${b.phone}`} className="flex items-center gap-1 text-xs text-gray-600 hover:text-brand-600"><Phone className="h-3 w-3" />{b.phone}</a>}
                        {b.email && <a href={`mailto:${b.email}`} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"><Mail className="h-3 w-3" />{b.email}</a>}
                        {b.website && <a href={b.website.startsWith('http') ? b.website : `https://${b.website}`} target="_blank" rel="noopener" className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"><Globe className="h-3 w-3" />Website</a>}
                        {!b.phone && !b.email && !b.website && <span className="text-xs text-gray-300">—</span>}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <button onClick={() => { setEditing(b); setEditEmail(b.email ?? ''); setEditNotes(b.notes ?? ''); }}
                        className="text-xs text-brand-600 hover:text-brand-800 font-medium">
                        ✏️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
              {businesses.length.toLocaleString()} Betriebe · Sortiert nach PLZ
            </div>
          </div>
        )}
      </div>

      {/* ── Email Preview & Edit Modal ── */}
      {showEmailPreview && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">✉️ E-Mail Vorschau & Bearbeitung</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Bitte überprüfe und korrigiere den E-Mail-Inhalt bevor du sendest.
                  <span className="font-semibold text-blue-600"> Wird an {businesses.filter(b => b.email && b.status === 'new').length} Betriebe gesendet.</span>
                </p>
              </div>
              <button onClick={() => setShowEmailPreview(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">✕</button>
            </div>

            {/* Editable content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
                  Betreff (Subject)
                </label>
                <input
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
                  E-Mail Text (wird für jeden Betrieb personalisiert — [Business Name] wird automatisch ersetzt)
                </label>
                <textarea
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  rows={18}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono leading-relaxed resize-y"
                />
              </div>

              <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                <strong>⚠️ Hinweis:</strong> Diese E-Mails werden sofort an alle Betriebe mit eingetragener E-Mail und Status "Neu" gesendet. Nach dem Versand wird der Status auf "Kontaktiert" gesetzt.
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowEmailPreview(false)}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
              >
                Abbrechen — nicht senden
              </button>
              <button
                onClick={confirmAndSend}
                className="flex items-center gap-2 rounded-lg bg-blue-600 text-white px-6 py-2.5 text-sm font-bold hover:bg-blue-700 transition"
              >
                <Mail className="h-4 w-4" />
                Jetzt {businesses.filter(b => b.email && b.status === 'new').length} E-Mails versenden
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-gray-900">{editing.business_name}</h3>
                <p className="text-sm text-gray-500">{editing.zip} {editing.city}</p>
              </div>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Email (manuell eintragen)</label>
              <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="info@autohaus.de" className="input" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Notizen</label>
              <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={3} className="input resize-none" />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={updateBusiness} className="flex-1 rounded-lg bg-brand-600 text-white px-4 py-2 text-sm font-semibold hover:bg-brand-700 transition">
                Speichern
              </button>
              {(editEmail || editing.email) && (
                <a href={`mailto:${editEmail || editing.email}?subject=${encodeURIComponent('PDR Connect - Professional PDR technicians for your workshop')}&body=${encodeURIComponent(EMAIL_TEMPLATE(editing.business_name))}`}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition">
                  <Mail className="h-4 w-4" /> Email
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
