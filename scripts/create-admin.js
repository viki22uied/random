// ============================================
// Create HDIMS Admin User
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

async function createAdminUser() {
  try {
    console.log('Creating HDIMS admin user...');

    // Create user in auth system
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@hdims.gov.in',
      password: 'Admin123!',
      email_confirm: true,
      user_metadata: {
        full_name: 'System Administrator',
        role: 'super_admin'
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return;
    }

    console.log('Auth user created:', authData.user.id);

    // Wait a moment for the user to be created
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Add user to users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        full_name: 'System Administrator',
        email: 'admin@hdims.gov.in',
        role: 'super_admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (userError) {
      console.error('Users table error:', userError);
    } else {
      console.log('User added to users table successfully!');
    }

    console.log('\n✅ HDIMS Admin User Created Successfully!');
    console.log('📧 Email: admin@hdims.gov.in');
    console.log('🔑 Password: Admin123!');
    console.log('🎯 Role: super_admin');
    console.log('\n🌐 You can now sign in at: http://localhost:3000/auth');

  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();
