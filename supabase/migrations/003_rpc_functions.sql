-- ============================================
-- HDIMS: RPC Functions for Frontend
-- ============================================

-- ============================================
-- SUBMIT PERFORMANCE DATA
-- ============================================
CREATE OR REPLACE FUNCTION submit_performance_data(
  p_facility_id UUID,
  p_reporting_start DATE,
  p_reporting_end DATE,
  p_program_name TEXT,
  p_metrics JSONB -- [{metric_key, metric_value, target_value, unit}]
)
RETURNS JSONB AS $$
DECLARE
  v_user_facility UUID;
  v_result JSONB;
  v_inserted_ids UUID[];
  v_metric JSONB;
BEGIN
  -- Verify user has access to facility
  SELECT facility_id INTO v_user_facility FROM users WHERE id = auth.uid();
  
  IF v_user_facility != p_facility_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot submit data for this facility';
  END IF;

  -- Validate date range
  IF p_reporting_end < p_reporting_start THEN
    RAISE EXCEPTION 'Invalid date range';
  END IF;

  -- Insert each metric
  FOR v_metric IN SELECT * FROM jsonb_array_elements(p_metrics)
  LOOP
    INSERT INTO performance_data (
      facility_id,
      reporting_period_start,
      reporting_period_end,
      program_name,
      metric_key,
      metric_value,
      target_value,
      unit,
      status,
      created_by
    ) VALUES (
      p_facility_id,
      p_reporting_start,
      p_reporting_end,
      p_program_name,
      v_metric->>'metric_key',
      (v_metric->>'metric_value')::NUMERIC,
      (v_metric->>'target_value')::NUMERIC,
      v_metric->>'unit',
      'submitted',
      auth.uid()
    ) RETURNING id INTO v_inserted_ids[array_length(v_inserted_ids, 1) + 1];

    -- Log audit
    INSERT INTO audit_logs (user_id, action, entity, entity_id, new_values)
    VALUES (auth.uid(), 'insert', 'performance_data', v_inserted_ids[array_length(v_inserted_ids, 1)], v_metric);
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'inserted_ids', v_inserted_ids,
    'message', 'Performance data submitted successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SUBMIT SCHEME DATA
-- ============================================
CREATE OR REPLACE FUNCTION submit_scheme_data(
  p_facility_id UUID,
  p_scheme_name TEXT,
  p_scheme_category TEXT,
  p_reporting_start DATE,
  p_reporting_end DATE,
  p_beneficiary_count INTEGER,
  p_target_beneficiaries INTEGER,
  p_funds_allocated NUMERIC,
  p_funds_utilized NUMERIC,
  p_activities JSONB,
  p_doc_ids TEXT[]
)
RETURNS JSONB AS $$
DECLARE
  v_user_facility UUID;
  v_scheme_id UUID;
