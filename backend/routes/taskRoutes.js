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
  // Create task (manager only)
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

  // Get tasks for current user (exclude trashed & archived for board)
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

  // Get tasks created by manager (exclude trashed)
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

  // Update task (manager: all fields; user: status only)
  router.put("/:id", protect, async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: "Task not found" });

      const isManager = req.user.role === "manager";
      const isOwner = task.assignedTo.toString() === req.user._id.toString();

      if (!isManager && !isOwner) {
        return res.status(403).json({ message: "Not allowed" });
      }

      const prevStatus = task.status;

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
        if (req.body.status) task.status = req.body.status;
      }

      await task.save();

      let desc;
      if (prevStatus !== task.status) {
        desc = `Task "${task.title}" status changed from ${prevStatus} to ${task.status}`;
      } else if (req.body.isArchived === true) {
        desc = `Task "${task.title}" archived`;
      } else if (req.body.isTrashed === true) {
        desc = `Task "${task.title}" moved to trash`;
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

  // Hard delete (rare, but for cleanup)
  router.delete("/:id", protect, requireRole("manager"), async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: "Task not found" });

      await task.deleteOne();
      await logAndEmit(io, {
        action: "DELETED_TASK",
        description: `Task "${task.title}" permanently deleted`,
        task: task._id,
        performedBy: req.user._id
      });

      io.emit("task_deleted", { id: req.params.id });
      res.json({ message: "Task deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};
