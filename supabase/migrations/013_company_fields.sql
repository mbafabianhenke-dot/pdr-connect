-- ============================================================
-- 013: Add separate company address fields + VAT ID
-- Splits the single company_address text field into
-- structured fields for street, house number, zip, country
-- and adds a VAT/IVA number field required for European firms.
-- ============================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS company_street       TEXT,
  ADD COLUMN IF NOT EXISTS company_house_number TEXT,
  ADD COLUMN IF NOT EXISTS company_zip          TEXT,
  ADD COLUMN IF NOT EXISTS company_country      TEXT,
  ADD COLUMN IF NOT EXISTS vat_id               TEXT;
