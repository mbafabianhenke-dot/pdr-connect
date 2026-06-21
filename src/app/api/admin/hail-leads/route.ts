import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/* ─── DWD Hail Detection ────────────────────────────────────────── */

// DWD Warnungen-API (public, no key required)
const DWD_WARNINGS_URL =
  'https://www.dwd.de/DWD/warnungen/warnapp/json/warnings.json';

// DWD event types for hail
const HAIL_EVENT_CODES = [
  'THUNDERSTORM_HAIL',    // Gewitter mit Hagel
  'HAIL',
  'SEVERE_THUNDERSTORM',  // Schwere Gewitter oft mit Hagel
];

interface DWDWarning {
  regionName: string;
  stateShort: string;
  type: number;
  level: number;
  event: string;
  headline: string;
  description: string;
  start: number;
  end: number;
  regions?: Array<{ name: string; id: string }>;
}

async function getHailRegions(date: string): Promise<string[]> {
  try {
    const res = await fetch(DWD_WARNINGS_URL, {
      next: { revalidate: 3600 },
      headers: { 'User-Agent': 'PDRConnect/1.0' },
    });
    if (!res.ok) return [];

    const text = await res.text();
    // DWD returns JSONP: warnWetter.loadWarnings({"time":...,"warnings":{...}})
    const jsonStr = text.replace(/^warnWetter\.loadWarnings\(/, '').replace(/\);?\s*$/, '');
    const data = JSON.parse(jsonStr);

    const targetDate = new Date(date);
    const dayStart = targetDate.getTime();
    const dayEnd = dayStart + 86400000;

    const regions: string[] = [];

    const warningsObj = data?.warnings || {};
    for (const warningList of Object.values(warningsObj)) {
      for (const w of warningList as DWDWarning[]) {
        const isHail =
          (w.event && (w.event.toLowerCase().includes('hagel') ||
            w.event.toLowerCase().includes('hail') ||
            HAIL_EVENT_CODES.includes(w.event))) ||
          (w.headline && w.headline.toLowerCase().includes('hagel'));

        if (!isHail) continue;

        const wStart = w.start || 0;
        const wEnd = w.end || 0;
        if (wStart <= dayEnd && wEnd >= dayStart) {
          if (w.regionName && !regions.includes(w.regionName)) {
            regions.push(w.regionName);
          }
        }
      }
    }
    return regions;
  } catch (e) {
    console.error('DWD fetch error:', e);
    return [];
  }
}

/* ─── Overpass API: Find businesses ────────────────────────────── */

interface OverpassElement {
  id: number;
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags: Record<string, string>;
}

async function findBusinessesInArea(
  lat: number,
  lng: number,
  radiusKm = 25,
): Promise<OverpassElement[]> {
  const radius = radiusKm * 1000;
  // Fast international query — uses standard OSM tags, works across Europe
  const query = `
[out:json][timeout:25];
(
  node["shop"="car"](around:${radius},${lat},${lng});
  way["shop"="car"](around:${radius},${lat},${lng});
  node["amenity"="car_repair"](around:${radius},${lat},${lng});
  way["amenity"="car_repair"](around:${radius},${lat},${lng});
  node["craft"="car_painter"](around:${radius},${lat},${lng});
  way["craft"="car_painter"](around:${radius},${lat},${lng});
  node["craft"="bodywork"](around:${radius},${lat},${lng});
  way["craft"="bodywork"](around:${radius},${lat},${lng});
  node["shop"="car_repair"](around:${radius},${lat},${lng});
  way["shop"="car_repair"](around:${radius},${lat},${lng});
);
out center;
`;

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: { 'Content-Type': 'text/plain' },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.elements ?? []) as OverpassElement[];
  } catch (e) {
    console.error('Overpass error:', e);
    return [];
  }
}

/* ─── Geocoding: Region name → coordinates ──────────────────────── */

