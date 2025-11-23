// ============================================
// Add Hospital Staff with Personal Emails
// ============================================

const { createClient } = require('@supabase/supabase-js');

// Supabase client
const supabase = createClient(
  'https://dkukdrpfbqdfbvptwhuz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrdWtkcnBmYnFkZmJ2cHR3aHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4ODQ2OTAsImV4cCI6MjA3OTQ2MDY5MH0.ByjkkUazAh4KM7nQi0UpjqUc6u2K2xEPRjzyRt5sJ6Q'
);

// Hospital staff with personal emails
const hospitalStaff = [
  {
    email: 'rajesh.kumar@gmail.com',
    password: 'Hospital123!',
    full_name: 'Dr. Rajesh Kumar',
    role: 'hospital_user',
    facility_id: 'FAC001'
  },
  {
    email: 'priya.sharma@yahoo.com',
    password: 'Hospital123!',
    full_name: 'Priya Sharma',
    role: 'hospital_user',
    facility_id: 'FAC001'
  },
  {
    email: 'arun.singh@outlook.com',
    password: 'Hospital123!',
    full_name: 'Arun Singh',
    role: 'hospital_user',
    facility_id: 'FAC002'
  },
  {
    email: 'anita.patel@gmail.com',
    password: 'Hospital123!',
    full_name: 'Dr. Anita Patel',
    role: 'hospital_user',
    facility_id: 'FAC002'
  },
  {
    email: 'meena.devi@yahoo.com',
    password: 'Hospital123!',
    full_name: 'Meena Devi',
    role: 'hospital_user',
    facility_id: 'FAC003'
  }
];

async function addHospitalStaff() {
  console.log('🏥 Adding Hospital Staff with Personal Emails');
  console.log('==========================================');

  for (const staff of hospitalStaff) {
    try {
      console.log(`\n👤 Adding: ${staff.full_name} (${staff.email})`);

      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: staff.email,
        password: staff.password,
        options: {
          data: {
            full_name: staff.full_name,
            role: staff.role
          }
        }
      });

      if (authError) {
        console.log(`❌ Auth creation failed: ${authError.message}`);
        continue;
      }

      console.log(`✅ Auth user created: ${authData.user?.id}`);

      // Step 2: Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user?.id,
          email: staff.email,
          full_name: staff.full_name,
          role: staff.role,
          facility_id: staff.facility_id,
          district_id: 'DIS001',
          state_id: 'STA001',
          is_active: true,
          created_at: new Date().toISOString()
        });

      if (profileError) {
        console.log(`❌ Profile creation failed: ${profileError.message}`);
        continue;
      }

      console.log(`✅ Profile created successfully`);

      // Step 3: Verify user exists
      const { data: verifyUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', staff.email)
        .single();

      if (verifyUser) {
        console.log(`✅ User verified in database`);
        console.log(`   - ID: ${verifyUser.id}`);
        console.log(`   - Name: ${verifyUser.full_name}`);
        console.log(`   - Role: ${verifyUser.role}`);
        console.log(`   - Facility: ${verifyUser.facility_id}`);
        console.log(`   - Active: ${verifyUser.is_active ? 'Yes' : 'No'}`);
      }

    } catch (error) {
      console.error(`❌ Error adding ${staff.email}:`, error.message);
    }
  }

  console.log('\n🎉 Hospital Staff Setup Complete!');
  console.log('==============================');
  console.log('✅ Hospital staff can now login with their personal emails:');
  
  hospitalStaff.forEach(staff => {
    console.log(`   - ${staff.full_name}: ${staff.email} / ${staff.password}`);
  });

  console.log('\n📋 Login Instructions:');
  console.log('1. Go to: http://localhost:3000/login');
  console.log('2. Select "Hospital Staff" role');
  console.log('3. Enter your personal email and password');
  console.log('4. Your activity will be tracked individually');

  console.log('\n🔍 Super Admin Tracking:');
  console.log('- All hospital staff activity is logged with their personal email');
  console.log('- Document uploads show individual uploader names');
  console.log('- Performance data submissions are tracked per user');
  console.log('- Audit logs show personal email identifiers');
}

addHospitalStaff().catch(console.error);
