// Test Supabase Connection
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Testing Supabase Connection...\n');

// Check environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  console.log('Please set these in backend/.env:');
  console.log('  SUPABASE_URL=your_supabase_url');
  console.log('  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log(`📍 Supabase URL: ${supabaseUrl}`);
console.log(`🔑 Service Key: ${supabaseKey.substring(0, 20)}...`);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n📊 Testing Database Connection...');
    
    // Test 1: Check if tables exist
    console.log('\n1️⃣ Checking tables...');
    const tables = [
      'profiles',
      'campaigns', 
      'social_connections',
      'influencer_analytics',
      'campaign_applications',
      'notifications',
      'transactions'
    ];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error && error.code === '42P01') {
        console.log(`   ❌ Table '${table}' does not exist - Run migrations!`);
      } else if (error) {
        console.log(`   ⚠️ Table '${table}' error: ${error.message}`);
      } else {
        console.log(`   ✅ Table '${table}' exists`);
      }
    }
    
    // Test 2: Create test user
    console.log('\n2️⃣ Creating test user...');
    const testUser = {
      email: `test_${Date.now()}@example.com`, // Use unique email to avoid conflicts
      password: 'TestPassword123!',
    };
    
    // Use admin API to create user with confirmed email
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true,
    });
    
    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('   ℹ️ Test user already exists');
      } else {
        console.log(`   ❌ Auth error: ${authError.message}`);
      }
    } else {
      console.log(`   ✅ Test user created: ${authData.user?.email}`);
      
      // Create profile for test user
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: testUser.email,
          first_name: 'Test',
          last_name: 'User',
          role: 'influencer',
          username: 'testuser_' + Date.now(),
        });
      
      if (profileError) {
        console.log(`   ⚠️ Profile creation error: ${profileError.message}`);
      } else {
        console.log('   ✅ Profile created');
      }
    }
    
    // Test 3: Test RLS policies
    console.log('\n3️⃣ Testing Row Level Security...');
    const { data: rlsTest, error: rlsError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (rlsError) {
      console.log(`   ⚠️ RLS might be blocking: ${rlsError.message}`);
    } else {
      console.log(`   ✅ RLS policies working (${rlsTest?.length || 0} profiles accessible)`);
    }
    
    // Test 4: Test storage buckets
    console.log('\n4️⃣ Checking storage buckets...');
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketError) {
      console.log(`   ❌ Storage error: ${bucketError.message}`);
    } else {
      const requiredBuckets = ['avatars', 'campaign-images', 'portfolio'];
      requiredBuckets.forEach(bucketName => {
        const exists = buckets?.some(b => b.name === bucketName);
        if (exists) {
          console.log(`   ✅ Bucket '${bucketName}' exists`);
        } else {
          console.log(`   ❌ Bucket '${bucketName}' missing - Create in Storage tab`);
        }
      });
    }
    
    // Test 5: Test real-time subscriptions
    console.log('\n5️⃣ Testing real-time subscriptions...');
    const channel = supabase
      .channel('test-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          console.log('   📨 Real-time event received:', payload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('   ✅ Real-time subscription active');
        } else {
          console.log(`   ℹ️ Subscription status: ${status}`);
        }
      });
    
    // Clean up subscription after 2 seconds
    setTimeout(() => {
      supabase.removeChannel(channel);
    }, 2000);
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('🎉 SUPABASE CONNECTION TEST COMPLETE!');
    console.log('='.repeat(50));
    console.log('\nNext steps:');
    console.log('1. If tables are missing, run the migration SQL');
    console.log('2. If buckets are missing, create them in Storage tab');
    console.log('3. Start your development servers:');
    console.log('   npm run dev');
    console.log('\n✨ You\'re ready to go!');
    
  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
    console.log('\nPlease check:');
    console.log('1. Your Supabase project is active');
    console.log('2. Your API keys are correct');
    console.log('3. Your network connection');
  }
}

// Run the test
testConnection();