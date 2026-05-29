import { createClient } from '@/lib/supabase/server';
import SearchClient from './SearchClient';

interface SearchParams { role?: string; country?: string; bundesland?: string; }

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: me } = await supabase.from('users').select('is_admin').eq('id', user!.id).single();
  const isAdmin = me?.is_admin ?? false;

  // user_public_profiles view: no email/phone, already filters
  // verified + visible_public + not blocked at the DB level.
  let query = supabase
    .from('user_public_profiles')
    .select('id, full_name, role, secondary_roles, available_countries, services, avatar_url, bio, is_premium, is_verified, postal_code, bundesland')
    .neq('id', user!.id)
    .neq('role', 'CUSTOMER')
    .neq('role', 'ADMINISTRATOR')
    // Only show profiles with at least 1 country and 1 service (mandatory completion)
    .not('available_countries', 'eq', '{}')
    .not('services', 'eq', '{}')
    .order('is_premium', { ascending: false })
    .limit(100);

  if (searchParams.role) {
    query = query.or(`role.eq.${searchParams.role},secondary_roles.cs.{${searchParams.role}}`);
  }
  if (searchParams.country) query = query.contains('available_countries', [searchParams.country]);
  if (searchParams.bundesland) query = query.eq('bundesland', searchParams.bundesland);

  const { data: results } = await query;

  return (
    <SearchClient
      results={results ?? []}
      currentRole={searchParams.role ?? ''}
      currentCountry={searchParams.country ?? ''}
      currentBundesland={searchParams.bundesland ?? ''}
      isAdmin={isAdmin}
    />
  );
}
