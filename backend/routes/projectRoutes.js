import express from "express";
import Project from "../models/Project.js";
import { protect } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();

/* ---------------------------------------------------------
   CREATE PROJECT  (Manager only)
--------------------------------------------------------- */
router.post("/", protect, requireRole("manager"), async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      isTrashed: false
    });

    return res.status(201).json(project);
  } catch (err) {
    console.error("CREATE PROJECT ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
});

/* ---------------------------------------------------------
   LIST PROJECTS  (Always return array)
--------------------------------------------------------- */
router.get("/", protect, async (req, res) => {
  try {
    const query =
      req.user.role === "manager"
        ? { isTrashed: false }
        : { isTrashed: false, status: { $ne: "completed" } };

    const projects = await Project.find(query)
      .populate("owner", "name email role")
      .sort({ createdAt: -1 });

    return res.json(Array.isArray(projects) ? projects : []);
  } catch (err) {
    console.error("LIST PROJECTS ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
});

/* ---------------------------------------------------------
   TRASHED PROJECTS (Manager only)
--------------------------------------------------------- */
router.get("/trash", protect, requireRole("manager"), async (req, res) => {
  try {
    const trashed = await Project.find({ isTrashed: true })
      .populate("owner", "name email role")
      .sort({ trashedAt: -1 });

    return res.json(Array.isArray(trashed) ? trashed : []);
  } catch (err) {
    console.error("TRASH LIST ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
});

/* ---------------------------------------------------------
   MOVE PROJECT TO TRASH
--------------------------------------------------------- */
router.put("/:id/trash", protect, requireRole("manager"), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.isTrashed = true;
    project.trashedAt = new Date();
    project.trashedBy = req.user._id;

    await project.save();
    return res.json(project);
  } catch (err) {
    console.error("TRASH ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
});

/* ---------------------------------------------------------
   RESTORE PROJECT
--------------------------------------------------------- */
router.put("/:id/restore", protect, requireRole("manager"), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.isTrashed = false;
    project.trashedAt = null;
    project.trashedBy = null;

    await project.save();
    return res.json(project);
  } catch (err) {
    console.error("RESTORE ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
});

/* ---------------------------------------------------------
   PERMANENT DELETE
--------------------------------------------------------- */
router.delete("/:id/permanent", protect, requireRole("manager"), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const { secret } = req.body;
    if (!secret || secret !== process.env.HARD_DELETE_SECRET) {
      return res.status(401).json({ message: "Invalid delete password" });
    }

    await project.deleteOne();
    return res.json({ message: "Project permanently deleted" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
});

export default router;
