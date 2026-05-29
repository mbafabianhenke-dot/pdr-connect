import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { assertAdmin } from '@/lib/admin-guard';

/** PATCH /api/admin/users/[id]  — admin updates any user field */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminCheck = await assertAdmin(supabase, user);
  if (adminCheck) return adminCheck;

  const body = await req.json();

  // Whitelist of updatable fields (admin has full access)
  const ALLOWED = [
    'full_name', 'phone', 'bio', 'role',
    'secondary_roles', 'services', 'available_countries',
    'company_name', 'company_address',
    'company_street', 'company_house_number', 'company_zip', 'company_country', 'vat_id',
    'postal_code', 'bundesland',
    'is_blocked', 'is_verified', 'is_premium', 'is_admin',
    'visible_public', 'verification_requested_at',
  ] as const;

  const update: Record<string, any> = {};
  for (const key of ALLOWED) {
    if (key in body) update[key] = body[key];
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
  }

  // When setting is_verified = true, also clear the pending queue and make visible
  if (update.is_verified === true) {
    update.verification_requested_at = null;
    update.visible_public = true;
  }

  const { error } = await supabase
    .from('users')
    .update(update)
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
