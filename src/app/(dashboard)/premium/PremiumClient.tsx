'use client';

import { useTranslation } from 'react-i18next';
import { CheckCircle, Clock, Eye, MessageSquare, Search, Zap, Globe } from 'lucide-react';

export default function PremiumClient() {
  const { t } = useTranslation();

  const FEATURES = [
    { icon: Eye,           label: t('premium.feat1') },
    { icon: MessageSquare, label: t('premium.feat2') },
    { icon: Search,        label: t('premium.feat3') },
    { icon: Zap,           label: t('premium.feat4') },
    { icon: Globe,         label: t('premium.feat5') },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('premium.freeTitle')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('premium.freeSubtitle')}</p>
      </div>

      {/* Free badge */}
      <div className="card border-brand-300 border-2 bg-gradient-to-br from-brand-50 to-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
            <CheckCircle className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <p className="font-bold text-xl text-gray-900">{t('premium.freeActive')}</p>
            <p className="text-sm text-brand-600 font-medium">{t('premium.freeLaunch')}</p>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {FEATURES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              {label}
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-brand-600 p-4 text-white text-center">
          <p className="text-3xl font-extrabold">€0</p>
          <p className="text-brand-200 text-sm mt-1">{t('premium.freeForNow')}</p>
        </div>
      </div>

      {/* Coming soon note */}
      <div className="card bg-gray-50 border border-gray-200">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-200 flex-shrink-0">
            <Clock className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{t('premium.comingSoonTitle')}</p>
            <p className="text-gray-500 text-sm mt-0.5">{t('premium.comingSoonDesc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
