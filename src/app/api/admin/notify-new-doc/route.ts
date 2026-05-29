import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendNewDocumentAdminEmail } from '@/lib/resend/emails';

/**
 * POST /api/admin/notify-new-doc
 * Called (fire-and-forget) after any document is inserted with status='pending'.
 * Sends the admin an email with the uploader's info + doc type.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { docType } = (await req.json()) as { docType: string };
    if (!docType) return NextResponse.json({ error: 'docType required' }, { status: 400 });

    // Load uploader's profile
    const { data: profile } = await supabase
      .from('users')
      .select('full_name, email, company_name')
      .eq('id', user.id)
      .single();

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const adminEmail = process.env.ADMIN_EMAIL ?? 'info@cybratech-solutions.com';
    await sendNewDocumentAdminEmail(adminEmail, {
      full_name:    profile.full_name,
      email:        profile.email,
      company_name: profile.company_name ?? undefined,
    }, docType);

    return NextResponse.json({ success: true });
  } catch (err) {
    // Non-fatal — just log and return 200 so the client isn't affected
    console.error('notify-new-doc error:', err);
    return NextResponse.json({ success: false });
  }
}
