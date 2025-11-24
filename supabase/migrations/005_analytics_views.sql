-- ============================================
-- HDIMS: Analytics & Materialized Views
-- ============================================

-- Materialized view for district-level KPIs
CREATE MATERIALIZED VIEW district_kpi_summary AS
SELECT 
  d.id as district_id,
  d.name as district_name,
  d.state_id,
  COUNT(DISTINCT f.id) as total_facilities,
  COUNT(DISTINCT CASE WHEN f.facility_type = 'PHC' THEN f.id END) as phc_count,
  COUNT(DISTINCT CASE WHEN f.facility_type = 'CHC' THEN f.id END) as chc_count,
  COUNT(DISTINCT CASE WHEN f.facility_type = 'DH' THEN f.id END) as dh_count,
  COUNT(DISTINCT pd.id) as total_submissions,
  COUNT(DISTINCT CASE WHEN pd.status = 'approved' THEN pd.id END) as approved_submissions,
  COUNT(DISTINCT CASE WHEN pd.status = 'submitted' THEN pd.id END) as pending_submissions,
  ROUND(
    COUNT(DISTINCT CASE WHEN pd.status = 'approved' THEN pd.id END)::NUMERIC / 
    NULLIF(COUNT(DISTINCT pd.id), 0) * 100, 
    2
  ) as approval_rate,
  MAX(pd.created_at) as last_submission_date
FROM districts d
LEFT JOIN facilities f ON f.district_id = d.id AND f.is_active = true
LEFT JOIN performance_data pd ON pd.facility_id = f.id
WHERE d.is_active = true
GROUP BY d.id, d.name, d.state_id;

-- Create index on materialized view
CREATE INDEX idx_district_kpi_state ON district_kpi_summary(state_id);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_district_kpi()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY district_kpi_summary;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh (requires pg_cron extension)
-- SELECT cron.schedule('refresh-district-kpi', '0 2 * * *', 'SELECT refresh_district_kpi()');

-- ============================================
-- State-level KPI View
-- ============================================
CREATE MATERIALIZED VIEW state_kpi_summary AS
SELECT 
  s.id as state_id,
  s.name as state_name,
  COUNT(DISTINCT d.id) as total_districts,
  COUNT(DISTINCT f.id) as total_facilities,
  SUM(d_kpi.total_submissions) as total_submissions,
  SUM(d_kpi.approved_submissions) as approved_submissions,
  SUM(d_kpi.pending_submissions) as pending_submissions,
  ROUND(
    SUM(d_kpi.approved_submissions)::NUMERIC / 
    NULLIF(SUM(d_kpi.total_submissions), 0) * 100, 
    2
  ) as overall_approval_rate
FROM states s
LEFT JOIN districts d ON d.state_id = s.id AND d.is_active = true
LEFT JOIN facilities f ON f.district_id = d.id AND f.is_active = true
LEFT JOIN district_kpi_summary d_kpi ON d_kpi.district_id = d.id
WHERE s.is_active = true
GROUP BY s.id, s.name;

-- ============================================
-- Program-wise Performance View
-- ============================================
CREATE VIEW program_performance AS
SELECT 
  pd.program_name,
  f.facility_type,
  d.name as district_name,
  s.name as state_name,
  COUNT(DISTINCT pd.id) as submission_count,
  AVG(pd.metric_value) as avg_value,
  AVG(pd.target_value) as avg_target,
  ROUND(
    (AVG(pd.metric_value) / NULLIF(AVG(pd.target_value), 0)) * 100, 
    2
  ) as achievement_percentage,
  COUNT(DISTINCT CASE WHEN pd.status = 'approved' THEN pd.id END) as approved_count
FROM performance_data pd
JOIN facilities f ON pd.facility_id = f.id
JOIN districts d ON f.district_id = d.id
JOIN states s ON d.state_id = s.id
WHERE pd.status = 'approved'
GROUP BY pd.program_name, f.facility_type, d.name, s.name;

