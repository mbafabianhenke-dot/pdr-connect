'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Clock, Mail, Phone, ShieldCheck, LogOut, LayoutDashboard } from 'lucide-react';

interface Props {
  fullName:    string | null;
  email:       string | null;
  phone:       string | null;
  createdAt:   string | null;
}

export default function PendingApprovalClient({ fullName, email, phone, createdAt }: Props) {
  const { t, i18n } = useTranslation();

  const dateLocale = t('pendingApproval.dateLocale', { defaultValue: 'en-GB' });
  const registeredAt = createdAt
    ? new Date(createdAt).toLocaleString(dateLocale, {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

          {/* Top banner */}
          <div className="bg-amber-500 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg leading-tight">
                  {t('pendingApproval.title')}
                </h1>
                <p className="text-amber-100 text-sm">
                  {t('pendingApproval.subtitle')}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 space-y-5">

            {/* Message */}
            <div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {t('pendingApproval.message')}
              </p>
            </div>

            {/* User details */}
            <div className="rounded-xl bg-gray-50 border border-gray-200 divide-y divide-gray-200">
              <div className="flex items-center gap-3 px-4 py-3">
                <ShieldCheck className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium">{t('pendingApproval.labelName')}</p>
                  <p className="text-sm font-semibold text-gray-800">{fullName ?? '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium">{t('pendingApproval.labelEmail')}</p>
                  <p className="text-sm font-semibold text-gray-800">{email ?? '—'}</p>
                </div>
              </div>
              {phone && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{t('pendingApproval.labelPhone')}</p>
                    <p className="text-sm font-semibold text-gray-800">{phone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 px-4 py-3">
                <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium">{t('pendingApproval.labelRegistered')}</p>
                  <p className="text-sm font-semibold text-gray-800">{registeredAt}</p>
                </div>
              </div>
            </div>

            {/* Info box */}
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
              <p className="text-xs text-blue-700 leading-relaxed">
                <strong>{t('pendingApproval.whatNext')}</strong><br />
                {t('pendingApproval.whatNextDesc')}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-1">
              {/* Go to dashboard — users can browse freely while waiting */}
              <Link
                href="/dashboard"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition"
              >
                <LayoutDashboard className="h-4 w-4" />
                {t('pendingApproval.goToDashboard')}
              </Link>

              {/* Refresh check — reloads page → Server Component re-checks is_verified */}
              <form action="/pending-approval" method="GET">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {t('pendingApproval.checkStatus')}
                </button>
              </form>

              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  <LogOut className="h-4 w-4" />
                  {t('pendingApproval.signOut')}
                </button>
              </form>
            </div>

            <p className="text-center text-xs text-gray-400">
              {t('pendingApproval.questions')}{' '}
              <a href="mailto:info@cybratech-solutions.com" className="text-brand-600 hover:underline">
                info@cybratech-solutions.com
              </a>
            </p>
          </div>
        </div>

        {/* PDR Connect branding */}
        <p className="text-center text-xs text-gray-400 mt-6">
          PDR Connect · Cybratech-Solutions · Efesou 9, 5280 Paralimni, Cyprus
        </p>
      </div>
    </div>
  );
}
