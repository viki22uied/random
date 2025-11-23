-- ============================================
-- HDIMS: Fix RLS Policies for User Registration
-- ============================================

-- Drop all existing user policies to start fresh
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_select_admin" ON users;
DROP POLICY IF EXISTS "users_insert_self" ON users;
DROP POLICY IF EXISTS "users_insert_admin" ON users;
DROP POLICY IF EXISTS "users_update_self" ON users;
DROP POLICY IF EXISTS "users_update_admin" ON users;

-- Allow anonymous users to insert their profile during registration
CREATE POLICY "users_insert_registration" ON users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow users to view their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR is_super_admin());

-- Allow super admin to view all users
CREATE POLICY "users_select_admin" ON users
  FOR SELECT
  TO authenticated
  USING (is_super_admin());

-- Allow users to update their own profile
CREATE POLICY "users_update_self" ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow super admin to update users
CREATE POLICY "users_update_admin" ON users
  FOR UPDATE
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());
