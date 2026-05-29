'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Search, MessageSquare, User, FileText,
  Scroll, Shield, LogOut, Home, Globe, Briefcase,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User as UserType } from '@/types/database';
import { ROLE_LABELS, CRAFT_ROLES } from '@/types/database';
import { cn } from '@/lib/utils';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface Props { profile: UserType; }

export default function Sidebar({ profile }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, i18n } = useTranslation();

  // Sync DB preferred_language to the UI on first load
  useEffect(() => {
    const lang = (profile as any).preferred_language as string | undefined;
    if (lang && ['en', 'de', 'es', 'el'].includes(lang) && lang !== i18n.language?.split('-')[0]) {
      i18n.changeLanguage(lang);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [(profile as any).preferred_language]);

  const isCraft = CRAFT_ROLES.includes(profile.role);

  const NAV = [
    { href: '/dashboard',  label: t('nav.dashboard'),   icon: LayoutDashboard },
    ...(isCraft
      ? [{ href: '/offers',   label: t('nav.myOffer'),    icon: Globe }]
      : [{ href: '/requests', label: t('nav.myRequests'), icon: Briefcase }]
    ),
    { href: '/search',     label: t('nav.findPros'),     icon: Search },
    { href: '/messages',   label: t('nav.messages'),     icon: MessageSquare },
    { href: '/profile',    label: t('nav.myProfile'),    icon: User },
    { href: '/documents',  label: t('nav.documents'),    icon: FileText },
    { href: '/contracts',  label: t('nav.contracts'),    icon: Scroll },
  ];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-gray-200 px-5 py-4">
        <Image src="/logo.png" alt="Cybratech Solutions" width={54} height={54} unoptimized className="flex-shrink-0" />
        <div className="leading-tight">
          <span className="block text-sm font-black text-gray-900 tracking-tight">PDR Connect</span>
          <span className="block text-[10px] font-medium text-gray-400 tracking-wide uppercase">by Cybratech Solutions</span>
        </div>
      </div>

      {/* User badge */}
      <div className="border-b border-gray-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-sm">
            {profile.full_name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">{profile.full_name}</p>
            <p className="truncate text-xs text-gray-500">
              {profile.is_admin
                ? 'Administrator'
                : t(`profile.roles.${profile.role}`, { defaultValue: ROLE_LABELS[profile.role] })}
            </p>
          </div>
        </div>
        <div className="mt-2 flex gap-2">
          {profile.is_verified && (
            <span className="badge-verified">✓ {t('dashboard.verified')}</span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}

        {profile.is_admin && (
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
              pathname.startsWith('/admin')
                ? 'bg-red-50 text-red-700'
                : 'text-red-600 hover:bg-red-50'
            )}
          >
            <Shield className="h-4 w-4" />
            {t('nav.adminPanel')}
          </Link>
        )}
      </nav>

      {/* Language switcher */}
      <div className="border-t border-gray-200 pt-2">
        <p className="px-5 pb-1 text-xs font-medium text-gray-400 uppercase tracking-wider">{t('nav.language')}</p>
        <LanguageSwitcher />
      </div>

      {/* Home + Logout */}
      <div className="border-t border-gray-200 px-3 py-3 space-y-0.5">
        <Link
          href="/"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
        >
          <Home className="h-4 w-4" />
          {t('nav.home')}
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
        >
          <LogOut className="h-4 w-4" />
          {t('nav.signOut')}
        </button>
      </div>
    </aside>
  );
}
