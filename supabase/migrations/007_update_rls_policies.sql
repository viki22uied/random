-- ============================================
-- HDIMS: Update RLS Policies for User Registration
-- ============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "users_insert_admin" ON users;
DROP POLICY IF EXISTS "users_update_admin" ON users;

-- Create new policy allowing users to insert their own profile during registration
CREATE POLICY "users_insert_self" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "users_update_self" ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Recreate super admin policies for full access
CREATE POLICY "users_insert_admin" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin());

CREATE POLICY "users_update_admin" ON users
  FOR UPDATE
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());
