-- ============================================
-- HDIMS: Initial Database Schema
-- ============================================

-- Create custom types (enums)
CREATE TYPE role_enum AS ENUM (
  'hospital_user',
  'district_admin',
  'state_admin',
  'super_admin'
);

CREATE TYPE status_enum AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'sent_back'
);

CREATE TYPE facility_type_enum AS ENUM (
  'PHC',
  'CHC',
  'SDH',
  'DH',
  'MEDICAL_COLLEGE',
  'SPECIALITY_HOSPITAL',
  'PRIVATE_EMPANELLED'
);

-- ============================================
-- CORE TABLES
-- ============================================

-- States
CREATE TABLE states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  region TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Districts
CREATE TABLE districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  population BIGINT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(state_id, code)
);

-- Facilities
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  facility_type facility_type_enum NOT NULL,
  address TEXT,
  pincode TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  bed_capacity INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (extends Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role role_enum NOT NULL DEFAULT 'hospital_user',
  facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
  district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
  state_id UUID REFERENCES states(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Data
CREATE TABLE performance_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  reporting_period_start DATE NOT NULL,
  reporting_period_end DATE NOT NULL,
  program_name TEXT NOT NULL,
  metric_key TEXT NOT NULL,
  metric_value NUMERIC(12, 2) NOT NULL,
  target_value NUMERIC(12, 2),
  unit TEXT,
  status status_enum NOT NULL DEFAULT 'submitted',
  comments TEXT,
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_period CHECK (reporting_period_end >= reporting_period_start),
  CONSTRAINT valid_value CHECK (metric_value >= 0)
);

-- Scheme Tracking
CREATE TABLE scheme_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  scheme_name TEXT NOT NULL,
  scheme_category TEXT,
  reporting_period_start DATE NOT NULL,
  reporting_period_end DATE NOT NULL,
  beneficiary_count INTEGER NOT NULL DEFAULT 0,
  target_beneficiaries INTEGER,
  funds_allocated NUMERIC(15, 2),
  funds_utilized NUMERIC(15, 2) NOT NULL DEFAULT 0,
  activities JSONB DEFAULT '[]',
  supporting_doc_ids TEXT[],
  status status_enum NOT NULL DEFAULT 'submitted',
  comments TEXT,
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_scheme_period CHECK (reporting_period_end >= reporting_period_start),
  CONSTRAINT valid_beneficiaries CHECK (beneficiary_count >= 0),
  CONSTRAINT valid_funds CHECK (funds_utilized >= 0)
);

-- Uploads
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  category TEXT,
  description TEXT,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_facility ON users(facility_id) WHERE facility_id IS NOT NULL;
CREATE INDEX idx_users_district ON users(district_id) WHERE district_id IS NOT NULL;
CREATE INDEX idx_users_state ON users(state_id) WHERE state_id IS NOT NULL;
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;

-- Districts
CREATE INDEX idx_districts_state ON districts(state_id);
CREATE INDEX idx_districts_active ON districts(is_active) WHERE is_active = true;

-- Facilities
CREATE INDEX idx_facilities_district ON facilities(district_id);
CREATE INDEX idx_facilities_type ON facilities(facility_type);
CREATE INDEX idx_facilities_active ON facilities(is_active) WHERE is_active = true;

-- Performance Data
CREATE INDEX idx_perf_facility_period ON performance_data(facility_id, reporting_period_start DESC);
CREATE INDEX idx_perf_status ON performance_data(status);
CREATE INDEX idx_perf_program ON performance_data(program_name);
CREATE INDEX idx_perf_metric ON performance_data(metric_key);
CREATE INDEX idx_perf_created_by ON performance_data(created_by);
CREATE INDEX idx_perf_reviewed_by ON performance_data(reviewed_by) WHERE reviewed_by IS NOT NULL;

-- Scheme Tracking
CREATE INDEX idx_scheme_facility_period ON scheme_tracking(facility_id, reporting_period_start DESC);
CREATE INDEX idx_scheme_status ON scheme_tracking(status);
CREATE INDEX idx_scheme_name ON scheme_tracking(scheme_name);
CREATE INDEX idx_scheme_activities ON scheme_tracking USING GIN(activities);

-- Uploads
CREATE INDEX idx_uploads_facility ON uploads(facility_id);
CREATE INDEX idx_uploads_category ON uploads(category);
CREATE INDEX idx_uploads_uploaded_by ON uploads(uploaded_by);

-- Audit Logs
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_states_updated_at BEFORE UPDATE ON states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_districts_updated_at BEFORE UPDATE ON districts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON facilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_data_updated_at BEFORE UPDATE ON performance_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheme_tracking_updated_at BEFORE UPDATE ON scheme_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

