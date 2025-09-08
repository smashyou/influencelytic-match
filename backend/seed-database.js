// Database Seeder - Creates Mock Data for Testing
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🌱 Starting Database Seeder...\n');

// Mock data
const mockUsers = [
  // Brands
  {
    email: 'nike@test.com',
    password: 'Test123!',
    profile: {
      first_name: 'Nike',
      last_name: 'Brand',
      role: 'brand',
      company_name: 'Nike Sports',
      bio: 'Just Do It. Leading sports brand looking for athletic influencers.',
      website: 'https://nike.com',
      avatar_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=nike',
    }
  },
  {
    email: 'fashion@test.com',
    password: 'Test123!',
    profile: {
      first_name: 'Fashion',
      last_name: 'House',
      role: 'brand',
      company_name: 'Fashion Forward',
      bio: 'Luxury fashion brand seeking style influencers.',
      website: 'https://fashionforward.com',
      avatar_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=fashion',
    }
  },
  {
    email: 'tech@test.com',
    password: 'Test123!',
    profile: {
      first_name: 'Tech',
      last_name: 'Corp',
      role: 'brand',
      company_name: 'TechCorp Innovation',
      bio: 'Technology company looking for tech reviewers and creators.',
      website: 'https://techcorp.com',
      avatar_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=tech',
    }
  },
  // Influencers
  {
    email: 'fitness@test.com',
    password: 'Test123!',
    profile: {
      first_name: 'Alex',
      last_name: 'Fitness',
      role: 'influencer',
      username: 'alexfitness',
      bio: 'Fitness coach and wellness advocate. 100K+ followers across platforms.',
      website: 'https://alexfitness.com',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    }
  },
  {
    email: 'beauty@test.com',
    password: 'Test123!',
    profile: {
      first_name: 'Sarah',
      last_name: 'Beauty',
      role: 'influencer',
      username: 'sarahbeauty',
      bio: 'Beauty and skincare enthusiast. Honest reviews and tutorials.',
      website: 'https://sarahbeauty.com',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    }
  },
  {
    email: 'travel@test.com',
    password: 'Test123!',
    profile: {
      first_name: 'Mike',
      last_name: 'Travel',
      role: 'influencer',
      username: 'miketravel',
      bio: 'Travel blogger exploring the world. Adventure and culture content.',
      website: 'https://miketravel.com',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
    }
  },
  {
    email: 'gaming@test.com',
    password: 'Test123!',
    profile: {
      first_name: 'Emma',
      last_name: 'Gaming',
      role: 'influencer',
      username: 'emmagaming',
      bio: 'Professional gamer and streamer. FPS and RPG content.',
      website: 'https://emmagaming.com',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
    }
  },
  {
    email: 'food@test.com',
    password: 'Test123!',
    profile: {
      first_name: 'Chef',
      last_name: 'John',
      role: 'influencer',
      username: 'chefjohn',
      bio: 'Professional chef sharing recipes and cooking tips.',
      website: 'https://chefjohn.com',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    }
  },
];

