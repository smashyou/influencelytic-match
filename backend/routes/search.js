// backend/routes/search.js - Search and Discovery Routes
const express = require("express");
const { supabase } = require("../config/supabase");
const { requireAuth } = require("../middleware/auth");
const router = express.Router();

// Search influencers with filters
router.get("/influencers", requireAuth, async (req, res) => {
  try {
    const {
      q: query,
      min_followers,
      max_followers,
      platforms,
      interests,
      min_engagement,
      max_fake_followers,
      location,
      verified_only,
      limit = 20,
      offset = 0,
    } = req.query;

    let dbQuery = supabase
      .from("profiles")
      .select(`
        *,
        social_connections (
          platform,
          follower_count,
          following_count,
          is_verified,
          username
        ),
        influencer_analytics (
          engagement_rate,
          fake_follower_percentage,
          niche_categories,
          audience_age_18_24,
          audience_age_25_34,
          audience_male,
          audience_female,
          top_locations
        )
      `)
      .eq("user_type", "influencer")
      .range(offset, offset + limit - 1);

    // Text search on name and bio
    if (query) {
      dbQuery = dbQuery.or(
        `first_name.ilike.%${query}%,last_name.ilike.%${query}%`
      );
    }

    const { data: influencers, error } = await dbQuery;

    if (error) {
      console.error("Search error:", error);
      return res.status(500).json({ error: "Search failed" });
    }

    // Apply additional filters
    let filteredInfluencers = influencers || [];

    if (min_followers || max_followers) {
      filteredInfluencers = filteredInfluencers.filter((influencer) => {
        const totalFollowers = influencer.social_connections?.reduce(
          (sum, conn) => sum + (conn.follower_count || 0), 0
        ) || 0;
        
        if (min_followers && totalFollowers < parseInt(min_followers)) return false;
        if (max_followers && totalFollowers > parseInt(max_followers)) return false;
        return true;
      });
    }

    if (platforms) {
      const requiredPlatforms = platforms.split(",");
      filteredInfluencers = filteredInfluencers.filter((influencer) => {
        const userPlatforms = influencer.social_connections?.map(conn => conn.platform) || [];
        return requiredPlatforms.every(platform => userPlatforms.includes(platform));
      });
    }

    if (min_engagement) {
      filteredInfluencers = filteredInfluencers.filter((influencer) => {
        const avgEngagement = influencer.influencer_analytics?.[0]?.engagement_rate || 0;
        return avgEngagement >= parseFloat(min_engagement);
      });
    }

    if (max_fake_followers) {
      filteredInfluencers = filteredInfluencers.filter((influencer) => {
        const fakePercentage = influencer.influencer_analytics?.[0]?.fake_follower_percentage || 0;
        return fakePercentage <= parseFloat(max_fake_followers);
      });
    }

    if (verified_only === "true") {
      filteredInfluencers = filteredInfluencers.filter((influencer) => {
        return influencer.social_connections?.some(conn => conn.is_verified);
      });
    }

    // Format response
    const formattedResults = filteredInfluencers.map((influencer) => ({
      id: influencer.id,
      name: `${influencer.first_name} ${influencer.last_name}`,
      avatar_url: influencer.avatar_url,
      bio: influencer.bio,
      total_followers: influencer.social_connections?.reduce(
        (sum, conn) => sum + (conn.follower_count || 0), 0
      ) || 0,
      engagement_rate: influencer.influencer_analytics?.[0]?.engagement_rate || 0,
      fake_follower_percentage: influencer.influencer_analytics?.[0]?.fake_follower_percentage || 0,
      platforms: influencer.social_connections?.map(conn => ({
        platform: conn.platform,
        username: conn.username,
        followers: conn.follower_count,
        verified: conn.is_verified,
      })) || [],
      niches: influencer.influencer_analytics?.[0]?.niche_categories || [],
      demographics: {
        age_18_24: influencer.influencer_analytics?.[0]?.audience_age_18_24 || 0,
        age_25_34: influencer.influencer_analytics?.[0]?.audience_age_25_34 || 0,
        male: influencer.influencer_analytics?.[0]?.audience_male || 0,
        female: influencer.influencer_analytics?.[0]?.audience_female || 0,
        top_locations: influencer.influencer_analytics?.[0]?.top_locations || [],
      },
    }));

    res.json({
      results: formattedResults,
      total: formattedResults.length,
      query: {
        q: query,
        filters: req.query,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

// Get trending topics
router.get("/trends/topics", requireAuth, async (req, res) => {
  try {
    // This would typically come from external APIs or ML analysis
    // For now, return mock trending topics
    const trendingTopics = [
      { topic: "sustainable fashion", mentions: 15420, growth: 28.5 },
      { topic: "wellness routine", mentions: 12890, growth: 22.1 },
      { topic: "tech reviews", mentions: 11240, growth: 18.7 },
      { topic: "travel tips", mentions: 9870, growth: 15.3 },
      { topic: "home decor", mentions: 8650, growth: 12.9 },
      { topic: "fitness motivation", mentions: 7430, growth: 10.2 },
      { topic: "food photography", mentions: 6920, growth: 8.8 },
      { topic: "skincare routine", mentions: 6180, growth: 7.4 },
    ];

    res.json(trendingTopics);
  } catch (error) {
    console.error("Trends error:", error);
    res.status(500).json({ error: "Failed to fetch trending topics" });
  }
});

// Get trending hashtags
router.get("/trends/hashtags", requireAuth, async (req, res) => {
  try {
    // Mock trending hashtags - would come from social media APIs
    const trendingHashtags = [
      { hashtag: "#sustainability", posts: 245000, growth: 34.2 },
      { hashtag: "#wellness", posts: 189000, growth: 28.7 },
      { hashtag: "#techreview", posts: 156000, growth: 25.1 },
      { hashtag: "#travel2025", posts: 134000, growth: 22.3 },
      { hashtag: "#homedecor", posts: 128000, growth: 19.8 },
      { hashtag: "#fitnessmotivation", posts: 112000, growth: 17.5 },
      { hashtag: "#foodie", posts: 98000, growth: 15.2 },
      { hashtag: "#skincare", posts: 87000, growth: 12.9 },
    ];

    res.json(trendingHashtags);
  } catch (error) {
    console.error("Hashtags error:", error);
    res.status(500).json({ error: "Failed to fetch trending hashtags" });
  }
});

module.exports = router;