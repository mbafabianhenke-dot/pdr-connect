import { redirect, notFound } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import UserDetailClient from './UserDetailClient';

interface Props { params: { id: string } }

/** Extract storage path from a full Supabase Storage URL */
function extractStoragePath(fileUrl: string): string | null {
  try {
    const url = new URL(fileUrl);
    const marker = `/storage/v1/object/`;
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return null;
    const afterMarker = url.pathname.slice(idx + marker.length);
    const parts = afterMarker.split('/');
    // parts[0] = "public"/"sign"/"authenticated", parts[1] = bucket, rest = path
    if (parts.length < 3) return null;
    return parts.slice(2).join('/');
  } catch {
    return null;
  }
}

export default async function AdminUserDetailPage({ params }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: admin } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  if (!admin?.is_admin) redirect('/dashboard');

  // Load full user profile (all columns)
  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!profile || error) notFound();

  // Load user's documents
  const { data: rawDocuments } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', params.id)
    .order('created_at', { ascending: false });

  // Generate signed URLs for private documents bucket (1 day TTL)
  const adminClient = createAdminClient();
  const documents = await Promise.all(
    (rawDocuments ?? []).map(async (doc) => {
      try {
        const storagePath = extractStoragePath(doc.file_url);
        if (!storagePath) return { ...doc, signed_url: doc.file_url };
        const { data } = await adminClient.storage
          .from('documents')
          .createSignedUrl(storagePath, 86400);
        return { ...doc, signed_url: data?.signedUrl ?? doc.file_url };
      } catch {
        return { ...doc, signed_url: doc.file_url };
      }
    })
  );

  // Load user's bypass violations
  const { data: violations } = await supabase
    .from('bypass_violations')
    .select('*')
    .eq('user_id', params.id)
    .order('created_at', { ascending: false })
    .limit(20);

  // Load user's offers
  const { data: offers } = await supabase
    .from('offers')
    .select('*')
    .eq('user_id', params.id)
    .order('created_at', { ascending: false })
    .limit(10);

  // Load user's job requests
  const { data: requests } = await supabase
    .from('job_requests')
    .select('*')
    .eq('user_id', params.id)
    .order('created_at', { ascending: false })
    .limit(10);

  // Load user's contracts
  const { data: contracts } = await supabase
    .from('contracts')
    .select('*')
    .eq('user_id', params.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <UserDetailClient
      profile={profile}
      documents={documents}
      violations={violations ?? []}
      offers={offers ?? []}
      requests={requests ?? []}
      contracts={contracts ?? []}
    />
  );
}
