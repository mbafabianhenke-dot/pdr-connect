'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const forgotSchema = z.object({
  resetEmail: z.string().email(),
});

type LoginData = z.infer<typeof loginSchema>;
type ForgotData = z.infer<typeof forgotSchema>;

type View = 'login' | 'forgot' | 'sent';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useSearchParams();
  const redirect     = params.get('redirect')   ?? '/dashboard';
  const emailDefault = params.get('email')       ?? '';
  const isConfirmed  = params.get('confirmed')   === '1';

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>('login');
  const [sentToEmail, setSentToEmail] = useState('');

  /* ── Login form ── */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: emailDefault },
  });

  /* ── Forgot password form ── */
  const {
    register: registerForgot,
    handleSubmit: handleForgot,
    formState: { errors: forgotErrors },
  } = useForm<ForgotData>({ resolver: zodResolver(forgotSchema) });

  /* ── Submit: sign in ── */
  const onSubmit = async ({ email, password }: LoginData) => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(
        error.message === 'Invalid login credentials'
          ? t('auth.errors.invalidCredentials')
          : error.message,
      );
    } else {
      router.push(redirect);
      router.refresh();
    }
  };

  /* ── Submit: send reset email ── */
  const onForgot = async ({ resetEmail }: ForgotData) => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSentToEmail(resetEmail);
      setView('sent');
    }
  };

  /* ════════════════════════════════════════════
     SENT VIEW — success confirmation
  ════════════════════════════════════════════ */
  if (view === 'sent') {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="card text-center">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('auth.resetEmailSent')}</h2>
          <p className="text-sm text-gray-500 mb-6">
            {t('auth.resetEmailSentDesc', { email: sentToEmail })}
          </p>
          <button
            onClick={() => setView('login')}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('auth.backToLogin')}
          </button>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════
     FORGOT VIEW — email input
  ════════════════════════════════════════════ */
  if (view === 'forgot') {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="card">
          <div className="flex justify-between items-start mb-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('auth.forgotPasswordTitle')}</h1>
              <p className="text-sm text-gray-500 mt-1">{t('auth.forgotPasswordDesc')}</p>
            </div>
            <div className="w-36 flex-shrink-0">
              <LanguageSwitcher />
            </div>
          </div>

          <form onSubmit={handleForgot(onForgot)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...registerForgot('resetEmail')}
                  type="email"
                  className="input pl-9"
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                />
              </div>
              {forgotErrors.resetEmail && (
                <p className="text-xs text-red-500 mt-1">{t('auth.errors.invalidEmail')}</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? t('auth.sendingReset') : t('auth.sendResetLink')}
            </button>
          </form>

          <button
            onClick={() => setView('login')}
            className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('auth.backToLogin')}
          </button>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════
     LOGIN VIEW — default
  ════════════════════════════════════════════ */
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="card">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('auth.welcomeBack')}</h1>
            <p className="text-sm text-gray-500 mb-6">{t('auth.signInTagline')}</p>
          </div>
          <div className="w-36 flex-shrink-0">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Email-confirmed banner — shown after clicking the confirmation link */}
        {isConfirmed && (
          <div className="rounded-xl bg-green-50 border border-green-200 p-3 flex items-center gap-2 mb-5">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-700 font-medium">{t('auth.emailConfirmedBanner')}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
            <input
              {...register('email')}
              type="email"
              className="input"
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{t('auth.errors.invalidEmail')}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">{t('auth.password')}</label>
              <button
                type="button"
                onClick={() => setView('forgot')}
                className="text-xs text-brand-600 hover:text-brand-700 hover:underline transition"
              >
                {t('auth.forgotPassword')}
              </button>
            </div>
            <div className="relative">
              <input
                {...register('password')}
                type={showPw ? 'text' : 'password'}
                className="input pr-10"
                placeholder="••••••••"
                autoComplete={isConfirmed ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{t('auth.errors.passwordRequired')}</p>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? t('auth.signingIn') : t('auth.signInBtn')}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          {t('auth.noAccount')}{' '}
          <Link href="/register" className="font-medium text-brand-600 hover:underline">
            {t('auth.createFree')}
          </Link>
        </p>
      </div>
    </div>
  );
}
