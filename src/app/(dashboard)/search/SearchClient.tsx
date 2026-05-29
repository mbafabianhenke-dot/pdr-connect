'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { CRAFT_ROLES, COUNTRIES, BUNDESLAENDER, type UserRole } from '@/types/database';
import { Search, MapPin, Briefcase, ShieldCheck } from 'lucide-react';

interface SearchResult {
  id: string;
  full_name: string;
  role: string;
  secondary_roles: string[];
  available_countries: string[];
  services: string[];
  avatar_url: string | null;
  bio: string | null;
  is_premium: boolean;
  is_verified: boolean;
  postal_code: string | null;
  bundesland: string | null;
}

interface Props {
  results: SearchResult[];
  currentRole: string;
  currentCountry: string;
  currentBundesland: string;
  isAdmin?: boolean;
}

export default function SearchClient({ results, currentRole, currentCountry, currentBundesland, isAdmin }: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('search.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('search.found', { count: results.length })}</p>
      </div>

      {/* Filters */}
      <form className="card space-y-3" method="GET">
        <div className="flex flex-wrap gap-4">
          {/* Role */}
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('search.role')}</label>
            <select name="role" defaultValue={currentRole} className="input">
              <option value="">{t('search.allRoles')}</option>
              {CRAFT_ROLES.map((value) => (
                <option key={value} value={value}>{t(`roles.${value}`)}</option>
              ))}
            </select>
          </div>

          {/* Country */}
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('search.country')}</label>
            <select name="country" defaultValue={currentCountry} className="input">
              <option value="">{t('search.allCountries')}</option>
              {COUNTRIES.map(({ code, name }) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </div>

          {/* Bundesland */}
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {t('search.bundesland')}
            </label>
            <select name="bundesland" defaultValue={currentBundesland} className="input">
              <option value="">{t('search.allBundeslaender')}</option>
              {BUNDESLAENDER.map((bl) => (
                <option key={bl} value={bl}>{bl}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <button type="submit" className="btn-primary">
            <Search className="h-4 w-4 mr-2" /> {t('search.searchBtn')}
          </button>
          {(currentRole || currentCountry || currentBundesland) && (
            <Link href="/search" className="btn-secondary">{t('search.clear')}</Link>
          )}
          {currentBundesland && (
            <span className="text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 font-medium">
              🗺️ {currentBundesland}
            </span>
          )}
        </div>
      </form>

      {/* Results */}
      {results.length === 0 ? (
        <div className="card text-center py-16">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900">{t('search.noResults')}</h3>
          <p className="text-sm text-gray-500 mt-1">{t('search.noResultsHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map(pro => (
            <div key={pro.id} className={`card hover:shadow-md transition ${isAdmin ? 'border-2 border-transparent hover:border-purple-200' : ''}`}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {pro.avatar_url ? (
                    <img src={pro.avatar_url} alt="" className="h-14 w-14 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-xl">
                      {pro.full_name?.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{pro.full_name}</h3>
                    <span className="badge-verified">✓ {t('dashboard.verified')}</span>
                  </div>

                  <div className="flex items-center gap-1 flex-wrap mt-1">
                    <Briefcase className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    <span className="text-xs font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                      {t(`roles.${pro.role}`)}
                    </span>
                    {(pro.secondary_roles ?? []).map((sr) => (
                      <span key={sr} className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                        {t(`roles.${sr}`)}
                      </span>
                    ))}
                  </div>

                  {/* Bundesland / PLZ badge */}
                  {pro.bundesland && (
                    <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 rounded-full px-2 py-0.5 mt-0.5 w-fit">
                      🗺️ {pro.bundesland}
                      {pro.postal_code && <span className="text-blue-400 ml-0.5">· {pro.postal_code}</span>}
                    </div>
                  )}

                  {(pro.available_countries as string[]).length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {(pro.available_countries as string[]).slice(0, 4).join(', ')}
                      {(pro.available_countries as string[]).length > 4 && ` +${(pro.available_countries as string[]).length - 4}`}
                    </div>
                  )}

                  {pro.bio && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{pro.bio}</p>
                  )}

                  {(pro.services as string[]).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(pro.services as string[]).slice(0, 3).map(s => (
                        <span key={s} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{s}</span>
                      ))}
                      {(pro.services as string[]).length > 3 && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                          +{(pro.services as string[]).length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Admin-only: full profile link */}
                  {isAdmin && (
                    <div className="mt-3 pt-3 border-t border-purple-100">
                      <Link
                        href={`/admin/users/${pro.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Admin: Vollständiges Profil öffnen
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
