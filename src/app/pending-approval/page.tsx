import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PendingApprovalClient from './PendingApprovalClient';

export default async function PendingApprovalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Not logged in → go to login
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, email, phone, is_verified, is_admin, created_at')
    .eq('id', user.id)
    .single();

  // Already approved → go to dashboard
  if (profile?.is_verified || profile?.is_admin) {
    redirect('/dashboard');
  }

  return (
    <PendingApprovalClient
      fullName={profile?.full_name ?? null}
      email={profile?.email ?? user.email ?? null}
      phone={profile?.phone ?? null}
      createdAt={profile?.created_at ?? null}
    />
  );
}
