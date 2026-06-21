import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('is_blocked')
    .eq('id', user.id)
    .single();

  if (!profile || profile.is_blocked) redirect('/login?error=blocked');

  // NOTE: We do NOT redirect admins or verified users here.
  // Admins could land here if their profile is incomplete —
  // redirecting them to /dashboard would cause a loop since
  // the dashboard layout would send them back here.
  // All users can use the onboarding form to complete their profile.

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-indigo-50">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
        {children}
      </div>
    </div>
  );
}
