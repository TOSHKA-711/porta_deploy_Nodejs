import express from "express";
import { config } from "dotenv";
import path from "path";
import { initialApp } from "./src/utils/initialApp.js";
import cors from "cors";

const app = express();
app.use(express.json());

app.use(cors({
  origin: "*", 
}));


config({ path: path.resolve("./config/config.env") });

initialApp(app, express);
