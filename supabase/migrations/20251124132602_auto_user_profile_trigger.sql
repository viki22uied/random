-- ============================================
-- HDIMS: Auto User Profile Creation Trigger
-- ============================================

-- Create a function to automatically create user profiles
-- when a new user signs up through Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into users table with data from auth.users
  INSERT INTO public.users (id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'hospital_user')::role_enum,
    true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger that fires when a new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also create a function to handle user deletion
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- The ON DELETE CASCADE should handle this, but let's be explicit
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user deletion
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_delete();

-- Update the RLS policy to prevent duplicate inserts during signup
DROP POLICY IF EXISTS "users_insert_registration" ON users;

CREATE POLICY "users_insert_registration" ON users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- Allow insertion if user doesn't already exist
    NOT EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()
    )
  );