// ============================================
// Create HDIMS Test Users (without foreign keys)
// ============================================

const { createClient } = require('@supabase/supabase-js');

// Supabase service role client (has admin privileges)
const supabaseAdmin = createClient(
  'https://dkukdrpfbqdfbvptwhuz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrdWtkcnBmYnFkZmJ2cHR3aHV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzg4NDY5MCwiZXhwIjoyMDc5NDYwNjkwfQ.h8yWdBZliW6wrOBi1xU3YVGCehvoz7UT1tAr8_aXLAU',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function createTestUsers() {
  try {
    console.log('🔧 Adding HDIMS Test Users to database...');

    // Test users data (without foreign keys for now)
    const testUsers = [
      {
        email: 'state@hdims.gov.in',
        fullName: 'State Administrator',
        role: 'state_admin'
      },
      {
        email: 'district@hdims.gov.in',
        fullName: 'District Administrator',
        role: 'district_admin'
      },
      {
        email: 'hospital@hdims.gov.in',
        fullName: 'Hospital Staff',
        role: 'hospital_user'
      }
    ];

    for (const user of testUsers) {
      console.log(`\n📧 Adding ${user.email} to users table...`);

      // Get user ID from auth system
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(
        (await supabaseAdmin.auth.admin.listUsers()).data.users.find(u => u.email === user.email)?.id
      );

      if (authError || !authData.user) {
        console.log(`❌ Could not find auth user for ${user.email}`);
        continue;
      }

      // Add user to users table without foreign keys
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authData.user.id,
          full_name: user.fullName,
          email: user.email,
          role: user.role,
          facility_id: null,
          district_id: null,
          state_id: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (userError) {
        console.log(`❌ Users table error for ${user.email}:`, userError.message);
      } else {
        console.log(`✅ User added to users table successfully!`);
      }
    }

    console.log('\n🎉 HDIMS Test Users Ready!');
    console.log('==========================================');
    console.log('👤 Available Test Accounts:');
    console.log('');
    console.log('🔹 Super Admin:');
    console.log('   Email: admin@hdims.gov.in');
    console.log('   Password: Admin123!');
    console.log('   Role: Super Admin');
    console.log('');
    console.log('🔹 State Admin:');
    console.log('   Email: state@hdims.gov.in');
    console.log('   Password: State123!');
    console.log('   Role: State Admin');
    console.log('');
    console.log('🔹 District Admin:');
    console.log('   Email: district@hdims.gov.in');
    console.log('   Password: District123!');
    console.log('   Role: District Admin');
    console.log('');
    console.log('🔹 Hospital User:');
    console.log('   Email: hospital@hdims.gov.in');
    console.log('   Password: Hospital123!');
    console.log('   Role: Hospital User');
    console.log('');
    console.log('🌐 Sign in at: http://localhost:3000/login');
    console.log('🎯 Use credentials with matching roles!');

  } catch (error) {
    console.error('Error adding test users:', error);
  }
}

createTestUsers();
