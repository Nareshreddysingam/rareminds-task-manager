// backend/routes/taskRoutes.js
import express from "express";
import Task from "../models/Task.js";
import ActivityLog from "../models/ActivityLog.js";
import { protect } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();

const logAndEmit = async (io, { action, description, task, performedBy }) => {
  const log = await ActivityLog.create({ action, description, task, performedBy });
  io.emit("activity_log", log);
};

export default (io) => {
  // ============================
  // CREATE TASK (Manager only)
  // ============================
  router.post("/", protect, requireRole("manager"), async (req, res) => {
    try {
      const {
        title,
        description,
        assignedTo,
        status,
        dueDate,
        priority,
        project
      } = req.body;

      const task = await Task.create({
        title,
        description,
        assignedTo,
        status: status || "todo",
        dueDate,
        priority,
        project: project || null,
        createdBy: req.user._id
      });

      await logAndEmit(io, {
        action: "CREATED_TASK",
        description: `Task "${task.title}" created`,
        task: task._id,
        performedBy: req.user._id
      });

      io.emit("task_updated", task);
      res.status(201).json(task);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // ============================
  // GET MY TASKS (skip trash)
  // ============================
  router.get("/my", protect, async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const query = {
        isTrashed: false,
        isArchived: false,
        $or: [{ assignedTo: req.user._id }, { createdBy: req.user._id }]
      };

      const [tasks, total] = await Promise.all([
        Task.find(query)
          .populate("createdBy", "name email role")
          .populate("assignedTo", "name email role")
          .populate("project", "name")
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        Task.countDocuments(query)
      ]);

      res.json({
        tasks,
        page,
        totalPages: Math.ceil(total / limit),
        total
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // ============================
  // GET TASKS CREATED BY MANAGER
  // ============================
  router.get("/created", protect, requireRole("manager"), async (req, res) => {
    try {
      const tasks = await Task.find({
        createdBy: req.user._id,
        isTrashed: false
      })
        .populate("assignedTo", "name email role")
        .populate("project", "name")
        .sort({ createdAt: -1 });

      res.json(tasks);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // ============================
  // GET TRASHED TASKS (Trash tab)
  // ============================
  router.get("/trash", protect, async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const baseQuery = { isTrashed: true };

      const query =
        req.user.role === "manager"
          ? baseQuery
          : {
              ...baseQuery,
              $or: [{ assignedTo: req.user._id }, { createdBy: req.user._id }]
            };

      const [tasks, total] = await Promise.all([
        Task.find(query)
          .populate("createdBy assignedTo project", "name email role")
          .sort({ trashedAt: -1 })
          .skip(skip)
          .limit(limit),
        Task.countDocuments(query)
      ]);

      res.json({
        tasks,
        page,
        totalPages: Math.ceil(total / limit),
        total
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // ============================
  // MOVE TASK TO TRASH
  // ============================
  router.put("/:id/trash", protect, async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: "Task not found" });

      const isManager = req.user.role === "manager";
      const isOwner =
        task.assignedTo.toString() === req.user._id.toString() ||
        task.createdBy.toString() === req.user._id.toString();

      if (!isManager && !isOwner)
        return res.status(403).json({ message: "Not allowed" });

      task.isTrashed = true;
      task.isArchived = false;
      task.trashedAt = new Date();
      task.trashedBy = req.user._id;

      await task.save();

      await logAndEmit(io, {
        action: "TRASHED_TASK",
        description: `Task "${task.title}" moved to trash`,
        task: task._id,
        performedBy: req.user._id
      });

      io.emit("task_updated", task);
      res.json(task);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // ============================
  // RESTORE TASK FROM TRASH
  // ============================
  router.put("/:id/restore", protect, async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: "Task not found" });

      const isManager = req.user.role === "manager";
      const isOwner =
        task.assignedTo.toString() === req.user._id.toString() ||
        task.createdBy.toString() === req.user._id.toString();

      if (!isManager && !isOwner)
        return res.status(403).json({ message: "Not allowed" });

      task.isTrashed = false;
      task.trashedAt = null;
      task.trashedBy = null;

      await task.save();

      await logAndEmit(io, {
        action: "RESTORED_TASK",
        description: `Task "${task.title}" restored from trash`,
        task: task._id,
        performedBy: req.user._id
      });

      io.emit("task_updated", task);
      res.json(task);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // ============================
  // UPDATE TASK (board, archive)
  // ============================
  router.put("/:id", protect, async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: "Task not found" });

      const isManager = req.user.role === "manager";
      const isOwner = task.assignedTo.toString() === req.user._id.toString();

      if (!isManager && !isOwner)
        return res.status(403).json({ message: "Not allowed" });

      const prevStatus = task.status;
      const prevIsTrashed = task.isTrashed;

      if (isManager) {
        const fields = [
          "title",
          "description",
          "status",
          "assignedTo",
          "dueDate",
          "priority",
          "project",
          "isArchived",
          "isTrashed"
        ];
        fields.forEach((field) => {
          if (req.body[field] !== undefined) {
            task[field] = req.body[field];
          }
        });
      } else if (isOwner) {
        // normal user can only move status
        if (req.body.status) task.status = req.body.status;
      }

      // if manager set isTrashed true via this route, keep metadata consistent
      if (!prevIsTrashed && task.isTrashed) {
        task.trashedAt = new Date();
        task.trashedBy = req.user._id;
      }

      await task.save();

      let desc;
      if (prevStatus !== task.status) {
        desc = `Task "${task.title}" status changed from ${prevStatus} to ${task.status}`;
      } else if (!prevIsTrashed && task.isTrashed) {
        desc = `Task "${task.title}" moved to trash`;
      } else if (req.body.isArchived === true) {
        desc = `Task "${task.title}" archived`;
      } else {
        desc = `Task "${task.title}" updated`;
      }

      await logAndEmit(io, {
        action: "UPDATED_TASK",
        description: desc,
        task: task._id,
        performedBy: req.user._id
      });

      io.emit("task_updated", task);
      res.json(task);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // ============================
  // PERMANENT DELETE TASK
  // ============================
  router.delete("/:id/permanent", protect, async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: "Task not found" });

      const isManager = req.user.role === "manager";
      const isOwner =
        task.assignedTo.toString() === req.user._id.toString() ||
        task.createdBy.toString() === req.user._id.toString();

      if (!isManager && !isOwner)
        return res.status(403).json({ message: "Not allowed" });

      // Manager must provide password; user doesn’t
      if (isManager) {
        const { secret } = req.body;
        if (!secret || secret !== process.env.HARD_DELETE_SECRET) {
          return res.status(401).json({ message: "Invalid delete password" });
        }
      }

      await logAndEmit(io, {
        action: "DELETED_TASK",
        description: `Task "${task.title}" permanently deleted`,
        task: task._id,
        performedBy: req.user._id
      });

      await task.deleteOne();
      io.emit("task_deleted", { id: req.params.id });

      res.json({ message: "Task permanently deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};
