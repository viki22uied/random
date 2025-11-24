-- ============================================
-- HDIMS: Fix User Signup Column Mismatch
-- ============================================

-- The signup code was trying to insert state_name and district_name 
-- which don't exist in the users table. 
-- Let's add these as optional columns or fix the signup code

-- Option 1: Add these columns to users table (for backward compatibility)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS state_name TEXT,
ADD COLUMN IF NOT EXISTS district_name TEXT;

-- Also add facility_name for consistency
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS facility_name TEXT;

-- Create a better RLS policy for user registration that handles the new columns
DROP POLICY IF EXISTS "users_insert_registration" ON users;

CREATE POLICY "users_insert_registration" ON users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Update the policy to allow users to update their own profile including new columns
DROP POLICY IF EXISTS "users_update_self" ON users;

CREATE POLICY "users_update_self" ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Also fix any potential issues with created_at timestamp
-- The users table should handle created_at automatically, but let's ensure it works
ALTER TABLE users 
ALTER COLUMN created_at SET DEFAULT NOW(),
ALTER COLUMN updated_at SET DEFAULT NOW();