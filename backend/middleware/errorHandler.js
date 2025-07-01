// backend/middleware/errorHandler.js - Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Supabase errors
  if (err.code) {
    return res.status(400).json({
      error: err.message,
      code: err.code,
    });
  }

  // Stripe errors
  if (err.type && err.type.startsWith("Stripe")) {
    return res.status(400).json({
      error: err.message,
      type: err.type,
    });
  }

  // Validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation failed",
      details: err.details,
    });
  }

  // Default error
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
};

module.exports = { errorHandler };
