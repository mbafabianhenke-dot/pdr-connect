export type UserRole = 'PDR_TECHNICIAN' | 'CAR_PAINTER' | 'PREPARER' | 'DISMANTLER' | 'CUSTOMER' | 'ADMINISTRATOR';

// ── German Bundesländer ────────────────────────────────────────────────────
export const BUNDESLAENDER = [
  'Baden-Württemberg',
  'Bayern',
  'Berlin',
  'Brandenburg',
  'Bremen',
  'Hamburg',
  'Hessen',
  'Mecklenburg-Vorpommern',
  'Niedersachsen',
  'Nordrhein-Westfalen',
  'Rheinland-Pfalz',
  'Saarland',
  'Sachsen',
  'Sachsen-Anhalt',
  'Schleswig-Holstein',
  'Thüringen',
] as const;

export type Bundesland = typeof BUNDESLAENDER[number];

/**
 * Maps a German 5-digit PLZ to its most likely Bundesland.
 * Uses the first two digits. Edge cases at state borders default to
 * the primary state for that prefix range.
 */
export function plzToBundesland(plz: string): string {
  if (!plz || !/^\d{5}$/.test(plz.trim())) return '';
  const n = parseInt(plz.substring(0, 2), 10);

  if (n >= 1  && n <= 2)  return 'Sachsen';              // Dresden, Bautzen
  if (n === 3)            return 'Brandenburg';           // Cottbus
  if (n === 4)            return 'Sachsen';               // Leipzig (04xxx)
  if (n === 5)            return 'Sachsen-Anhalt';
  if (n === 6)            return 'Sachsen-Anhalt';        // Halle, Magdeburg
  if (n === 7)            return 'Thüringen';             // Erfurt, Jena
  if (n === 8 || n === 9) return 'Sachsen';               // Chemnitz, Zwickau
  if (n >= 10 && n <= 13) return 'Berlin';
  if (n >= 14 && n <= 16) return 'Brandenburg';           // Potsdam, Frankfurt/Oder
  if (n >= 17 && n <= 19) return 'Mecklenburg-Vorpommern';
  if (n >= 20 && n <= 22) return 'Hamburg';
  if (n >= 23 && n <= 25) return 'Schleswig-Holstein';
  if (n === 26 || n === 27) return 'Niedersachsen';       // Oldenburg, Bremerhaven
  if (n === 28)           return 'Bremen';
  if (n === 29)           return 'Niedersachsen';
  if (n === 30 || n === 31) return 'Niedersachsen';       // Hannover
  if (n === 32 || n === 33) return 'Nordrhein-Westfalen'; // Bielefeld, Paderborn
  if (n >= 34 && n <= 36) return 'Hessen';               // Kassel, Fulda
  if (n === 37 || n === 38) return 'Niedersachsen';       // Göttingen, Braunschweig
  if (n === 39)           return 'Sachsen-Anhalt';        // Magdeburg
  if (n === 49)           return 'Niedersachsen';         // Osnabrück (before NRW range!)
  if (n >= 40 && n <= 53) return 'Nordrhein-Westfalen';  // Düsseldorf…Bonn
  if (n >= 54 && n <= 56) return 'Rheinland-Pfalz';      // Trier, Mainz, Koblenz
  if (n >= 57 && n <= 59) return 'Nordrhein-Westfalen';  // Siegen, Hagen
  if (n >= 60 && n <= 65) return 'Hessen';               // Frankfurt, Darmstadt
  if (n === 66)           return 'Saarland';
  if (n === 67)           return 'Rheinland-Pfalz';       // Kaiserslautern, Ludwigshafen
  if (n >= 68 && n <= 79) return 'Baden-Württemberg';    // Mannheim…Freiburg
  if (n >= 80 && n <= 87) return 'Bayern';               // München…Kempten
  if (n === 88 || n === 89) return 'Baden-Württemberg';  // Ravensburg, Ulm/BW
  if (n >= 90 && n <= 97) return 'Bayern';               // Nürnberg…Würzburg
  if (n >= 98 && n <= 99) return 'Thüringen';            // Suhl, Weimar
  return '';
}

/** Roles that are searchable craft professionals (excludes CUSTOMER) */
export const CRAFT_ROLES: UserRole[] = ['PDR_TECHNICIAN', 'CAR_PAINTER', 'PREPARER', 'DISMANTLER'];
export type DocType = 'EU_ID' | 'A1' | 'TRAVEL_DOC' | 'COMPANY_DOC' | 'GALLERY_IMAGE' | 'AVATAR' | 'WORK_VISA';
export type DocStatus = 'pending' | 'verified' | 'rejected';
export type ContractLanguage = 'de' | 'en' | 'el' | 'es';

export interface ExperienceEntry {
  id: string;
  company: string;
  position: string;
  from_year: string;
  to_year: string;
  is_current: boolean;
  description: string;
}

