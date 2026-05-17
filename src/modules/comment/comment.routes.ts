import { Router } from "express";
import * as commentController from "./comment.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireTaskAccess } from "../task/task.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  createCommentSchema,
  commentParamsSchema,
  taskCommentsParamsSchema,
} from "./comment.schema.js";

// ─── Task-scoped routes ───────────────────────────────────
// Mounted at /api/v1/tasks/:id/comments

export const taskCommentRouter = Router({ mergeParams: true });

taskCommentRouter.post(
  "/",
  authenticate,
  validate(createCommentSchema),
  requireTaskAccess(),
  commentController.createComment
);

taskCommentRouter.get(
  "/",
  authenticate,
  validate(taskCommentsParamsSchema),
  requireTaskAccess(),
  commentController.getTaskComments
);

// ─── Comment-scoped routes ────────────────────────────────
// Mounted at /api/v1/comments

export const commentRouter = Router();

commentRouter.delete(
  "/:id",
  authenticate,
  validate(commentParamsSchema),
  commentController.deleteComment
);