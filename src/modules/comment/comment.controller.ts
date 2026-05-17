import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendCreated, sendSuccess } from "../../utils/ApiResponse.js";
import * as commentService from "./comment.service.js";
import type { CreateCommentBody } from "./comment.schema.js";

// ─── Param Types ──────────────────────────────────────────

type TaskParams = { id: string };
type CommentParams = { id: string };

// ─── Comment Controllers ──────────────────────────────────

export const createComment = asyncHandler(
  async (
    req: Request<TaskParams, unknown, CreateCommentBody>,
    res: Response
  ) => {
    const comment = await commentService.createComment(
      req.params.id,
      req.user!.sub,
      req.body.content
    );

    sendCreated(res, comment, "Comment created successfully");
  }
);

export const getTaskComments = asyncHandler(
  async (req: Request<TaskParams>, res: Response) => {
    const comments = await commentService.getTaskComments(req.params.id);

    sendSuccess(res, comments, "Comments fetched successfully");
  }
);

export const deleteComment = asyncHandler(
  async (req: Request<CommentParams>, res: Response) => {
    await commentService.deleteComment(req.params.id, req.user!.sub);

    sendSuccess(res, null, "Comment deleted successfully");
  }
);