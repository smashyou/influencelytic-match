// backend/server.js - Updated Main Server File
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// Import route handlers
const authRoutes = require("./routes/auth");
const socialRoutes = require("./routes/social");
const campaignRoutes = require("./routes/campaigns");
const paymentRoutes = require("./routes/payments");
const analyticsRoutes = require("./routes/analytics");
const searchRoutes = require("./routes/search");
const notificationRoutes = require("./routes/notifications");
const profileRoutes = require("./routes/profile");

// Route middleware
app.use("/api/auth", authRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/profile", profileRoutes);

// Additional convenience routes
app.use("/api/applications", require("./routes/applications"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/trends", searchRoutes); // Reuse search routes for trends

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    error: "API endpoint not found",
    path: req.path,
    method: req.method,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  
  // Don't leak error details in production
  if (process.env.NODE_ENV === "production") {
    res.status(500).json({
      error: "Internal server error",
      requestId: req.id,
    });
  } else {
    res.status(500).json({
      error: err.message,
      stack: err.stack,
      requestId: req.id,
    });
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`💾 Database: ${process.env.SUPABASE_URL ? "Connected" : "Not configured"}`);
  console.log(`💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? "Connected" : "Not configured"}`);
  console.log(`🤖 AI Service: ${process.env.AI_SERVICE_URL || "http://localhost:8000"}`);
});

module.exports = app;