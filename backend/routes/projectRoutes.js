// backend/routes/projectRoutes.js
import express from "express";
import Project from "../models/Project.js";
import { protect } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();

// Create project (manager only)
router.post("/", protect, requireRole("manager"), async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await Project.create({
      name,
      description,
      owner: req.user._id
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List projects
router.get("/", protect, async (req, res) => {
  try {
    const query =
      req.user.role === "manager" ? {} : { status: { $ne: "completed" } };
    const projects = await Project.find(query)
      .populate("owner", "name email role")
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
