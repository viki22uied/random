-- ============================================
-- HDIMS: Add State and District Name Columns
-- ============================================

-- Add text columns for state and district names to users table
ALTER TABLE users 
ADD COLUMN state_name TEXT,
ADD COLUMN district_name TEXT;

-- Add indexes for better performance
CREATE INDEX idx_users_state_name ON users(state_name);
CREATE INDEX idx_users_district_name ON users(district_name);

-- Add comments for documentation
COMMENT ON COLUMN users.state_name IS 'Text name of the state (e.g., "Delhi", "Maharashtra")';
COMMENT ON COLUMN users.district_name IS 'Text name of the district (e.g., "Central Delhi", "Mumbai")';
