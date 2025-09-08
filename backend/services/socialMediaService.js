// backend/services/socialMediaService.js - Social Media API Integration
const axios = require("axios");
const { supabase } = require("../config/supabase");

// Platform-specific data fetching
const fetchPlatformData = async (
  platform,
  authCode,
  userId,
  accessToken = null
) => {
  try {
    switch (platform) {
      case "instagram":
        return await fetchInstagramData(authCode, userId, accessToken);
      case "facebook":
        return await fetchFacebookData(authCode, userId, accessToken);
      case "tiktok":
        return await fetchTikTokData(authCode, userId, accessToken);
      case "youtube":
        return await fetchYouTubeData(authCode, userId, accessToken);
      case "twitter":
        return await fetchTwitterData(authCode, userId, accessToken);
      case "linkedin":
        return await fetchLinkedInData(authCode, userId, accessToken);
      default:
        throw new Error("Unsupported platform");
    }
  } catch (error) {
    console.error(`Error fetching ${platform} data:`, error);
    return null;
  }
};

const fetchInstagramData = async (authCode, userId, existingToken = null) => {
  try {
    let accessToken = existingToken;

    if (!accessToken && authCode) {
      // Exchange code for access token
      const tokenResponse = await axios.post(
        "https://api.instagram.com/oauth/access_token",
        {
          client_id: process.env.INSTAGRAM_CLIENT_ID,
          client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
          grant_type: "authorization_code",
          redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
          code: authCode,
        }
      );

      accessToken = tokenResponse.data.access_token;
    }

    if (!accessToken) {
      throw new Error("No access token available");
    }

    // Get user profile
    const profileResponse = await axios.get(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`
    );
    const profile = profileResponse.data;

    // Get media insights for engagement calculation
    const mediaResponse = await axios.get(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count&limit=50&access_token=${accessToken}`
    );
    const media = mediaResponse.data.data || [];

    // Calculate engagement metrics
    const totalLikes = media.reduce(
      (sum, post) => sum + (post.like_count || 0),
      0
    );
    const totalComments = media.reduce(
      (sum, post) => sum + (post.comments_count || 0),
      0
    );
    const avgLikes =
      media.length > 0 ? Math.round(totalLikes / media.length) : 0;
    const avgComments =
      media.length > 0 ? Math.round(totalComments / media.length) : 0;

    // Try to get follower count (requires Instagram Business/Creator account)
    let followerCount = 0;
    try {
      const insightsResponse = await axios.get(
        `https://graph.instagram.com/${profile.id}?fields=followers_count&access_token=${accessToken}`
      );
      followerCount = insightsResponse.data.followers_count || 0;
    } catch (error) {
      console.log(
        "Could not fetch follower count - may require business account"
      );
    }

    return {
      id: profile.id,
      username: profile.username,
      display_name: profile.username,
      avatar_url: null, // Instagram doesn't provide profile pic URL in basic API
      access_token: accessToken,
      refresh_token: null,
      expires_at: null, // Instagram tokens don't expire
      follower_count: followerCount,
      following_count: 0, // Not available in basic API
      post_count: profile.media_count || media.length,
      is_verified: profile.account_type === "BUSINESS",
      engagement_data: {
        avg_likes: avgLikes,
        avg_comments: avgComments,
        recent_posts: media.slice(0, 10),
      },
    };
  } catch (error) {
    console.error(
      "Instagram API error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const fetchFacebookData = async (authCode, userId, existingToken = null) => {
  // Similar implementation for Facebook
  // This would handle Facebook Pages API for business accounts
  return {
    id: "fb_" + userId,
    username: "facebook_user",
    display_name: "Facebook User",
    avatar_url: null,
    access_token: "placeholder_token",
    refresh_token: null,
    expires_at: null,
    follower_count: 0,
    following_count: 0,
    post_count: 0,
    is_verified: false,
  };
};

const fetchTikTokData = async (authCode, userId, existingToken = null) => {
  try {
    let accessToken = existingToken;

    if (!accessToken && authCode) {
      // Exchange code for access token
      const tokenResponse = await axios.post(
        "https://open-api.tiktok.com/oauth/access_token/",
        {
          client_key: process.env.TIKTOK_CLIENT_KEY,
          client_secret: process.env.TIKTOK_CLIENT_SECRET,
          code: authCode,
          grant_type: "authorization_code",
        }
      );

      accessToken = tokenResponse.data.data.access_token;
      const openId = tokenResponse.data.data.open_id;
      const expiresIn = tokenResponse.data.data.expires_in;

      // Get user profile
      const profileResponse = await axios.get(
        "https://open-api.tiktok.com/user/info/",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            open_id: openId,
            fields:
              "open_id,union_id,avatar_url,display_name,follower_count,following_count,likes_count,video_count,is_verified",
          },
        }
      );

      const userData = profileResponse.data.data.user;

      return {
        id: openId,
        username: userData.display_name,
        display_name: userData.display_name,
        avatar_url: userData.avatar_url,
        access_token: accessToken,
        refresh_token: null,
        expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
        follower_count: userData.follower_count || 0,
        following_count: userData.following_count || 0,
        post_count: userData.video_count || 0,
        is_verified: userData.is_verified || false,
        engagement_data: {
          likes_count: userData.likes_count || 0,
        },
      };
    }

    return null;
  } catch (error) {
    console.error("TikTok API error:", error.response?.data || error.message);
    throw error;
  }
};

