-- ============================================================
-- 012: Fix visibility for verified users
-- Root cause: visible_public defaults to false, so approved
-- users never appear in the "Profis finden" search because
-- user_public_profiles requires is_verified=true AND
-- visible_public=true AND is_blocked=false.
-- ============================================================

-- 1. Backfill: make all already-verified non-blocked users visible
UPDATE public.users
SET visible_public = true
WHERE is_verified = true
  AND is_blocked  = false
  AND is_admin    = false;

-- 2. Change default so future approved users start visible
ALTER TABLE public.users
  ALTER COLUMN visible_public SET DEFAULT true;
