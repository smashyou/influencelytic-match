// backend/routes/auth.js - Authentication Routes
const express = require("express");
const { supabase } = require("../config/supabase");
const router = express.Router();

// Sign up
router.post("/signup", async (req, res) => {
  try {
    const { email, password, first_name, last_name, user_type } = req.body;

    // Validate required fields
    if (!email || !password || !first_name || !last_name || !user_type) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name,
          user_type,
        },
      },
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Create profile
    if (authData.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        first_name,
        last_name,
        user_type,
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }

      // Create user preferences
      await supabase.from("user_preferences").insert({
        user_id: authData.user.id,
      });

      // Create brand profile if user is a brand
      if (user_type === "brand") {
        await supabase.from("brand_profiles").insert({
          user_id: authData.user.id,
          company_name: `${first_name} ${last_name}`, // Default, can be updated later
        });
      }
    }

    res.status(201).json({
      message: "User created successfully",
      user: authData.user,
      session: authData.session,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Sign in
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({
      message: "Sign in successful",
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ error: "Failed to sign in" });
  }
});

// Sign out
router.post("/signout", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      await supabase.auth.signOut();
    }

    res.json({ message: "Signed out successfully" });
  } catch (error) {
    console.error("Signout error:", error);
    res.status(500).json({ error: "Failed to sign out" });
  }
});

// Get current user
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    res.json({ user, profile });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

module.exports = router;
