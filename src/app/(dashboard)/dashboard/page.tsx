import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { User } from '@/types/database';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data: docs }, { data: messages }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('documents').select('id, type, status').eq('user_id', user.id),
    supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('receiver_id', user.id)
      .is('read_at', null),
  ]);

  if (!profile) redirect('/login');

  const docsVerified = docs?.filter(d => d.status === 'verified').length ?? 0;
  const docsTotal = docs?.length ?? 0;
  const hasCompanyDoc = docs?.some(d => d.type === 'COMPANY_DOC' && d.status !== 'rejected') ?? false;

  const p = profile as User & {
    company_street?: string; company_house_number?: string;
    company_zip?: string; company_country?: string; available_countries?: string[];
  };
  const hasCompanyAddress = !!(p.company_street?.trim() && p.company_house_number?.trim() && p.company_zip?.trim() && p.company_country);
  const hasCountry = (p.available_countries?.length ?? 0) > 0;

  return (
    <DashboardClient
      profile={profile as User}
      unread={messages?.length ?? 0}
      docsTotal={docsTotal}
      docsVerified={docsVerified}
      hasDocs={docsTotal > 0}
      hasCompanyDoc={hasCompanyDoc}
      hasCompanyAddress={hasCompanyAddress}
      hasCountry={hasCountry}
    />
  );
}
