import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: p } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  return p?.is_admin ? supabase : null;
}

const BLACKLIST = [
  'example.com','test.com','domain.com','sentry.io','wixpress.com',
  'google.com','facebook.com','instagram.com','schema.org','w3.org',
  'cloudflare.com','jquery','png','jpg','gif','svg',
];

function extractEmails(html: string): string[] {
  const decoded = html
    .replace(/&#64;/gi, '@').replace(/&#x40;/gi, '@')
    .replace(/\[at\]/gi, '@').replace(/\(at\)/gi, '@')
    .replace(/&#46;/gi, '.').replace(/\[dot\]/gi, '.');

  const regex = /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b/g;
  const matches = decoded.match(regex) ?? [];

  const filtered = matches.filter(e => {
    const l = e.toLowerCase();
    if (l.length > 80) return false;
    if (BLACKLIST.some(b => l.includes(b))) return false;
    return true;
  });

  return Array.from(new Set(filtered)).slice(0, 5);
}

function rankEmails(emails: string[]): string {
  const prio = ['info@','kontakt@','contact@','mail@','service@','office@','hello@'];
  for (const p of prio) {
    const m = emails.find(e => e.toLowerCase().startsWith(p));
    if (m) return m;
  }
  return emails[0];
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PDRConnect/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'de-DE,de;q=0.9',
      },
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') ?? '';
    if (!ct.includes('html') && !ct.includes('text')) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function findEmail(rawUrl: string): Promise<string | null> {
  let base = rawUrl.trim();
  if (!base.startsWith('http')) base = 'https://' + base;
  base = base.replace(/\/$/, '');

  const pages = [
    base,
    base + '/impressum',
    base + '/kontakt',
    base + '/contact',
    base + '/ueber-uns',
    base + '/imprint',
  ];

  for (const url of pages) {
    const html = await fetchHtml(url);
    if (!html) continue;
    const emails = extractEmails(html);
    if (emails.length > 0) return rankEmails(emails);
    await new Promise(r => setTimeout(r, 200));
  }
  return null;
}

export async function POST(req: NextRequest) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { bundesland, zip, limit = 50 } = body as { bundesland?: string; zip?: string; limit?: number };

  let q = supabase
    .from('de_businesses')
    .select('id, business_name, website')
    .is('email', null)
    .not('website', 'is', null)
    .neq('website', '')
    .limit(limit);

  if (bundesland) q = q.eq('bundesland', bundesland) as typeof q;
  if (zip)        q = q.ilike('zip', `${zip}%`) as typeof q;

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const businesses = (data ?? []) as Array<{ id: string; business_name: string; website: string }>;
  if (!businesses.length) return NextResponse.json({ found: 0, processed: 0 });

  let found = 0;

  for (const biz of businesses) {
    const email = await findEmail(biz.website);
    if (email) {
      await supabase
        .from('de_businesses')
        .update({ email, updated_at: new Date().toISOString() })
        .eq('id', biz.id);
      found++;
    }
    await new Promise(r => setTimeout(r, 500));
  }

  return NextResponse.json({ found, processed: businesses.length });
}
