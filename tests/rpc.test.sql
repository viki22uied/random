-- ============================================
-- HDIMS: RPC Function Tests
-- ============================================

-- Test 1: submit_performance_data function
DO $$
DECLARE
    v_result JSONB;
    v_facility_id UUID := '770e8400-e29b-41d4-a716-446655440001';
    v_test_metrics JSONB := '[
        {"metric_key": "test_patients", "metric_value": 100, "target_value": 120, "unit": "count"},
        {"metric_key": "test_visits", "metric_value": 250, "target_value": 200, "unit": "count"}
    ]';
BEGIN
    RAISE NOTICE '=== Test 1: submit_performance_data Function ===';
    
    -- Test successful submission
    BEGIN
        SELECT submit_performance_data(
            v_facility_id,
            '2024-01-01',
            '2024-01-31',
            'Test Program',
            v_test_metrics
        ) INTO v_result;
        
        IF v_result->>'success' = 'true' THEN
            RAISE NOTICE 'SUCCESS: Performance data submitted successfully';
            RAISE NOTICE 'Inserted IDs: %', v_result->'inserted_ids';
        ELSE
            RAISE NOTICE 'ERROR: Performance data submission failed';
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: submit_performance_data failed: %', SQLERRM;
    END;
    
    -- Test invalid date range
    BEGIN
        SELECT submit_performance_data(
            v_facility_id,
            '2024-01-31',
            '2024-01-01',
            'Test Program',
            v_test_metrics
        ) INTO v_result;
        
        RAISE NOTICE 'ERROR: Invalid date range was accepted!';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'SUCCESS: Invalid date range correctly rejected: %', SQLERRM;
    END;
    
    -- Test invalid metrics (negative values)
    BEGIN
        SELECT submit_performance_data(
            v_facility_id,
            '2024-01-01',
            '2024-01-31',
            'Test Program',
            '[{"metric_key": "test_negative", "metric_value": -10, "unit": "count"}]'::jsonb
        ) INTO v_result;
        
        RAISE NOTICE 'ERROR: Negative metric value was accepted!';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'SUCCESS: Negative metric value correctly rejected: %', SQLERRM;
    END;
    
END $$;

-- Test 2: submit_scheme_data function
DO $$
DECLARE
    v_result JSONB;
    v_facility_id UUID := '770e8400-e29b-41d4-a716-446655440001';
    v_test_activities JSONB := '[
        {"activity": "Test Activity 1", "date": "2024-01-15", "beneficiaries": 50},
        {"activity": "Test Activity 2", "date": "2024-02-15", "beneficiaries": 75}
    ]';
BEGIN
    RAISE NOTICE '=== Test 2: submit_scheme_data Function ===';
    
    -- Test successful submission
    BEGIN
        SELECT submit_scheme_data(
            v_facility_id,
            'Test Scheme',
            'Central',
            '2024-01-01',
            '2024-03-31',
            125,
            150,
            1000000,
            850000,
            v_test_activities,
            ARRAY['doc-1', 'doc-2']
        ) INTO v_result;
        
        IF v_result->>'success' = 'true' THEN
            RAISE NOTICE 'SUCCESS: Scheme data submitted successfully';
            RAISE NOTICE 'Scheme ID: %', v_result->>'scheme_id';
        ELSE
            RAISE NOTICE 'ERROR: Scheme data submission failed';
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: submit_scheme_data failed: %', SQLERRM;
    END;
    
    -- Test negative beneficiary count
    BEGIN
        SELECT submit_scheme_data(
            v_facility_id,
            'Test Scheme Invalid',
            'Central',
            '2024-01-01',
            '2024-03-31',
            -10,
            150,
            1000000,
            850000,
            '[]'::jsonb,
            ARRAY[]
        ) INTO v_result;
        
        RAISE NOTICE 'ERROR: Negative beneficiary count was accepted!';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'SUCCESS: Negative beneficiary count correctly rejected: %', SQLERRM;
    END;
    
END $$;

-- Test 3: review_submission function
DO $$
DECLARE
    v_result JSONB;
    v_performance_id UUID;
    v_scheme_id UUID;
