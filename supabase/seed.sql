-- ============================================
-- HDIMS: Seed Data for Development/Testing
-- ============================================

-- Insert States
INSERT INTO states (id, name, code, region) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Maharashtra', 'MH', 'West'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Karnataka', 'KA', 'South'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Delhi', 'DL', 'North'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Tamil Nadu', 'TN', 'South'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Uttar Pradesh', 'UP', 'North')
ON CONFLICT (id) DO NOTHING;

-- Insert Districts
INSERT INTO districts (id, name, state_id, code, population) VALUES
  -- Maharashtra Districts
  ('660e8400-e29b-41d4-a716-446655440001', 'Mumbai', '550e8400-e29b-41d4-a716-446655440001', 'MUM', 12442373),
  ('660e8400-e29b-41d4-a716-446655440002', 'Pune', '550e8400-e29b-41d4-a716-446655440001', 'PUN', 9429408),
  ('660e8400-e29b-41d4-a716-446655440003', 'Nashik', '550e8400-e29b-41d4-a716-446655440001', 'NAS', 6109052),
  
  -- Karnataka Districts
  ('660e8400-e29b-41d4-a716-446655440004', 'Bengaluru Urban', '550e8400-e29b-41d4-a716-446655440002', 'BLR', 9621551),
  ('660e8400-e29b-41d4-a716-446655440005', 'Mysuru', '550e8400-e29b-41d4-a716-446655440002', 'MYS', 3105727),
  
  -- Delhi Districts
  ('660e8400-e29b-41d4-a716-446655440006', 'Central Delhi', '550e8400-e29b-41d4-a716-446655440003', 'CDL', 582320),
  ('660e8400-e29b-41d4-a716-446655440007', 'New Delhi', '550e8400-e29b-41d4-a716-446655440003', 'NDL', 133713),
  
  -- Tamil Nadu Districts
  ('660e8400-e29b-41d4-a716-446655440008', 'Chennai', '550e8400-e29b-41d4-a716-446655440004', 'CHE', 7089000),
  ('660e8400-e29b-41d4-a716-446655440009', 'Coimbatore', '550e8400-e29b-41d4-a716-446655440004', 'CBE', 2156474),
  
  -- Uttar Pradesh Districts
  ('660e8400-e29b-41d4-a716-446655440010', 'Lucknow', '550e8400-e29b-41d4-a716-446655440005', 'LKO', 2817105),
  ('660e8400-e29b-41d4-a716-446655440011', 'Kanpur', '550e8400-e29b-41d4-a716-446655440005', 'KNP', 2765348)
ON CONFLICT (id) DO NOTHING;

