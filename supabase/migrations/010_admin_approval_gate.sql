-- ============================================================
-- 010: Admin Approval Gate
-- Every new registration is blocked until an admin approves it.
-- • handle_new_user auto-sets verification_requested_at = now()
-- • Backfill: existing unverified non-admin users are queued too
-- • RLS added to offers / job_requests / matches tables
-- ============================================================

-- ── 1. Update handle_new_user to auto-queue new registrations ──
-- Sets verification_requested_at = now() so every new user
-- immediately appears in the admin "Verifications" tab.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_secondary_roles TEXT[];
BEGIN
  BEGIN
    SELECT ARRAY(
      SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'secondary_roles')
    ) INTO v_secondary_roles;
  EXCEPTION WHEN OTHERS THEN
    v_secondary_roles := '{}'::TEXT[];
  END;

  IF v_secondary_roles IS NULL THEN
    v_secondary_roles := '{}'::TEXT[];
  END IF;

  INSERT INTO public.users (
    id, email, phone, full_name, role, secondary_roles,
    gdpr_consent, gdpr_consent_at,
    verification_requested_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'PDR_TECHNICIAN'),
    v_secondary_roles,
    COALESCE((NEW.raw_user_meta_data->>'gdpr_consent')::boolean, false),
    CASE WHEN (NEW.raw_user_meta_data->>'gdpr_consent')::boolean THEN now() ELSE NULL END,
    now()   -- ← auto-queue: admin must approve before dashboard access
  );
  RETURN NEW;
END;
$$;

-- ── 2. Backfill existing unverified users into the pending queue ──
-- Users created before this migration have verification_requested_at = NULL.
-- Setting it to their created_at makes them visible in the admin panel.
UPDATE public.users
SET verification_requested_at = created_at
WHERE is_verified               = false
  AND verification_requested_at IS NULL
  AND is_admin                  = false;

-- ── 3. RLS for offers ──────────────────────────────────────────
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "offers_select_own"   ON public.offers;
DROP POLICY IF EXISTS "offers_select_admin" ON public.offers;
DROP POLICY IF EXISTS "offers_insert_own"   ON public.offers;
DROP POLICY IF EXISTS "offers_update_own"   ON public.offers;
DROP POLICY IF EXISTS "offers_delete_own"   ON public.offers;

CREATE POLICY "offers_select_own"   ON public.offers FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "offers_select_admin" ON public.offers FOR SELECT USING (public.is_admin());
CREATE POLICY "offers_insert_own"   ON public.offers FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "offers_update_own"   ON public.offers FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "offers_delete_own"   ON public.offers FOR DELETE USING (user_id = auth.uid());

-- ── 4. RLS for job_requests ────────────────────────────────────
ALTER TABLE public.job_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "requests_select_own"   ON public.job_requests;
DROP POLICY IF EXISTS "requests_select_admin" ON public.job_requests;
DROP POLICY IF EXISTS "requests_insert_own"   ON public.job_requests;
DROP POLICY IF EXISTS "requests_update_own"   ON public.job_requests;
DROP POLICY IF EXISTS "requests_delete_own"   ON public.job_requests;

CREATE POLICY "requests_select_own"   ON public.job_requests FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "requests_select_admin" ON public.job_requests FOR SELECT USING (public.is_admin());
CREATE POLICY "requests_insert_own"   ON public.job_requests FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "requests_update_own"   ON public.job_requests FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "requests_delete_own"   ON public.job_requests FOR DELETE USING (user_id = auth.uid());

-- ── 5. RLS for matches ─────────────────────────────────────────
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "matches_select_parties" ON public.matches;
DROP POLICY IF EXISTS "matches_select_admin"   ON public.matches;
DROP POLICY IF EXISTS "matches_insert_admin"   ON public.matches;
DROP POLICY IF EXISTS "matches_update_admin"   ON public.matches;

-- The matched technician and client can see their own match
CREATE POLICY "matches_select_parties" ON public.matches
  FOR SELECT USING (tech_user_id = auth.uid() OR client_user_id = auth.uid());
-- Admin can see and manage all matches
CREATE POLICY "matches_select_admin" ON public.matches FOR SELECT USING (public.is_admin());
CREATE POLICY "matches_insert_admin" ON public.matches FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "matches_update_admin" ON public.matches FOR UPDATE USING (public.is_admin());