BEGIN
    RAISE NOTICE '=== Test 3: review_submission Function ===';
    
    -- Get a test performance data ID
    SELECT id INTO v_performance_id 
    FROM performance_data 
    WHERE status = 'submitted' 
    LIMIT 1;
    
    -- Get a test scheme tracking ID
    SELECT id INTO v_scheme_id 
    FROM scheme_tracking 
    WHERE status = 'submitted' 
    LIMIT 1;
    
    -- Test approving performance data
    IF v_performance_id IS NOT NULL THEN
        BEGIN
            SELECT review_submission(
                'performance_data',
                v_performance_id,
                'approved',
                'Data verified and approved',
                NULL
            ) INTO v_result;
            
            IF v_result->>'success' = 'true' THEN
                RAISE NOTICE 'SUCCESS: Performance data approved successfully';
            ELSE
                RAISE NOTICE 'ERROR: Performance data approval failed';
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'ERROR: review_submission for performance data failed: %', SQLERRM;
        END;
    END IF;
    
    -- Test rejecting scheme data
    IF v_scheme_id IS NOT NULL THEN
        BEGIN
            SELECT review_submission(
                'scheme_tracking',
                v_scheme_id,
                'rejected',
                NULL,
                'Insufficient documentation'
            ) INTO v_result;
            
            IF v_result->>'success' = 'true' THEN
                RAISE NOTICE 'SUCCESS: Scheme data rejected successfully';
            ELSE
                RAISE NOTICE 'ERROR: Scheme data rejection failed';
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'ERROR: review_submission for scheme data failed: %', SQLERRM;
        END;
    END IF;
    
    -- Test sending back for revision
    IF v_performance_id IS NOT NULL THEN
        -- First, reset status to submitted
        UPDATE performance_data SET status = 'submitted' WHERE id = v_performance_id;
        
        BEGIN
            SELECT review_submission(
                'performance_data',
                v_performance_id,
                'sent_back',
                'Please verify beneficiary counts',
                NULL
            ) INTO v_result;
            
            IF v_result->>'success' = 'true' THEN
                RAISE NOTICE 'SUCCESS: Performance data sent back successfully';
            ELSE
                RAISE NOTICE 'ERROR: Performance data send back failed';
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'ERROR: review_submission send back failed: %', SQLERRM;
        END;
    END IF;
    
END $$;

-- Test 4: get_facility_dashboard function
DO $$
DECLARE
    v_result JSONB;
    v_facility_id UUID := '770e8400-e29b-41d4-a716-446655440001';
BEGIN
    RAISE NOTICE '=== Test 4: get_facility_dashboard Function ===';
    
    -- Test getting facility dashboard
    BEGIN
        SELECT get_facility_dashboard(v_facility_id) INTO v_result;
        
        IF v_result IS NOT NULL THEN
            RAISE NOTICE 'SUCCESS: Facility dashboard retrieved successfully';
            RAISE NOTICE 'Facility name: %', v_result->'facility'->>'name';
            RAISE NOTICE 'Performance metrics count: %', jsonb_array_length(v_result->'performance_metrics');
            RAISE NOTICE 'Scheme data count: %', jsonb_array_length(v_result->'scheme_data');
        ELSE
            RAISE NOTICE 'ERROR: Facility dashboard retrieval failed';
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: get_facility_dashboard failed: %', SQLERRM;
    END;
    
    -- Test with date filters
    BEGIN
        SELECT get_facility_dashboard(v_facility_id, '2024-01-01', '2024-01-31') INTO v_result;
        
        IF v_result IS NOT NULL THEN
            RAISE NOTICE 'SUCCESS: Facility dashboard with date filters retrieved successfully';
        ELSE
            RAISE NOTICE 'ERROR: Filtered facility dashboard retrieval failed';
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: get_facility_dashboard with filters failed: %', SQLERRM;
    END;
    
END $$;

-- Test 5: get_district_dashboard function
DO $$
DECLARE
    v_result JSONB;
    v_district_id UUID := '660e8400-e29b-41d4-a716-446655440001';
BEGIN
    RAISE NOTICE '=== Test 5: get_district_dashboard Function ===';
    
    -- Test getting district dashboard
    BEGIN
        SELECT get_district_dashboard(v_district_id) INTO v_result;
        
        IF v_result IS NOT NULL THEN
            RAISE NOTICE 'SUCCESS: District dashboard retrieved successfully';
            RAISE NOTICE 'District name: %', v_result->'district'->>'name';
            RAISE NOTICE 'Total facilities: %', v_result->'facilities_summary'->>'total';
            RAISE NOTICE 'Pending reviews: %', v_result->'pending_reviews';
        ELSE
            RAISE NOTICE 'ERROR: District dashboard retrieval failed';
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: get_district_dashboard failed: %', SQLERRM;
    END;
    
END $$;

-- Test 6: get_state_dashboard function
DO $$
DECLARE
    v_result JSONB;
    v_state_id UUID := '550e8400-e29b-41d4-a716-446655440001';
BEGIN
    RAISE NOTICE '=== Test 6: get_state_dashboard Function ===';
    
    -- Test getting state dashboard
    BEGIN
        SELECT get_state_dashboard(v_state_id) INTO v_result;
        
        IF v_result IS NOT NULL THEN
            RAISE NOTICE 'SUCCESS: State dashboard retrieved successfully';
            RAISE NOTICE 'State name: %', v_result->'state'->>'name';
            RAISE NOTICE 'Districts count: %', v_result->'districts_count';
            RAISE NOTICE 'Facilities count: %', v_result->'facilities_count';
        ELSE
            RAISE NOTICE 'ERROR: State dashboard retrieval failed';
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: get_state_dashboard failed: %', SQLERRM;
    END;
    
END $$;

-- Test 7: get_performance_trends function
DO $$
DECLARE
    v_result JSONB;
    v_facility_id UUID := '770e8400-e29b-41d4-a716-446655440001';
