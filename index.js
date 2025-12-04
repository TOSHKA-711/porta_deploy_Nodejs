import express from "express";
import { config } from "dotenv";
import path from "path";
import { initialApp } from "./src/utils/initialApp.js";
// import cors from "cors";

const app = express();

// Basic CORS
// CORS كامل، يتعامل مع preflight
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

config({ path: path.resolve("./config/config.env") });

initialApp(app, express);
