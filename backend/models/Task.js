// backend/models/Task.js
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    status: {
      type: String,
      enum: ["todo", "in_progress", "done"],
      default: "todo"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: false
    },

    dueDate: Date,

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },

    // Archive support
    isArchived: {
      type: Boolean,
      default: false
    },

    // Trash support
    isTrashed: {
      type: Boolean,
      default: false
    },
    trashedAt: Date,
    trashedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
