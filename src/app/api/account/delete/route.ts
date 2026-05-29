import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { sendAccountDeletionConfirmationEmail } from '@/lib/resend/emails';

/** Extract storage path from a Supabase Storage public URL */
function extractStoragePath(fileUrl: string): string | null {
  try {
    const url = new URL(fileUrl);
    const marker = `/storage/v1/object/`;
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return null;
    const afterMarker = url.pathname.slice(idx + marker.length);
    // afterMarker = "public/<bucket>/<path>" or "sign/<bucket>/<path>"
    const parts = afterMarker.split('/');
    if (parts.length < 3) return null;
    return parts.slice(2).join('/');
  } catch {
    return null;
  }
}

/** DELETE /api/account/delete — permanently delete the calling user's account */
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminClient = createAdminClient();

  // 1. Fetch user's profile to get name, email and file URLs
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, avatar_url, gallery_urls, preferred_language')
    .eq('id', user.id)
    .single();

  const userName = profile?.full_name ?? 'Nutzer';
  const userEmail = user.email ?? '';

  // 2. Fetch user's documents to get their storage URLs
  const { data: documents } = await supabase
    .from('documents')
    .select('file_url')
    .eq('user_id', user.id);

  // 3. Delete all storage files
  // 3a. Avatar
  if (profile?.avatar_url) {
    const avatarPath = extractStoragePath(profile.avatar_url);
    if (avatarPath) {
      await adminClient.storage.from('avatars').remove([avatarPath]);
    }
  }

  // 3b. Gallery images
  const galleryUrls: string[] = Array.isArray(profile?.gallery_urls) ? profile.gallery_urls : [];
  for (const url of galleryUrls) {
    const path = extractStoragePath(url);
    if (path) {
      await adminClient.storage.from('avatars').remove([path]);
    }
  }

  // 3c. Documents
  if (documents && documents.length > 0) {
    for (const doc of documents) {
      if (doc.file_url) {
        const path = extractStoragePath(doc.file_url);
        if (path) {
          await adminClient.storage.from('documents').remove([path]);
        }
      }
    }
  }

  // 4. Delete DB rows (cascade order to avoid FK issues)
  // Documents
  await supabase.from('documents').delete().eq('user_id', user.id);
  // Offers
  await supabase.from('offers').delete().eq('user_id', user.id);
  // Job requests
  await supabase.from('job_requests').delete().eq('user_id', user.id);
  // Bypass violations
  await supabase.from('bypass_violations').delete().eq('user_id', user.id);
  // Matches (as either party)
  await supabase.from('matches').delete().eq('tech_id', user.id);
  await supabase.from('matches').delete().eq('client_id', user.id);
  // Users row
  await supabase.from('users').delete().eq('id', user.id);

  // 5. Sign the user out before deleting auth user
  await supabase.auth.signOut();

  // 6. Delete Supabase Auth user (requires service role)
  const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(user.id);
  if (authDeleteError) {
    console.error('[account/delete] auth delete error:', authDeleteError);
    // Non-fatal: profile and files are already gone
  }

  // 7. Send confirmation email
  if (userEmail) {
    try {
      await sendAccountDeletionConfirmationEmail(userEmail, userName, profile?.preferred_language);
    } catch (e) {
      console.error('[account/delete] email error:', e);
    }
  }

  return NextResponse.json({ success: true });
}
