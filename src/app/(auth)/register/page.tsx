'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import type { UserRole } from '@/types/database';
import { Eye, EyeOff, Check } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const CRAFT_ROLE_KEYS: { value: UserRole; icon: string; isImg?: boolean; grad?: string }[] = [
  { value: 'PDR_TECHNICIAN', icon: '/icons/pdr-technician.png', isImg: true, grad: 'from-brand-600 to-brand-800' },
  { value: 'CAR_PAINTER',    icon: '/icons/car-painter.png',    isImg: true, grad: 'from-slate-600 to-brand-700' },
  { value: 'PREPARER',       icon: '/icons/preparer.png',       isImg: true, grad: 'from-brand-700 to-slate-700' },
  { value: 'DISMANTLER',     icon: '/icons/dismantler.png',     isImg: true, grad: 'from-slate-500 to-slate-700' },
];

const schema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const [showPw, setShowPw]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [done, setDone]             = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['PDR_TECHNICIAN']);
  const [rolesError, setRolesError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const toggleCraftRole = (role: string) => {
    setRolesError('');
    setSelectedRoles(prev => {
      const withoutCustomer = prev.filter(r => r !== 'CUSTOMER');
      if (withoutCustomer.includes(role)) {
        const next = withoutCustomer.filter(r => r !== role);
        return next.length > 0 ? next : [role];
      }
      return [...withoutCustomer, role];
    });
  };

  const onSubmit = async (data: FormData) => {
    if (selectedRoles.length === 0) { setRolesError(t('auth.errors.rolesRequired')); return; }
    setLoading(true);

    const primaryRole = selectedRoles[0];
    const secondaryRoles = selectedRoles.slice(1);

    // Use the server-side register endpoint which:
    // 1. Creates the user via admin API (bypasses Supabase email rate limits)
    // 2. Generates a signed confirmation link
    // 3. Sends the branded email via Resend API directly — reliable delivery
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        role: primaryRole,
        secondary_roles: secondaryRoles,
        lang: i18n.language,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      const msg: string = json?.error ?? 'Registration failed';
      // "already registered" → tell user to sign in
      if (msg.toLowerCase().includes('already')) {
        toast.error(t('auth.errors.emailAlreadyRegistered'));
      } else {
        toast.error(msg);
      }
      return;
    }

    setDone(true);
  };

  if (done) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="card text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{t('auth.checkEmail')}</h2>
          <p className="text-gray-600 text-sm">{t('auth.checkEmailDesc')}</p>
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-left">
            <p className="text-sm text-blue-700">
              <strong>{t('auth.afterEmailTitle')}:</strong> {t('auth.afterEmailDesc')}
            </p>
          </div>
          <Link href="/login" className="btn-primary w-full text-center block">
            {t('auth.backToSignIn')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="card">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('auth.createAccount')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('auth.tagline')}</p>
          </div>
          <div className="w-36 flex-shrink-0">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-6 text-xs text-gray-400">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white font-bold text-xs">1</span>
          <span className="font-medium text-brand-700">{t('auth.createAccountStep')}</span>
          <div className="h-px flex-1 bg-gray-200" />
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-500 font-bold text-xs">2</span>
          <span>{t('auth.companyDataStep')}</span>
          <div className="h-px flex-1 bg-gray-200" />
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-500 font-bold text-xs">3</span>
          <span>{t('auth.termsStep')}</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('onboarding.step1.contactName')} <span className="text-red-400">*</span>
            </label>
            <input {...register('full_name')} className="input" placeholder={t('profile.contactNameEx')} />
            {errors.full_name && <p className="text-xs text-red-500 mt-1">{t('auth.errors.fullNameMin')}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.email')} <span className="text-red-400">*</span>
            </label>
            <input {...register('email')} type="email" className="input" placeholder={t('auth.emailPlaceholder')} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{t('auth.errors.invalidEmail')}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.password')} <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPw ? 'text' : 'password'}
                className="input pr-10"
                placeholder={t('auth.passwordHint')}
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.password.type === 'too_small' ? t('auth.errors.passwordMin')
                  : t('auth.errors.passwordUppercase')}
              </p>
            )}
          </div>

          {/* Role selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.yourRole')} <span className="text-red-400">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">{t('auth.selectMultipleRoles')}</p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              {CRAFT_ROLE_KEYS.map(({ value, icon, isImg, grad }) => {
                const selected = selectedRoles.includes(value);
                const isPrimary = selectedRoles[0] === value;
                return (
                  <button key={value} type="button" onClick={() => toggleCraftRole(value)}
                    className={`rounded-xl border-2 p-3 text-left transition relative ${
                      selected ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {selected && (
                      <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-brand-600 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    {isPrimary && selectedRoles.length > 1 && (
                      <span className="absolute top-2 left-2 text-xs font-semibold text-brand-600 bg-brand-100 px-1.5 py-0.5 rounded-full leading-tight">
                        {t('auth.primaryRole')}
                      </span>
                    )}
                    <div className={`mb-2 ${isPrimary && selectedRoles.length > 1 ? 'mt-5' : ''}`}>
                      {isImg && grad ? (
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow">
                          <img src={icon} alt={value} className="absolute inset-0 w-full h-full object-cover" />
                          <div className={`absolute inset-0 bg-gradient-to-br ${grad} opacity-20`} />
                        </div>
                      ) : (
                        <span className="text-2xl">{icon}</span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-gray-900">{t(`roles.${value}`)}</div>
                    <div className="text-xs text-gray-500">{t(`roles.${value}_desc`)}</div>
                  </button>
                );
              })}
            </div>

            <button type="button"
              onClick={() => { setSelectedRoles(['CUSTOMER']); setRolesError(''); }}
              className={`w-full rounded-xl border-2 p-3 text-left transition relative ${
                selectedRoles[0] === 'CUSTOMER' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {selectedRoles[0] === 'CUSTOMER' && (
                <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-brand-600 flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              <div className="mb-1">
                <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow">
                  <img src="/icons/customer.png" alt="Customer" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-brand-800 opacity-20" />
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-900">{t('roles.CUSTOMER')}</div>
              <div className="text-xs text-gray-500">{t('roles.CUSTOMER_desc')}</div>
            </button>

            {rolesError && <p className="text-xs text-red-500 mt-2">{rolesError}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? t('auth.creatingBtn') : t('auth.createAccountBtn')}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          {t('auth.alreadyHave')}{' '}
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            {t('auth.signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
}
