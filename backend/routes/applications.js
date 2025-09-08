// backend/routes/applications.js - Campaign Applications Routes
const express = require("express");
const { supabase } = require("../config/supabase");
const { authenticateToken, requireAuth } = require("../middleware/auth");
const router = express.Router();

// Get all applications for a user (brand or influencer)
router.get("/", requireAuth, async (req, res) => {
  try {
    const { role } = req.profile;
    const userId = req.user.id;

    let query = supabase
      .from("campaign_applications")
      .select(`
        *,
        campaigns (
          id,
          title,
          description,
          budget,
          category,
          status,
          brand_id,
          profiles!campaigns_brand_id_fkey (
            first_name,
            last_name,
            company_name,
            avatar_url
          )
        ),
        profiles!campaign_applications_influencer_id_fkey (
          id,
          first_name,
          last_name,
          username,
          avatar_url,
          bio
        )
      `);

    // Filter based on user role
    if (role === "influencer") {
      query = query.eq("influencer_id", userId);
    } else if (role === "brand") {
      // Get applications for campaigns owned by this brand
      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("id")
        .eq("brand_id", userId);
      
      if (campaigns) {
        const campaignIds = campaigns.map(c => c.id);
        query = query.in("campaign_id", campaignIds);
      }
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      applications: data || []
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get application by ID
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("campaign_applications")
      .select(`
        *,
        campaigns (
          *,
          profiles!campaigns_brand_id_fkey (
            first_name,
            last_name,
            company_name,
            avatar_url
          )
        ),
        profiles!campaign_applications_influencer_id_fkey (
          *
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;

    // Verify user has permission to view this application
    const userId = req.user.id;
    const userRole = req.profile.role;
    
    if (userRole === "influencer" && data.influencer_id !== userId) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to view this application"
      });
    }
    
    if (userRole === "brand" && data.campaigns.brand_id !== userId) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to view this application"
      });
    }

    res.json({
      success: true,
      application: data
    });
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update application status (for brands)
router.put("/:id/status", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Validate status
    const validStatuses = ["pending", "accepted", "rejected", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status"
      });
    }

    // Get the application to verify ownership
    const { data: application, error: fetchError } = await supabase
      .from("campaign_applications")
      .select(`
        *,
        campaigns!inner (
          brand_id
        )
      `)
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Verify the user is the brand owner
    if (application.campaigns.brand_id !== userId) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to update this application"
      });
    }

    // Update the status
    const { data, error } = await supabase
      .from("campaign_applications")
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Create notification for the influencer
    await supabase
      .from("notifications")
      .insert({
        user_id: application.influencer_id,
        type: "application_status",
        title: `Application ${status}`,
        message: `Your application has been ${status}`,
        data: {
          application_id: id,
          campaign_id: application.campaign_id,
          status
        }
      });

    res.json({
      success: true,
      application: data
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete/withdraw application
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.profile.role;

    // Get the application
    const { data: application, error: fetchError } = await supabase
      .from("campaign_applications")
      .select("*, campaigns!inner (brand_id)")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Verify permission
    if (userRole === "influencer" && application.influencer_id !== userId) {
      return res.status(403).json({
        success: false,
        error: "You can only withdraw your own applications"
      });
    }

    if (userRole === "brand" && application.campaigns.brand_id !== userId) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to delete this application"
      });
    }

    // Delete the application
    const { error } = await supabase
      .from("campaign_applications")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({
      success: true,
      message: "Application deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting application:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;