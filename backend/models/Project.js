// backend/models/Project.js
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }, // usually a manager
    status: {
      type: String,
      enum: ["active", "on_hold", "completed"],
      default: "active"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
