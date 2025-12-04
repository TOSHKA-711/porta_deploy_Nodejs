import { Router } from "express";
import express from "express";
import * as pc from "./project.controller.js";
import { multerHost } from "../../services/multerHost.js";
import { errorHandler } from "../../utils/errorHandler.js";
import { isAuth } from "../../middlewares/Auth.js";

const router = Router();

// ----------------- github apis

router.get(
  "/getGithubRepos",
  isAuth(),
  express.json({ limit: "1000mb" }),
  errorHandler(pc.getGithubRepos)
);

router.post(
  "/uploadProject",
  isAuth(),
  express.json({ limit: "1000mb" }),
  multerHost().single("projectZip"),
  errorHandler(pc.uploadProject)
);

router.delete(
  "/deleteGithubRepo",
  isAuth(),
  express.json({ limit: "1000mb" }),
  errorHandler(pc.deleteGithubRepo)
);

// ----------------- vercel apis
router.get(
  "/getVercelDeployments",
  isAuth(),
  express.json({ limit: "1000mb" }),
  errorHandler(pc.getVercelDeployments)
);

router.post(
  "/importProjectToVercel",
  isAuth(),
  express.json({ limit: "1000mb" }),
  errorHandler(pc.importToVercel)
);
router.post(
  "/deployProject",
  isAuth(),
  express.json({ limit: "1000mb" }),
  errorHandler(pc.deployToVercel)
);

router.delete(
  "/cancelDeployToVercel/:projectId",
  isAuth(),
  express.json({ limit: "1000mb" }),
  errorHandler(pc.cancelDeployToVercel)
);

export default router;

//-------------------- management Apis

router.post(
  "/addProject",
  isAuth(),
  express.json({ limit: "1000mb" }),
  errorHandler(pc.addProject)
);
router.delete(
  "/deleteProject/:projectId",
  isAuth(),
  express.json({ limit: "1000mb" }),
  errorHandler(pc.deleteProject)
);
router.put(
  "/updateProject/:projectId",
  isAuth(),
  multerHost().single("image"),
  express.json({ limit: "1000mb" }),
  errorHandler(pc.updateProject)
);
router.get(
  "/getAllProjects/:userId",
  express.json({ limit: "1000mb" }),
  errorHandler(pc.getAllProjects)
);
router.get(
  "/getAllProjects",
  isAuth(),
  express.json({ limit: "1000mb" }),
  errorHandler(pc.getAllProjectsByToken)
);
router.get(
  "/getProject/:projectId",
  express.json({ limit: "1000mb" }),
  errorHandler(pc.getProjectById)
);