const fetchYouTubeData = async (authCode, userId, existingToken = null) => {
  try {
    let accessToken = existingToken;
    let refreshToken = null;

    if (!accessToken && authCode) {
      // Exchange code for access token
      const tokenResponse = await axios.post(
        "https://oauth2.googleapis.com/token",
        {
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          code: authCode,
          grant_type: "authorization_code",
          redirect_uri: process.env.YOUTUBE_REDIRECT_URI,
        }
      );

      accessToken = tokenResponse.data.access_token;
      refreshToken = tokenResponse.data.refresh_token;
      const expiresIn = tokenResponse.data.expires_in;

      // Get channel info
      const channelResponse = await axios.get(
        "https://www.googleapis.com/youtube/v3/channels",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            part: "snippet,statistics,contentDetails",
            mine: true,
          },
        }
      );

      const channel = channelResponse.data.items[0];

      return {
        id: channel.id,
        username: channel.snippet.title,
        display_name: channel.snippet.title,
        avatar_url: channel.snippet.thumbnails.high.url,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
        follower_count: parseInt(channel.statistics.subscriberCount) || 0,
        following_count: 0, // YouTube doesn't have following
        post_count: parseInt(channel.statistics.videoCount) || 0,
        is_verified: channel.snippet.customUrl ? true : false,
        engagement_data: {
          view_count: parseInt(channel.statistics.viewCount) || 0,
          comment_count: parseInt(channel.statistics.commentCount) || 0,
          description: channel.snippet.description,
        },
      };
    }

    return null;
  } catch (error) {
    console.error("YouTube API error:", error.response?.data || error.message);
    throw error;
  }
};

const fetchTwitterData = async (authCode, userId, existingToken = null) => {
  // Twitter API implementation
  return {
    id: "tw_" + userId,
    username: "twitter_user",
    display_name: "Twitter User",
    avatar_url: null,
    access_token: "placeholder_token",
    refresh_token: null,
    expires_at: null,
    follower_count: 0,
    following_count: 0,
    post_count: 0,
    is_verified: false,
  };
};

const fetchLinkedInData = async (authCode, userId, existingToken = null) => {
  // LinkedIn API implementation
  return {
    id: "ln_" + userId,
    username: "linkedin_user",
    display_name: "LinkedIn User",
    avatar_url: null,
    access_token: "placeholder_token",
    refresh_token: null,
    expires_at: null,
    follower_count: 0,
    following_count: 0,
    post_count: 0,
    is_verified: false,
  };
};

// AI Analysis Service
const analyzeInfluencerData = async (userId, platform) => {
  try {
    // Get connection and recent posts data
    const { data: connection } = await supabase
      .from("social_connections")
      .select("*")
      .eq("user_id", userId)
      .eq("platform", platform)
      .single();

    if (!connection) return;

    // Perform AI analysis (this would call your FastAPI AI service)
    const analysisResults = await performAIAnalysis(connection);

    // Store analytics results
    await supabase.from("influencer_analytics").upsert(
      {
        user_id: userId,
        platform: platform,
        engagement_rate: analysisResults.engagement_rate,
        avg_likes: analysisResults.avg_likes,
        avg_comments: analysisResults.avg_comments,
        fake_follower_percentage: analysisResults.fake_follower_percentage,
        sentiment_score: analysisResults.sentiment_score,
        audience_age_18_24: analysisResults.demographics.age_18_24,
        audience_age_25_34: analysisResults.demographics.age_25_34,
        audience_age_35_44: analysisResults.demographics.age_35_44,
        audience_male: analysisResults.demographics.male,
        audience_female: analysisResults.demographics.female,
        top_locations: analysisResults.top_locations,
        interests: analysisResults.interests,
        niche_categories: analysisResults.niche_categories,
      },
      {
        onConflict: "user_id,platform",
      }
    );

    // Store AI insights
    await supabase.from("ai_insights").insert([
      {
        subject_type: "influencer",
        subject_id: userId,
        insight_type: "fake_followers",
        confidence_score: analysisResults.fake_follower_confidence,
        data: { percentage: analysisResults.fake_follower_percentage },
        explanation: analysisResults.fake_follower_explanation,
      },
      {
        subject_type: "influencer",
        subject_id: userId,
        insight_type: "sentiment",
        confidence_score: analysisResults.sentiment_confidence,
        data: { score: analysisResults.sentiment_score },
        explanation: analysisResults.sentiment_explanation,
      },
    ]);
  } catch (error) {
    console.error("AI analysis error:", error);
  }
};

// Mock AI analysis (replace with actual FastAPI calls)
const performAIAnalysis = async (connection) => {
  // This would be replaced with actual calls to your FastAPI AI service
  return {
    engagement_rate: Math.random() * 10 + 1, // 1-11%
    avg_likes: Math.floor(Math.random() * 1000) + 100,
    avg_comments: Math.floor(Math.random() * 100) + 10,
    fake_follower_percentage: Math.random() * 30, // 0-30%
    fake_follower_confidence: Math.random() * 40 + 60, // 60-100%
    fake_follower_explanation:
      "Analysis based on engagement patterns and follower behavior",
    sentiment_score: (Math.random() - 0.5) * 2, // -1 to 1
    sentiment_confidence: Math.random() * 30 + 70, // 70-100%
    sentiment_explanation:
      "Overall positive sentiment detected in recent posts",
    demographics: {
      age_18_24: Math.random() * 40 + 10,
      age_25_34: Math.random() * 40 + 20,
      age_35_44: Math.random() * 30 + 15,
      male: Math.random() * 60 + 20,
      female: Math.random() * 60 + 20,
    },
    top_locations: ["United States", "Canada", "United Kingdom"],
    interests: ["fashion", "lifestyle", "travel"],
    niche_categories: ["fashion", "beauty"],
  };
};

module.exports = {
  fetchPlatformData,
  analyzeInfluencerData,
};
