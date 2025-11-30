import * as indexRouter from "../../src/modules/index.routes.js";
import { connectDB } from "../../DB/connection.js";
import { globalError } from "../../src/utils/errorHandler.js";

export const initialApp = (app, express) => {
  connectDB();
  const port = process.env.PORT;

  // Routes
  app.use("/user", indexRouter.userRoutes);
  app.use("/project", indexRouter.projectRoutes);
  app.use("/portfolio", indexRouter.portfolioRoutes);

  // Global Error Handler
  app.use(globalError);

  // Run Server
  app.listen(port, () => console.log(`app start listening on port ${port}!`));
};
