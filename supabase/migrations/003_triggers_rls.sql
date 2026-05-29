-- Triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS trg_companies_updated_at ON public.companies;
DROP TRIGGER IF EXISTS trg_documents_updated_at ON public.documents;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- New user handler
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, gdpr_consent, gdpr_consent_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'PDR_TECHNICIAN'),
    COALESCE((NEW.raw_user_meta_data->>'gdpr_consent')::boolean, false),
    CASE WHEN (NEW.raw_user_meta_data->>'gdpr_consent')::boolean THEN now() ELSE NULL END
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS enable
ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bypass_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE((SELECT is_admin FROM public.users WHERE id = auth.uid()), false);
$$;

CREATE OR REPLACE FUNCTION public.is_premium()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE((SELECT is_premium FROM public.users WHERE id = auth.uid()), false);
$$;

-- Drop existing policies (clean slate)
DROP POLICY IF EXISTS "users_select_own"    ON public.users;
DROP POLICY IF EXISTS "users_select_public" ON public.users;
DROP POLICY IF EXISTS "users_select_admin"  ON public.users;
DROP POLICY IF EXISTS "users_update_own"    ON public.users;
DROP POLICY IF EXISTS "users_update_admin"  ON public.users;

DROP POLICY IF EXISTS "companies_select_own"   ON public.companies;
DROP POLICY IF EXISTS "companies_select_admin" ON public.companies;
DROP POLICY IF EXISTS "companies_insert_own"   ON public.companies;
DROP POLICY IF EXISTS "companies_update_own"   ON public.companies;

DROP POLICY IF EXISTS "documents_select_own"   ON public.documents;
DROP POLICY IF EXISTS "documents_select_admin" ON public.documents;
DROP POLICY IF EXISTS "documents_insert_own"   ON public.documents;

DROP POLICY IF EXISTS "messages_select_participant" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_premium"     ON public.messages;
DROP POLICY IF EXISTS "messages_select_admin"       ON public.messages;

DROP POLICY IF EXISTS "bypass_select_admin" ON public.bypass_violations;
DROP POLICY IF EXISTS "bypass_select_own"   ON public.bypass_violations;

DROP POLICY IF EXISTS "contracts_select_own"   ON public.contracts;
DROP POLICY IF EXISTS "contracts_select_admin" ON public.contracts;
DROP POLICY IF EXISTS "contracts_insert_own"   ON public.contracts;

DROP POLICY IF EXISTS "sub_events_admin" ON public.subscription_events;
DROP POLICY IF EXISTS "sub_events_own"   ON public.subscription_events;

-- USERS policies
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (id = auth.uid());
CREATE POLICY "users_select_public" ON public.users FOR SELECT USING (is_verified = true AND visible_public = true AND is_blocked = false);
CREATE POLICY "users_select_admin" ON public.users FOR SELECT USING (public.is_admin());
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "users_update_admin" ON public.users FOR UPDATE USING (public.is_admin());

-- COMPANIES policies
CREATE POLICY "companies_select_own"   ON public.companies FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "companies_select_admin" ON public.companies FOR SELECT USING (public.is_admin());
CREATE POLICY "companies_insert_own"   ON public.companies FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "companies_update_own"   ON public.companies FOR UPDATE USING (user_id = auth.uid());

-- DOCUMENTS policies
CREATE POLICY "documents_select_own"   ON public.documents FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "documents_select_admin" ON public.documents FOR SELECT USING (public.is_admin());
CREATE POLICY "documents_insert_own"   ON public.documents FOR INSERT WITH CHECK (user_id = auth.uid());

-- MESSAGES policies
CREATE POLICY "messages_select_participant" ON public.messages FOR SELECT USING ((sender_id = auth.uid() OR receiver_id = auth.uid()) AND public.is_premium());
CREATE POLICY "messages_insert_premium"     ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid() AND public.is_premium());
CREATE POLICY "messages_select_admin"       ON public.messages FOR SELECT USING (public.is_admin());

-- BYPASS VIOLATIONS
CREATE POLICY "bypass_select_admin" ON public.bypass_violations FOR SELECT USING (public.is_admin());
CREATE POLICY "bypass_select_own"   ON public.bypass_violations FOR SELECT USING (user_id = auth.uid());

-- CONTRACTS
CREATE POLICY "contracts_select_own"   ON public.contracts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "contracts_select_admin" ON public.contracts FOR SELECT USING (public.is_admin());
CREATE POLICY "contracts_insert_own"   ON public.contracts FOR INSERT WITH CHECK (user_id = auth.uid());

-- SUBSCRIPTION EVENTS
CREATE POLICY "sub_events_admin" ON public.subscription_events FOR SELECT USING (public.is_admin());
CREATE POLICY "sub_events_own"   ON public.subscription_events FOR SELECT USING (user_id = auth.uid());

-- Bypass count RPC
CREATE OR REPLACE FUNCTION public.increment_bypass_count(user_id UUID)
RETURNS INT AS $$
DECLARE new_count INT;
BEGIN
  UPDATE public.users
  SET bypass_count = bypass_count + 1,
      is_blocked = CASE WHEN bypass_count + 1 >= 5 THEN true ELSE is_blocked END
  WHERE id = user_id
  RETURNING bypass_count INTO new_count;
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION public.increment_bypass_count(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_bypass_count(UUID) TO authenticated;

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('contracts', 'contracts', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('company-docs', 'company-docs', false) ON CONFLICT (id) DO NOTHING;
