import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/dashboard/Sidebar';

const ADMIN_EMAIL = 'mbafabianhenke@gmail.com';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Hard email lock — double protection in addition to middleware
  if (user.email !== ADMIN_EMAIL) redirect('/dashboard');

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  if (!profile?.is_admin) redirect('/dashboard');

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar profile={profile} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
