/*
# Auto-promote first user to admin

## Overview
If no admin exists in the system, the first user who signs up is automatically
promoted to admin role. This ensures the platform owner can access the admin
panel without manual database intervention.

## Security
- Only runs when zero admin profiles exist.
- Implemented as a trigger on the profiles table AFTER INSERT.
- Checks if any admin already exists before promoting.
*/

CREATE OR REPLACE FUNCTION promote_first_user_to_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  admin_count integer;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM profiles WHERE role = 'admin';
  
  IF admin_count = 0 THEN
    UPDATE profiles SET role = 'admin', updated_at = now() WHERE id = NEW.id;
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION promote_first_user_to_admin FROM anon;

DROP TRIGGER IF EXISTS on_profile_insert_promote_first_admin ON profiles;
CREATE TRIGGER on_profile_insert_promote_first_admin
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION promote_first_user_to_admin();
