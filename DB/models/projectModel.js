import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String },
    githubUrl: { type: String, required: true },
    vercelUrl: { type: String },
    image: {
      public_id: { type: String },
      secure_url: { type: String },
    },
    isDeployed: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isProfiled: { type: Boolean, default: false },
    language: String,
    features: [String],
    isComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const projectModel = mongoose.model("project", projectSchema);
