'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Search, MessageSquare, User, FileText,
  Scroll, Shield, LogOut, Home, Globe, Briefcase, Menu, X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User as UserType } from '@/types/database';
import { ROLE_LABELS, CRAFT_ROLES } from '@/types/database';
import { cn } from '@/lib/utils';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface Props { profile: UserType; }

export default function MobileNav({ profile }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();

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
    setOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      {/* Top mobile header */}
      <header className="flex lg:hidden items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="PDR Connect" width={32} height={32} unoptimized />
          <span className="text-sm font-black text-gray-900 tracking-tight">PDR Connect</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-xl transition-transform duration-300 lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="PDR Connect" width={40} height={40} unoptimized />
            <div className="leading-tight">
              <span className="block text-sm font-black text-gray-900">PDR Connect</span>
              <span className="block text-[10px] font-medium text-gray-400 uppercase tracking-wide">by Cybratech Solutions</span>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
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
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
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
            <>
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                  pathname.startsWith('/admin') && !pathname.startsWith('/admin/hail')
                    ? 'bg-red-50 text-red-700'
                    : 'text-red-600 hover:bg-red-50'
                )}
              >
                <Shield className="h-4 w-4" />
                {t('nav.adminPanel')}
              </Link>
              <Link
                href="/admin/hail-leads"
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                  pathname.startsWith('/admin/hail')
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'text-yellow-600 hover:bg-yellow-50'
                )}
              >
                <Globe className="h-4 w-4" />
                ⛈️ Hagel-Leads
              </Link>
            </>
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
            onClick={() => setOpen(false)}
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
      </div>
    </>
  );
}
