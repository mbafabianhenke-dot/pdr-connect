import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { assertAdmin } from '@/lib/admin-guard';
import {
  sendAccountApprovedEmail,
  sendVerificationRejectedEmail,
} from '@/lib/resend/emails';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminCheck = await assertAdmin(supabase, user);
  if (adminCheck) return adminCheck;

  const body = await req.json();
  const { userId, action } = body as { userId: string; action: 'approve' | 'reject' };

  if (!userId || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Load target user
  const { data: target } = await supabase
    .from('users')
    .select('email, full_name, preferred_language')
    .eq('id', userId)
    .single();

  if (!target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (action === 'approve') {
    const { error } = await supabase
      .from('users')
      .update({ is_verified: true, verification_requested_at: null })
      .eq('id', userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    let emailError: string | null = null;
    try {
      const result = await sendAccountApprovedEmail(target.email, target.full_name, target.preferred_language);
      console.log('[verify-user] approval email sent to', target.email, 'result:', JSON.stringify(result));
    } catch (e: any) {
      emailError = e?.message ?? String(e);
      console.error('[verify-user] approval email FAILED for', target.email, ':', emailError, e);
    }

    return NextResponse.json({ success: true, emailError });
  } else {
    // reject: clear the request so they can submit again
    const { error } = await supabase
      .from('users')
      .update({ verification_requested_at: null })
      .eq('id', userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    let emailError: string | null = null;
    try {
      const result = await sendVerificationRejectedEmail(target.email, target.full_name, target.preferred_language);
      console.log('[verify-user] rejection email sent to', target.email, 'result:', JSON.stringify(result));
    } catch (e: any) {
      emailError = e?.message ?? String(e);
      console.error('[verify-user] rejection email FAILED for', target.email, ':', emailError, e);
    }

    return NextResponse.json({ success: true, emailError });
  }
}
