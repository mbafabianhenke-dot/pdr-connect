import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { assertAdmin } from '@/lib/admin-guard';

function extractStoragePath(fileUrl: string): string | null {
  try {
    const url = new URL(fileUrl);
    const marker = `/storage/v1/object/`;
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return null;
    const afterMarker = url.pathname.slice(idx + marker.length);
    const parts = afterMarker.split('/');
    if (parts.length < 3) return null;
    return parts.slice(2).join('/');
  } catch {
    return null;
  }
}

/** DELETE /api/admin/delete-user — admin permanently deletes any user account */
export async function DELETE(req: NextRequest) {
  // 1. Auth — must be a logged-in admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const adminCheck = await assertAdmin(supabase, user);
  if (adminCheck) return adminCheck;

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  // Prevent admin from deleting themselves
  if (userId === user.id) {
    return NextResponse.json({ error: 'Cannot delete your own account via this endpoint' }, { status: 400 });
  }

  const adminClient = createAdminClient();

  // 2. Fetch target user profile + files
  const { data: profile } = await adminClient
    .from('users')
    .select('full_name, avatar_url, gallery_urls')
    .eq('id', userId)
    .single();

  // 3. Fetch documents
  const { data: documents } = await adminClient
    .from('documents')
    .select('file_url')
    .eq('user_id', userId);

  // 4. Delete all storage files

  // Avatar
  if (profile?.avatar_url) {
    const path = extractStoragePath(profile.avatar_url);
    if (path) await adminClient.storage.from('avatars').remove([path]);
  }

  // Gallery images
  const galleryUrls: string[] = Array.isArray(profile?.gallery_urls) ? profile.gallery_urls : [];
  for (const url of galleryUrls) {
    const path = extractStoragePath(url);
    if (path) await adminClient.storage.from('avatars').remove([path]);
  }

  // Documents
  for (const doc of documents ?? []) {
    if (doc.file_url) {
      const path = extractStoragePath(doc.file_url);
      if (path) await adminClient.storage.from('documents').remove([path]);
    }
  }

  // 5. Delete DB rows (use adminClient to bypass RLS)
  await adminClient.from('documents').delete().eq('user_id', userId);
  await adminClient.from('offers').delete().eq('user_id', userId);
  await adminClient.from('job_requests').delete().eq('user_id', userId);
  await adminClient.from('bypass_violations').delete().eq('user_id', userId);
  await adminClient.from('matches').delete().eq('tech_id', userId);
  await adminClient.from('matches').delete().eq('client_id', userId);
  await adminClient.from('users').delete().eq('id', userId);

  // 6. Delete Supabase Auth user
  const { error: authErr } = await adminClient.auth.admin.deleteUser(userId);
  if (authErr) {
    console.error('[admin/delete-user] auth delete error:', authErr);
  }

  console.log(`[admin/delete-user] Admin ${user.id} deleted user ${userId} (${profile?.full_name})`);

  return NextResponse.json({ success: true });
}
