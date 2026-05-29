import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendVerificationRequestAdminEmail } from '@/lib/resend/emails';

export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user || authError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Load full profile (including company data for admin email)
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('full_name, email, phone, role, created_at, is_verified, verification_requested_at, company_name, company_street, company_house_number, company_zip, company_country, vat_id, available_countries')
    .eq('id', user.id)
    .single();

  if (!profile || profileError) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Already verified AND no pending re-verification needed → nothing to do
  if (profile.is_verified) {
    return NextResponse.json({ error: 'Profile is already verified' }, { status: 400 });
  }

  // Verification request already pending (admin review in progress) → no spam
  if (profile.verification_requested_at) {
    return NextResponse.json({ error: 'Verification already requested — please wait for admin review' }, { status: 400 });
  }

  // Server-side validation: all mandatory fields must be filled
  const missing: string[] = [];
  if (!profile.full_name?.trim())           missing.push('full_name');
  if (!profile.company_name?.trim())        missing.push('company_name');
  if (!profile.company_street?.trim())      missing.push('company_street');
  if (!profile.company_house_number?.trim()) missing.push('company_house_number');
  if (!profile.company_zip?.trim())         missing.push('company_zip');
  if (!profile.company_country)             missing.push('company_country');
  if (!profile.phone?.trim())               missing.push('phone');
  if (!profile.role)                        missing.push('role');
  if (!Array.isArray(profile.available_countries) || profile.available_countries.length === 0)
    missing.push('available_countries');

  if (missing.length > 0) {
    return NextResponse.json({
      error: `Incomplete profile. Missing fields: ${missing.join(', ')}`,
      missing,
    }, { status: 422 });
  }

  // Mark verification as requested
  const { error: updateError } = await supabase
    .from('users')
    .update({ verification_requested_at: new Date().toISOString() })
    .eq('id', user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Notify admin
  const adminEmail = process.env.ADMIN_EMAIL ?? 'info@cybratech-solutions.com';
  try {
    await sendVerificationRequestAdminEmail(adminEmail, {
      full_name:            profile.full_name,
      email:                profile.email,
      phone:                profile.phone,
      role:                 profile.role,
      created_at:           profile.created_at,
      company_name:         profile.company_name,
      company_street:       profile.company_street,
      company_house_number: profile.company_house_number,
      company_zip:          profile.company_zip,
      company_country:      profile.company_country,
      vat_id:               profile.vat_id,
    });
  } catch (emailErr) {
    // Non-fatal: verification_requested_at was already saved
    console.error('Admin notification email failed:', emailErr);
  }

  return NextResponse.json({ success: true });
}
