import { Router } from "express";
import * as pc from "./portfolio.controller.js";
// import { multerHost } from "../../services/multerHost.js";
import { errorHandler } from "../../utils/errorHandler.js";
import { isAuth } from "../../middlewares/Auth.js";

const router = Router();

router.get("/getPortfolio/:userId", errorHandler(pc.getPortfolioByUserId));
router.get("/getPortfolio", isAuth(),errorHandler(pc.getPortfolioByToken));


router.put(
  "/updatePortfolio",
  isAuth(),
  errorHandler(pc.updatePortfolioByUserId)
);

export default router;