-- ============================================
-- Scheme Utilization View
-- ============================================
CREATE VIEW scheme_utilization AS
SELECT 
  st.scheme_name,
  st.scheme_category,
  d.name as district_name,
  s.name as state_name,
  COUNT(DISTINCT st.id) as scheme_count,
  SUM(st.beneficiary_count) as total_beneficiaries,
  SUM(st.target_beneficiaries) as total_target,
  SUM(st.funds_allocated) as total_allocated,
  SUM(st.funds_utilized) as total_utilized,
  ROUND(
    (SUM(st.funds_utilized) / NULLIF(SUM(st.funds_allocated), 0)) * 100, 
    2
  ) as fund_utilization_percentage,
  ROUND(
    (SUM(st.beneficiary_count)::NUMERIC / NULLIF(SUM(st.target_beneficiaries), 0)) * 100, 
    2
  ) as beneficiary_achievement_percentage
FROM scheme_tracking st
JOIN facilities f ON st.facility_id = f.id
JOIN districts d ON f.district_id = d.id
JOIN states s ON d.state_id = s.id
WHERE st.status = 'approved'
GROUP BY st.scheme_name, st.scheme_category, d.name, s.name;

-- ============================================
-- Time-series Performance Trends
-- ============================================
CREATE OR REPLACE FUNCTION get_performance_trends_aggregate(
  p_metric_key TEXT,
  p_district_id UUID DEFAULT NULL,
  p_state_id UUID DEFAULT NULL,
  p_months INTEGER DEFAULT 12
)
RETURNS TABLE (
  period DATE,
  avg_value NUMERIC,
  avg_target NUMERIC,
  facility_count BIGINT,
  total_submissions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pd.reporting_period_start as period,
    AVG(pd.metric_value) as avg_value,
    AVG(pd.target_value) as avg_target,
    COUNT(DISTINCT pd.facility_id) as facility_count,
    COUNT(*) as total_submissions
  FROM performance_data pd
  JOIN facilities f ON pd.facility_id = f.id
  JOIN districts d ON f.district_id = d.id
  WHERE pd.metric_key = p_metric_key
    AND pd.status = 'approved'
    AND pd.reporting_period_start >= CURRENT_DATE - (p_months || ' months')::INTERVAL
    AND (p_district_id IS NULL OR d.id = p_district_id)
    AND (p_state_id IS NULL OR d.state_id = p_state_id)
  GROUP BY pd.reporting_period_start
  ORDER BY pd.reporting_period_start;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Facility Performance Ranking
-- ============================================
CREATE OR REPLACE FUNCTION get_facility_rankings(
  p_district_id UUID,
  p_program_name TEXT DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  rank BIGINT,
  facility_id UUID,
  facility_name TEXT,
  total_submissions BIGINT,
  approved_submissions BIGINT,
  approval_rate NUMERIC,
  avg_achievement_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY 
      COUNT(DISTINCT CASE WHEN pd.status = 'approved' THEN pd.id END) DESC
    ) as rank,
    f.id as facility_id,
    f.name as facility_name,
    COUNT(pd.id) as total_submissions,
    COUNT(CASE WHEN pd.status = 'approved' THEN pd.id END) as approved_submissions,
    ROUND(
      COUNT(CASE WHEN pd.status = 'approved' THEN pd.id END)::NUMERIC / 
      NULLIF(COUNT(pd.id), 0) * 100, 
      2
    ) as approval_rate,
    ROUND(
      AVG(pd.metric_value / NULLIF(pd.target_value, 0)) * 100, 
      2
    ) as avg_achievement_percentage
  FROM facilities f
  LEFT JOIN performance_data pd ON pd.facility_id = f.id
    AND (p_program_name IS NULL OR pd.program_name = p_program_name)
    AND (p_start_date IS NULL OR pd.reporting_period_start >= p_start_date)
    AND (p_end_date IS NULL OR pd.reporting_period_end <= p_end_date)
  WHERE f.district_id = p_district_id
    AND f.is_active = true
  GROUP BY f.id, f.name;
END;
$$ LANGUAGE plpgsql;
