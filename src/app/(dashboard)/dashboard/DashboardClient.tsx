'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle, CheckCircle, FileText, MessageSquare,
  Search, Star, Upload, ChevronRight, ShieldCheck,
  Globe, Briefcase, XCircle, MapPin, UserPlus, Copy, Check,
} from 'lucide-react';
import type { User } from '@/types/database';
import { CRAFT_ROLES } from '@/types/database';

interface Props {
  profile: User;
  unread: number;
  docsTotal: number;
  docsVerified: number;
  hasDocs: boolean;
  hasCompanyDoc: boolean;
  hasCompanyAddress: boolean;
  hasCountry: boolean;
}

export default function DashboardClient({ profile, unread, docsTotal, docsVerified, hasDocs, hasCompanyDoc, hasCompanyAddress, hasCountry }: Props) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopyInvite = () => {
    navigator.clipboard.writeText('https://pdrconnect.eu/register').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const isCustomer = profile.role === 'CUSTOMER';
  const isCraft = CRAFT_ROLES.includes(profile.role);

  const steps = isCustomer ? [
    { id: 'profile',  done: profile.visible_public, href: '/profile',  icon: Search,      label: t('dashboard.makePublic') },
    { id: 'premium',  done: profile.is_premium,     href: '/premium',  icon: Star,        label: t('dashboard.getPremium') },
    { id: 'search',   done: false,                  href: '/search',   icon: Upload,      label: t('dashboard.findProfessionals') },
  ] : [
    { id: 'docs',     done: hasDocs,               href: '/documents', icon: Upload,       label: t('dashboard.uploadDocs') },
    { id: 'verified', done: profile.is_verified,   href: '/documents', icon: CheckCircle,  label: t('dashboard.profileVerified') },
    { id: 'visible',  done: profile.visible_public, href: '/profile',   icon: Search,       label: t('dashboard.makePublic') },
    { id: 'premium',  done: profile.is_premium,    href: '/premium',   icon: Star,         label: t('dashboard.getPremium') },
  ];

  const completedSteps = steps.filter(s => s.done).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('dashboard.welcomeBack', { name: profile.full_name.split(' ')[0] })}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {t('dashboard.memberSince', {
            role: profile.role,
            year: new Date(profile.created_at).getFullYear(),
          })}
        </p>
      </div>

      {/* Status alerts */}
      {profile.is_blocked && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">{t('dashboard.suspended')}</p>
            <p className="text-sm text-red-600">{t('dashboard.suspendedDesc')}</p>
          </div>
        </div>
      )}

      {/* Verification requested — waiting for admin */}
      {!profile.is_verified && profile.verification_requested_at && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800">{t('dashboard.verificationRequested')}</p>
            <p className="text-sm text-amber-600">{t('dashboard.verificationRequestedDesc')}</p>
          </div>
        </div>
      )}

      {/* Not verified, not requested yet → show prerequisite checklist */}
      {!profile.is_verified && !profile.verification_requested_at && !isCustomer && !profile.is_admin && (
        <div className="rounded-xl border border-brand-200 overflow-hidden">
          <div className="bg-brand-50 px-4 py-3 flex items-center gap-3 border-b border-brand-200">
            <ShieldCheck className="h-5 w-5 text-brand-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-brand-900 text-sm">{t('dashboard.requestVerificationTitle')}</p>
              <p className="text-xs text-brand-600 mt-0.5">{t('dashboard.requestVerificationDesc')}</p>
            </div>
          </div>
          <div className="bg-white divide-y divide-gray-100">
            {[
              { ok: hasCompanyAddress, label: t('verification.checkCompanyAddress'), href: '/profile',           icon: MapPin },
              { ok: hasCompanyDoc,     label: t('verification.checkCompanyDoc'),     href: '/documents',        icon: FileText },
              { ok: hasCountry,        label: t('verification.checkCountries'),      href: '/profile?tab=settings', icon: Globe },
            ].map(({ ok, label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-gray-50 ${ok ? 'text-gray-600' : 'text-red-700 bg-red-50 hover:bg-red-100'}`}
              >
                {ok
                  ? <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  : <XCircle    className="h-4 w-4 text-red-400 flex-shrink-0" />}
                <Icon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <span className={`flex-1 ${ok ? '' : 'font-medium'}`}>{label}</span>
                {!ok && <ChevronRight className="h-4 w-4 text-red-400 flex-shrink-0" />}
              </Link>
            ))}
            {hasCompanyAddress && hasCompanyDoc && hasCountry && (
              <div className="px-4 py-3 bg-green-50 flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <p className="text-sm text-green-700 flex-1 font-medium">{t('dashboard.allPrereqsMet')}</p>
                <Link
                  href="/documents"
                  className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-700 transition"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {t('dashboard.requestVerificationBtn')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {profile.bypass_count > 0 && (
        <div className="rounded-xl bg-orange-50 border border-orange-200 p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-orange-800">
              {t('dashboard.bypassWarning', { count: profile.bypass_count })}
            </p>
            <p className="text-sm text-orange-600">{t('dashboard.bypassWarningDesc')}</p>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: t('dashboard.profileStatus'),
            value: profile.is_verified ? t('dashboard.verified') : t('dashboard.unverified'),
            icon: CheckCircle,
            color: profile.is_verified ? 'text-green-600' : 'text-gray-400',
          },
          {
            label: t('dashboard.membership'),
            value: profile.is_premium ? t('dashboard.premium') : t('dashboard.free'),
            icon: Star,
            color: profile.is_premium ? 'text-yellow-500' : 'text-gray-400',
          },
          {
            label: t('dashboard.unreadMessages'),
            value: String(unread),
            icon: MessageSquare,
            color: 'text-brand-600',
          },
          {
            label: t('dashboard.documents'),
            value: t('dashboard.verifiedOf', { v: docsVerified, t: docsTotal }),
            icon: FileText,
            color: 'text-purple-600',
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <Icon className={`h-5 w-5 ${color} mb-2`} />
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Onboarding checklist */}
      {completedSteps < steps.length && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">{t('dashboard.gettingStarted')}</h2>
            <span className="text-sm text-gray-500">{completedSteps}/{steps.length} {t('dashboard.complete')}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full mb-5">
            <div
              className="h-1.5 bg-brand-600 rounded-full transition-all"
              style={{ width: `${(completedSteps / steps.length) * 100}%` }}
            />
          </div>
          <div className="space-y-3">
            {steps.map(({ id, label, done, href, icon: Icon }) => (
              <Link
                key={id}
                href={href}
                className={`flex items-center gap-3 rounded-lg p-3 transition ${
                  done ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  done ? 'bg-green-500' : 'bg-gray-200'
                }`}>
                  <Icon className={`h-4 w-4 ${done ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <span className={`flex-1 text-sm font-medium ${done ? 'text-green-700 line-through' : 'text-gray-700'}`}>
                  {label}
                </span>
                {!done && <ChevronRight className="h-4 w-4 text-gray-400" />}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Process bar — flat prototype style */}
      <div className="card !p-5">
        <h2 className="font-semibold text-gray-900 mb-3 text-sm">{t('dashboard.processTitle')}</h2>
        <div className="flex overflow-x-auto">
          {(isCraft ? [
            { label: t('dashboard.proc.profileCreated'),  done: true },
            { label: t('dashboard.proc.docsUploaded'),    done: hasDocs },
            { label: t('dashboard.proc.profileVerified'), done: profile.is_verified },
            { label: t('dashboard.proc.offerSubmitted'),  done: false },
            { label: t('dashboard.proc.adminMatching'),   done: false },
            { label: t('dashboard.proc.contractSigned'),  done: false },
          ] : [
            { label: t('dashboard.proc.profileCreated'),  done: true },
            { label: t('dashboard.proc.requestSubmitted'), done: false },
            { label: t('dashboard.proc.adminMatching'),   done: false },
            { label: t('dashboard.proc.contractSigned'),  done: false },
            { label: t('dashboard.proc.jobInProgress'),   done: false },
          ]).map((step, idx, arr) => {
            const activeIdx = arr.findIndex(s => !s.done);
            const isActive = idx === activeIdx;
            return (
              <div
                key={idx}
                className={`flex-1 min-w-[80px] text-center text-xs font-semibold py-3 px-2 border-y first:border-l last:border-r first:rounded-l-lg last:rounded-r-lg border-r transition ${
                  step.done
                    ? 'bg-green-50 text-green-700 border-green-300'
                    : isActive
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-gray-50 text-gray-400 border-gray-200'
                }`}
              >
                {step.done ? '✓ ' : ''}{step.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite a Colleague */}
      <div className="rounded-xl border border-brand-200 bg-gradient-to-r from-brand-50 to-blue-50 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 flex-shrink-0">
          <UserPlus className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-brand-900 text-sm">{t('dashboard.inviteTitle')}</p>
          <p className="text-xs text-brand-600 mt-0.5">{t('dashboard.inviteDesc')}</p>
          <div className="mt-2 flex items-center gap-2 bg-white border border-brand-200 rounded-lg px-3 py-1.5 w-fit max-w-full">
            <span className="text-xs text-gray-600 font-mono truncate">pdrconnect.eu/register</span>
          </div>
        </div>
        <button
          onClick={handleCopyInvite}
          className={`flex-shrink-0 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-brand-600 text-white hover:bg-brand-700'
          }`}
        >
          {copied
            ? <><Check className="h-4 w-4" /> {t('dashboard.inviteCopied')}</>
            : <><Copy className="h-4 w-4" /> {t('dashboard.inviteCopy')}</>}
        </button>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isCraft ? (
          <Link href="/offers" className="card hover:shadow-md transition flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
              <Globe className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{t('nav.myOffer')}</p>
              <p className="text-xs text-gray-500">{t('dashboard.offerDesc')}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
          </Link>
        ) : (
          <Link href="/requests" className="card hover:shadow-md transition flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{t('nav.myRequests')}</p>
              <p className="text-xs text-gray-500">{t('dashboard.requestDesc')}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
          </Link>
        )}

        <Link href="/messages" className="card hover:shadow-md transition flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
            <MessageSquare className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{t('dashboard.messages')}</p>
            <p className="text-xs text-gray-500">
              {unread > 0 ? t('dashboard.unreadCount', { count: unread }) : t('dashboard.noNewMessages')}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
        </Link>

        <Link href="/documents" className="card hover:shadow-md transition flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
            <FileText className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{t('dashboard.documents')}</p>
            <p className="text-xs text-gray-500">{t('dashboard.manageFiles')}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
        </Link>
      </div>
    </div>
  );
}
