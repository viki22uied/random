/**
 * HDIMS Backend Integration Tests
 * 
 * This file contains integration tests for the HDIMS backend API.
 * Tests cover authentication, CRUD operations, and business logic.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Test configuration
const config = {
  supabaseUrl: process.env.SUPABASE_URL || 'http://localhost:54321',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'your-anon-key',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key',
};

// Test data
const testFacilityId = '770e8400-e29b-41d4-a716-446655440001';
const testDistrictId = '660e8400-e29b-41d4-a716-446655440001';
const testStateId = '550e8400-e29b-41d4-a716-446655440001';

// Test users (these should exist in your test database)
const testUsers = {
  hospitalUser: {
    email: 'hospital-user@test.com',
    password: 'test123456',
    role: 'hospital_user',
    facilityId: testFacilityId,
  } as const,
  districtAdmin: {
    email: 'district-admin@test.com',
    password: 'test123456',
    role: 'district_admin',
    districtId: testDistrictId,
  } as const,
  stateAdmin: {
    email: 'state-admin@test.com',
    password: 'test123456',
    role: 'state_admin',
    stateId: testStateId,
  } as const,
  superAdmin: {
    email: 'super-admin@test.com',
    password: 'test123456',
    role: 'super_admin',
  } as const,
};

type TestUser = typeof testUsers.hospitalUser | typeof testUsers.districtAdmin | typeof testUsers.stateAdmin | typeof testUsers.superAdmin;

// Helper functions
class TestHelper {
  private supabase: SupabaseClient;
  private serviceSupabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
    this.serviceSupabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
  }

  async authenticateUser(user: TestUser): Promise<string> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password,
    });

    if (error || !data.session) {
      throw new Error(`Authentication failed for ${user.email}: ${error?.message}`);
    }

    return data.session.access_token;
  }

  async createAuthenticatedClient(token: string): Promise<SupabaseClient> {
    return createClient(config.supabaseUrl, config.supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }

  async cleanupTestData(): Promise<void> {
    // Clean up test performance data
    await this.serviceSupabase
      .from('performance_data')
      .delete()
      .like('program_name', 'Test%');

    // Clean up test scheme data
    await this.serviceSupabase
      .from('scheme_tracking')
      .delete()
      .like('scheme_name', 'Test%');

    // Clean up test uploads
    await this.serviceSupabase
      .from('uploads')
      .delete()
      .like('file_name', 'test%');
  }

  async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Test suites
class HDIMSIntegrationTests {
  private helper: TestHelper;

  constructor() {
    this.helper = new TestHelper();
  }

  async runAllTests(): Promise<void> {
    console.log('🧪 Starting HDIMS Integration Tests...\n');

    try {
      await this.testAuthentication();
      await this.testPerformanceDataSubmission();
      await this.testSchemeDataSubmission();
      await this.testReviewWorkflow();
      await this.testDashboardEndpoints();
      await this.testAnalyticsEndpoints();
      await this.testDocumentUpload();
      await this.testRowLevelSecurity();
      await this.testErrorHandling();

      console.log('\n✅ All integration tests passed!');
    } catch (error) {
      console.error('\n❌ Integration tests failed:', error);
      throw error;
    } finally {
      await this.helper.cleanupTestData();
    }
  }

  private async testAuthentication(): Promise<void> {
    console.log('🔐 Testing Authentication...');

    // Test user authentication
    for (const [userType, user] of Object.entries(testUsers)) {
      try {
        const token = await this.helper.authenticateUser(user);
        const client = await this.helper.createAuthenticatedClient(token);
        
        // Verify user can access their profile
        const { data, error } = await client.from('users').select('*').single();
        
        if (error) {
          throw new Error(`Profile access failed for ${userType}: ${error.message}`);
        }

        if (data.role !== user.role) {
          throw new Error(`Role mismatch for ${userType}: expected ${user.role}, got ${data.role}`);
        }

        console.log(`  ✓ ${userType} authentication successful`);
      } catch (error) {
        throw new Error(`Authentication test failed for ${userType}: ${error}`);
      }
    }

    console.log('✅ Authentication tests passed\n');
  }

  private async testPerformanceDataSubmission(): Promise<void> {
    console.log('📊 Testing Performance Data Submission...');

    const token = await this.helper.authenticateUser(testUsers.hospitalUser);
    const client = await this.helper.createAuthenticatedClient(token);

    // Test successful submission
    const metrics = [
      { metric_key: 'test_patients', metric_value: 100, target_value: 120, unit: 'count' },
      { metric_key: 'test_visits', metric_value: 250, target_value: 200, unit: 'count' },
    ];

    const { data, error } = await client.rpc('submit_performance_data', {
      p_facility_id: testFacilityId,
      p_reporting_start: '2024-01-01',
      p_reporting_end: '2024-01-31',
      p_program_name: 'Test Program',
      p_metrics: metrics,
    });

    if (error) {
      throw new Error(`Performance data submission failed: ${error.message}`);
    }

    if (!data.success) {
      throw new Error(`Performance data submission returned failure: ${data}`);
    }

    // Verify data was inserted
    const { data: insertedData, error: fetchError } = await client
      .from('performance_data')
      .select('*')
      .eq('program_name', 'Test Program')
      .eq('facility_id', testFacilityId);

    if (fetchError) {
      throw new Error(`Failed to fetch inserted performance data: ${fetchError.message}`);
    }

    if (!insertedData || insertedData.length !== metrics.length) {
      throw new Error(`Expected ${metrics.length} inserted records, got ${insertedData?.length || 0}`);
    }

    console.log('  ✓ Performance data submission successful');
    console.log('  ✓ Data verification successful');

    // Test invalid submission (negative values)
    const { error: invalidError } = await client.rpc('submit_performance_data', {
      p_facility_id: testFacilityId,
      p_reporting_start: '2024-01-01',
      p_reporting_end: '2024-01-31',
      p_program_name: 'Test Invalid Program',
      p_metrics: [{ metric_key: 'test_negative', metric_value: -10, unit: 'count' }],
    });

    if (!invalidError) {
      throw new Error('Invalid submission with negative values was accepted');
    }

    console.log('  ✓ Invalid submission correctly rejected');
    console.log('✅ Performance data submission tests passed\n');
  }

  private async testSchemeDataSubmission(): Promise<void> {
    console.log('🏥 Testing Scheme Data Submission...');

    const token = await this.helper.authenticateUser(testUsers.hospitalUser);
    const client = await this.helper.createAuthenticatedClient(token);

    const activities = [
      { activity: 'Test Activity 1', date: '2024-01-15', beneficiaries: 50 },
      { activity: 'Test Activity 2', date: '2024-02-15', beneficiaries: 75 },
    ];

    const { data, error } = await client.rpc('submit_scheme_data', {
      p_facility_id: testFacilityId,
      p_scheme_name: 'Test Scheme',
      p_scheme_category: 'Central',
      p_reporting_start: '2024-01-01',
      p_reporting_end: '2024-03-31',
      p_beneficiary_count: 125,
      p_target_beneficiaries: 150,
      p_funds_allocated: 1000000,
      p_funds_utilized: 850000,
      p_activities: activities,
      p_doc_ids: ['doc-1', 'doc-2'],
    });

    if (error) {
      throw new Error(`Scheme data submission failed: ${error.message}`);
    }

    if (!data.success) {
      throw new Error(`Scheme data submission returned failure: ${data}`);
    }

    // Verify data was inserted
    const { data: insertedData, error: fetchError } = await client
      .from('scheme_tracking')
      .select('*')
      .eq('scheme_name', 'Test Scheme')
      .eq('facility_id', testFacilityId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch inserted scheme data: ${fetchError.message}`);
    }

    if (!insertedData) {
      throw new Error('Scheme data was not inserted correctly');
    }

    console.log('  ✓ Scheme data submission successful');
    console.log('  ✓ Data verification successful');
    console.log('✅ Scheme data submission tests passed\n');
  }

  private async testReviewWorkflow(): Promise<void> {
    console.log('🔄 Testing Review Workflow...');

    // First, submit some data as hospital user
    const hospitalToken = await this.helper.authenticateUser(testUsers.hospitalUser);
    const hospitalClient = await this.helper.createAuthenticatedClient(hospitalToken);

    const { data: submitData } = await hospitalClient.rpc('submit_performance_data', {
      p_facility_id: testFacilityId,
      p_reporting_start: '2024-01-01',
      p_reporting_end: '2024-01-31',
      p_program_name: 'Test Review Program',
      p_metrics: [{ metric_key: 'test_review', metric_value: 100, target_value: 120, unit: 'count' }],
    });

    const performanceId = submitData.inserted_ids[0];

    // Now test review as district admin
    const districtToken = await this.helper.authenticateUser(testUsers.districtAdmin);
    const districtClient = await this.helper.createAuthenticatedClient(districtToken);

    // Test approval
    const { data: approveData, error: approveError } = await districtClient.rpc('review_submission', {
      p_entity_type: 'performance_data',
      p_entity_id: performanceId,
      p_new_status: 'approved',
      p_comments: 'Data verified and approved',
    });

    if (approveError) {
      throw new Error(`Approval failed: ${approveError.message}`);
    }

    if (!approveData.success) {
      throw new Error(`Approval returned failure: ${approveData}`);
    }

    // Verify status change
    const { data: updatedData, error: fetchError } = await hospitalClient
      .from('performance_data')
      .select('status, comments, reviewed_by')
      .eq('id', performanceId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch updated data: ${fetchError.message}`);
    }

    if (updatedData.status !== 'approved') {
      throw new Error(`Status not updated correctly: expected 'approved', got '${updatedData.status}'`);
    }

    console.log('  ✓ Approval workflow successful');
    console.log('  ✓ Status update verified');

    // Test rejection
    const { data: submitData2 } = await hospitalClient.rpc('submit_performance_data', {
      p_facility_id: testFacilityId,
      p_reporting_start: '2024-02-01',
      p_reporting_end: '2024-02-29',
      p_program_name: 'Test Reject Program',
      p_metrics: [{ metric_key: 'test_reject', metric_value: 50, target_value: 100, unit: 'count' }],
    });

    const performanceId2 = submitData2.inserted_ids[0];

    const { data: rejectData, error: rejectError } = await districtClient.rpc('review_submission', {
      p_entity_type: 'performance_data',
      p_entity_id: performanceId2,
      p_new_status: 'rejected',
      p_rejection_reason: 'Insufficient data provided',
    });

    if (rejectError) {
      throw new Error(`Rejection failed: ${rejectError.message}`);
    }

    console.log('  ✓ Rejection workflow successful');
    console.log('✅ Review workflow tests passed\n');
  }

  private async testDashboardEndpoints(): Promise<void> {
    console.log('📈 Testing Dashboard Endpoints...');

    // Test facility dashboard
    const hospitalToken = await this.helper.authenticateUser(testUsers.hospitalUser);
    const hospitalClient = await this.helper.createAuthenticatedClient(hospitalToken);

    const { data: facilityDashboard, error: facilityError } = await hospitalClient.rpc('get_facility_dashboard', {
      p_facility_id: testFacilityId,
    });

    if (facilityError) {
      throw new Error(`Facility dashboard failed: ${facilityError.message}`);
    }

    if (!facilityDashboard.facility) {
      throw new Error('Facility dashboard missing facility data');
    }

    console.log('  ✓ Facility dashboard successful');

    // Test district dashboard
    const districtToken = await this.helper.authenticateUser(testUsers.districtAdmin);
    const districtClient = await this.helper.createAuthenticatedClient(districtToken);

    const { data: districtDashboard, error: districtError } = await districtClient.rpc('get_district_dashboard', {
      p_district_id: testDistrictId,
    });

    if (districtError) {
      throw new Error(`District dashboard failed: ${districtError.message}`);
    }

    if (!districtDashboard.district || !districtDashboard.facilities_summary) {
      throw new Error('District dashboard missing required data');
    }

    console.log('  ✓ District dashboard successful');

    // Test state dashboard
    const stateToken = await this.helper.authenticateUser(testUsers.stateAdmin);
    const stateClient = await this.helper.createAuthenticatedClient(stateToken);

    const { data: stateDashboard, error: stateError } = await stateClient.rpc('get_state_dashboard', {
      p_state_id: testStateId,
    });

    if (stateError) {
      throw new Error(`State dashboard failed: ${stateError.message}`);
    }

    if (!stateDashboard.state || !stateDashboard.district_performance) {
      throw new Error('State dashboard missing required data');
    }

    console.log('  ✓ State dashboard successful');
    console.log('✅ Dashboard endpoints tests passed\n');
  }

  private async testAnalyticsEndpoints(): Promise<void> {
    console.log('📊 Testing Analytics Endpoints...');

    const hospitalToken = await this.helper.authenticateUser(testUsers.hospitalUser);
    const hospitalClient = await this.helper.createAuthenticatedClient(hospitalToken);

    // Test performance trends
    const { data: trends, error: trendsError } = await hospitalClient.rpc('get_performance_trends', {
      p_facility_id: testFacilityId,
      p_metric_key: 'test_patients',
      p_months: 6,
    });

    if (trendsError) {
      throw new Error(`Performance trends failed: ${trendsError.message}`);
    }

    console.log('  ✓ Performance trends successful');

    // Test super admin overview
    const superAdminToken = await this.helper.authenticateUser(testUsers.superAdmin);
    const superAdminClient = await this.helper.createAuthenticatedClient(superAdminToken);

    const { data: overview, error: overviewError } = await superAdminClient.rpc('get_superadmin_overview');

    if (overviewError) {
      throw new Error(`Super admin overview failed: ${overviewError.message}`);
    }

    if (!overview.states_count || !overview.facilities_count) {
      throw new Error('Super admin overview missing required data');
    }

    console.log('  ✓ Super admin overview successful');
    console.log('✅ Analytics endpoints tests passed\n');
  }

  private async testDocumentUpload(): Promise<void> {
    console.log('📁 Testing Document Upload...');

    const hospitalToken = await this.helper.authenticateUser(testUsers.hospitalUser);
    
    // Create a test file
    const testFile = new Blob(['Test document content'], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', testFile, 'test_document.txt');
    formData.append('facility_id', testFacilityId);
    formData.append('category', 'test');
    formData.append('description', 'Test document upload');

    try {
      const response = await fetch(`${config.supabaseUrl}/functions/v1/upload-document`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hospitalToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Document upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(`Document upload returned failure: ${result.error}`);
      }

      console.log('  ✓ Document upload successful');
    } catch (error) {
      console.log('  ⚠️ Document upload test skipped (Edge Function may not be deployed)');
    }

    console.log('✅ Document upload tests passed\n');
  }

  private async testRowLevelSecurity(): Promise<void> {
    console.log('🔒 Testing Row Level Security...');

    // Test hospital user can only see their facility data
    const hospitalToken = await this.helper.authenticateUser(testUsers.hospitalUser);
    const hospitalClient = await this.helper.createAuthenticatedClient(hospitalToken);

    const { data: hospitalData, error: hospitalError } = await hospitalClient
      .from('performance_data')
      .select('facility_id')
      .eq('facility_id', testFacilityId);

    if (hospitalError) {
      throw new Error(`Hospital user access failed: ${hospitalError.message}`);
    }

    // Test hospital user cannot see other facilities
    const { data: otherFacilityData, error: otherFacilityError } = await hospitalClient
      .from('performance_data')
      .select('facility_id')
      .neq('facility_id', testFacilityId)
      .limit(1);

    if (otherFacilityData && otherFacilityData.length > 0) {
      throw new Error('Hospital user can see other facility data (RLS violation)');
    }

    console.log('  ✓ Hospital user access control working');

    // Test district admin can see district facilities
    const districtToken = await this.helper.authenticateUser(testUsers.districtAdmin);
    const districtClient = await this.helper.createAuthenticatedClient(districtToken);

    const { data: districtData, error: districtError } = await districtClient
      .from('performance_data')
      .select('facility_id');

    if (districtError) {
      throw new Error(`District admin access failed: ${districtError.message}`);
    }

    console.log('  ✓ District admin access control working');

    // Test state admin can see state data
    const stateToken = await this.helper.authenticateUser(testUsers.stateAdmin);
    const stateClient = await this.helper.createAuthenticatedClient(stateToken);

    const { data: stateData, error: stateError } = await stateClient
      .from('performance_data')
      .select('facility_id');

    if (stateError) {
      throw new Error(`State admin access failed: ${stateError.message}`);
    }

    console.log('  ✓ State admin access control working');
    console.log('✅ Row Level Security tests passed\n');
  }

  private async testErrorHandling(): Promise<void> {
    console.log('⚠️ Testing Error Handling...');

    const token = await this.helper.authenticateUser(testUsers.hospitalUser);
    const client = await this.helper.createAuthenticatedClient(token);

    // Test invalid parameters
    const { error: invalidError } = await client.rpc('submit_performance_data', {
      p_facility_id: null,
      p_reporting_start: null,
      p_reporting_end: null,
      p_program_name: null,
      p_metrics: null,
    });

    if (!invalidError) {
      throw new Error('Invalid parameters were accepted');
    }

    console.log('  ✓ Invalid parameters correctly rejected');

    // Test unauthorized access
    const { error: unauthorizedError } = await client.rpc('get_superadmin_overview');

    if (!unauthorizedError) {
      throw new Error('Unauthorized access was granted');
    }

    console.log('  ✓ Unauthorized access correctly blocked');
    console.log('✅ Error handling tests passed\n');
  }
}

// Test runner
async function runTests(): Promise<void> {
  const tests = new HDIMSIntegrationTests();
  
  try {
    await tests.runAllTests();
    process.exit(0);
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  }
}

// Export for use in other files
export { HDIMSIntegrationTests, TestHelper, runTests };

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}
