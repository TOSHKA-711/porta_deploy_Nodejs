import * as indexRouter from "../../src/modules/index.routes.js";
import { connectDB } from "../../DB/connection.js";
import { globalError } from "../../src/utils/errorHandler.js";

export const initialApp = (app, express) => {
  connectDB();
  app.use(express.json());
  const port = process.env.PORT;

  // Multer route: project upload
  app.use("/project", indexRouter.projectRoutes); // Multer يمسك الملفات أولاً

  // فقط للراوتات العادية اللي محتاجة JSON body
  app.use("/user", indexRouter.userRoutes);
  app.use("/portfolio", indexRouter.portfolioRoutes);

  // Global Error Handler
  app.use(globalError);

  // Run Server
  app.listen(port, () => console.log(`app start listening on port ${port}!`));
};
