// backend/middleware/auth.js - Authentication Middleware
const { supabase } = require("../config/supabase");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return res.status(401).json({ error: "User profile not found" });
    }

    req.user = user;
    req.profile = profile;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ error: "Authentication failed" });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.profile || !roles.includes(req.profile.user_type)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
};

module.exports = { 
  authenticateToken, 
  requireAuth: authenticateToken, // Alias for compatibility
  requireRole,
  requireBrand: requireRole(['brand']),
  requireInfluencer: requireRole(['influencer']),
  requireAdmin: requireRole(['admin']),
  optionalAuth: (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return next(); // Continue without auth
    }
    return authenticateToken(req, res, next);
  }
};
