import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { assertAdmin } from '@/lib/admin-guard';

/** Extract storage path from a full Supabase Storage URL.
 *  Input:  https://<project>.supabase.co/storage/v1/object/public/avatars/user123/photo.jpg
 *  Output: user123/photo.jpg
 */
function extractStoragePath(fileUrl: string, bucket: string): string | null {
  try {
    const url = new URL(fileUrl);
    // Path format: /storage/v1/object/public/<bucket>/<path>
    //           or /storage/v1/object/sign/<bucket>/<path>
    const marker = `/storage/v1/object/`;
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return null;
    const afterMarker = url.pathname.slice(idx + marker.length);
    // afterMarker = "public/<bucket>/<path>" or "sign/<bucket>/<path>"
    const parts = afterMarker.split('/');
    // parts[0] = "public" or "sign", parts[1] = bucket, rest = path
    if (parts.length < 3) return null;
    return parts.slice(2).join('/');
  } catch {
    return null;
  }
}

/** DELETE /api/admin/delete-file  — remove a file from storage + optionally the DB row */
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminCheck = await assertAdmin(supabase, user);
  if (adminCheck) return adminCheck;

  const { fileUrl, bucket, docId, userId, galleryUrl } = await req.json();

  if (!fileUrl || !bucket) {
    return NextResponse.json({ error: 'fileUrl and bucket are required' }, { status: 400 });
  }

  // Use admin client to bypass storage RLS
  const adminClient = createAdminClient();

  // 1. Delete from storage
  const storagePath = extractStoragePath(fileUrl, bucket);
  if (storagePath) {
    const { error: storageError } = await adminClient.storage.from(bucket).remove([storagePath]);
    if (storageError) {
      console.error('[delete-file] storage error:', storageError);
      // Non-fatal: continue to DB cleanup
    }
  }

  // 2a. If it's a document — delete the DB row
  if (docId) {
    const { error } = await supabase.from('documents').delete().eq('id', docId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 2b. If it's the avatar — clear avatar_url on the user
  if (!docId && !galleryUrl && bucket === 'avatars' && userId) {
    const { error } = await supabase.from('users').update({ avatar_url: null }).eq('id', userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 2c. If it's a gallery image — remove from gallery_urls array
  if (galleryUrl && userId) {
    // Fetch current gallery_urls
    const { data: u } = await supabase.from('users').select('gallery_urls').eq('id', userId).single();
    const newGallery = (u?.gallery_urls ?? []).filter((url: string) => url !== galleryUrl);
    const { error } = await supabase.from('users').update({ gallery_urls: newGallery }).eq('id', userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

/** PATCH /api/admin/delete-file  — update document status (verify/reject) */
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminCheck = await assertAdmin(supabase, user);
  if (adminCheck) return adminCheck;

  const { docId, status } = await req.json();
  if (!docId || !['verified', 'rejected', 'pending'].includes(status)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Use service-role client to bypass RLS — admin updates any document
  const adminClient = createAdminClient();

  // Fetch the document first so we can apply business logic on approval
  const { data: doc } = await adminClient
    .from('documents')
    .select('type, file_url, user_id')
    .eq('id', docId)
    .single();

  const { error } = await adminClient.from('documents').update({ status }).eq('id', docId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // On approval: propagate to users table (same logic as /api/admin/verify-doc)
  if (status === 'verified' && doc?.user_id && doc?.file_url) {
    if (doc.type === 'AVATAR') {
      await adminClient.from('users').update({ avatar_url: doc.file_url }).eq('id', doc.user_id);
    } else if (doc.type === 'GALLERY_IMAGE') {
      const { data: userData } = await adminClient
        .from('users').select('gallery_urls').eq('id', doc.user_id).single();
      const current = (userData?.gallery_urls ?? []) as string[];
      if (!current.includes(doc.file_url)) {
        await adminClient.from('users')
          .update({ gallery_urls: [...current, doc.file_url] }).eq('id', doc.user_id);
      }
    }
  }

  return NextResponse.json({ success: true });
}