async function geocodeRegion(regionName: string): Promise<{ lat: number; lng: number; city: string; state: string } | null> {
  try {
    // Support multiple countries: DE, BE, NL, FR, AT, CH, PL, ES, IT, GB
    const query = encodeURIComponent(regionName);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=de,be,nl,fr,at,ch,pl,es,it,gb,lu`,
      { headers: { 'User-Agent': 'PDRConnect/1.0' } },
    );
    if (!res.ok) return null;
    const results = await res.json();
    if (!results?.length) return null;
    const r = results[0];
    return {
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      city: r.display_name?.split(',')[0]?.trim() ?? regionName,
      state: r.display_name?.split(',').slice(-2, -1)[0]?.trim() ?? '',
    };
  } catch {
    return null;
  }
}

/* ─── Map OSM element → business type ────────────────────────────── */

function classifyBusiness(tags: Record<string, string>): string {
  const name = (tags.name ?? '').toLowerCase();
  const shop = tags.shop ?? '';
  const craft = tags.craft ?? '';

  if (
    name.includes('autohaus') ||
    name.includes('automobile') ||
    name.includes('pkw') ||
    shop === 'car'
  ) return 'autohaus';

  if (
    name.includes('karosserie') ||
    name.includes('lackier') ||
    craft === 'car_painter' ||
    craft === 'painter'
  ) return 'kl_betrieb';

  return 'werkstatt';
}

/* ─── Main handler ───────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const date: string = body.date ?? new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const customRegions: string[] = body.regions ?? [];
  const preloadedLeads: Record<string, unknown>[] | undefined = body.preloadedLeads;

  // If client already did Overpass search, just save the results
  if (preloadedLeads && preloadedLeads.length > 0) {
    const { error } = await supabase
      .from('hail_leads')
      .upsert(preloadedLeads, { onConflict: 'osm_id,hail_date', ignoreDuplicates: true });
    return NextResponse.json({
      date, regions: customRegions,
      total_found: preloadedLeads.length,
      inserted: error ? 0 : preloadedLeads.length,
      errors: error ? [error.message] : [],
    });
  }

  // 1. Get hail regions (server-side fallback)
  let regions = customRegions.length > 0 ? customRegions : await getHailRegions(date);

  if (!regions.length) {
    return NextResponse.json({ message: 'No hail regions found for this date', date, leads: [] });
  }

  const allLeads: Record<string, unknown>[] = [];
  const errors: string[] = [];

  // 2. For each region, geocode and find businesses
  for (const regionName of regions.slice(0, 10)) { // max 10 regions per call
    const geo = await geocodeRegion(regionName);
    if (!geo) {
      errors.push(`Could not geocode: ${regionName}`);
      continue;
    }

    const elements = await findBusinessesInArea(geo.lat, geo.lng, 30);

    for (const el of elements) {
      const tags = el.tags ?? {};
      // Allow businesses even without a name (use osm_id as fallback)
      const businessName = tags.name || tags['name:fr'] || tags['name:nl'] || tags['name:de'] || `Business ${el.type}/${el.id}`;
      if (!tags.name && !tags.phone && !tags.website && !tags.email) continue; // skip if absolutely no useful data

      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;

      const parts = [
        tags['addr:street'],
        tags['addr:housenumber'],
        tags['addr:city'],
      ].filter(Boolean);

      allLeads.push({
        hail_date:     date,
        region:        regionName,
        city:          tags['addr:city'] ?? geo.city,
        state:         tags['addr:state'] ?? geo.state,
        lat:           lat ?? geo.lat,
        lng:           lng ?? geo.lng,
        business_name: businessName,
        business_type: classifyBusiness(tags),
        address:       parts.join(', ') || null,
        zip:           tags['addr:postcode'] ?? null,
        phone:         tags.phone ?? tags['contact:phone'] ?? null,
        email:         tags.email ?? tags['contact:email'] ?? null,
        website:       tags.website ?? tags['contact:website'] ?? null,
        osm_id:        `${el.type}/${el.id}`,
        status:        'new',
      });
    }

    // Small delay to be polite to Overpass
    await new Promise((r) => setTimeout(r, 500));
  }

  // 3. Upsert into DB (skip duplicates)
  let inserted = 0;
  if (allLeads.length > 0) {
    const { error } = await supabase
      .from('hail_leads')
      .upsert(allLeads, { onConflict: 'osm_id,hail_date', ignoreDuplicates: true });
    if (!error) inserted = allLeads.length;
    else errors.push(error.message);
  }

  return NextResponse.json({
    date,
    regions,
    total_found: allLeads.length,
    inserted,
    errors,
    leads: allLeads,
  });
}

/* ─── GET: list leads ────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const url = new URL(req.url);
  const status  = url.searchParams.get('status');
  const date    = url.searchParams.get('date');
  const region  = url.searchParams.get('region');
  const format  = url.searchParams.get('format'); // 'csv'

  let query = supabase
    .from('hail_leads')
    .select('*')
    .order('hail_date', { ascending: false })
    .order('region')
    .limit(1000);

  if (status) query = query.eq('status', status);
  if (date)   query = query.eq('hail_date', date);
  if (region) query = query.ilike('region', `%${region}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // CSV export
  if (format === 'csv') {
    const cols = ['hail_date','region','city','state','business_name','business_type','address','zip','phone','email','website','status','notes'];
    const header = cols.join(';');
    const rows = (data ?? []).map((r: Record<string, unknown>) =>
      cols.map((c) => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(';')
    );
    const csv = [header, ...rows].join('\n');
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="hagel-leads-${date ?? 'all'}.csv"`,
      },
    });
  }

  return NextResponse.json({ leads: data ?? [], count: data?.length ?? 0 });
}

/* ─── PATCH: update lead status/notes ───────────────────────────── */

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id, status, email, notes, phone } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status !== undefined) {
    update.status = status;
    if (status === 'contacted') update.contacted_at = new Date().toISOString();
  }
  if (email !== undefined) update.email = email;
  if (notes !== undefined) update.notes = notes;
  if (phone !== undefined) update.phone = phone;

  const { error } = await supabase.from('hail_leads').update(update).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
