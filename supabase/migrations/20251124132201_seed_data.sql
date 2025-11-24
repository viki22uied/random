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