export interface ReferenceEntry {
  id: string;
  referee_name: string;
  referee_company: string;
  ref_text: string;
  rating: number; // 1–5
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  full_name: string;
  role: UserRole;
  is_premium: boolean;
  is_verified: boolean;
  is_admin: boolean;
  is_blocked: boolean;
  bypass_count: number;
  available_countries: string[];
  services: string[];
  visible_public: boolean;
  contract_pdf_url?: string;
  avatar_url?: string;
  bio?: string;
  // Multi-role support (migration 006)
  secondary_roles?: string[];
  // Extended profile fields (migration 005)
  company_name?: string;
  company_address?: string;
  work_experience?: ExperienceEntry[];
  gallery_urls?: string[];
  profile_references?: ReferenceEntry[];
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  preferred_language: ContractLanguage;
  gdpr_consent: boolean;
  gdpr_consent_at?: string;
  /** German postal code (5 digits) */
  postal_code?: string;
  /** Derived Bundesland from postal code — set on save */
  bundesland?: string;
  /** Separate structured company address fields (migration 013) */
  company_street?: string;
  company_house_number?: string;
  company_zip?: string;
  company_country?: string;
  /** VAT / IVA number — required for European companies */
  vat_id?: string;
  /** Set when user clicks "Verifizieren lassen" — cleared on admin approve/reject */
  verification_requested_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  user_id: string;
  company_name: string;
  address: string;
  country: string;
  tax_number?: string;
  company_document_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  type: DocType;
  file_url: string;
  status: DocStatus;
  reviewed_by?: string;
  review_note?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  original_text?: string;
  is_flagged: boolean;
  flag_reason?: string;
  timestamp: string;
  read_at?: string;
}

export interface BypassViolation {
  id: string;
  user_id: string;
  message_id?: string;
  detected_pattern: string;
  bypass_count_at_time: number;
  created_at: string;
}

export interface Contract {
  id: string;
  user_id: string;
  pdf_url: string;
  signed: boolean;
  signed_at?: string;
  language: ContractLanguage;
  version: string;
  created_at: string;
}

// Public profile — never includes email/phone
export interface PublicProfile {
  id: string;
  full_name?: string; // only for premium viewers
  role: UserRole;
  available_countries: string[];
  services: string[];
  avatar_url?: string;
  bio?: string;
  is_verified: boolean;
  is_premium: boolean;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  PDR_TECHNICIAN: 'PDR Technician',
  CAR_PAINTER: 'Car Painter',
  PREPARER: 'Preparer',
  DISMANTLER: 'Dismantler',
  CUSTOMER: 'Customer',
  ADMINISTRATOR: 'Administrator',
};

