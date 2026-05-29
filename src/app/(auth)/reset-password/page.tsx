'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, CheckCircle, KeyRound, Loader2, AlertCircle } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'min8')
      .regex(/[A-Z]/, 'uppercase')
      .regex(/[0-9]/, 'number'),
    confirm: z.string().min(1),
  })
  .refine(d => d.password === d.confirm, {
    message: 'mismatch',
    path: ['confirm'],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  /* ── Verify the session exists (set by callback route) ── */
  useEffect(() => {
    const supabase = createClient();

    // Case 1: arrived via /api/auth/callback — session already set in cookies
    // Case 2: direct link with ?code= (fallback)
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      // Direct link — exchange code client-side
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) setLinkError(true);
        else setReady(true);
      });
    } else {
      // No code — check if callback already established a session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) setReady(true);
        else setLinkError(true);
      });
    }
  }, []);

  const onSubmit = async ({ password }: FormData) => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(t('auth.errors.resetFailed'));
    } else {
      // Sign out the recovery session so user logs in fresh
      await supabase.auth.signOut();
      setDone(true);
      toast.success(t('auth.resetSuccess'));
    }
  };

  /* ── Loading state ── */
  if (!ready && !linkError) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="card flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
          <p className="text-sm text-gray-500">{t('auth.verifyingLink')}</p>
        </div>
      </div>
    );
  }

  /* ── Invalid / expired link ── */
  if (linkError) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="card text-center">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('auth.linkExpiredTitle')}</h2>
          <p className="text-sm text-gray-500 mb-6">{t('auth.linkExpiredDesc')}</p>
          <Link href="/login" className="btn-primary mt-4 w-full text-center block">
            {t('auth.backToLogin')}
          </Link>
        </div>
      </div>
    );
  }

  /* ── Success screen ── */
  if (done) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="card text-center">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('auth.resetSuccess')}</h2>
          <Link href="/login" className="btn-primary mt-4 w-full text-center block">
            {t('auth.signIn')}
          </Link>
        </div>
      </div>
    );
  }

  /* ── Reset form ── */
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="card">
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
              <KeyRound className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t('auth.resetPasswordTitle')}</h1>
              <p className="text-xs text-gray-500 mt-0.5">{t('auth.resetPasswordDesc')}</p>
            </div>
          </div>
          <div className="w-36 flex-shrink-0">
            <LanguageSwitcher />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* New password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.newPassword')}
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPw ? 'text' : 'password'}
                className="input pr-10"
                placeholder={t('auth.passwordHint')}
                autoFocus
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
              <p className="text-xs text-red-500 mt-1">
                {errors.password.message === 'min8'
                  ? t('auth.errors.passwordMin')
                  : errors.password.message === 'uppercase'
                  ? t('auth.errors.passwordUppercase')
                  : t('auth.errors.passwordNumber')}
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.confirmPassword')}
            </label>
            <div className="relative">
              <input
                {...register('confirm')}
                type={showConfirm ? 'text' : 'password'}
                className="input pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirm && (
              <p className="text-xs text-red-500 mt-1">{t('auth.errors.passwordsNoMatch')}</p>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? t('auth.resettingBtn') : t('auth.resetBtn')}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            {t('auth.backToLogin')}
          </Link>
        </p>
      </div>
    </div>
  );
}
