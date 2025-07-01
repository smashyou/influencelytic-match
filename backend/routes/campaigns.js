// backend/routes/campaigns.js - Campaign Management Routes
const express = require("express");
const { supabase } = require("../config/supabase");
const { requireRole } = require("../middleware/auth");
const router = express.Router();

// Get all campaigns (public for influencers to browse)
router.get("/", async (req, res) => {
  try {
    const {
      status = "active",
      category,
      min_budget,
      max_budget,
      location,
      platform,
      page = 1,
      limit = 20,
    } = req.query;

    let query = supabase
      .from("campaigns")
      .select(
        `
        *,
        profiles:brand_id (first_name, last_name),
        brand_profiles:brand_id (company_name, logo_url)
      `
      )
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (category) {
      query = query.contains("target_interests", [category]);
    }
    if (min_budget) {
      query = query.gte("budget_min", parseInt(min_budget));
    }
    if (max_budget) {
      query = query.lte("budget_max", parseInt(max_budget));
    }
    if (location) {
      query = query.contains("target_locations", [location]);
    }
    if (platform) {
      query = query.contains("required_platforms", [platform]);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: campaigns, error } = await query;

    if (error) throw error;

    res.json({
      campaigns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: campaigns.length === parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get campaigns error:", error);
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
});

// Get campaign by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: campaign, error } = await supabase
      .from("campaigns")
      .select(
        `
        *,
        profiles:brand_id (first_name, last_name),
        brand_profiles:brand_id (company_name, logo_url, description),
        campaign_applications (
          id,
          status,
          proposed_rate,
          ai_match_score,
          applied_at,
          profiles:influencer_id (first_name, last_name)
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Campaign not found" });
      }
      throw error;
    }

    // Check if current user can view this campaign
    const canView =
      campaign.status === "active" || campaign.brand_id === req.user.id;

    if (!canView) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(campaign);
  } catch (error) {
    console.error("Get campaign error:", error);
    res.status(500).json({ error: "Failed to fetch campaign" });
  }
});

// Create new campaign (brands only)
router.post("/", requireRole(["brand"]), async (req, res) => {
  try {
    const campaignData = {
      ...req.body,
      brand_id: req.user.id,
      status: "draft",
    };

    // Validate required fields
    const requiredFields = ["title", "description", "budget_min", "budget_max"];
    for (const field of requiredFields) {
      if (!campaignData[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    const { data: campaign, error } = await supabase
      .from("campaigns")
      .insert(campaignData)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(campaign);
  } catch (error) {
    console.error("Create campaign error:", error);
    res.status(500).json({ error: "Failed to create campaign" });
  }
});

// Update campaign (brand owner only)
router.put("/:id", requireRole(["brand"]), async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const { data: existingCampaign, error: fetchError } = await supabase
      .from("campaigns")
      .select("brand_id")
      .eq("id", id)
      .single();

    if (fetchError || existingCampaign.brand_id !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { data: campaign, error } = await supabase
      .from("campaigns")
      .update(req.body)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json(campaign);
  } catch (error) {
    console.error("Update campaign error:", error);
    res.status(500).json({ error: "Failed to update campaign" });
  }
});

// Apply to campaign (influencers only)
router.post("/:id/apply", requireRole(["influencer"]), async (req, res) => {
  try {
    const { id: campaign_id } = req.params;
    const { proposed_rate, application_message, portfolio_links } = req.body;

    // Check if campaign exists and is active
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("id, status, max_applications")
      .eq("id", campaign_id)
      .eq("status", "active")
      .single();

    if (campaignError || !campaign) {
      return res
        .status(404)
        .json({ error: "Campaign not found or not active" });
    }

    // Check if already applied
    const { data: existingApplication } = await supabase
      .from("campaign_applications")
      .select("id")
      .eq("campaign_id", campaign_id)
      .eq("influencer_id", req.user.id)
      .single();

    if (existingApplication) {
      return res
        .status(400)
        .json({ error: "Already applied to this campaign" });
    }

    // TODO: Calculate AI match score here
    const ai_match_score = 75; // Placeholder

    const { data: application, error } = await supabase
      .from("campaign_applications")
      .insert({
        campaign_id,
        influencer_id: req.user.id,
        proposed_rate,
        application_message,
        portfolio_links,
        ai_match_score,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(application);
  } catch (error) {
    console.error("Apply to campaign error:", error);
    res.status(500).json({ error: "Failed to apply to campaign" });
  }
});

// Get applications for a campaign (brand owner only)
router.get("/:id/applications", requireRole(["brand"]), async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("brand_id")
      .eq("id", id)
      .single();

    if (campaignError || campaign.brand_id !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { data: applications, error } = await supabase
      .from("campaign_applications")
      .select(
        `
        *,
        profiles:influencer_id (first_name, last_name),
        social_connections:influencer_id (platform, follower_count, engagement_rate),
        influencer_analytics:influencer_id (*)
      `
      )
      .eq("campaign_id", id)
      .order("ai_match_score", { ascending: false });

    if (error) throw error;

    res.json(applications);
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// Update application status (brand owner only)
router.patch(
  "/applications/:applicationId",
  requireRole(["brand"]),
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const { status, brand_feedback } = req.body;

      // Verify the application belongs to a campaign owned by this brand
      const { data: application, error: fetchError } = await supabase
        .from("campaign_applications")
        .select(
          `
        id,
        campaign_id,
        campaigns:campaign_id (brand_id)
      `
        )
        .eq("id", applicationId)
        .single();

      if (fetchError || application.campaigns.brand_id !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updateData = { status };
      if (brand_feedback) updateData.brand_feedback = brand_feedback;
      if (status === "accepted" || status === "rejected") {
        updateData.responded_at = new Date().toISOString();
      }

      const { data: updatedApplication, error } = await supabase
        .from("campaign_applications")
        .update(updateData)
        .eq("id", applicationId)
        .select()
        .single();

      if (error) throw error;

      res.json(updatedApplication);
    } catch (error) {
      console.error("Update application error:", error);
      res.status(500).json({ error: "Failed to update application" });
    }
  }
);

module.exports = router;
