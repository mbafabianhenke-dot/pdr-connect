import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { assertAdmin } from '@/lib/admin-guard';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const adminCheck = await assertAdmin(supabase, user);
  if (adminCheck) return adminCheck;

  const body = await req.json();
  const { offerId, requestId, techRate, clientFee, location, assignment, notes } = body;

  if (!offerId || !requestId) {
    return NextResponse.json({ error: 'offerId and requestId required' }, { status: 400 });
  }

  // Load offer + request to get user IDs
  const [{ data: offer }, { data: request }] = await Promise.all([
    supabase.from('offers').select('user_id').eq('id', offerId).single(),
    supabase.from('job_requests').select('user_id').eq('id', requestId).single(),
  ]);

  if (!offer || !request) {
    return NextResponse.json({ error: 'Offer or request not found' }, { status: 404 });
  }

  // Create match
  const { error: matchErr } = await supabase.from('matches').insert({
    offer_id: offerId,
    job_request_id: requestId,
    tech_user_id: offer.user_id,
    client_user_id: request.user_id,
    admin_id: user.id,
    tech_rate: techRate || null,
    client_fee: clientFee || null,
    location: location || null,
    assignment: assignment || null,
    notes: notes || null,
    status: 'proposed',
  });

  if (matchErr) return NextResponse.json({ error: matchErr.message }, { status: 500 });

  // Update statuses
  await Promise.all([
    supabase.from('offers').update({ status: 'matched' }).eq('id', offerId),
    supabase.from('job_requests').update({ status: 'matched' }).eq('id', requestId),
  ]);

  return NextResponse.json({ success: true });
}