const mockCampaigns = [
  {
    title: 'Summer Fitness Challenge 2025',
    description: 'Looking for fitness influencers to promote our new summer workout program. Create engaging content showing your fitness journey with our app.',
    budget: 5000,
    category: 'fitness',
    requirements: {
      min_followers: 10000,
      platforms: ['instagram', 'tiktok'],
      content_type: ['reels', 'posts'],
      deliverables: '5 posts, 3 reels over 2 weeks',
    },
    start_date: new Date(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    status: 'active',
  },
  {
    title: 'Luxury Fashion Week Campaign',
    description: 'Seeking fashion influencers to showcase our new collection during Fashion Week. Professional photography and exclusive access to events.',
    budget: 10000,
    category: 'fashion',
    requirements: {
      min_followers: 50000,
      platforms: ['instagram', 'youtube'],
      content_type: ['posts', 'stories', 'videos'],
      deliverables: '10 posts, 20 stories, 2 YouTube videos',
    },
    start_date: new Date(),
    end_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    status: 'active',
  },
  {
    title: 'Tech Product Launch - Smart Home',
    description: 'Launch campaign for our new smart home ecosystem. Looking for tech reviewers to create in-depth reviews and tutorials.',
    budget: 8000,
    category: 'technology',
    requirements: {
      min_followers: 25000,
      platforms: ['youtube', 'twitter'],
      content_type: ['reviews', 'tutorials'],
      deliverables: '1 detailed review video, 5 tweets, 1 blog post',
    },
    start_date: new Date(),
    end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    status: 'active',
  },
  {
    title: 'Healthy Eating Challenge',
    description: 'Promote healthy eating habits with our meal delivery service. Share your journey to better nutrition.',
    budget: 3000,
    category: 'food',
    requirements: {
      min_followers: 5000,
      platforms: ['instagram', 'tiktok'],
      content_type: ['reels', 'posts'],
      deliverables: '10 posts showing meals, 5 recipe videos',
    },
    start_date: new Date(),
    end_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    status: 'active',
  },
  {
    title: 'Travel Adventure Series',
    description: 'Document your travels with our travel gear. Looking for adventurous content creators.',
    budget: 7500,
    category: 'travel',
    requirements: {
      min_followers: 20000,
      platforms: ['instagram', 'youtube', 'tiktok'],
      content_type: ['vlogs', 'posts', 'stories'],
      deliverables: '2 travel vlogs, 15 posts, daily stories',
    },
    start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    end_date: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
    status: 'active',
  },
  {
    title: 'Gaming Peripheral Review',
    description: 'Review our new gaming mouse and keyboard. Looking for competitive gamers and streamers.',
    budget: 4000,
    category: 'gaming',
    requirements: {
      min_followers: 15000,
      platforms: ['twitch', 'youtube', 'twitter'],
      content_type: ['streams', 'reviews'],
      deliverables: '2 stream sessions, 1 review video, 5 tweets',
    },
    start_date: new Date(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'active',
  },
];

async function seedDatabase() {
  try {
    const createdUsers = [];
    const createdCampaigns = [];

    // Step 1: Create users
    console.log('👥 Creating mock users...');
    for (const userData of mockUsers) {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
      });

      if (authError) {
        if (authError.message.includes('already been registered')) {
          console.log(`   ℹ️ User ${userData.email} already exists`);
          // Get existing user
          const { data: { users } } = await supabase.auth.admin.listUsers();
          const existingUser = users.find(u => u.email === userData.email);
          if (existingUser) {
            createdUsers.push({ ...userData, id: existingUser.id });
          }
        } else {
          console.log(`   ❌ Error creating ${userData.email}: ${authError.message}`);
        }
      } else if (authData.user) {
        // Create profile
        const profileData = {
          id: authData.user.id,
          email: userData.email,
          ...userData.profile,
          created_at: new Date().toISOString(),
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(profileData);

        if (profileError) {
          console.log(`   ⚠️ Profile error for ${userData.email}: ${profileError.message}`);
        } else {
          console.log(`   ✅ Created user: ${userData.email} (${userData.profile.role})`);
          createdUsers.push({ ...userData, id: authData.user.id });
        }
      }
    }

    // Step 2: Create campaigns (from brand users)
    console.log('\n📢 Creating mock campaigns...');
    const brandUsers = createdUsers.filter(u => u.profile.role === 'brand');
    
    for (let i = 0; i < mockCampaigns.length; i++) {
      const campaign = mockCampaigns[i];
      const brand = brandUsers[i % brandUsers.length]; // Distribute campaigns among brands
      
      if (!brand) {
        console.log('   ⚠️ No brand users available for campaigns');
        break;
      }

      const campaignData = {
        ...campaign,
        brand_id: brand.id,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('campaigns')
        .insert(campaignData)
        .select()
        .single();

      if (error) {
        console.log(`   ❌ Campaign error: ${error.message}`);
      } else {
        console.log(`   ✅ Created campaign: ${campaign.title}`);
        createdCampaigns.push(data);
      }
    }

    // Step 3: Create mock social connections for influencers
    console.log('\n🔗 Creating mock social connections...');
    const influencerUsers = createdUsers.filter(u => u.profile.role === 'influencer');
    const platforms = ['instagram', 'tiktok', 'youtube', 'twitter'];
    
    for (const influencer of influencerUsers) {
      // Give each influencer 2-3 random platforms
      const numPlatforms = Math.floor(Math.random() * 2) + 2;
      const selectedPlatforms = platforms.sort(() => 0.5 - Math.random()).slice(0, numPlatforms);
      
      for (const platform of selectedPlatforms) {
        const connectionData = {
          user_id: influencer.id,
          platform: platform,
          platform_user_id: `mock_${platform}_${influencer.id}`,
          username: `${influencer.profile.username}_${platform}`,
          profile_data: {
            follower_count: Math.floor(Math.random() * 100000) + 10000,
            following_count: Math.floor(Math.random() * 1000) + 100,
            post_count: Math.floor(Math.random() * 500) + 50,
          },
          is_mock: true,
          access_token: `mock_token_${platform}_${Date.now()}`,
          created_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('social_connections')
          .insert(connectionData);

        if (error) {
          console.log(`   ⚠️ Connection error: ${error.message}`);
        } else {
          console.log(`   ✅ Connected ${influencer.profile.username} to ${platform}`);
        }

        // Add analytics data
        const analyticsData = {
          user_id: influencer.id,
          platform: platform,
          follower_count: connectionData.profile_data.follower_count,
          following_count: connectionData.profile_data.following_count,
          post_count: connectionData.profile_data.post_count,
          engagement_rate: Math.random() * 5 + 1, // 1-6% engagement
          avg_likes: Math.floor(connectionData.profile_data.follower_count * 0.05),
          avg_comments: Math.floor(connectionData.profile_data.follower_count * 0.01),
          is_mock: true,
        };

        await supabase
          .from('influencer_analytics')
          .upsert(analyticsData);
      }
    }

    // Step 4: Create some campaign applications
    console.log('\n📝 Creating mock campaign applications...');
    for (const campaign of createdCampaigns.slice(0, 3)) { // First 3 campaigns
      for (const influencer of influencerUsers.slice(0, 3)) { // First 3 influencers
        const applicationData = {
          campaign_id: campaign.id,
          influencer_id: influencer.id,
          status: ['pending', 'accepted', 'rejected'][Math.floor(Math.random() * 3)],
          proposed_rate: Math.floor(campaign.budget * (0.3 + Math.random() * 0.4)),
          message: `I'm excited about this campaign! I have experience in ${campaign.category} content.`,
          portfolio_links: ['https://example.com/portfolio'],
          created_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('campaign_applications')
          .insert(applicationData);

        if (error) {
          console.log(`   ⚠️ Application error: ${error.message}`);
        } else {
          console.log(`   ✅ ${influencer.profile.username} applied to ${campaign.title}`);
        }
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('🎉 DATABASE SEEDING COMPLETE!');
    console.log('='.repeat(50));
    console.log('\n📊 Summary:');
    console.log(`   • ${createdUsers.length} users created`);
    console.log(`   • ${createdCampaigns.length} campaigns created`);
    console.log(`   • Social connections added`);
    console.log(`   • Campaign applications created`);
    console.log('\n🔑 Test Accounts:');
    console.log('   Brands:');
    console.log('   • nike@test.com / Test123!');
    console.log('   • fashion@test.com / Test123!');
    console.log('   • tech@test.com / Test123!');
    console.log('   Influencers:');
    console.log('   • fitness@test.com / Test123!');
    console.log('   • beauty@test.com / Test123!');
    console.log('   • travel@test.com / Test123!');
    console.log('\n✨ You can now log in with these accounts!');

  } catch (error) {
    console.error('\n❌ Seeding error:', error);
  }
}

// Run seeder
seedDatabase();