-- =============================================
-- PDR Connect — Initial Schema
-- Operator: Cybratech-Solutions, Cyprus
-- =============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE user_role AS ENUM (
  'PDR_TECHNICIAN',
  'CAR_PAINTER',
  'PREPARER',
  'DISMANTLER'
);

CREATE TYPE doc_type AS ENUM (
  'EU_ID',
  'A1',
  'TRAVEL_DOC',
  'COMPANY_DOC'
);

CREATE TYPE doc_status AS ENUM (
  'pending',
  'verified',
  'rejected'
);

CREATE TYPE contract_language AS ENUM (
  'de', 'en', 'pt', 'el', 'es'
);

-- =============================================
-- USERS (extends auth.users)
-- =============================================

CREATE TABLE public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,          -- hidden from UI, internal only
  phone         TEXT,                   -- hidden from UI, internal only
  full_name     TEXT NOT NULL,
  role          user_role NOT NULL,
  is_premium    BOOLEAN NOT NULL DEFAULT false,
  is_verified   BOOLEAN NOT NULL DEFAULT false,
  is_admin      BOOLEAN NOT NULL DEFAULT false,
  is_blocked    BOOLEAN NOT NULL DEFAULT false,
  bypass_count  INT NOT NULL DEFAULT 0,
  available_countries TEXT[] NOT NULL DEFAULT '{}',
  services      TEXT[] NOT NULL DEFAULT '{}',
  visible_public BOOLEAN NOT NULL DEFAULT false,
  contract_pdf_url TEXT,
  avatar_url    TEXT,
  bio           TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  preferred_language contract_language NOT NULL DEFAULT 'en',
  gdpr_consent  BOOLEAN NOT NULL DEFAULT false,
  gdpr_consent_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- COMPANIES
-- =============================================

CREATE TABLE public.companies (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_name     TEXT NOT NULL,
  address          TEXT NOT NULL,
  country          TEXT NOT NULL,
  tax_number       TEXT,
  company_document_url TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- =============================================
-- DOCUMENTS
-- =============================================

CREATE TABLE public.documents (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type        doc_type NOT NULL,
  file_url    TEXT NOT NULL,
  status      doc_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.users(id),
  review_note TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- MESSAGES
-- =============================================

CREATE TABLE public.messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  original_text TEXT,              -- stored before censoring, admin-visible only
  is_flagged  BOOLEAN NOT NULL DEFAULT false,
  flag_reason TEXT,
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at     TIMESTAMPTZ,
  CONSTRAINT no_self_message CHECK (sender_id <> receiver_id)
);

CREATE INDEX idx_messages_sender   ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_messages_ts       ON public.messages(timestamp DESC);

-- =============================================
-- BYPASS VIOLATIONS LOG
-- =============================================

CREATE TABLE public.bypass_violations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message_id  UUID REFERENCES public.messages(id),
  detected_pattern TEXT NOT NULL,
  bypass_count_at_time INT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- CONTRACTS
-- =============================================

CREATE TABLE public.contracts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  pdf_url     TEXT NOT NULL,
  signed      BOOLEAN NOT NULL DEFAULT false,
  signed_at   TIMESTAMPTZ,
  language    contract_language NOT NULL DEFAULT 'en',
  version     TEXT NOT NULL DEFAULT '1.0',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- SUBSCRIPTIONS LOG
-- =============================================

CREATE TABLE public.subscription_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL,
  stripe_event_id TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- NEW USER HANDLER (called by auth trigger)
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, gdpr_consent, gdpr_consent_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'PDR_TECHNICIAN'),
    COALESCE((NEW.raw_user_meta_data->>'gdpr_consent')::boolean, false),
    CASE WHEN (NEW.raw_user_meta_data->>'gdpr_consent')::boolean THEN now() ELSE NULL END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bypass_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Helper: is current user admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.users WHERE id = auth.uid()),
    false
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: is current user premium?
CREATE OR REPLACE FUNCTION public.is_premium()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_premium FROM public.users WHERE id = auth.uid()),
    false
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- USERS policies
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_select_public" ON public.users
  FOR SELECT USING (
    is_verified = true
    AND visible_public = true
    AND is_blocked = false
  );

CREATE POLICY "users_select_admin" ON public.users
  FOR SELECT USING (public.is_admin());

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_admin" ON public.users
  FOR UPDATE USING (public.is_admin());

-- COMPANIES policies
CREATE POLICY "companies_select_own" ON public.companies
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "companies_select_admin" ON public.companies
  FOR SELECT USING (public.is_admin());

CREATE POLICY "companies_insert_own" ON public.companies
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "companies_update_own" ON public.companies
  FOR UPDATE USING (user_id = auth.uid());

-- DOCUMENTS policies
CREATE POLICY "documents_select_own" ON public.documents
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "documents_select_admin" ON public.documents
  FOR SELECT USING (public.is_admin());

CREATE POLICY "documents_insert_own" ON public.documents
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- MESSAGES policies — only premium users
CREATE POLICY "messages_select_participant" ON public.messages
  FOR SELECT USING (
    (sender_id = auth.uid() OR receiver_id = auth.uid())
    AND public.is_premium()
  );

CREATE POLICY "messages_insert_premium" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND public.is_premium()
  );

CREATE POLICY "messages_select_admin" ON public.messages
  FOR SELECT USING (public.is_admin());

-- BYPASS VIOLATIONS — admin only
CREATE POLICY "bypass_select_admin" ON public.bypass_violations
  FOR SELECT USING (public.is_admin());

CREATE POLICY "bypass_select_own" ON public.bypass_violations
  FOR SELECT USING (user_id = auth.uid());

-- CONTRACTS policies
CREATE POLICY "contracts_select_own" ON public.contracts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "contracts_select_admin" ON public.contracts
  FOR SELECT USING (public.is_admin());

CREATE POLICY "contracts_insert_own" ON public.contracts
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- SUBSCRIPTION EVENTS — admin only read
CREATE POLICY "sub_events_admin" ON public.subscription_events
  FOR SELECT USING (public.is_admin());

CREATE POLICY "sub_events_own" ON public.subscription_events
  FOR SELECT USING (user_id = auth.uid());

-- =============================================
-- STORAGE BUCKETS (run in Supabase dashboard)
-- =============================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('contracts', 'contracts', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('company-docs', 'company-docs', false);
