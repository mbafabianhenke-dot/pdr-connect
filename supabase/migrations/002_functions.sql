-- Increment bypass count and auto-block at >= 5
CREATE OR REPLACE FUNCTION public.increment_bypass_count(user_id UUID)
RETURNS INT AS $$
DECLARE
  new_count INT;
BEGIN
  UPDATE public.users
  SET bypass_count = bypass_count + 1,
      is_blocked = CASE WHEN bypass_count + 1 >= 5 THEN true ELSE is_blocked END
  WHERE id = user_id
  RETURNING bypass_count INTO new_count;
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users (only on their own)
REVOKE ALL ON FUNCTION public.increment_bypass_count(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_bypass_count(UUID) TO authenticated;