export const COUNTRIES = [
  // ── Europe ────────────────────────────────────────────────────────────────
  { code: 'AL', name: 'Albania' },
  { code: 'AD', name: 'Andorra' },
  { code: 'AT', name: 'Austria' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BY', name: 'Belarus' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BA', name: 'Bosnia & Herzegovina' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EE', name: 'Estonia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'GE', name: 'Georgia' },
  { code: 'DE', name: 'Germany' },
  { code: 'GR', name: 'Greece' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'XK', name: 'Kosovo' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MT', name: 'Malta' },
  { code: 'MD', name: 'Moldova' },
  { code: 'MC', name: 'Monaco' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'MK', name: 'North Macedonia' },
  { code: 'NO', name: 'Norway' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' },
  { code: 'SM', name: 'San Marino' },
  { code: 'RS', name: 'Serbia' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'ES', name: 'Spain' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'TR', name: 'Turkey' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'GB', name: 'United Kingdom' },
  // ── North America ─────────────────────────────────────────────────────────
  { code: 'CA', name: 'Canada' },
  { code: 'MX', name: 'Mexico' },
  { code: 'US', name: 'United States' },
  // ── Central America & Caribbean ───────────────────────────────────────────
  { code: 'BS', name: 'Bahamas' },
  { code: 'BB', name: 'Barbados' },
  { code: 'BZ', name: 'Belize' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'CU', name: 'Cuba' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'HT', name: 'Haiti' },
  { code: 'HN', name: 'Honduras' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'PA', name: 'Panama' },
  { code: 'TT', name: 'Trinidad & Tobago' },
  // ── South America ─────────────────────────────────────────────────────────
  { code: 'AR', name: 'Argentina' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BR', name: 'Brazil' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'GY', name: 'Guyana' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Peru' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'VE', name: 'Venezuela' },
  // ── Asia ─────────────────────────────────────────────────────────────────
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AM', name: 'Armenia' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'CN', name: 'China' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IL', name: 'Israel' },
  { code: 'JP', name: 'Japan' },
  { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'NP', name: 'Nepal' },
  { code: 'OM', name: 'Oman' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PH', name: 'Philippines' },
  { code: 'QA', name: 'Qatar' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'KR', name: 'South Korea' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'SY', name: 'Syria' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TH', name: 'Thailand' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'YE', name: 'Yemen' },
  // ── Oceania ───────────────────────────────────────────────────────────────
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
];

/**
 * European country codes — used for mandatory VAT/IVA field validation.
 * Includes all geographically European countries.
 */
export const EUROPEAN_COUNTRY_CODES = new Set([
  'AL','AD','AT','AZ','BY','BE','BA','BG','HR','CY','CZ','DK','EE','FI',
  'FR','GE','DE','GR','HU','IS','IE','IT','XK','LV','LI','LT','LU','MT',
  'MD','MC','ME','NL','MK','NO','PL','PT','RO','RU','SM','RS','SK','SI',
  'ES','SE','CH','TR','UA','GB',
]);

/** Phone dial codes for country selector — sorted by dial code length desc for parsing */
export const PHONE_CODES: { code: string; flag: string; name: string }[] = [
  { code: '+1',   flag: '🇺🇸', name: 'US / CA' },
  { code: '+7',   flag: '🇷🇺', name: 'Russia / KZ' },
  { code: '+30',  flag: '🇬🇷', name: 'Greece' },
  { code: '+31',  flag: '🇳🇱', name: 'Netherlands' },
  { code: '+32',  flag: '🇧🇪', name: 'Belgium' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+34',  flag: '🇪🇸', name: 'Spain' },
  { code: '+36',  flag: '🇭🇺', name: 'Hungary' },
  { code: '+39',  flag: '🇮🇹', name: 'Italy' },
  { code: '+40',  flag: '🇷🇴', name: 'Romania' },
  { code: '+41',  flag: '🇨🇭', name: 'Switzerland' },
  { code: '+43',  flag: '🇦🇹', name: 'Austria' },
  { code: '+44',  flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+45',  flag: '🇩🇰', name: 'Denmark' },
  { code: '+46',  flag: '🇸🇪', name: 'Sweden' },
  { code: '+47',  flag: '🇳🇴', name: 'Norway' },
  { code: '+48',  flag: '🇵🇱', name: 'Poland' },
  { code: '+49',  flag: '🇩🇪', name: 'Germany' },
  { code: '+51',  flag: '🇵🇪', name: 'Peru' },
  { code: '+52',  flag: '🇲🇽', name: 'Mexico' },
  { code: '+53',  flag: '🇨🇺', name: 'Cuba' },
  { code: '+54',  flag: '🇦🇷', name: 'Argentina' },
  { code: '+55',  flag: '🇧🇷', name: 'Brazil' },
  { code: '+56',  flag: '🇨🇱', name: 'Chile' },
  { code: '+57',  flag: '🇨🇴', name: 'Colombia' },
  { code: '+58',  flag: '🇻🇪', name: 'Venezuela' },
  { code: '+60',  flag: '🇲🇾', name: 'Malaysia' },
  { code: '+61',  flag: '🇦🇺', name: 'Australia' },
  { code: '+62',  flag: '🇮🇩', name: 'Indonesia' },
  { code: '+63',  flag: '🇵🇭', name: 'Philippines' },
  { code: '+64',  flag: '🇳🇿', name: 'New Zealand' },
  { code: '+65',  flag: '🇸🇬', name: 'Singapore' },
  { code: '+66',  flag: '🇹🇭', name: 'Thailand' },
  { code: '+81',  flag: '🇯🇵', name: 'Japan' },
  { code: '+82',  flag: '🇰🇷', name: 'South Korea' },
  { code: '+84',  flag: '🇻🇳', name: 'Vietnam' },
  { code: '+86',  flag: '🇨🇳', name: 'China' },
  { code: '+90',  flag: '🇹🇷', name: 'Turkey' },
  { code: '+91',  flag: '🇮🇳', name: 'India' },
  { code: '+92',  flag: '🇵🇰', name: 'Pakistan' },
  { code: '+93',  flag: '🇦🇫', name: 'Afghanistan' },
  { code: '+94',  flag: '🇱🇰', name: 'Sri Lanka' },
  { code: '+95',  flag: '🇲🇲', name: 'Myanmar' },
  { code: '+98',  flag: '🇮🇷', name: 'Iran' },
  { code: '+212', flag: '🇲🇦', name: 'Morocco' },
  { code: '+216', flag: '🇹🇳', name: 'Tunisia' },
  { code: '+220', flag: '🇬🇲', name: 'Gambia' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+352', flag: '🇱🇺', name: 'Luxembourg' },
  { code: '+353', flag: '🇮🇪', name: 'Ireland' },
  { code: '+354', flag: '🇮🇸', name: 'Iceland' },
  { code: '+355', flag: '🇦🇱', name: 'Albania' },
  { code: '+356', flag: '🇲🇹', name: 'Malta' },
  { code: '+357', flag: '🇨🇾', name: 'Cyprus' },
  { code: '+358', flag: '🇫🇮', name: 'Finland' },
  { code: '+359', flag: '🇧🇬', name: 'Bulgaria' },
  { code: '+370', flag: '🇱🇹', name: 'Lithuania' },
  { code: '+371', flag: '🇱🇻', name: 'Latvia' },
  { code: '+372', flag: '🇪🇪', name: 'Estonia' },
  { code: '+373', flag: '🇲🇩', name: 'Moldova' },
  { code: '+374', flag: '🇦🇲', name: 'Armenia' },
  { code: '+375', flag: '🇧🇾', name: 'Belarus' },
  { code: '+376', flag: '🇦🇩', name: 'Andorra' },
  { code: '+377', flag: '🇲🇨', name: 'Monaco' },
  { code: '+380', flag: '🇺🇦', name: 'Ukraine' },
  { code: '+381', flag: '🇷🇸', name: 'Serbia' },
  { code: '+382', flag: '🇲🇪', name: 'Montenegro' },
  { code: '+383', flag: '🇽🇰', name: 'Kosovo' },
  { code: '+385', flag: '🇭🇷', name: 'Croatia' },
  { code: '+386', flag: '🇸🇮', name: 'Slovenia' },
  { code: '+387', flag: '🇧🇦', name: 'Bosnia & Herzegovina' },
  { code: '+389', flag: '🇲🇰', name: 'North Macedonia' },
  { code: '+420', flag: '🇨🇿', name: 'Czech Republic' },
  { code: '+421', flag: '🇸🇰', name: 'Slovakia' },
  { code: '+423', flag: '🇱🇮', name: 'Liechtenstein' },
  { code: '+501', flag: '🇧🇿', name: 'Belize' },
  { code: '+502', flag: '🇬🇹', name: 'Guatemala' },
  { code: '+503', flag: '🇸🇻', name: 'El Salvador' },
  { code: '+504', flag: '🇭🇳', name: 'Honduras' },
  { code: '+505', flag: '🇳🇮', name: 'Nicaragua' },
  { code: '+506', flag: '🇨🇷', name: 'Costa Rica' },
  { code: '+507', flag: '🇵🇦', name: 'Panama' },
  { code: '+509', flag: '🇭🇹', name: 'Haiti' },
  { code: '+591', flag: '🇧🇴', name: 'Bolivia' },
  { code: '+592', flag: '🇬🇾', name: 'Guyana' },
  { code: '+593', flag: '🇪🇨', name: 'Ecuador' },
  { code: '+595', flag: '🇵🇾', name: 'Paraguay' },
  { code: '+598', flag: '🇺🇾', name: 'Uruguay' },
  { code: '+852', flag: '🇭🇰', name: 'Hong Kong' },
  { code: '+855', flag: '🇰🇭', name: 'Cambodia' },
  { code: '+856', flag: '🇱🇦', name: 'Laos' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+886', flag: '🇹🇼', name: 'Taiwan' },
  { code: '+960', flag: '🇲🇻', name: 'Maldives' },
  { code: '+961', flag: '🇱🇧', name: 'Lebanon' },
  { code: '+962', flag: '🇯🇴', name: 'Jordan' },
  { code: '+963', flag: '🇸🇾', name: 'Syria' },
  { code: '+964', flag: '🇮🇶', name: 'Iraq' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+967', flag: '🇾🇪', name: 'Yemen' },
  { code: '+968', flag: '🇴🇲', name: 'Oman' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+972', flag: '🇮🇱', name: 'Israel' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { code: '+976', flag: '🇲🇳', name: 'Mongolia' },
  { code: '+977', flag: '🇳🇵', name: 'Nepal' },
  { code: '+992', flag: '🇹🇯', name: 'Tajikistan' },
  { code: '+993', flag: '🇹🇲', name: 'Turkmenistan' },
  { code: '+994', flag: '🇦🇿', name: 'Azerbaijan' },
  { code: '+995', flag: '🇬🇪', name: 'Georgia' },
  { code: '+996', flag: '🇰🇬', name: 'Kyrgyzstan' },
  { code: '+998', flag: '🇺🇿', name: 'Uzbekistan' },
];

/** Parse a stored phone string (e.g. "+49 123456") into dial code + number */
export function parsePhone(raw: string): { code: string; num: string } {
  const sorted = [...PHONE_CODES].sort((a, b) => b.code.length - a.code.length);
  for (const { code } of sorted) {
    if (raw.startsWith(code)) return { code, num: raw.slice(code.length).trim() };
  }
  return { code: '+49', num: raw };
}