-- Insert Facilities
INSERT INTO facilities (id, name, district_id, facility_type, address, contact_phone, bed_capacity) VALUES
  -- Maharashtra Facilities
  ('770e8400-e29b-41d4-a716-446655440001', 'Mumbai Central Hospital', '660e8400-e29b-41d4-a716-446655440001', 'DH', 'Mumbai Central, Mumbai', '+91-22-12345678', 500),
  ('770e8400-e29b-41d4-a716-446655440002', 'Andheri PHC', '660e8400-e29b-41d4-a716-446655440001', 'PHC', 'Andheri West, Mumbai', '+91-22-23456789', 25),
  ('770e8400-e29b-41d4-a716-446655440003', 'Pune District Hospital', '660e8400-e29b-41d4-a716-446655440002', 'DH', 'Shivajinagar, Pune', '+91-20-34567890', 350),
  ('770e8400-e29b-41d4-a716-446655440004', 'Nashik Medical College', '660e8400-e29b-41d4-a716-446655440003', 'MEDICAL_COLLEGE', 'Nashik Road, Nashik', '+91-253-4567890', 800),
  
  -- Karnataka Facilities
  ('770e8400-e29b-41d4-a716-446655440005', 'Bangalore Medical College', '660e8400-e29b-41d4-a716-446655440004', 'MEDICAL_COLLEGE', 'Fort, Bangalore', '+91-80-45678901', 1000),
  ('770e8400-e29b-41d4-a716-446655440006', 'Mysore CHC', '660e8400-e29b-41d4-a716-446655440005', 'CHC', 'Mysore Palace Area, Mysore', '+91-821-5678901', 100),
  
  -- Delhi Facilities
  ('770e8400-e29b-41d4-a716-446655440007', 'AIIMS Delhi', '660e8400-e29b-41d4-a716-446655440006', 'SPECIALITY_HOSPITAL', 'Ansari Nagar, New Delhi', '+91-11-23456789', 1500),
  ('770e8400-e29b-41d4-a716-446655440008', 'Central Delhi PHC', '660e8400-e29b-41d4-a716-446655440006', 'PHC', 'Connaught Place, New Delhi', '+91-11-34567890', 30),
  
  -- Tamil Nadu Facilities
  ('770e8400-e29b-41d4-a716-446655440009', 'Chennai General Hospital', '660e8400-e29b-41d4-a716-446655440008', 'DH', 'T Nagar, Chennai', '+91-44-45678901', 600),
  ('770e8400-e29b-41d4-a716-446655440010', 'Coimbatore SDH', '660e8400-e29b-41d4-a716-446655440009', 'SDH', 'RS Puram, Coimbatore', '+91-422-5678901', 200),
  
  -- Uttar Pradesh Facilities
  ('770e8400-e29b-41d4-a716-446655440011', 'King George Medical College', '660e8400-e29b-41d4-a716-446655440010', 'MEDICAL_COLLEGE', 'Chowk, Lucknow', '+91-522-3456789', 1200),
  ('770e8400-e29b-41d4-a716-446655440012', 'Kanpur District Hospital', '660e8400-e29b-41d4-a716-446655440011', 'DH', 'Civil Lines, Kanpur', '+91-512-4567890', 400)
ON CONFLICT (id) DO NOTHING;

-- Note: Actual user creation must be done through Supabase Auth
-- The following shows the structure - execute after creating auth users

-- Sample user profiles (insert after creating auth users)
/*
INSERT INTO users (id, full_name, email, role, facility_id, district_id, state_id) VALUES
  -- Hospital Users
  ('auth-user-id-1', 'Dr. Rajesh Kumar', 'rajesh@mumbai-hospital.in', 'hospital_user', '770e8400-e29b-41d4-a716-446655440001', NULL, NULL),
  ('auth-user-id-2', 'Dr. Priya Sharma', 'priya@bangalore-medical.in', 'hospital_user', '770e8400-e29b-41d4-a716-446655440005', NULL, NULL),
  ('auth-user-id-3', 'Dr. Vijay Kumar', 'vijay@chennai-general.in', 'hospital_user', '770e8400-e29b-41d4-a716-446655440009', NULL, NULL),
  ('auth-user-id-4', 'Dr. Amit Singh', 'amit@kgmc-lucknow.in', 'hospital_user', '770e8400-e29b-41d4-a716-446655440011', NULL, NULL),
  
  -- District Admins
  ('auth-user-id-5', 'Mrs. Anjali Deshmukh', 'anjali@mumbai-health.gov.in', 'district_admin', NULL, '660e8400-e29b-41d4-a716-446655440001', NULL),
  ('auth-user-id-6', 'Mr. Ramesh Gowda', 'ramesh@bangalore-health.gov.in', 'district_admin', NULL, '660e8400-e29b-41d4-a716-446655440004', NULL),
  ('auth-user-id-7', 'Mrs. Kavita Singh', 'kavita@delhi-health.gov.in', 'district_admin', NULL, '660e8400-e29b-41d4-a716-446655440006', NULL),
  
  -- State Admins
  ('auth-user-id-8', 'Dr. Sanjay Patil', 'sanjay@mh-health.gov.in', 'state_admin', NULL, NULL, '550e8400-e29b-41d4-a716-446655440001'),
  ('auth-user-id-9', 'Dr. Meera Reddy', 'meera@ka-health.gov.in', 'state_admin', NULL, NULL, '550e8400-e29b-41d4-a716-446655440002'),
  ('auth-user-id-10', 'Dr. Ashok Kumar', 'ashok@up-health.gov.in', 'state_admin', NULL, NULL, '550e8400-e29b-41d4-a716-446655440005'),
  
  -- Super Admin
  ('auth-user-id-11', 'System Administrator', 'admin@hdims.gov.in', 'super_admin', NULL, NULL, NULL);
*/

