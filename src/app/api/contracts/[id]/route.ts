import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminDb = createAdminClient();

  // Fetch contract to check ownership
  const { data: contract } = await adminDb
    .from('contracts')
    .select('id, user_id, pdf_url')
    .eq('id', params.id)
    .single();

  if (!contract) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Check authorization: owner OR admin
  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (contract.user_id !== user.id && !profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Delete from storage if there's a file
  if (contract.pdf_url && contract.pdf_url.length > 0) {
    try {
      const url = new URL(contract.pdf_url);
      const marker = '/storage/v1/object/';
      const idx = url.pathname.indexOf(marker);
      if (idx !== -1) {
        const parts = url.pathname.slice(idx + marker.length).split('/');
        const path = parts.slice(2).join('/');
        await adminDb.storage.from('documents').remove([path]);
      }
    } catch { /* ignore storage errors */ }
  }

  // Delete DB record
  const { error } = await adminDb
    .from('contracts')
    .delete()
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
