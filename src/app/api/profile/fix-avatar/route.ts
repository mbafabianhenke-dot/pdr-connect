import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/profile/fix-avatar
 * Repairs a missing avatar_url on the user row by finding the most recent
 * verified AVATAR document and writing its file_url back to users.avatar_url.
 * Uses the service-role admin client so it bypasses RLS completely.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminClient = createAdminClient();

  // Find the most recent verified AVATAR document for this user
  const { data: doc } = await adminClient
    .from('documents')
    .select('file_url')
    .eq('user_id', user.id)
    .eq('type', 'AVATAR')
    .eq('status', 'verified')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!doc?.file_url) {
    return NextResponse.json({ fixed: false, avatar_url: null });
  }

  // Update users.avatar_url using the service-role client (bypasses RLS)
  const { error } = await adminClient
    .from('users')
    .update({ avatar_url: doc.file_url })
    .eq('id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ fixed: true, avatar_url: doc.file_url });
}

/**
 * DELETE /api/profile/fix-avatar
 * Clears avatar_url for the currently logged-in user.
 */
export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('users')
    .update({ avatar_url: null })
    .eq('id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
