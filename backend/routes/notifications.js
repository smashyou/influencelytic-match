// backend/routes/notifications.js - Notification Management
const express = require("express");
const { supabase } = require("../config/supabase");
const { requireAuth } = require("../middleware/auth");
const router = express.Router();

// Get user notifications
router.get("/", requireAuth, async (req, res) => {
  try {
    const { limit = 20, offset = 0, unread_only } = req.query;

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (unread_only === "true") {
      query = query.eq("is_read", false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error("Notifications error:", error);
      return res.status(500).json({ error: "Failed to fetch notifications" });
    }

    res.json(notifications || []);
  } catch (error) {
    console.error("Notifications error:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Mark notification as read
router.put("/:id/read", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", req.user.id);

    if (error) {
      console.error("Mark read error:", error);
      return res.status(500).json({ error: "Failed to mark notification as read" });
    }

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// Mark all notifications as read
router.put("/read-all", requireAuth, async (req, res) => {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", req.user.id)
      .eq("is_read", false);

    if (error) {
      console.error("Mark all read error:", error);
      return res.status(500).json({ error: "Failed to mark all notifications as read" });
    }

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all read error:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
});

// Create notification (internal use)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { user_id, type, title, message, data } = req.body;

    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        user_id,
        type,
        title,
        message,
        data: data || {},
      })
      .select()
      .single();

    if (error) {
      console.error("Create notification error:", error);
      return res.status(500).json({ error: "Failed to create notification" });
    }

    res.status(201).json(notification);
  } catch (error) {
    console.error("Create notification error:", error);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

module.exports = router;