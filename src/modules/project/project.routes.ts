import { Router } from "express";
import * as projectController from "./project.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  createProjectSchema,
  updateProjectSchema,
  projectParamsSchema,
  workspaceProjectsParamsSchema,
} from "./project.schema.js";
import { authenticate  } from "../../middleware/auth.middleware.js";
import { requireWorkspaceMember } from "../../middleware/workspace.middleware.js";
import { requireProjectAccess } from "../../middleware/project.middleware.js";

// ─── Workspace-scoped routes ──────────────────────────────
// Mounted at /api/v1/workspaces

export const workspaceProjectRouter = Router({ mergeParams: true });

workspaceProjectRouter.post(
  "/",
  authenticate,
  validate(createProjectSchema),
  requireWorkspaceMember(["OWNER", "ADMIN"]),
  projectController.createProject
);

workspaceProjectRouter.get(
  "/",
  authenticate,
  validate(workspaceProjectsParamsSchema),
  requireWorkspaceMember(),
  projectController.getWorkspaceProjects
);

// ─── Project-scoped routes ────────────────────────────────
// Mounted at /api/v1/projects

export const projectRouter = Router();

projectRouter.get(
  "/:id",
  authenticate,
  validate(projectParamsSchema),
  requireProjectAccess(),
  projectController.getProjectById
);

projectRouter.patch(
  "/:id",
  authenticate,
  validate(updateProjectSchema),
  requireProjectAccess(["OWNER", "ADMIN"]),
  projectController.updateProject
);

projectRouter.delete(
  "/:id",
  authenticate,
  validate(projectParamsSchema),
  requireProjectAccess(["OWNER", "ADMIN"]),
  projectController.deleteProject
);