-- Sample Performance Data (assuming user with ID exists)
-- These will be inserted after creating actual users through Supabase Auth
DO $$
DECLARE
    v_user_id UUID := (SELECT id FROM users LIMIT 1);
BEGIN
    IF v_user_id IS NOT NULL THEN
        INSERT INTO performance_data (
            facility_id, reporting_period_start, reporting_period_end,
            program_name, metric_key, metric_value, target_value, unit, status, created_by
        ) VALUES
            -- Mumbai Hospital Data
            ('770e8400-e29b-41d4-a716-446655440001', '2024-01-01', '2024-01-31', 'OPD Services', 'total_opd_patients', 2500, 2000, 'count', 'approved', v_user_id),
            ('770e8400-e29b-41d4-a716-446655440001', '2024-01-01', '2024-01-31', 'Immunization', 'children_immunized', 450, 500, 'count', 'approved', v_user_id),
            ('770e8400-e29b-41d4-a716-446655440001', '2024-01-01', '2024-01-31', 'Maternal Health', 'anc_checkups', 180, 200, 'count', 'approved', v_user_id),
            
            -- Bangalore Medical College Data
            ('770e8400-e29b-41d4-a716-446655440005', '2024-01-01', '2024-01-31', 'OPD Services', 'total_opd_patients', 3200, 3000, 'count', 'approved', v_user_id),
            ('770e8400-e29b-41d4-a716-446655440005', '2024-01-01', '2024-01-31', 'Emergency Services', 'emergency_cases', 890, 800, 'count', 'submitted', v_user_id),
            
            -- Chennai Hospital Data
            ('770e8400-e29b-41d4-a716-446655440009', '2024-01-01', '2024-01-31', 'OPD Services', 'total_opd_patients', 2800, 2500, 'count', 'approved', v_user_id),
            ('770e8400-e29b-41d4-a716-446655440009', '2024-01-01', '2024-01-31', 'Surgery', 'major_surgeries', 120, 100, 'count', 'submitted', v_user_id),
            
            -- Lucknow Medical College Data
            ('770e8400-e29b-41d4-a716-446655440011', '2024-01-01', '2024-01-31', 'OPD Services', 'total_opd_patients', 3500, 3200, 'count', 'approved', v_user_id),
            ('770e8400-e29b-41d4-a716-446655440011', '2024-01-01', '2024-01-31', 'Research', 'clinical_trials', 5, 3, 'count', 'approved', v_user_id);
    END IF;
END $$;

-- Sample Scheme Tracking Data
DO $$
DECLARE
    v_user_id UUID := (SELECT id FROM users LIMIT 1);
