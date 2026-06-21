import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// Simple auth-only layout for sign-legal
// NO contract gates here — this IS the gate page!
export default async function SignLegalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-indigo-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
        {children}
      </div>
    </div>
  );
}
