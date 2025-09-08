// Mock Authentication Service for Development
// This simulates social media OAuth flows without real API keys

const crypto = require('crypto');
const { supabase } = require('../config/supabase');

class MockAuthService {
  constructor() {
    this.mockUsers = {
      tiktok: {
        id: 'mock_tiktok_user_123',
        username: 'creative_creator',
        display_name: 'Creative Creator',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tiktok',
        bio_description: 'Content creator | 🎬 Daily videos | 📧 collab@example.com',
        is_verified: true,
        follower_count: 125000,
        following_count: 890,
        likes_count: 3500000,
        video_count: 450,
        profile_deep_link: 'https://www.tiktok.com/@creative_creator',
      },
      instagram: {
        id: 'mock_instagram_user_456',
        username: 'lifestyle_influencer',
        full_name: 'Lifestyle Influencer',
        profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=instagram',
        bio: 'Lifestyle & Fashion | 📍 LA | 💌 partnerships@example.com',
        website: 'https://example.com',
        is_verified: true,
        followers_count: 85000,
        follows_count: 650,
        media_count: 1200,
        engagement_rate: 4.2,
      },
      youtube: {
        id: 'mock_youtube_channel_789',
        title: 'Tech Reviews Plus',
        description: 'Your source for honest tech reviews and tutorials',
        customUrl: '@techreviewsplus',
        thumbnail: 'https://api.dicebear.com/7.x/avataaars/svg?seed=youtube',
        subscriberCount: 250000,
        viewCount: 15000000,
        videoCount: 320,
        country: 'US',
        publishedAt: '2020-01-15T00:00:00Z',
      },
      twitter: {
        id: 'mock_twitter_user_101',
        username: 'thought_leader',
        name: 'Thought Leader',
        profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=twitter',
        description: 'Sharing insights on business and innovation | Speaker | Author',
        verified: true,
        followers_count: 45000,
        following_count: 1200,
        tweet_count: 8500,
        listed_count: 250,
        created_at: '2019-03-10T00:00:00Z',
      },
      linkedin: {
        id: 'mock_linkedin_user_202',
        firstName: 'Professional',
        lastName: 'Expert',
        headline: 'CEO at Success Company | Business Strategy | Innovation',
        profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=linkedin',
        publicProfileUrl: 'https://linkedin.com/in/professional-expert',
        connections: 5000,
        followers: 12000,
        summary: 'Helping businesses grow through strategic innovation',
        positions: [
          {
            title: 'CEO',
            company: 'Success Company',
            startDate: '2020-01',
            current: true,
          }
        ],
      },
      facebook: {
        id: 'mock_facebook_user_303',
        name: 'Community Builder',
        email: 'community@example.com',
        picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=facebook',
        friends_count: 3500,
        pages_managed: 2,
        groups_count: 15,
      },
    };

    this.mockVideos = [
      {
        id: 'video_1',
        title: 'Amazing Content #1',
        description: 'Check out this amazing content!',
        duration: 30,
        views: 150000,
        likes: 12000,
        comments: 450,
        shares: 890,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'video_2',
        title: 'Viral Video #2',
        description: 'This went viral last week!',
        duration: 45,
        views: 500000,
        likes: 45000,
        comments: 2300,
        shares: 5600,
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'video_3',
        title: 'Tutorial: How to Create Content',
        description: 'Step by step guide',
        duration: 180,
        views: 75000,
        likes: 8900,
        comments: 560,
        shares: 1200,
        created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    this.mockAnalytics = {
      demographics: {
        age_ranges: {
          '13-17': 5,
          '18-24': 35,
          '25-34': 40,
          '35-44': 15,
          '45+': 5,
        },
        gender_distribution: {
          male: 45,
          female: 53,
          other: 2,
        },
        top_countries: [
          { country: 'US', percentage: 45 },
          { country: 'UK', percentage: 15 },
          { country: 'CA', percentage: 10 },
          { country: 'AU', percentage: 8 },
          { country: 'Other', percentage: 22 },
        ],
      },
      engagement: {
        avg_likes_per_post: 8500,
        avg_comments_per_post: 250,
        avg_shares_per_post: 450,
        engagement_rate: 4.2,
        best_posting_times: ['09:00', '12:00', '18:00', '21:00'],
      },
      growth: {
        followers_30_days: 5200,
        followers_growth_rate: 4.5,
        views_30_days: 1500000,
        engagement_trend: 'increasing',
      },
    };
  }

  // Generate mock OAuth authorization URL
  getAuthorizationUrl(platform, state) {
    const mockState = state || crypto.randomBytes(16).toString('hex');
    
    // Simulate OAuth flow by creating a mock authorization URL
    const baseUrl = `${process.env.FRONTEND_URL}/mock-oauth/${platform}`;
    const params = new URLSearchParams({
      client_id: `mock_${platform}_client`,
      redirect_uri: `${process.env.BACKEND_URL}/api/auth/${platform}/callback`,
      state: mockState,
      response_type: 'code',
      scope: this.getMockScopes(platform),
    });

    return {
      url: `${baseUrl}?${params.toString()}`,
      state: mockState,
    };
  }

  // Get mock scopes for platform
  getMockScopes(platform) {
    const scopes = {
      tiktok: 'user.info.basic,user.info.profile,user.info.stats,video.list',
      instagram: 'user_profile,user_media',
      youtube: 'https://www.googleapis.com/auth/youtube.readonly',
      twitter: 'users.read,tweet.read',
      linkedin: 'r_liteprofile,r_emailaddress',
      facebook: 'email,public_profile,pages_show_list',
    };
    return scopes[platform] || 'basic';
  }

  // Exchange mock authorization code for tokens
  async exchangeCodeForTokens(platform, code) {
    // Simulate network delay
    await this.simulateDelay(500);

    // Generate mock tokens
    const mockTokens = {
      access_token: `mock_${platform}_access_${crypto.randomBytes(16).toString('hex')}`,
      refresh_token: `mock_${platform}_refresh_${crypto.randomBytes(16).toString('hex')}`,
      expires_in: 3600,
      token_type: 'Bearer',
      scope: this.getMockScopes(platform),
      open_id: this.mockUsers[platform]?.id || `mock_${platform}_user_${Date.now()}`,
    };

    console.log(`[MOCK] Generated tokens for ${platform}:`, {
      ...mockTokens,
      access_token: mockTokens.access_token.substring(0, 20) + '...',
    });

    return mockTokens;
  }

  // Get mock user info
  async getUserInfo(platform, accessToken) {
    await this.simulateDelay(300);
    
    const user = this.mockUsers[platform];
    if (!user) {
      throw new Error(`Mock user not found for platform: ${platform}`);
    }

    console.log(`[MOCK] Returning user info for ${platform}:`, user.username || user.name);
    return user;
  }

  // Get mock user videos/content
  async getUserContent(platform, accessToken, options = {}) {
    await this.simulateDelay(400);

    const { limit = 20, cursor = null } = options;
    
    // Return paginated mock content
    const startIndex = cursor ? parseInt(cursor) : 0;
    const endIndex = Math.min(startIndex + limit, this.mockVideos.length);
    const videos = this.mockVideos.slice(startIndex, endIndex);
    
    const hasMore = endIndex < this.mockVideos.length;
    const nextCursor = hasMore ? endIndex.toString() : null;

    console.log(`[MOCK] Returning ${videos.length} videos for ${platform}`);

    return {
      data: videos,
      paging: {
        cursors: {
          after: nextCursor,
        },
        next: nextCursor ? `mock://next?cursor=${nextCursor}` : null,
      },
      has_more: hasMore,
      total: this.mockVideos.length,
    };
  }

  // Get mock analytics
  async getAnalytics(platform, accessToken, options = {}) {
    await this.simulateDelay(350);

    console.log(`[MOCK] Returning analytics for ${platform}`);
    
    return {
      platform,
      user_id: this.mockUsers[platform]?.id,
      ...this.mockAnalytics,
      generated_at: new Date().toISOString(),
    };
  }

  // Refresh mock access token
  async refreshAccessToken(platform, refreshToken) {
    await this.simulateDelay(200);

    const newAccessToken = `mock_${platform}_access_refreshed_${crypto.randomBytes(16).toString('hex')}`;
    
    console.log(`[MOCK] Refreshed token for ${platform}`);
    
    return {
      access_token: newAccessToken,
      expires_in: 3600,
      token_type: 'Bearer',
    };
  }

  // Store mock connection in database
  async storeConnection(userId, platform, tokenData, userInfo) {
    try {
      const { error } = await supabase
        .from('social_connections')
        .upsert({
          user_id: userId,
          platform: platform,
          platform_user_id: userInfo.id,
          username: userInfo.username || userInfo.name || userInfo.title,
          profile_data: userInfo,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000),
          is_mock: true, // Flag to identify mock data
        });

      if (error) throw error;

      // Also update influencer analytics with mock data
      await this.updateMockAnalytics(userId, platform, userInfo);

      console.log(`[MOCK] Stored ${platform} connection for user ${userId}`);
      return { success: true };
    } catch (error) {
      console.error(`[MOCK] Error storing connection:`, error);
      throw error;
    }
  }

  // Update mock analytics in database
  async updateMockAnalytics(userId, platform, userInfo) {
    const analyticsData = {
      user_id: userId,
      platform: platform,
      follower_count: userInfo.follower_count || userInfo.followers_count || userInfo.subscriberCount || 10000,
      following_count: userInfo.following_count || userInfo.follows_count || 500,
      post_count: userInfo.video_count || userInfo.media_count || userInfo.videoCount || userInfo.tweet_count || 100,
      engagement_rate: this.calculateMockEngagementRate(userInfo),
      avg_likes: Math.floor((userInfo.likes_count || 100000) / (userInfo.video_count || 100)),
      avg_comments: Math.floor(Math.random() * 500) + 50,
      avg_views: Math.floor(Math.random() * 50000) + 5000,
      is_mock: true,
    };

    const { error } = await supabase
      .from('influencer_analytics')
      .upsert(analyticsData);

    if (error) {
      console.error(`[MOCK] Error updating analytics:`, error);
    }
  }

  // Calculate mock engagement rate
  calculateMockEngagementRate(userInfo) {
    const followers = userInfo.follower_count || userInfo.followers_count || userInfo.subscriberCount || 10000;
    const engagement = userInfo.likes_count || userInfo.viewCount || 100000;
    const posts = userInfo.video_count || userInfo.media_count || userInfo.videoCount || 100;
    
    if (followers === 0 || posts === 0) return 0;
    
    const avgEngagementPerPost = engagement / posts;
    const engagementRate = (avgEngagementPerPost / followers) * 100;
    
    // Cap at reasonable rate
    return Math.min(engagementRate, 10);
  }

  // Simulate network delay
  async simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate mock campaign matches
  async generateMockMatches(influencerId, campaignId) {
    await this.simulateDelay(600);

    const matchScore = Math.random() * 40 + 60; // 60-100 score
    const confidence = Math.random() * 30 + 70; // 70-100 confidence

    console.log(`[MOCK] Generated match score: ${matchScore.toFixed(1)}%`);

    return {
      influencer_id: influencerId,
      campaign_id: campaignId,
      match_score: matchScore,
      confidence_score: confidence,
      factors: {
        audience_match: Math.random() * 40 + 60,
        engagement_quality: Math.random() * 40 + 60,
        content_relevance: Math.random() * 40 + 60,
        brand_safety: Math.random() * 20 + 80,
      },
      reasoning: 'Strong audience overlap with target demographic. High engagement rate indicates active community. Content style aligns with brand values.',
      generated_at: new Date().toISOString(),
      is_mock: true,
    };
  }

  // Check if using mock mode
  static isEnabled() {
    return process.env.USE_MOCK_AUTH === 'true' || process.env.NODE_ENV === 'development';
  }
}

module.exports = MockAuthService;