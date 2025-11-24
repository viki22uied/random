// ============================================
// Create HDIMS Test Users
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
    console.log('🔧 Creating HDIMS Test Users...');

    // Test users data
    const testUsers = [
      {
        email: 'state@hdims.gov.in',
        password: 'State123!',
        fullName: 'State Administrator',
        role: 'state_admin',
        stateId: '550e8400-e29b-41d4-a716-446655440001'
      },
      {
        email: 'district@hdims.gov.in',
        password: 'District123!',
        fullName: 'District Administrator',
        role: 'district_admin',
        districtId: '660e8400-e29b-41d4-a716-446655440001'
      },
      {
        email: 'hospital@hdims.gov.in',
        password: 'Hospital123!',
        fullName: 'Hospital Staff',
        role: 'hospital_user',
        facilityId: '770e8400-e29b-41d4-a716-446655440001'
      }
    ];

    for (const user of testUsers) {
      console.log(`\n📧 Creating ${user.email}...`);

      // Create user in auth system
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.fullName,
          role: user.role
        }
      });

      if (authError) {
        console.log(`❌ Auth error for ${user.email}:`, authError.message);
        continue;
      }

      console.log(`✅ Auth user created: ${authData.user.id}`);

      // Wait a moment for the user to be created
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Add user to users table
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authData.user.id,
          full_name: user.fullName,
          email: user.email,
          role: user.role,
          facility_id: user.facilityId || null,
          district_id: user.districtId || null,
          state_id: user.stateId || null,
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

    console.log('\n🎉 All HDIMS Test Users Created Successfully!');
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
    console.log('🌐 You can now sign in at: http://localhost:3000/login');
    console.log('🎯 Use the credentials above with matching roles!');

  } catch (error) {
    console.error('Error creating test users:', error);
  }
}

createTestUsers();