BEGIN
    IF v_user_id IS NOT NULL THEN
        INSERT INTO scheme_tracking (
            facility_id, scheme_name, scheme_category, reporting_period_start, reporting_period_end,
            beneficiary_count, target_beneficiaries, funds_allocated, funds_utilized,
            activities, status, created_by
        ) VALUES
            -- PM-JAY Scheme
            ('770e8400-e29b-41d4-a716-446655440001', 'PM-JAY', 'Central', '2024-01-01', '2024-03-31',
             350, 400, 5000000, 4250000,
             '[{"activity": "Surgeries performed", "date": "2024-01-15", "beneficiaries": 120}, {"activity": "Diagnostic tests", "date": "2024-02-10", "beneficiaries": 230}]'::jsonb,
             'approved', v_user_id),
            
            ('770e8400-e29b-41d4-a716-446655440005', 'PM-JAY', 'Central', '2024-01-01', '2024-03-31',
             280, 300, 4000000, 3800000,
             '[{"activity": "Cardiac procedures", "date": "2024-01-20", "beneficiaries": 80}, {"activity": "Cancer treatments", "date": "2024-02-15", "beneficiaries": 200}]'::jsonb,
             'approved', v_user_id),
            
            -- Janani Suraksha Yojana
            ('770e8400-e29b-41d4-a716-446655440002', 'Janani Suraksha Yojana', 'Central', '2024-01-01', '2024-03-31',
             95, 100, 500000, 475000,
             '[{"activity": "Institutional deliveries", "date": "2024-02-10", "beneficiaries": 95}]'::jsonb,
             'submitted', v_user_id),
            
            ('770e8400-e29b-41d4-a716-446655440009', 'Janani Suraksha Yojana', 'Central', '2024-01-01', '2024-03-31',
             120, 150, 750000, 720000,
             '[{"activity": "Postnatal care", "date": "2024-01-25", "beneficiaries": 120}]'::jsonb,
             'approved', v_user_id),
            
            -- National Health Mission
            ('770e8400-e29b-41d4-a716-446655440006', 'National Health Mission', 'Central', '2024-01-01', '2024-03-31',
             500, 600, 2000000, 1800000,
             '[{"activity": "Health camps", "date": "2024-01-05", "beneficiaries": 200}, {"activity": "Vaccination drives", "date": "2024-02-01", "beneficiaries": 300}]'::jsonb,
             'approved', v_user_id),
            
            -- State-specific schemes
            ('770e8400-e29b-41d4-a716-446655440011', 'Mahatma Jyotiba Phule Jan Arogya Yojana', 'State', '2024-01-01', '2024-03-31',
             180, 200, 1500000, 1350000,
             '[{"activity": "Free surgeries", "date": "2024-01-30", "beneficiaries": 180}]'::jsonb,
             'submitted', v_user_id);
    END IF;
END $$;

-- Sample Upload Records
DO $$
DECLARE
    v_user_id UUID := (SELECT id FROM users LIMIT 1);
BEGIN
    IF v_user_id IS NOT NULL THEN
        INSERT INTO uploads (
            facility_id, storage_path, file_name, file_type, file_size, category, description, uploaded_by
        ) VALUES
            ('770e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001/monthly_report_jan.pdf', 
             'January_Monthly_Report.pdf', 'application/pdf', 2048576, 'monthly_report', 
             'Monthly performance report for January 2024', v_user_id),
            
            ('770e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440005/pm_jay_documents.pdf', 
             'PMJAY_Implementation_Doc.pdf', 'application/pdf', 1536000, 'scheme_documentation', 
             'PM-JAY scheme implementation documents', v_user_id),
            
            ('770e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440009/infrastructure_photos.zip', 
             'Infrastructure_Photos.zip', 'application/zip', 5242880, 'infrastructure', 
             'Hospital infrastructure photographs', v_user_id);
    END IF;
END $$;

-- Sample Audit Logs
DO $$
DECLARE
    v_user_id UUID := (SELECT id FROM users LIMIT 1);
BEGIN
    IF v_user_id IS NOT NULL THEN
        INSERT INTO audit_logs (user_id, action, entity, entity_id, new_values, ip_address, user_agent)
        VALUES
            (v_user_id, 'insert', 'performance_data', 
             (SELECT id FROM performance_data LIMIT 1), 
             '{"metric_value": 2500, "program_name": "OPD Services"}'::jsonb,
             '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
            
            (v_user_id, 'insert', 'scheme_tracking',
             (SELECT id FROM scheme_tracking LIMIT 1),
             '{"scheme_name": "PM-JAY", "beneficiary_count": 350}'::jsonb,
             '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
            
            (v_user_id, 'approve', 'performance_data',
             (SELECT id FROM performance_data WHERE status = 'approved' LIMIT 1),
             '{"status": "approved", "comments": "Data verified and approved"}'::jsonb,
             '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
    END IF;
END $$;

-- Refresh materialized views after seeding
DO $$
BEGIN
    -- Refresh district KPI summary if it exists
    IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'district_kpi_summary') THEN
        REFRESH MATERIALIZED VIEW district_kpi_summary;
    END IF;
    
    -- Refresh state KPI summary if it exists
    IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'state_kpi_summary') THEN
        REFRESH MATERIALIZED VIEW state_kpi_summary;
    END IF;
END $$;
