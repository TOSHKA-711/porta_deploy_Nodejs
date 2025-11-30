import { Router } from "express";
import * as pc from "./project.controller.js";
import { multerHost } from "../../services/multerHost.js";
import { errorHandler } from "../../utils/errorHandler.js";
import { isAuth } from "../../middlewares/Auth.js";

const router = Router();

// ----------------- github apis

router.get("/getGithubRepos", isAuth(), errorHandler(pc.getGithubRepos));

router.post(
  "/uploadProject",
  // multerHost().any("files"),
  isAuth(),
  errorHandler(pc.uploadProject)
);

router.delete("/deleteGithubRepo", isAuth(), errorHandler(pc.deleteGithubRepo));

// ----------------- vercel apis
router.get(
  "/getVercelDeployments",
  isAuth(),
  errorHandler(pc.getVercelDeployments)
);

router.post(
  "/importProjectToVercel",
  isAuth(),
  errorHandler(pc.importToVercel)
);
router.post("/deployProject", isAuth(), errorHandler(pc.deployToVercel));

router.delete(
  "/cancelDeployToVercel/:projectId",
  isAuth(),
  errorHandler(pc.cancelDeployToVercel)
);

export default router;

//-------------------- management Apis

router.post("/addProject", isAuth(), errorHandler(pc.addProject));
router.delete(
  "/deleteProject/:projectId",
  isAuth(),
  errorHandler(pc.deleteProject)
);
router.put(
  "/updateProject/:projectId",
  isAuth(),
  multerHost().single("image"),
  errorHandler(pc.updateProject)
);
router.get("/getAllProjects/:userId", errorHandler(pc.getAllProjects));
router.get("/getAllProjects", isAuth(), errorHandler(pc.getAllProjectsByToken));
router.get("/getProject/:projectId", errorHandler(pc.getProjectById));
