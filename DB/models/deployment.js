// models/Deployment.js
import mongoose from "mongoose";

const deploymentSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    vercelDeploymentId: { type: String },
    vercelUrl: { type: String },
    status: {
      type: String,
      enum: ["pending", "building", "ready", "error"],
      default: "pending",
    },
    logs: { type: String },
  },
  { timestamps: true }
);

export const deploymentModel = mongoose.model("deployment", deploymentSchema);
