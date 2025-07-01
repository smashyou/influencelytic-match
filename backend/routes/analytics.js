// backend/routes/analytics.js - Analytics & AI Routes
const express = require("express");
const { supabase } = require("../config/supabase");
const { requireRole } = require("../middleware/auth");
const router = express.Router();

// Get influencer analytics
router.get("/influencer/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    // Check permissions - users can only view their own analytics unless they're brands viewing public data
    if (userId !== req.user.id && req.profile.user_type !== "brand") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { data: analytics, error } = await supabase
      .from("influencer_analytics")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;

    // Get social connections for additional context
    const { data: connections } = await supabase
      .from("social_connections")
      .select(
        "platform, follower_count, following_count, post_count, is_verified"
      )
      .eq("user_id", userId)
      .eq("is_active", true);

    // Combine analytics with connection data
    const combinedData = analytics.map((analytic) => {
      const connection = connections.find(
        (conn) => conn.platform === analytic.platform
      );
      return {
        ...analytic,
        connection: connection || null,
      };
    });

    res.json({
      analytics: combinedData,
      summary: {
        total_followers: connections.reduce(
          (sum, conn) => sum + (conn.follower_count || 0),
          0
        ),
        platforms_connected: connections.length,
        verified_accounts: connections.filter((conn) => conn.is_verified)
          .length,
        avg_engagement_rate:
          analytics.length > 0
            ? analytics.reduce((sum, a) => sum + (a.engagement_rate || 0), 0) /
              analytics.length
            : 0,
      },
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// Get AI insights for user
router.get("/insights/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    if (userId !== req.user.id && req.profile.user_type !== "brand") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { data: insights, error } = await supabase
      .from("ai_insights")
      .select("*")
      .eq("subject_type", "influencer")
      .eq("subject_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    // Group insights by type
    const groupedInsights = insights.reduce((acc, insight) => {
      if (!acc[insight.insight_type]) {
        acc[insight.insight_type] = [];
      }
      acc[insight.insight_type].push(insight);
      return acc;
    }, {});

    res.json(groupedInsights);
  } catch (error) {
    console.error("Get insights error:", error);
    res.status(500).json({ error: "Failed to fetch insights" });
  }
});

// Get campaign match suggestions for influencer
router.get("/matches", requireRole(["influencer"]), async (req, res) => {
  try {
    // Get influencer's analytics and interests
    const { data: analytics } = await supabase
      .from("influencer_analytics")
      .select("*")
      .eq("user_id", req.user.id);

    const { data: connections } = await supabase
      .from("social_connections")
      .select("*")
      .eq("user_id", req.user.id)
      .eq("is_active", true);

    if (!analytics.length || !connections.length) {
      return res.json({
        matches: [],
        message: "Connect social media accounts to get personalized matches",
      });
    }

    // Get active campaigns
    const { data: campaigns } = await supabase
      .from("campaigns")
      .select(
        `
        *,
        profiles:brand_id (first_name, last_name),
        brand_profiles:brand_id (company_name, logo_url)
      `
      )
      .eq("status", "active");

    // Calculate match scores (simplified algorithm)
    const matches = campaigns
      .map((campaign) => {
        let matchScore = 0;
        let reasons = [];

        // Check follower count requirements
        const totalFollowers = connections.reduce(
          (sum, conn) => sum + (conn.follower_count || 0),
          0
        );
        if (totalFollowers >= (campaign.min_followers || 0)) {
          matchScore += 20;
          reasons.push("Meets follower requirements");
        }

        // Check platform requirements
        const influencerPlatforms = connections.map((conn) => conn.platform);
        const requiredPlatforms = campaign.required_platforms || [];
        const platformMatch =
          requiredPlatforms.length === 0 ||
          requiredPlatforms.some((platform) =>
            influencerPlatforms.includes(platform)
          );
        if (platformMatch) {
          matchScore += 25;
          reasons.push("Platform compatibility");
        }

        // Check engagement rate
        const avgEngagement =
          analytics.reduce((sum, a) => sum + (a.engagement_rate || 0), 0) /
          analytics.length;
        if (avgEngagement >= (campaign.min_engagement_rate || 0)) {
          matchScore += 20;
          reasons.push("Strong engagement rate");
        }

        // Check interests alignment
        const influencerInterests = analytics.flatMap((a) => a.interests || []);
        const campaignInterests = campaign.target_interests || [];
        const interestOverlap = campaignInterests.filter((interest) =>
          influencerInterests.includes(interest)
        );
        if (interestOverlap.length > 0) {
          matchScore += 15;
          reasons.push(`Shared interests: ${interestOverlap.join(", ")}`);
        }

        // Check demographics (simplified)
        matchScore += Math.random() * 20; // Placeholder for demographic matching

        return {
          ...campaign,
          match_score: Math.min(100, matchScore),
          match_reasons: reasons,
          estimated_rate: calculateEstimatedRate(totalFollowers, avgEngagement),
        };
      })
      .filter((match) => match.match_score >= 30)
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 20);

    res.json({ matches });
  } catch (error) {
    console.error("Get matches error:", error);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});

// Get influencer suggestions for brands
router.get(
  "/influencer-suggestions",
  requireRole(["brand"]),
  async (req, res) => {
    try {
      const {
        min_followers,
        max_followers,
        platforms,
        interests,
        locations,
        min_engagement,
        budget,
      } = req.query;

      let query = supabase.from("influencer_analytics").select(`
        *,
        profiles:user_id (first_name, last_name),
        social_connections:user_id (platform, follower_count, username, is_verified)
      `);

      // Apply filters
      if (min_engagement) {
        query = query.gte("engagement_rate", parseFloat(min_engagement));
      }

      const { data: influencers, error } = await query;

      if (error) throw error;

      // Filter and score influencers
      const filteredInfluencers = influencers
        .filter((influencer) => {
          const connections = influencer.social_connections || [];
          const totalFollowers = connections.reduce(
            (sum, conn) => sum + (conn.follower_count || 0),
            0
          );

          // Apply filters
          if (min_followers && totalFollowers < parseInt(min_followers))
            return false;
          if (max_followers && totalFollowers > parseInt(max_followers))
            return false;

          if (platforms) {
            const requiredPlatforms = platforms.split(",");
            const influencerPlatforms = connections.map(
              (conn) => conn.platform
            );
            if (
              !requiredPlatforms.some((platform) =>
                influencerPlatforms.includes(platform)
              )
            ) {
              return false;
            }
          }

          return true;
        })
        .map((influencer) => {
          const connections = influencer.social_connections || [];
          const totalFollowers = connections.reduce(
            (sum, conn) => sum + (conn.follower_count || 0),
            0
          );

          return {
            user_id: influencer.user_id,
            name: `${influencer.profiles.first_name} ${influencer.profiles.last_name}`,
            platforms: connections.map((conn) => ({
              platform: conn.platform,
              username: conn.username,
              followers: conn.follower_count,
              verified: conn.is_verified,
            })),
            engagement_rate: influencer.engagement_rate,
            total_followers: totalFollowers,
            interests: influencer.interests || [],
            fake_follower_percentage: influencer.fake_follower_percentage,
            estimated_rate: calculateEstimatedRate(
              totalFollowers,
              influencer.engagement_rate
            ),
            match_score: calculateBrandMatchScore(influencer, {
              interests: interests ? interests.split(",") : [],
              budget: budget ? parseInt(budget) : null,
            }),
          };
        })
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, 50);

      res.json({ influencers: filteredInfluencers });
    } catch (error) {
      console.error("Get influencer suggestions error:", error);
      res.status(500).json({ error: "Failed to fetch influencer suggestions" });
    }
  }
);

// Helper functions
const calculateEstimatedRate = (followers, engagementRate) => {
  // Simplified rate calculation
  const baseRate = Math.max(50, followers * 0.01); // $0.01 per follower minimum $50
  const engagementMultiplier = Math.max(1, engagementRate / 3); // Higher engagement = higher rate
  return Math.round(baseRate * engagementMultiplier);
};

const calculateBrandMatchScore = (influencer, brandCriteria) => {
  let score = 50; // Base score

  // Interest alignment
  if (brandCriteria.interests && brandCriteria.interests.length > 0) {
    const overlap = (influencer.interests || []).filter((interest) =>
      brandCriteria.interests.includes(interest)
    );
    score += overlap.length * 10;
  }

  // Budget alignment
  if (brandCriteria.budget && influencer.estimated_rate) {
    if (influencer.estimated_rate <= brandCriteria.budget) {
      score += 20;
    } else if (influencer.estimated_rate <= brandCriteria.budget * 1.2) {
      score += 10;
    }
  }

  // Fake follower penalty
  if (influencer.fake_follower_percentage > 20) {
    score -= 20;
  }

  // Engagement bonus
  if (influencer.engagement_rate > 5) {
    score += 15;
  }

  return Math.min(100, Math.max(0, score));
};

module.exports = router;
