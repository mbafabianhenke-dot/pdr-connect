import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: p } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  return p?.is_admin ? createAdminClient() : null;
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const adminClient = await requireAdmin();
  if (!adminClient) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await adminClient
    .from('job_requests')
    .delete()
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
