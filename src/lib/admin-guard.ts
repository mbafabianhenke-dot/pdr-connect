import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'mbafabianhenke@gmail.com';

/**
 * Checks that the authenticated user is the designated admin.
 * Returns null if access is granted, or a 403 NextResponse if denied.
 */
export async function assertAdmin(
  supabase: SupabaseClient,
  user: { id: string; email?: string } | null
): Promise<NextResponse | null> {
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Hard email lock — only the designated admin email is allowed
  if (user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return null; // access granted
}
