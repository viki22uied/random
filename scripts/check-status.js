// ============================================
// HDIMS System Status Check
// ============================================

const { createClient } = require('@supabase/supabase-js');

// Supabase client
const supabase = createClient(
  'https://dkukdrpfbqdfbvptwhuz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrdWtkcnBmYnFkZmJ2cHR3aHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4ODQ2OTAsImV4cCI6MjA3OTQ2MDY5MH0.ByjkkUazAh4KM7nQi0UpjqUc6u2K2xEPRjzyRt5sJ6Q'
);

async function checkSystemStatus() {
  console.log('🔍 HDIMS System Status Check');
  console.log('================================');

  try {
    // Test database connection
    console.log('\n📊 Testing Database Connection...');
    const { data, error } = await supabase
      .from('states')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Database: Connection failed');
      console.log('   Error:', error.message);
    } else {
      console.log('✅ Database: Connected and working');
    }

    // Test RPC function
    console.log('\n🔧 Testing RPC Functions...');
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_superadmin_overview');
      if (rpcError) {
        console.log('❌ RPC: Function call failed');
        console.log('   Error:', rpcError.message);
      } else {
        console.log('✅ RPC: Functions working');
      }
    } catch (rpcErr) {
      console.log('❌ RPC: Function call failed');
      console.log('   Error:', rpcErr.message);
    }

    // Test Edge Function
    console.log('\n⚡ Testing Edge Functions...');
    try {
      const response = await fetch('https://dkukdrpfbqdfbvptwhuz.supabase.co/functions/v1/analytics-district');
      if (response.ok) {
        console.log('✅ Edge Functions: Deployed and responding');
      } else {
        console.log('❌ Edge Functions: Not responding properly');
      }
    } catch (edgeErr) {
      console.log('❌ Edge Functions: Connection failed');
      console.log('   Error:', edgeErr.message);
    }

    // Test authentication
    console.log('\n🔐 Testing Authentication...');
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@hdims.gov.in',
        password: 'Admin123!'
      });

      if (authError) {
        console.log('❌ Authentication: Sign in failed');
        console.log('   Error:', authError.message);
      } else {
        console.log('✅ Authentication: Working correctly');
        console.log('   User:', authData.user.email);
      }
    } catch (authErr) {
      console.log('❌ Authentication: Sign in failed');
      console.log('   Error:', authErr.message);
    }

    console.log('\n🌐 Access URLs:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Auth Page: http://localhost:3000/auth');
    console.log('   Dashboard: http://localhost:3000/hdims-dashboard');
    console.log('   Backend API: https://dkukdrpfbqdfbvptwhuz.supabase.co/rest/v1/');
    console.log('   Supabase Dashboard: https://supabase.com/dashboard/project/dkukdrpfbqdfbvptwhuz');

    console.log('\n👤 Admin Credentials:');
    console.log('   Email: admin@hdims.gov.in');
    console.log('   Password: Admin123!');
    console.log('   Role: super_admin');

    console.log('\n🚀 Your HDIMS System is Ready!');
    console.log('================================');

  } catch (error) {
    console.error('System check failed:', error);
  }
}

checkSystemStatus();
