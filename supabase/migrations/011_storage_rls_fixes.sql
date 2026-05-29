-- ============================================================
-- 011: Storage RLS Policies + Documents delete policy
-- Without storage policies users cannot upload ANY files.
-- The "new row violates row-level security policy" error on
-- document / image upload is caused by missing storage.objects
-- INSERT policies for authenticated users.
-- ============================================================

-- ── 1. AVATARS bucket ─────────────────────────────────────
-- Public read (bucket is already public=true, but we need
-- an explicit SELECT policy for RLS)

DROP POLICY IF EXISTS "avatars_select_public"    ON storage.objects;
DROP POLICY IF EXISTS "avatars_insert_own"        ON storage.objects;
DROP POLICY IF EXISTS "avatars_update_own"        ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete_own"        ON storage.objects;

-- Anyone (including anon) can read public avatar files
CREATE POLICY "avatars_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Authenticated users can upload into their own folder (uid/*)
CREATE POLICY "avatars_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can update their own files
CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can delete their own files
CREATE POLICY "avatars_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── 2. DOCUMENTS bucket ───────────────────────────────────

DROP POLICY IF EXISTS "documents_storage_select_own"   ON storage.objects;
DROP POLICY IF EXISTS "documents_storage_select_admin" ON storage.objects;
DROP POLICY IF EXISTS "documents_storage_insert_own"   ON storage.objects;
DROP POLICY IF EXISTS "documents_storage_update_own"   ON storage.objects;
DROP POLICY IF EXISTS "documents_storage_delete_own"   ON storage.objects;

-- User can read their own document files
CREATE POLICY "documents_storage_select_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admin can read all documents
CREATE POLICY "documents_storage_select_admin"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND public.is_admin()
  );

-- Users can upload to their own folder
CREATE POLICY "documents_storage_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own files
CREATE POLICY "documents_storage_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own files
CREATE POLICY "documents_storage_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── 3. CONTRACTS bucket ──────────────────────────────────

DROP POLICY IF EXISTS "contracts_storage_select_own"   ON storage.objects;
DROP POLICY IF EXISTS "contracts_storage_insert_own"   ON storage.objects;
DROP POLICY IF EXISTS "contracts_storage_delete_own"   ON storage.objects;

CREATE POLICY "contracts_storage_select_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'contracts'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "contracts_storage_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'contracts'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "contracts_storage_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'contracts'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── 4. Missing documents TABLE policies ──────────────────
-- Users need to delete their own document rows too.

DROP POLICY IF EXISTS "documents_delete_own"   ON public.documents;
DROP POLICY IF EXISTS "documents_update_own"   ON public.documents;

CREATE POLICY "documents_delete_own"
  ON public.documents FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "documents_update_own"
  ON public.documents FOR UPDATE
  USING (user_id = auth.uid());
