import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/dashboard/Sidebar';
import MobileNav from '@/components/dashboard/MobileNav';
import ContractsModal from '@/components/dashboard/ContractsModal';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // ── Auth check ─────────────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.is_blocked) redirect('/login?error=blocked');

  // ── Admins bypass ALL gates ─────────────────────────────────────
  if (profile.is_admin) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar profile={profile} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <MobileNav profile={profile} />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-5xl px-4 py-6 lg:px-6 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ── Gate: Company data must be complete ────────────────────────
  // AGB/Datenschutz is handled by the ContractsModal (client-side popup)
  // so users can always log out and change language even during signing.
  const profileComplete = !!(
    profile.full_name?.trim() &&
    profile.phone?.trim() &&
    profile.company_name?.trim() &&
    profile.company_street?.trim() &&
    profile.company_zip?.trim() &&
    profile.company_country
  );

  if (!profileComplete) {
    redirect('/onboarding');
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Blocking modal for AGB + Datenschutz — shown client-side if not signed */}
      <ContractsModal />

      {/* Dashboard shell (visible behind modal until contracts are signed) */}
      <Sidebar profile={profile} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileNav profile={profile} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-4 py-6 lg:px-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
