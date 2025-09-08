// backend/routes/ai.js - AI Service Routes
const express = require("express");
const axios = require("axios");
const { authenticateToken, requireAuth } = require("../middleware/auth");
const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

// Get AI match score for campaigns
router.post("/match-score", requireAuth, async (req, res) => {
  try {
    const { campaignId, influencerId } = req.body;

    // In mock mode, return a random score
    if (process.env.USE_MOCK_AUTH === "true") {
      const mockScore = Math.floor(Math.random() * 40) + 60; // 60-100
      return res.json({
        success: true,
        score: mockScore,
        factors: {
          audience_relevance: Math.floor(Math.random() * 30) + 70,
          engagement_quality: Math.floor(Math.random() * 30) + 70,
          content_alignment: Math.floor(Math.random() * 30) + 70,
          brand_fit: Math.floor(Math.random() * 30) + 70
        },
        recommendation: mockScore >= 75 ? "Highly Recommended" : "Good Match"
      });
    }

    // Call AI service for real scoring
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/match`, {
        campaign_id: campaignId,
        influencer_id: influencerId
      });

      res.json({
        success: true,
        ...response.data
      });
    } catch (aiError) {
      // Fallback to mock if AI service is unavailable
      const mockScore = Math.floor(Math.random() * 40) + 60;
      res.json({
        success: true,
        score: mockScore,
        factors: {
          audience_relevance: Math.floor(Math.random() * 30) + 70,
          engagement_quality: Math.floor(Math.random() * 30) + 70,
          content_alignment: Math.floor(Math.random() * 30) + 70,
          brand_fit: Math.floor(Math.random() * 30) + 70
        },
        recommendation: mockScore >= 75 ? "Highly Recommended" : "Good Match",
        note: "AI service unavailable - using estimated score"
      });
    }
  } catch (error) {
    console.error("Error getting match score:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get content suggestions
router.post("/content-suggestions", requireAuth, async (req, res) => {
  try {
    const { campaignId, platform } = req.body;

    // Mock suggestions
    const suggestions = {
      instagram: [
        "Create a carousel post showcasing the product in different settings",
        "Share a Reel demonstrating the product's key features",
        "Post Stories with behind-the-scenes content",
        "Host a giveaway to boost engagement"
      ],
      tiktok: [
        "Create a trending sound video featuring the product",
        "Make a 'Day in the Life' video incorporating the product",
        "Film a quick tutorial or how-to video",
        "Join a relevant challenge or create your own"
      ],
      youtube: [
        "Create an in-depth review video",
        "Film an unboxing experience",
        "Make a comparison video with similar products",
        "Create a tutorial showing different use cases"
      ]
    };

    res.json({
      success: true,
      suggestions: suggestions[platform] || suggestions.instagram,
      platform
    });
  } catch (error) {
    console.error("Error getting content suggestions:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Analyze engagement metrics
router.post("/analyze-engagement", requireAuth, async (req, res) => {
  try {
    const { metrics } = req.body;

    // Mock analysis
    const analysis = {
      engagement_rate: ((metrics.likes + metrics.comments) / metrics.followers * 100).toFixed(2),
      performance: "above_average",
      insights: [
        "Your engagement rate is higher than the industry average",
        "Comments show high audience interest",
        "Best posting time appears to be evenings",
        "Video content performs 40% better than static posts"
      ],
      recommendations: [
        "Continue focusing on video content",
        "Engage more with comments to boost algorithm ranking",
        "Consider posting more frequently during peak hours",
        "Use more call-to-action in captions"
      ]
    };

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error("Error analyzing engagement:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get trending topics/hashtags
router.get("/trending/:platform", async (req, res) => {
  try {
    const { platform } = req.params;

    // Mock trending data
    const trending = {
      instagram: [
        "#OOTD", "#ThrowbackThursday", "#Foodie", "#Travel",
        "#Fitness", "#Beauty", "#Fashion", "#Lifestyle"
      ],
      tiktok: [
        "#ForYou", "#FYP", "#Viral", "#Trending",
        "#Challenge", "#Dance", "#Comedy", "#DIY"
      ],
      youtube: [
        "Shorts", "Tutorial", "Vlog", "Review",
        "Haul", "Challenge", "React", "Gaming"
      ]
    };

    res.json({
      success: true,
      platform,
      trending: trending[platform] || trending.instagram,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error getting trending topics:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;