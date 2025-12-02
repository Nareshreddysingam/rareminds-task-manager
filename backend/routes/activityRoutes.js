import express from "express";
import ActivityLog from "../models/ActivityLog.js";
import { protect } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();

// Managers can see all logs; users see only their own actions
router.get("/", protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query =
      req.user.role === "manager" ? {} : { performedBy: req.user._id };

    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .populate("performedBy", "name email role")
        .populate("task", "title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ActivityLog.countDocuments(query)
    ]);

    res.json({
      logs,
      page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Optional: managers can see logs for a specific user
router.get("/user/:userId", protect, requireRole("manager"), async (req, res) => {
  try {
    const logs = await ActivityLog.find({ performedBy: req.params.userId })
      .populate("performedBy", "name email role")
      .populate("task", "title")
      .sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
