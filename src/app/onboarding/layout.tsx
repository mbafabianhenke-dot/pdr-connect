import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('is_verified, is_admin, is_blocked, verification_requested_at')
    .eq('id', user.id)
    .single();

  if (!profile || profile.is_blocked) redirect('/login?error=blocked');

  // Already fully verified → go to dashboard
  if (profile.is_verified || profile.is_admin) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-indigo-50">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
        {children}
      </div>
    </div>
  );
}
