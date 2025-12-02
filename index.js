import express from "express";
import { config } from "dotenv";
import path from "path";
import { initialApp } from "./src/utils/initialApp.js";
import cors from "cors";

const app = express();

// Increase JSON body size limit (for safety, although file uploads use multer)
app.use(express.json({ limit: "1000mb" }));

app.use(
  cors({
    origin: "*",
  })
);


config({ path: path.resolve("./config/config.env") });

initialApp(app, express);
