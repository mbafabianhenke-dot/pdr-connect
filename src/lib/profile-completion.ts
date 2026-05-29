/**
 * Shared profile-completion logic.
 * Used in both the frontend (profile page banner) and backend (cron reminder).
 */

export type ProfileLang = 'en' | 'de' | 'es' | 'el';

export interface CompletionStep {
  key: string;
  labels: Record<ProfileLang, string>;
  done: boolean;
  tab: 'overview' | 'settings';
}

export interface ProfileCompletion {
  complete: boolean;
  doneCount: number;
  total: 5;
  steps: CompletionStep[];
}

export function getProfileCompletion(
  user: Record<string, any> | null,
  documents: Array<{ type: string }>,
): ProfileCompletion {
  const isCustomer = user?.role === 'CUSTOMER';

  const steps: CompletionStep[] = [
    {
      key: 'company_info',
      labels: {
        en: 'Company information',
        de: 'Firmendaten',
        es: 'Datos de empresa',
        el: 'Στοιχεία εταιρείας',
      },
      done: !!(
        user?.company_name?.trim() &&
        user?.company_street?.trim() &&
        user?.company_house_number?.trim() &&
        user?.company_zip?.trim() &&
        user?.company_country
      ),
      tab: 'overview',
    },
    {
      key: 'company_doc',
      labels: {
        en: 'Company document',
        de: 'Firmenunterlage',
        es: 'Documento de empresa',
        el: 'Έγγραφο εταιρείας',
      },
      done: documents.some(d => d.type === 'COMPANY_DOC'),
      tab: 'overview',
    },
    {
      key: 'services',
      labels: {
        en: 'Services / Skills (min. 1)',
        de: 'Dienstleistungen (min. 1)',
        es: 'Servicios (mín. 1)',
        el: 'Υπηρεσίες (τουλ. 1)',
      },
      // CUSTOMER role has no services — auto-done
      done: isCustomer || (Array.isArray(user?.services) && user.services.length > 0),
      tab: 'settings',
    },
    {
      key: 'countries',
      labels: {
        en: 'Available countries (min. 1)',
        de: 'Verfügbare Länder (min. 1)',
        es: 'Países disponibles (mín. 1)',
        el: 'Διαθέσιμες χώρες (τουλ. 1)',
      },
      done: Array.isArray(user?.available_countries) && user.available_countries.length > 0,
      tab: 'settings',
    },
    {
      key: 'identity_doc',
      labels: {
        en: 'Passport or EU ID',
        de: 'Reisepass oder EU-Ausweis',
        es: 'Pasaporte o DNI de la UE',
        el: 'Διαβατήριο ή ταυτότητα ΕΕ',
      },
      done: documents.some(d => d.type === 'IDENTITY_DOC'),
      tab: 'overview',
    },
  ];

  const doneCount = steps.filter(s => s.done).length;
  return { complete: doneCount === 5, doneCount, total: 5, steps };
}
