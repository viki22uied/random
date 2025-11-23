-- ============================================
-- HDIMS: Row Level Security Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS role_enum AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Get current user's facility
CREATE OR REPLACE FUNCTION get_user_facility()
RETURNS UUID AS $$
  SELECT facility_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Get current user's district
CREATE OR REPLACE FUNCTION get_user_district()
RETURNS UUID AS $$
  SELECT district_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Get current user's state
CREATE OR REPLACE FUNCTION get_user_state()
RETURNS UUID AS $$
  SELECT state_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin');
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR is_super_admin());

-- Super admin can view all users
CREATE POLICY "users_select_admin" ON users
  FOR SELECT
  TO authenticated
  USING (is_super_admin());

-- Only super admin can insert users
CREATE POLICY "users_insert_admin" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin());

-- Only super admin can update users
CREATE POLICY "users_update_admin" ON users
  FOR UPDATE
  TO authenticated
  USING (is_super_admin());

-- ============================================
-- PERFORMANCE_DATA POLICIES
-- ============================================

-- HOSPITAL_USER: Select own facility data
CREATE POLICY "perf_select_hospital_user" ON performance_data
  FOR SELECT
  TO authenticated
  USING (
    facility_id = get_user_facility() 
    OR get_user_role() IN ('district_admin', 'state_admin', 'super_admin')
  );

-- DISTRICT_ADMIN: Select district data
CREATE POLICY "perf_select_district_admin" ON performance_data
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM facilities f
      WHERE f.id = performance_data.facility_id
      AND f.district_id = get_user_district()
    )
    OR get_user_role() IN ('state_admin', 'super_admin')
  );

-- STATE_ADMIN: Select state data
CREATE POLICY "perf_select_state_admin" ON performance_data
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM facilities f
      JOIN districts d ON f.district_id = d.id
      WHERE f.id = performance_data.facility_id
      AND d.state_id = get_user_state()
    )
    OR is_super_admin()
  );

-- HOSPITAL_USER: Insert for own facility
CREATE POLICY "perf_insert_hospital_user" ON performance_data
  FOR INSERT
  TO authenticated
  WITH CHECK (
    facility_id = get_user_facility()
    AND created_by = auth.uid()
  );

-- HOSPITAL_USER: Update own submissions when status allows
CREATE POLICY "perf_update_hospital_user" ON performance_data
  FOR UPDATE
  TO authenticated
  USING (
    facility_id = get_user_facility()
    AND created_by = auth.uid()
    AND status IN ('submitted', 'sent_back')
  )
  WITH CHECK (
    facility_id = get_user_facility()
    AND status IN ('submitted', 'sent_back')
  );

-- DISTRICT_ADMIN: Update status and comments
CREATE POLICY "perf_update_district_admin" ON performance_data
  FOR UPDATE
  TO authenticated
  USING (
    get_user_role() = 'district_admin'
    AND EXISTS (
      SELECT 1 FROM facilities f
      WHERE f.id = performance_data.facility_id
      AND f.district_id = get_user_district()
    )
  );

-- SUPER_ADMIN: Full access
CREATE POLICY "perf_all_super_admin" ON performance_data
  FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ============================================
-- SCHEME_TRACKING POLICIES
-- ============================================

-- HOSPITAL_USER: Select own facility data
CREATE POLICY "scheme_select_hospital_user" ON scheme_tracking
  FOR SELECT
  TO authenticated
  USING (
    facility_id = get_user_facility()
    OR get_user_role() IN ('district_admin', 'state_admin', 'super_admin')
  );

-- DISTRICT_ADMIN: Select district data
CREATE POLICY "scheme_select_district_admin" ON scheme_tracking
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM facilities f
      WHERE f.id = scheme_tracking.facility_id
      AND f.district_id = get_user_district()
    )
    OR get_user_role() IN ('state_admin', 'super_admin')
  );

-- STATE_ADMIN: Select state data
CREATE POLICY "scheme_select_state_admin" ON scheme_tracking
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM facilities f
      JOIN districts d ON f.district_id = d.id
      WHERE f.id = scheme_tracking.facility_id
      AND d.state_id = get_user_state()
    )
    OR is_super_admin()
  );

-- HOSPITAL_USER: Insert for own facility
CREATE POLICY "scheme_insert_hospital_user" ON scheme_tracking
  FOR INSERT
  TO authenticated
  WITH CHECK (
    facility_id = get_user_facility()
    AND created_by = auth.uid()
  );

-- HOSPITAL_USER: Update own submissions
CREATE POLICY "scheme_update_hospital_user" ON scheme_tracking
  FOR UPDATE
  TO authenticated
  USING (
    facility_id = get_user_facility()
    AND created_by = auth.uid()
    AND status IN ('submitted', 'sent_back')
  );

-- DISTRICT_ADMIN: Update status
CREATE POLICY "scheme_update_district_admin" ON scheme_tracking
  FOR UPDATE
  TO authenticated
  USING (
    get_user_role() = 'district_admin'
    AND EXISTS (
      SELECT 1 FROM facilities f
      WHERE f.id = scheme_tracking.facility_id
      AND f.district_id = get_user_district()
    )
  );

-- SUPER_ADMIN: Full access
CREATE POLICY "scheme_all_super_admin" ON scheme_tracking
  FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ============================================
-- UPLOADS POLICIES
-- ============================================

-- Users can view uploads based on facility access
CREATE POLICY "uploads_select" ON uploads
  FOR SELECT
  TO authenticated
  USING (
    facility_id = get_user_facility()
    OR get_user_role() IN ('district_admin', 'state_admin', 'super_admin')
  );

-- HOSPITAL_USER: Insert for own facility
CREATE POLICY "uploads_insert" ON uploads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    facility_id = get_user_facility()
    AND uploaded_by = auth.uid()
  );

-- SUPER_ADMIN: Full access
CREATE POLICY "uploads_all_super_admin" ON uploads
  FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ============================================
-- FACILITIES, DISTRICTS, STATES POLICIES
-- ============================================

-- Everyone can view active facilities/districts/states
CREATE POLICY "facilities_select" ON facilities
  FOR SELECT
  TO authenticated
  USING (is_active = true OR is_super_admin());

CREATE POLICY "districts_select" ON districts
  FOR SELECT
  TO authenticated
  USING (is_active = true OR is_super_admin());

CREATE POLICY "states_select" ON states
  FOR SELECT
  TO authenticated
  USING (is_active = true OR is_super_admin());

-- Only super admin can modify
CREATE POLICY "facilities_modify" ON facilities
  FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE POLICY "districts_modify" ON districts
  FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE POLICY "states_modify" ON states
  FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ============================================
-- AUDIT_LOGS POLICIES
-- ============================================

-- Users can view their own audit logs
CREATE POLICY "audit_select_own" ON audit_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_super_admin());

-- System can insert audit logs
CREATE POLICY "audit_insert" ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

