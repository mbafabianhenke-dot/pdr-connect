import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import AdminTabs from './AdminTabs';

export const dynamic = 'force-dynamic';

interface PageProps { searchParams?: { tab?: string; id?: string } }

/** Extract storage path from a full Supabase Storage URL */
function extractStoragePath(fileUrl: string): string | null {
  try {
    const url = new URL(fileUrl);
    const marker = `/storage/v1/object/`;
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return null;
    const afterMarker = url.pathname.slice(idx + marker.length);
    const parts = afterMarker.split('/');
    if (parts.length < 3) return null;
    return parts.slice(2).join('/');
  } catch {
    return null;
  }
}

export default async function AdminPage({ searchParams }: PageProps) {
  const initialTab = (searchParams?.tab as string) ?? 'stats';
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const ADMIN_EMAIL = 'mbafabianhenke@gmail.com';

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Hard email lock — triple protection
  if (user.email !== ADMIN_EMAIL) redirect('/dashboard');

  const { data: admin } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  if (!admin?.is_admin) redirect('/dashboard');

  const [
    { data: users, count: userCount },
    { data: rawPendingDocs, error: docsError },
    { data: violations },
    { count: premiumCount },
    { count: verifiedCount },
    { data: pendingVerifications },
    { data: openOffers },
    { data: openRequests },
    { data: activeMatches },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(100),
    // Use adminClient to bypass RLS on documents table
    // users!user_id disambiguates the FK (documents has two FKs to users: user_id + reviewed_by)
    adminClient.from('documents').select('*, users!user_id(full_name, email)').eq('status', 'pending').order('created_at'),
    supabase.from('bypass_violations').select('*, users(full_name, email)').order('created_at', { ascending: false }).limit(50),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_premium', true),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_verified', true),
    supabase
      .from('users')
      .select('id, full_name, email, phone, role, created_at, verification_requested_at, avatar_url, bio, company_name')
      .not('verification_requested_at', 'is', null)
      .eq('is_verified', false)
      .order('verification_requested_at', { ascending: true }),
    supabase
      .from('offers')
      .select('*, users(full_name, role)')
      .eq('status', 'open')
      .order('created_at', { ascending: true }),
    supabase
      .from('job_requests')
      .select('*, users(id, full_name, role, email, phone, company_name, avatar_url)')
      .order('created_at', { ascending: false }),
    supabase
      .from('matches')
      .select('*, offers(available_from, available_until), job_requests(role_needed, location_city, location_country)')
      .not('status', 'eq', 'cancelled')
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  if (docsError) console.error('[admin] pendingDocs query error:', JSON.stringify(docsError));
  console.log('[admin] rawPendingDocs count:', rawPendingDocs?.length ?? 0);

  // ── Generate signed URLs for pending docs (private bucket) ──────────────
  // Gallery images and avatars are stored in the public 'avatars' bucket — no signing needed.
  const pendingDocs = await Promise.all(
    (rawPendingDocs ?? []).map(async (doc) => {
      try {
        if (doc.type === 'GALLERY_IMAGE' || doc.type === 'AVATAR') {
          return { ...doc, signed_url: doc.file_url }; // public URL, no signing needed
        }
        const storagePath = extractStoragePath(doc.file_url);
        if (!storagePath) return { ...doc, signed_url: null };
        const { data } = await adminClient.storage.from('documents').createSignedUrl(storagePath, 86400);
        return { ...doc, signed_url: data?.signedUrl ?? null };
      } catch {
        return { ...doc, signed_url: null };
      }
    })
  );

  // ── Load & sign documents for pending verification users ───────────────
  const pendingUserIds = (pendingVerifications ?? []).map((u: any) => u.id);
  let verificationDocs: any[] = [];

  if (pendingUserIds.length > 0) {
    const { data: rawVerDocs } = await adminClient
      .from('documents')
      .select('*')
      .in('user_id', pendingUserIds)
      .order('created_at', { ascending: false });

    verificationDocs = await Promise.all(
      (rawVerDocs ?? []).map(async (doc) => {
        try {
          const storagePath = extractStoragePath(doc.file_url);
          if (!storagePath) return { ...doc, signed_url: null };
          const { data } = await adminClient.storage.from('documents').createSignedUrl(storagePath, 86400);
          return { ...doc, signed_url: data?.signedUrl ?? null };
        } catch {
          return { ...doc, signed_url: null };
        }
      })
    );
  }

  // ── Load customer inquiries ──────────────────────────────────────────────
  const { data: inquiries } = await supabase
    .from('customer_inquiries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  const stats = {
    total: userCount ?? 0,
    premium: premiumCount ?? 0,
    verified: verifiedCount ?? 0,
    pendingDocs: pendingDocs.length,
    pendingVerifications: pendingVerifications?.length ?? 0,
    openOffers: openOffers?.length ?? 0,
    openRequests: openRequests?.length ?? 0,
    activeMatches: activeMatches?.length ?? 0,
  };

  return (
    <AdminTabs
      users={users ?? []}
      pendingDocs={pendingDocs}
      violations={violations ?? []}
      pendingVerifications={pendingVerifications ?? []}
      verificationDocs={verificationDocs}
      openOffers={openOffers ?? []}
      openRequests={openRequests ?? []}
      activeMatches={activeMatches ?? []}
      inquiries={inquiries ?? []}
      stats={stats}
      initialTab={initialTab}
    />
  );
}
