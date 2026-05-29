import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { assertAdmin } from '@/lib/admin-guard';

/**
 * POST /api/admin/verify-doc
 * Approve or reject a pending document.
 * Uses the service-role admin client to bypass RLS.
 *
 * Body:
 *  { docId, action: 'approve' | 'reject', userId?, docType?, fileUrl?, reviewNote? }
 */
export async function POST(req: NextRequest) {
  // Verify caller is an admin via their cookie session
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminCheck = await assertAdmin(supabase, user);
  if (adminCheck) return adminCheck;

  const { docId, action, userId, docType, fileUrl, reviewNote } = await req.json() as {
    docId: string;
    action: 'approve' | 'reject';
    userId?: string;
    docType?: string;
    fileUrl?: string;
    reviewNote?: string;
  };

  if (!docId || !action) {
    return NextResponse.json({ error: 'docId and action are required' }, { status: 400 });
  }

  // Use service-role client — bypasses RLS for documents and users tables
  const adminClient = createAdminClient();

  if (action === 'approve') {
    // 1. Mark document as verified
    const { error: docErr } = await adminClient
      .from('documents')
      .update({ status: 'verified' })
      .eq('id', docId);
    if (docErr) return NextResponse.json({ error: docErr.message }, { status: 500 });

    // 2. Apply business logic based on doc type
    if (userId && docType && fileUrl) {
      if (docType === 'GALLERY_IMAGE') {
        // Append approved image URL to user's gallery
        const { data: userData } = await adminClient
          .from('users')
          .select('gallery_urls')
          .eq('id', userId)
          .single();
        const current = (userData?.gallery_urls ?? []) as string[];
        await adminClient
          .from('users')
          .update({ gallery_urls: [...current, fileUrl] })
          .eq('id', userId);
      } else if (docType === 'AVATAR') {
        // Set approved image as user's avatar
        await adminClient
          .from('users')
          .update({ avatar_url: fileUrl })
          .eq('id', userId);
      } else {
        // Compliance document — mark user as verified
        await adminClient
          .from('users')
          .update({ is_verified: true })
          .eq('id', userId);
      }
    }

    return NextResponse.json({ success: true });
  }

  if (action === 'reject') {
    const { error } = await adminClient
      .from('documents')
      .update({ status: 'rejected', review_note: reviewNote ?? '' })
      .eq('id', docId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
