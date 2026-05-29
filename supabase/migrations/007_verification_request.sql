-- 007: Add verification request tracking
-- Users can request verification after accepting AGB + GDPR (done at registration).
-- Admin approves/rejects through the admin panel.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS verification_requested_at TIMESTAMPTZ;

-- Sparse index for fast admin queries
CREATE INDEX IF NOT EXISTS users_verification_pending_idx
  ON public.users(verification_requested_at)
  WHERE verification_requested_at IS NOT NULL AND is_verified = false;
