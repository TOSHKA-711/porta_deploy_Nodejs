import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    bio: { type: String, default: "" },

    role: {
      type: String,
    },

    about: {
      title: { type: String, default: "About Me" },
      // content: { type: String, default: "" },
      projectsNumber: Number,
      clients: Number,
      yearsExp: Number,
      hashtags: [String],
      highLights: [String],
    },

    // theme: {
    //   primary: { type: String, default: "#B7A7FD" },
    //   background: { type: String, default: "#0B0E1A" },
    //   text: { type: String, default: "#ffffff" },
    // },

    theme: {
      type: String,
      enum: ["light", "dark", "default"],
      default: "default",
    },

    projects: [
      {
        title: { type: String, required: true },
        tech: { type: String },
        desc: { type: String },
        features: [{ type: String }],
        isComplete: { type: Boolean, default: false },
      },
    ],

    socialLinks: {
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      mobile: { type: String, default: "" },
      email: { type: String, default: "" },
    },

    // settings: {
    //   showExperience: { type: Boolean, default: true },
    //   showProjects: { type: Boolean, default: true },
    //   layout: { type: String, default: "default" },
    // },

    // Hero Section
    hero: {
      title: String, // "Hello! I Am Ali mostafa..."
      subtitle: String, // "A Designer who Judges a book by its cover..."
      description: String, // الفقرة الطويلة عن نفسك
      currentPosition: String, // "Currently, I'm a at Facebook"
    },

    // Work Experience
    workExperience: [
      {
        logo: String, // URL أو اسم اللوجو
        title: String, // "CIB on the Mobile"
        description: String, // "Take your client onboard seamlessly..."
        link: String, // LEARN MORE
      },
    ],

    // Skills
    skills: [String],
  },

  { timestamps: true }
);

export const portfolioModel = mongoose.model("portfolio", portfolioSchema);
