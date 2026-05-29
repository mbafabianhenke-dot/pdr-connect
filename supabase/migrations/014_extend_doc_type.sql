-- ============================================================
-- 014: Extend doc_type enum + admin document policies
--
-- 1. Add GALLERY_IMAGE and AVATAR to the doc_type enum so that
--    profile-page uploads (gallery photos, profile pictures) can
--    be saved to the documents table for admin approval.
--
-- 2. Add documents_update_admin policy so admins can approve /
--    reject documents from both browser clients and API routes.
-- ============================================================

-- ── 1. Extend the enum ──────────────────────────────────────
-- ALTER TYPE … ADD VALUE is non-transactional in Postgres, so
-- it must NOT be wrapped in a BEGIN/COMMIT block.
-- IF NOT EXISTS avoids errors on re-runs.
ALTER TYPE public.doc_type ADD VALUE IF NOT EXISTS 'GALLERY_IMAGE';
ALTER TYPE public.doc_type ADD VALUE IF NOT EXISTS 'AVATAR';

-- ── 2. Admin update policy for documents ────────────────────
DROP POLICY IF EXISTS "documents_update_admin" ON public.documents;
CREATE POLICY "documents_update_admin"
  ON public.documents
  FOR UPDATE
  USING (public.is_admin());
