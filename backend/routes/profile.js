// backend/routes/profile.js - Profile Management
const express = require("express");
const { supabase } = require("../config/supabase");
const { requireAuth } = require("../middleware/auth");
const router = express.Router();

// Get current user profile
router.get("/", requireAuth, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", req.user.id)
      .single();

    if (error) {
      console.error("Profile fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }

    res.json(profile);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update user profile
router.put("/", requireAuth, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.id; // Prevent ID changes
    delete updates.user_type; // Prevent user type changes

    const { data: profile, error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.user.id)
      .select()
      .single();

    if (error) {
      console.error("Profile update error:", error);
      return res.status(500).json({ error: "Failed to update profile" });
    }

    res.json(profile);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Get brand profile
router.get("/brand", requireAuth, async (req, res) => {
  try {
    const { data: brandProfile, error } = await supabase
      .from("brand_profiles")
      .select("*")
      .eq("user_id", req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found error
      console.error("Brand profile fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch brand profile" });
    }

    res.json(brandProfile || null);
  } catch (error) {
    console.error("Brand profile fetch error:", error);
    res.status(500).json({ error: "Failed to fetch brand profile" });
  }
});

// Update brand profile
router.put("/brand", requireAuth, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.id;
    delete updates.user_id;

    // Check if brand profile exists
    const { data: existing } = await supabase
      .from("brand_profiles")
      .select("id")
      .eq("user_id", req.user.id)
      .single();

    let result;
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from("brand_profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", req.user.id)
        .select()
        .single();
      
      result = { data, error };
    } else {
      // Create new
      const { data, error } = await supabase
        .from("brand_profiles")
        .insert({
          user_id: req.user.id,
          ...updates,
        })
        .select()
        .single();
      
      result = { data, error };
    }

    if (result.error) {
      console.error("Brand profile update error:", result.error);
      return res.status(500).json({ error: "Failed to update brand profile" });
    }

    res.json(result.data);
  } catch (error) {
    console.error("Brand profile update error:", error);
    res.status(500).json({ error: "Failed to update brand profile" });
  }
});

module.exports = router;