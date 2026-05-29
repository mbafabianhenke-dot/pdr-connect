-- ============================================================
-- 009_contact_privacy.sql
-- Contact information (email, phone) is PRIVATE.
-- Regular users can NEVER see another user's email or phone.
-- Only the admin has full access to all user data.
-- ============================================================

-- ── 1. Drop the broad public-user SELECT policy ─────────────
-- This policy allowed ANY authenticated user to query the full
-- users row (including email & phone) for any verified/visible user.
DROP POLICY IF EXISTS "users_select_public" ON public.users;

-- ── 2. Safe public-profiles view ────────────────────────────
-- Exposes only non-sensitive columns.
-- Filters to verified + publicly visible + non-blocked users.
-- Since this view runs as the view owner (postgres) it bypasses
-- users-table RLS intentionally — the WHERE clause is the guard.
DROP VIEW IF EXISTS public.user_public_profiles;
CREATE VIEW public.user_public_profiles AS
SELECT
  id,
  full_name,
  role,
  secondary_roles,
  available_countries,
  services,
  avatar_url,
  bio,
  is_premium,
  is_verified,
  visible_public,
  is_blocked
FROM public.users
WHERE visible_public = true
  AND is_verified    = true
  AND is_blocked     = false;

GRANT SELECT ON public.user_public_profiles TO authenticated, anon;

-- ── 3. Minimal name-lookup view for messaging ───────────────
-- The messages page needs to display a conversation partner's
-- name. Exposing only id + full_name + avatar is safe.
DROP VIEW IF EXISTS public.user_name_lookup;
CREATE VIEW public.user_name_lookup AS
SELECT id, full_name, avatar_url
FROM public.users
WHERE is_blocked = false;

-- Only authenticated users can look up names (not anon)
GRANT SELECT ON public.user_name_lookup TO authenticated;

-- ── 4. Verify remaining users-table policies are correct ────
-- users_select_own   → user sees their OWN full row  ✓
-- users_select_admin → admin sees ALL rows            ✓
-- (users_select_public has been removed above)