BEGIN
  -- Verify access
  SELECT facility_id INTO v_user_facility FROM users WHERE id = auth.uid();
  
  IF v_user_facility != p_facility_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Insert scheme data
  INSERT INTO scheme_tracking (
    facility_id,
    scheme_name,
    scheme_category,
    reporting_period_start,
    reporting_period_end,
    beneficiary_count,
    target_beneficiaries,
    funds_allocated,
    funds_utilized,
    activities,
    supporting_doc_ids,
    status,
    created_by
  ) VALUES (
    p_facility_id,
    p_scheme_name,
    p_scheme_category,
    p_reporting_start,
    p_reporting_end,
    p_beneficiary_count,
    p_target_beneficiaries,
    p_funds_allocated,
    p_funds_utilized,
    p_activities,
    p_doc_ids,
    'submitted',
    auth.uid()
  ) RETURNING id INTO v_scheme_id;

  -- Log audit
  INSERT INTO audit_logs (user_id, action, entity, entity_id, new_values)
  VALUES (auth.uid(), 'insert', 'scheme_tracking', v_scheme_id, 
    jsonb_build_object('scheme_name', p_scheme_name, 'beneficiary_count', p_beneficiary_count));

  RETURN jsonb_build_object('success', true, 'scheme_id', v_scheme_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- REVIEW SUBMISSION (Approve/Reject)
-- ============================================
CREATE OR REPLACE FUNCTION review_submission(
  p_entity_type TEXT, -- 'performance_data' or 'scheme_tracking'
  p_entity_id UUID,
  p_new_status status_enum,
  p_comments TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_role role_enum;
  v_user_district UUID;
  v_facility_id UUID;
  v_facility_district UUID;
BEGIN
  -- Get user role and district
  SELECT role, district_id INTO v_user_role, v_user_district 
  FROM users WHERE id = auth.uid();

  -- Only district_admin can review
  IF v_user_role != 'district_admin' AND v_user_role != 'super_admin' THEN
    RAISE EXCEPTION 'Unauthorized: Only district admins can review submissions';
  END IF;

  -- Get facility for the submission
  IF p_entity_type = 'performance_data' THEN
    SELECT f.id, f.district_id INTO v_facility_id, v_facility_district
    FROM performance_data pd
    JOIN facilities f ON pd.facility_id = f.id
    WHERE pd.id = p_entity_id;
  ELSIF p_entity_type = 'scheme_tracking' THEN
    SELECT f.id, f.district_id INTO v_facility_id, v_facility_district
    FROM scheme_tracking st
    JOIN facilities f ON st.facility_id = f.id
    WHERE st.id = p_entity_id;
  ELSE
    RAISE EXCEPTION 'Invalid entity type';
  END IF;

  -- Verify district access
  IF v_user_role = 'district_admin' AND v_user_district != v_facility_district THEN
    RAISE EXCEPTION 'Unauthorized: Cannot review submissions from other districts';
  END IF;

  -- Update the submission
  IF p_entity_type = 'performance_data' THEN
    UPDATE performance_data SET
      status = p_new_status,
      comments = p_comments,
      rejection_reason = CASE WHEN p_new_status = 'rejected' THEN p_rejection_reason ELSE NULL END,
      reviewed_by = auth.uid(),
      reviewed_at = NOW()
    WHERE id = p_entity_id;
  ELSIF p_entity_type = 'scheme_tracking' THEN
    UPDATE scheme_tracking SET
      status = p_new_status,
      comments = p_comments,
      rejection_reason = CASE WHEN p_new_status = 'rejected' THEN p_rejection_reason ELSE NULL END,
      reviewed_by = auth.uid(),
      reviewed_at = NOW()
    WHERE id = p_entity_id;
  END IF;

  -- Log audit
  INSERT INTO audit_logs (user_id, action, entity, entity_id, new_values)
  VALUES (auth.uid(), 
    CASE p_new_status 
      WHEN 'approved' THEN 'approve'
      WHEN 'rejected' THEN 'reject'
      ELSE 'update'
    END,
    p_entity_type, 
    p_entity_id,
    jsonb_build_object('status', p_new_status, 'comments', p_comments)
  );

  RETURN jsonb_build_object('success', true, 'new_status', p_new_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GET FACILITY DASHBOARD
-- ============================================
CREATE OR REPLACE FUNCTION get_facility_dashboard(
  p_facility_id UUID DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_facility UUID;
  v_facility_id UUID;
  v_result JSONB;
BEGIN
  -- If no facility_id provided, use user's facility
  SELECT facility_id INTO v_user_facility FROM users WHERE id = auth.uid();
  v_facility_id := COALESCE(p_facility_id, v_user_facility);

  -- Verify access
  IF v_user_facility != v_facility_id AND 
     NOT EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('district_admin', 'state_admin', 'super_admin')) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT jsonb_build_object(
    'facility', (SELECT row_to_json(f) FROM facilities f WHERE f.id = v_facility_id),
    'performance_metrics', (
      SELECT jsonb_agg(pd ORDER BY pd.created_at DESC)
      FROM performance_data pd
      WHERE pd.facility_id = v_facility_id
        AND (p_start_date IS NULL OR pd.reporting_period_start >= p_start_date)
        AND (p_end_date IS NULL OR pd.reporting_period_end <= p_end_date)
      LIMIT 100
    ),
    'scheme_data', (
      SELECT jsonb_agg(st ORDER BY st.created_at DESC)
      FROM scheme_tracking st
      WHERE st.facility_id = v_facility_id
        AND (p_start_date IS NULL OR st.reporting_period_start >= p_start_date)
        AND (p_end_date IS NULL OR st.reporting_period_end <= p_end_date)
      LIMIT 100
    ),
    'status_summary', (
      SELECT jsonb_build_object(
        'performance', jsonb_build_object(
          'submitted', COUNT(*) FILTER (WHERE status = 'submitted'),
          'approved', COUNT(*) FILTER (WHERE status = 'approved'),
          'rejected', COUNT(*) FILTER (WHERE status = 'rejected'),
          'sent_back', COUNT(*) FILTER (WHERE status = 'sent_back')
        ),
        'schemes', (
          SELECT jsonb_build_object(
            'submitted', COUNT(*) FILTER (WHERE status = 'submitted'),
            'approved', COUNT(*) FILTER (WHERE status = 'approved'),
            'rejected', COUNT(*) FILTER (WHERE status = 'rejected')
          )
          FROM scheme_tracking
          WHERE facility_id = v_facility_id
        )
      )
      FROM performance_data
      WHERE facility_id = v_facility_id
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GET DISTRICT DASHBOARD
-- ============================================
CREATE OR REPLACE FUNCTION get_district_dashboard(
  p_district_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_district UUID;
  v_district_id UUID;
  v_result JSONB;
BEGIN
  SELECT district_id INTO v_user_district FROM users WHERE id = auth.uid();
  v_district_id := COALESCE(p_district_id, v_user_district);

  -- Verify access
  IF NOT EXISTS(
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND (district_id = v_district_id OR role IN ('state_admin', 'super_admin'))
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT jsonb_build_object(
    'district', (SELECT row_to_json(d) FROM districts d WHERE d.id = v_district_id),
    'facilities_summary', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'by_type', jsonb_object_agg(facility_type, type_count)
      )
      FROM (
        SELECT facility_type, COUNT(*) as type_count
        FROM facilities
        WHERE district_id = v_district_id AND is_active = true
        GROUP BY facility_type
      ) t
    ),
    'pending_reviews', (
      SELECT COUNT(*)
      FROM performance_data pd
      JOIN facilities f ON pd.facility_id = f.id
      WHERE f.district_id = v_district_id
        AND pd.status = 'submitted'
    ),
    'facilities', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'facility', row_to_json(f),
          'pending_count', (
            SELECT COUNT(*) FROM performance_data pd 
            WHERE pd.facility_id = f.id AND pd.status = 'submitted'
          )
        )
      )
      FROM facilities f
      WHERE f.district_id = v_district_id AND f.is_active = true
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GET STATE DASHBOARD & ANALYTICS
-- ============================================
CREATE OR REPLACE FUNCTION get_state_dashboard(
  p_state_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_state UUID;
  v_state_id UUID;
  v_result JSONB;
BEGIN
  SELECT state_id INTO v_user_state FROM users WHERE id = auth.uid();
  v_state_id := COALESCE(p_state_id, v_user_state);

  -- Verify access
  IF NOT EXISTS(
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND (state_id = v_state_id OR role = 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT jsonb_build_object(
    'state', (SELECT row_to_json(s) FROM states s WHERE s.id = v_state_id),
    'districts_count', (
      SELECT COUNT(*) FROM districts WHERE state_id = v_state_id AND is_active = true
    ),
    'facilities_count', (
      SELECT COUNT(*) 
      FROM facilities f
      JOIN districts d ON f.district_id = d.id
      WHERE d.state_id = v_state_id AND f.is_active = true
    ),
    'district_performance', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'district', row_to_json(d),
          'facilities_count', (
            SELECT COUNT(*) FROM facilities f 
            WHERE f.district_id = d.id AND f.is_active = true
          ),
          'approved_submissions', (
            SELECT COUNT(*)
            FROM performance_data pd
            JOIN facilities f ON pd.facility_id = f.id
            WHERE f.district_id = d.id AND pd.status = 'approved'
          )
        )
      )
      FROM districts d
      WHERE d.state_id = v_state_id AND d.is_active = true
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GET PERFORMANCE TRENDS
-- ============================================
CREATE OR REPLACE FUNCTION get_performance_trends(
  p_facility_id UUID,
  p_metric_key TEXT,
  p_months INTEGER DEFAULT 12
)
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT jsonb_agg(
      jsonb_build_object(
        'period', reporting_period_start,
        'value', metric_value,
        'target', target_value,
        'status', status
      ) ORDER BY reporting_period_start
    )
    FROM performance_data
    WHERE facility_id = p_facility_id
      AND metric_key = p_metric_key
      AND reporting_period_start >= CURRENT_DATE - (p_months || ' months')::INTERVAL
      AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GET SUPER ADMIN OVERVIEW
-- ============================================
CREATE OR REPLACE FUNCTION get_superadmin_overview()
RETURNS JSONB AS $$
BEGIN
  -- Verify super admin
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Super admin only';
  END IF;

  RETURN jsonb_build_object(
    'states_count', (SELECT COUNT(*) FROM states WHERE is_active = true),
    'districts_count', (SELECT COUNT(*) FROM districts WHERE is_active = true),
    'facilities_count', (SELECT COUNT(*) FROM facilities WHERE is_active = true),
    'users_count', (SELECT COUNT(*) FROM users WHERE is_active = true),
    'pending_reviews', (
      SELECT COUNT(*) FROM performance_data WHERE status = 'submitted'
    ),
    'recent_activity', (
      SELECT jsonb_agg(al ORDER BY al.created_at DESC)
      FROM audit_logs al
      LIMIT 50
    ),
    'facilities_by_type', (
      SELECT jsonb_object_agg(facility_type, count)
      FROM (
        SELECT facility_type, COUNT(*) as count
        FROM facilities
        WHERE is_active = true
        GROUP BY facility_type
      ) t
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
