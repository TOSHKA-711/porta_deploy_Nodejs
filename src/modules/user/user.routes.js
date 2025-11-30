import { Router } from "express";
import * as uc from "./user.controller.js";
import { multerHost } from "../../services/multerHost.js";
import { allowedExtensions } from "../../utils/allowedExtensions.js";
import { errorHandler } from "../../utils/errorHandler.js";
import { isAuth } from "../../middlewares/Auth.js";
import { validationMiddleware } from "../../middlewares/validation.js";

const router = Router();

router.post(
  "/signUp",
  // multerHost(allowedExtensions.images).single("profile"),
  // validationMiddleware(uc.signUpSchema),
  errorHandler(uc.signUp)
);
router.post("/githubLogin", isAuth(), errorHandler(uc.gitHubAuth));
router.post(
  "/signUpAdmin",
  multerHost(allowedExtensions.images).single("profile"),
  errorHandler(uc.signUpAdmin)
);
router.post("/login", uc.login);
router.put("/update", isAuth(), errorHandler(uc.updateUser));
router.get("/confirmEmail/:token", errorHandler(uc.confirmEmail));
router.get("/profile/:userId", errorHandler(uc.getUserById));
router.get("/profile", isAuth(), errorHandler(uc.getUserByToken));
router.get("/getAllUsers", errorHandler(uc.getAllUsers));
router.get("/getUsersOverview", isAuth(), errorHandler(uc.getUsersOverview));

export default router;
