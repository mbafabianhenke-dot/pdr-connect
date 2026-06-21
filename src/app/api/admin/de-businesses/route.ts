import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/* ── Auth guard ─────────────────────────────────────────────── */
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: p } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  if (!p?.is_admin) return null;
  return supabase;
}

/* ── POST — save imported businesses ────────────────────────── */
export async function POST(req: NextRequest) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const businesses: Record<string, unknown>[] = body.businesses ?? [];

  if (!businesses.length) {
    return NextResponse.json({ inserted: 0, message: 'No businesses to save' });
  }

  const { error } = await supabase
    .from('de_businesses')
    .upsert(businesses, { onConflict: 'osm_id', ignoreDuplicates: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ inserted: businesses.length });
}

/* ── GET — list / export ─────────────────────────────────────── */
export async function GET(req: NextRequest) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url    = new URL(req.url);
  const format = url.searchParams.get('format');
  const zip    = url.searchParams.get('zip');
  const bl     = url.searchParams.get('bundesland');
  const type   = url.searchParams.get('type');
  const status = url.searchParams.get('status');
  const limit  = Math.min(parseInt(url.searchParams.get('limit') ?? '2000'), 5000);

  let q = supabase
    .from('de_businesses')
    .select('*')
    .order('zip', { ascending: true })
    .order('business_name', { ascending: true })
    .limit(limit);

  if (zip)    q = q.ilike('zip', `${zip}%`);
  if (bl)     q = q.eq('bundesland', bl);
  if (type)   q = q.eq('business_type', type);
  if (status) q = q.eq('status', status);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (format === 'csv') {
    const cols = ['zip','city','bundesland','business_name','business_type','address','phone','email','website','status','notes'];
    const header = cols.join(';');
    const rows = (data ?? []).map((r: Record<string, unknown>) =>
      cols.map(c => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(';')
    );
    const csv = '﻿' + [header, ...rows].join('\r\n'); // BOM for Excel
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="de-businesses-${Date.now()}.csv"`,
      },
    });
  }

  return NextResponse.json({ businesses: data ?? [], count: data?.length ?? 0 });
}

/* ── PATCH — update single record ───────────────────────────── */
export async function PATCH(req: NextRequest) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, ...fields } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  fields.updated_at = new Date().toISOString();
  if (fields.status === 'contacted' && !fields.contacted_at) {
    fields.contacted_at = new Date().toISOString();
  }

  const { error } = await supabase.from('de_businesses').update(fields).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

/* ── DELETE — bulk delete by filter or all ───────────────────── */
export async function DELETE(req: NextRequest) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { ids, zip, bundesland, type, deleteAll } = body;

  if (deleteAll) {
    // Delete EVERYTHING
    const { error } = await supabase.from('de_businesses').delete().gte('created_at', '2000-01-01');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, deleted: 'all' });
  }

  if (ids?.length) {
    // Delete specific IDs
    const { error } = await supabase.from('de_businesses').delete().in('id', ids);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, deleted: ids.length });
  }

  // Delete by filter (bundesland, zip, type)
  let q = supabase.from('de_businesses').delete();
  if (bundesland) q = q.eq('bundesland', bundesland) as typeof q;
  if (zip)        q = q.ilike('zip', `${zip}%`) as typeof q;
  if (type)       q = q.eq('business_type', type) as typeof q;

  if (!bundesland && !zip && !type) {
    return NextResponse.json({ error: 'No filter specified — use deleteAll:true to delete everything' }, { status: 400 });
  }

  const { error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