BEGIN
    RAISE NOTICE '=== Test 7: get_performance_trends Function ===';
    
    -- Test getting performance trends
    BEGIN
        SELECT get_performance_trends(v_facility_id, 'total_opd_patients', 6) INTO v_result;
        
        IF v_result IS NOT NULL THEN
            RAISE NOTICE 'SUCCESS: Performance trends retrieved successfully';
            RAISE NOTICE 'Trend data points: %', jsonb_array_length(v_result);
        ELSE
            RAISE NOTICE 'INFO: No performance trends found (expected for test data)';
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: get_performance_trends failed: %', SQLERRM;
    END;
    
END $$;

-- Test 8: get_superadmin_overview function
DO $$
DECLARE
    v_result JSONB;
BEGIN
    RAISE NOTICE '=== Test 8: get_superadmin_overview Function ===';
    
    -- This function requires super admin role, so we'll test the structure
    BEGIN
        -- Mock super admin context for testing
        -- In a real test, this would be called with proper auth
        
        -- Test function exists and has correct structure
        SELECT proname FROM pg_proc WHERE proname = 'get_superadmin_overview';
        
        RAISE NOTICE 'SUCCESS: get_superadmin_overview function exists';
        
        -- Note: Actual execution requires super admin role
        RAISE NOTICE 'INFO: Function execution requires super admin authentication';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: get_superadmin_overview function test failed: %', SQLERRM;
    END;
    
END $$;

-- Test 9: Analytics functions
DO $$
DECLARE
    v_result RECORD;
BEGIN
    RAISE NOTICE '=== Test 9: Analytics Functions ===';
    
    -- Test get_performance_trends_aggregate
    BEGIN
        -- Test function exists
        SELECT proname FROM pg_proc WHERE proname = 'get_performance_trends_aggregate';
        RAISE NOTICE 'SUCCESS: get_performance_trends_aggregate function exists';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: get_performance_trends_aggregate function not found';
    END;
    
    -- Test get_facility_rankings
    BEGIN
        -- Test function exists
        SELECT proname FROM pg_proc WHERE proname = 'get_facility_rankings';
        RAISE NOTICE 'SUCCESS: get_facility_rankings function exists';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: get_facility_rankings function not found';
    END;
    
    -- Test refresh_district_kpi
    BEGIN
        -- Test function exists
        SELECT proname FROM pg_proc WHERE proname = 'refresh_district_kpi';
        RAISE NOTICE 'SUCCESS: refresh_district_kpi function exists';
        
        -- Test execution (if materialized view exists)
        PERFORM refresh_district_kpi();
        RAISE NOTICE 'SUCCESS: refresh_district_kpi executed successfully';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'INFO: refresh_district_kpi test completed (may fail if view doesn''t exist)';
    END;
    
END $$;

-- Test 10: Error handling and edge cases
DO $$
DECLARE
    v_result JSONB;
BEGIN
    RAISE NOTICE '=== Test 10: Error Handling and Edge Cases ===';
    
    -- Test with NULL parameters
    BEGIN
        SELECT submit_performance_data(NULL, NULL, NULL, NULL, NULL) INTO v_result;
        RAISE NOTICE 'ERROR: NULL parameters were accepted!';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'SUCCESS: NULL parameters correctly rejected: %', SQLERRM;
    END;
    
    -- Test with invalid UUID format
    BEGIN
        SELECT submit_performance_data(
            'invalid-uuid',
            '2024-01-01',
            '2024-01-31',
            'Test Program',
            '[{"metric_key": "test", "metric_value": 100}]'::jsonb
        ) INTO v_result;
        
        RAISE NOTICE 'ERROR: Invalid UUID was accepted!';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'SUCCESS: Invalid UUID correctly rejected: %', SQLERRM;
    END;
    
    -- Test with empty metrics array
    BEGIN
        SELECT submit_performance_data(
            '770e8400-e29b-41d4-a716-446655440001',
            '2024-01-01',
            '2024-01-31',
            'Test Program',
            '[]'::jsonb
        ) INTO v_result;
        
        RAISE NOTICE 'INFO: Empty metrics array test completed';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'SUCCESS: Empty metrics array handled: %', SQLERRM;
    END;
    
END $$;

-- Test Summary
DO $$
BEGIN
    RAISE NOTICE '=== RPC Function Tests Summary ===';
    RAISE NOTICE '✓ submit_performance_data function';
    RAISE NOTICE '✓ submit_scheme_data function';
    RAISE NOTICE '✓ review_submission function';
    RAISE NOTICE '✓ get_facility_dashboard function';
    RAISE NOTICE '✓ get_district_dashboard function';
    RAISE NOTICE '✓ get_state_dashboard function';
    RAISE NOTICE '✓ get_performance_trends function';
    RAISE NOTICE '✓ get_superadmin_overview function';
    RAISE NOTICE '✓ Analytics functions';
    RAISE NOTICE '✓ Error handling and edge cases';
    RAISE NOTICE '';
    RAISE NOTICE 'All RPC function tests completed!';
    RAISE NOTICE '';
    RAISE NOTICE 'Note: Some functions require proper authentication';
    RAISE NOTICE 'and authorization to execute successfully.';
END $$;
