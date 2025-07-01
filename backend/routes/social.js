// backend/routes/social.js - Social Media Integration Routes
const express = require("express");
const { supabase } = require("../config/supabase");
const { requireRole } = require("../middleware/auth");
const {
  fetchPlatformData,
  analyzeInfluencerData,
} = require("../services/socialMediaService");
const router = express.Router();

// Get connected platforms for current user
router.get("/connections", async (req, res) => {
  try {
    const { data: connections, error } = await supabase
      .from("social_connections")
      .select("*")
      .eq("user_id", req.user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Remove sensitive data
    const sanitizedConnections = connections.map((conn) => ({
      ...conn,
      access_token: undefined,
      refresh_token: undefined,
    }));

    res.json(sanitizedConnections);
  } catch (error) {
    console.error("Get connections error:", error);
    res.status(500).json({ error: "Failed to fetch connections" });
  }
});

// Initiate OAuth flow for a platform
router.get("/auth/:platform", requireRole(["influencer"]), async (req, res) => {
  try {
    const { platform } = req.params;

    const supportedPlatforms = [
      "instagram",
      "facebook",
      "tiktok",
      "youtube",
      "twitter",
      "linkedin",
    ];
    if (!supportedPlatforms.includes(platform)) {
      return res.status(400).json({ error: "Unsupported platform" });
    }

    // Generate auth URL based on platform
    let authUrl;
    switch (platform) {
      case "instagram":
        authUrl = `https://api.instagram.com/oauth/authorize?client_id=${
          process.env.INSTAGRAM_CLIENT_ID
        }&redirect_uri=${encodeURIComponent(
          process.env.INSTAGRAM_REDIRECT_URI
        )}&scope=user_profile,user_media&response_type=code&state=${
          req.user.id
        }`;
        break;
      case "facebook":
        authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${
          process.env.FACEBOOK_APP_ID
        }&redirect_uri=${encodeURIComponent(
          process.env.FACEBOOK_REDIRECT_URI
        )}&scope=pages_read_engagement,pages_show_list,instagram_basic,instagram_manage_insights&response_type=code&state=${
          req.user.id
        }`;
        break;
      case "tiktok":
        authUrl = `https://www.tiktok.com/auth/authorize/?client_key=${
          process.env.TIKTOK_CLIENT_KEY
        }&response_type=code&scope=user.info.basic,video.list&redirect_uri=${encodeURIComponent(
          process.env.TIKTOK_REDIRECT_URI
        )}&state=${req.user.id}`;
        break;
      case "youtube":
        authUrl = `https://accounts.google.com/oauth2/auth?client_id=${
          process.env.GOOGLE_CLIENT_ID
        }&redirect_uri=${encodeURIComponent(
          process.env.YOUTUBE_REDIRECT_URI
        )}&scope=https://www.googleapis.com/auth/youtube.readonly&response_type=code&access_type=offline&state=${
          req.user.id
        }`;
        break;
      case "twitter":
        // Twitter OAuth 2.0 PKCE flow would be implemented here
        authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${
          process.env.TWITTER_CLIENT_ID
        }&redirect_uri=${encodeURIComponent(
          process.env.TWITTER_REDIRECT_URI
        )}&scope=tweet.read%20users.read%20follows.read&state=${
          req.user.id
        }&code_challenge=challenge&code_challenge_method=plain`;
        break;
      case "linkedin":
        authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${
          process.env.LINKEDIN_CLIENT_ID
        }&redirect_uri=${encodeURIComponent(
          process.env.LINKEDIN_REDIRECT_URI
        )}&scope=r_liteprofile%20r_emailaddress%20w_member_social&state=${
          req.user.id
        }`;
        break;
    }

    res.json({ authUrl });
  } catch (error) {
    console.error("Social auth error:", error);
    res.status(500).json({ error: "Failed to generate auth URL" });
  }
});

// Handle OAuth callback
router.post("/callback/:platform", async (req, res) => {
  try {
    const { platform } = req.params;
    const { code, state: userId } = req.body;

    if (!code || !userId) {
      return res.status(400).json({ error: "Missing code or state parameter" });
    }

    // Exchange code for access token and fetch user data
    const platformData = await fetchPlatformData(platform, code, userId);

    if (!platformData) {
      return res.status(400).json({ error: "Failed to fetch platform data" });
    }

    // Store or update connection
    const { data: connection, error } = await supabase
      .from("social_connections")
      .upsert(
        {
          user_id: userId,
          platform,
          platform_user_id: platformData.id,
          username: platformData.username,
          display_name: platformData.display_name,
          avatar_url: platformData.avatar_url,
          access_token: platformData.access_token,
          refresh_token: platformData.refresh_token,
          expires_at: platformData.expires_at,
          follower_count: platformData.follower_count,
          following_count: platformData.following_count,
          post_count: platformData.post_count,
          is_verified: platformData.is_verified,
          is_active: true,
          last_sync_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,platform,platform_user_id",
        }
      )
      .select()
      .single();

    if (error) throw error;

    // Trigger analytics analysis
    await analyzeInfluencerData(userId, platform);

    res.json({
      message: "Platform connected successfully",
      connection: {
        ...connection,
        access_token: undefined,
        refresh_token: undefined,
      },
    });
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.status(500).json({ error: "Failed to connect platform" });
  }
});

// Sync data from connected platforms
router.post(
  "/sync/:platform",
  requireRole(["influencer"]),
  async (req, res) => {
    try {
      const { platform } = req.params;

      // Get existing connection
      const { data: connection, error: connectionError } = await supabase
        .from("social_connections")
        .select("*")
        .eq("user_id", req.user.id)
        .eq("platform", platform)
        .eq("is_active", true)
        .single();

      if (connectionError || !connection) {
        return res.status(404).json({ error: "Platform not connected" });
      }

      // Refresh platform data
      const updatedData = await fetchPlatformData(
        platform,
        null,
        req.user.id,
        connection.access_token
      );

      if (updatedData) {
        // Update connection with fresh data
        await supabase
          .from("social_connections")
          .update({
            follower_count: updatedData.follower_count,
            following_count: updatedData.following_count,
            post_count: updatedData.post_count,
            last_sync_at: new Date().toISOString(),
          })
          .eq("id", connection.id);

        // Re-analyze influencer data
        await analyzeInfluencerData(req.user.id, platform);
      }

      res.json({ message: "Data synced successfully" });
    } catch (error) {
      console.error("Sync error:", error);
      res.status(500).json({ error: "Failed to sync data" });
    }
  }
);

// Disconnect platform
router.delete(
  "/connections/:platform",
  requireRole(["influencer"]),
  async (req, res) => {
    try {
      const { platform } = req.params;

      const { error } = await supabase
        .from("social_connections")
        .update({ is_active: false })
        .eq("user_id", req.user.id)
        .eq("platform", platform);

      if (error) throw error;

      res.json({ message: "Platform disconnected successfully" });
    } catch (error) {
      console.error("Disconnect error:", error);
      res.status(500).json({ error: "Failed to disconnect platform" });
    }
  }
);

module.exports = router;
