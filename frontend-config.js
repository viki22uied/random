// ============================================
// HDIMS Frontend Configuration
// ============================================

export const config = {
  // Supabase Configuration (from your backend .env)
  supabase: {
    url: 'https://dkukdrpfbqdfbvptwhuz.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrdWtkcnBmYnFkZmJ2cHR3aHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4ODQ2OTAsImV4cCI6MjA3OTQ2MDY5MH0.ByjkkUazAh4KM7nQi0UpjqUc6u2K2xEPRjzyRt5sJ6Q',
  },

  // API Endpoints
  api: {
    rest: 'https://dkukdrpfbqdfbvptwhuz.supabase.co/rest/v1/',
    functions: 'https://dkukdrpfbqdfbvptwhuz.supabase.co/functions/v1/',
    auth: 'https://dkukdrpfbqdfbvptwhuz.supabase.co/auth/v1/',
    storage: 'https://dkukdrpfbqdfbvptwhuz.supabase.co/storage/v1/',
  },

  // Edge Functions
  functions: {
    submitPerformance: 'https://dkukdrpfbqdfbvptwhuz.supabase.co/functions/v1/submit-performance',
    submitScheme: 'https://dkukdrpfbqdfbvptwhuz.supabase.co/functions/v1/submit-scheme',
    reviewSubmission: 'https://dkukdrpfbqdfbvptwhuz.supabase.co/functions/v1/review-submission',
    analyticsDistrict: 'https://dkukdrpfbqdfbvptwhuz.supabase.co/functions/v1/analytics-district',
    analyticsState: 'https://dkukdrpfbqdfbvptwhuz.supabase.co/functions/v1/analytics-state',
    uploadDocument: 'https://dkukdrpfbqdfbvptwhuz.supabase.co/functions/v1/upload-document',
  },

  // RPC Functions
  rpc: {
    submitPerformanceData: 'submit_performance_data',
    submitSchemeData: 'submit_scheme_data',
    reviewSubmission: 'review_submission',
    getFacilityDashboard: 'get_facility_dashboard',
    getDistrictDashboard: 'get_district_dashboard',
    getStateDashboard: 'get_state_dashboard',
    getPerformanceTrends: 'get_performance_trends',
    getSuperadminOverview: 'get_superadmin_overview',
  },

  // Application Settings
  app: {
    name: 'HDIMS - Health Data Information & Management System',
    version: '1.0.0',
    environment: 'development',
  },

  // User Roles
  roles: {
    HOSPITAL_USER: 'hospital_user',
    DISTRICT_ADMIN: 'district_admin',
    STATE_ADMIN: 'state_admin',
    SUPER_ADMIN: 'super_admin',
  },

  // Status Options
  status: {
    SUBMITTED: 'submitted',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    SENT_BACK: 'sent_back',
    UNDER_REVIEW: 'under_review',
  },
};

export default config;
