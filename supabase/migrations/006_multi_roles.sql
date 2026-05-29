-- =============================================
-- PDR Connect — Multi-role support
-- Allows professionals to hold multiple skills
-- =============================================

-- 1. Add secondary_roles column
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS secondary_roles TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_users_secondary_roles
  ON public.users USING gin(secondary_roles);

-- 2. Update handle_new_user trigger to also persist phone + secondary_roles
-- NOTE: SET search_path = public is required so the auth trigger context
-- (supabase_auth_admin) can resolve ::public.user_role correctly.
-- Without it, migration 006 would drop the search_path config from the
-- function and cause "Database error saving new user" on every signup.
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
    gdpr_consent, gdpr_consent_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'PDR_TECHNICIAN'),
    v_secondary_roles,
    COALESCE((NEW.raw_user_meta_data->>'gdpr_consent')::boolean, false),
    CASE WHEN (NEW.raw_user_meta_data->>'gdpr_consent')::boolean THEN now() ELSE NULL END
  );
  RETURN NEW;
END;
$$;
