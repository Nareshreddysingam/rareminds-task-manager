// backend/models/ActivityLog.js
import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // CREATED_TASK, UPDATED_TASK, etc.
    description: String,

    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },

    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Trash system
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

export default mongoose.model("ActivityLog", activityLogSchema);
