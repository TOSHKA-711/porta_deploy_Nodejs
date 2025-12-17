import express from "express";
import { config } from "dotenv";
import path from "path";
import { initialApp } from "./src/utils/initialApp.js";
import cors from "cors";

const app = express();

// Load environment variables first
config({ path: path.resolve("./config/config.env") });

// CORS configuration - supports file uploads
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173", // Vite default
  "http://localhost:5174",
  "http://localhost:8080",
  process.env.FRONTEND_URL, // Allow custom frontend URL from env
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, mobile apps)
      if (!origin) return callback(null, true);

      // Allow exact matches
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow any localhost in development
      if (
        process.env.NODE_ENV !== "production" &&
        origin.startsWith("http://localhost")
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
  })
);


initialApp(app, express);
