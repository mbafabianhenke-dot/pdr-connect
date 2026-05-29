import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/register', '/privacy', '/terms', '/legal', '/reset-password', '/pending-approval'];
const AUTH_PATHS   = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as any)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic   = PUBLIC_PATHS.some(p => path === p || path.startsWith('/api/auth') || path.startsWith('/api/'));
  const isAuthPath = AUTH_PATHS.some(p => path === p);

  // ── 1. Unauthenticated → login (protect all non-public routes) ──
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  // ── 2. Authenticated on auth pages → redirect away ──────────────
  if (user && isAuthPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // ── 3. Admin guard ───────────────────────────────────────────────
  if (path.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url));

    // Hard email lock — only this address may ever reach the admin area
    const ADMIN_EMAIL = 'mbafabianhenke@gmail.com';
    if (user.email !== ADMIN_EMAIL) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    const { data: profile } = await supabase
      .from('users')
      .select('is_admin, is_blocked')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin || profile.is_blocked) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
