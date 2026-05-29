-- ============================================================
-- 015: Add ADMINISTRATOR to user_role enum
--
-- Allows admin users to have their role displayed as
-- "Administrator" instead of a craft role.
-- ALTER TYPE … ADD VALUE is non-transactional in Postgres,
-- so it must NOT be wrapped in BEGIN/COMMIT.
-- ============================================================

ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'ADMINISTRATOR';
