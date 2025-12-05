// backend/routes/activityRoutes.js
import express from "express";
import ActivityLog from "../models/ActivityLog.js";
import { protect } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();

// ============================
// NORMAL ACTIVITY LIST
// ============================
router.get("/", protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const baseQuery = { isTrashed: false };

    const query =
      req.user.role === "manager"
        ? baseQuery
        : { ...baseQuery, performedBy: req.user._id };

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

// ============================
// LOGS BY USER (manager only)
// ============================
router.get("/user/:userId", protect, requireRole("manager"), async (req, res) => {
  try {
    const logs = await ActivityLog.find({
      performedBy: req.params.userId,
      isTrashed: false
    })
      .populate("performedBy", "name email role")
      .populate("task", "title")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================
// TRASHED LOGS (Trash tab)
// ============================
router.get("/trash", protect, requireRole("manager"), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { isTrashed: true };

    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .populate("performedBy", "name email role")
        .populate("task", "title")
        .sort({ trashedAt: -1 })
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

// ============================
// MOVE LOG TO TRASH (manager)
// ============================
router.put("/:id/trash", protect, requireRole("manager"), async (req, res) => {
  try {
    const log = await ActivityLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: "Log not found" });

    log.isTrashed = true;
    log.trashedAt = new Date();
    log.trashedBy = req.user._id;

    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================
// RESTORE LOG (manager)
// ============================
router.put("/:id/restore", protect, requireRole("manager"), async (req, res) => {
  try {
    const log = await ActivityLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: "Log not found" });

    log.isTrashed = false;
    log.trashedAt = null;
    log.trashedBy = null;

    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================
// PERMANENT DELETE LOG
// ============================
router.delete("/:id/permanent", protect, requireRole("manager"), async (req, res) => {
  try {
    const log = await ActivityLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: "Log not found" });

    const { secret } = req.body;
    if (!secret || secret !== process.env.HARD_DELETE_SECRET) {
      return res.status(401).json({ message: "Invalid delete password" });
    }

    await log.deleteOne();
    res.json({ message: "Log permanently deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
