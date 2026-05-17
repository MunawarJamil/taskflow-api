import { Router } from "express";
import * as taskController from "./task.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireProjectAccess } from "../../middleware/project.middleware.js";
import { requireTaskAccess } from "./task.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
  taskParamsSchema,
  listTasksSchema,
} from "./task.schema.js";

// ─── Project-scoped routes ────────────────────────────────
// Mounted at /api/v1/projects/:id/tasks

export const projectTaskRouter = Router({ mergeParams: true });

projectTaskRouter.post(
  "/",
  authenticate,
  validate(createTaskSchema),
  requireProjectAccess(),
  taskController.createTask
);

projectTaskRouter.get(
  "/",
  authenticate,
  validate(listTasksSchema),
  requireProjectAccess(),
  taskController.listTasks
);

// ─── Task-scoped routes ───────────────────────────────────
// Mounted at /api/v1/tasks

export const taskRouter = Router();

taskRouter.get(
  "/:id",
  authenticate,
  validate(taskParamsSchema),
  requireTaskAccess(),
  taskController.getTaskById
);

taskRouter.patch(
  "/:id",
  authenticate,
  validate(updateTaskSchema),
  requireTaskAccess(),
  taskController.updateTask
);

taskRouter.delete(
  "/:id",
  authenticate,
  validate(taskParamsSchema),
  requireTaskAccess(),
  taskController.deleteTask
);

taskRouter.patch(
  "/:id/assign",
  authenticate,
  validate(assignTaskSchema),
  requireTaskAccess(["OWNER", "ADMIN"]),
  taskController.assignTask
);