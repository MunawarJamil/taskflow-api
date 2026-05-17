import express, { type Application } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { notFound } from "./middleware/notFound.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { ok } from "./utils/ApiResponse.js";
import authRoutes from "./modules/auth/auth.routes.js";
import workspaceRoutes from "./modules/workspace/workspace.routes.js";
import {
  projectRouter,
  workspaceProjectRouter,
} from "./modules/project/project.routes.js";
import { projectTaskRouter, taskRouter } from "./modules/task/task.routes.js";
export const createApp = (): Application => {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      //   origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(","),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(requestLogger);

  app.get("/", (_req, res) => {
    res.json(
      ok({
        env: env.NODE_ENV,
      }),
    );
  });

  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/workspaces", workspaceRoutes);

  app.use("/api/v1/workspaces/:id/projects", workspaceProjectRouter);
  app.use("/api/v1/projects", projectRouter);

  app.use("/api/v1/projects/:id/tasks", projectTaskRouter);
  app.use("/api/v1/tasks", taskRouter);

  app.use(notFound);
  app.use(errorMiddleware);
  return app;
};
