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
    isArchived: {
      type: Boolean,
      default: false
    },
    isTrashed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
