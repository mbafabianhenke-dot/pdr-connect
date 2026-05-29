-- =============================================
-- PDR Connect — Profile Extensions
-- Adds company info, work experience, gallery
-- images and references to user profiles
-- =============================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS company_name      TEXT,
  ADD COLUMN IF NOT EXISTS company_address   TEXT,
  ADD COLUMN IF NOT EXISTS work_experience   JSONB        NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS gallery_urls      TEXT[]       NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS profile_references JSONB       NOT NULL DEFAULT '[]'::jsonb;

-- Index for JSONB search (optional but useful for admin queries)
CREATE INDEX IF NOT EXISTS idx_users_work_experience     ON public.users USING gin(work_experience);
CREATE INDEX IF NOT EXISTS idx_users_profile_references  ON public.users USING gin(profile_references);

-- =============================================
-- STORAGE: gallery bucket (public)
-- Run once in Supabase Dashboard → Storage:
-- INSERT INTO storage.buckets (id, name, public)
--   VALUES ('gallery', 'gallery', true)
-- ON CONFLICT DO NOTHING;
-- =============================================

-- Storage policy: users can upload their own gallery images
-- (add in Supabase Dashboard under Storage → gallery → Policies)
-- Policy name: "gallery_insert_own"
-- Definition: (storage.foldername(name))[1] = auth.uid()::text
