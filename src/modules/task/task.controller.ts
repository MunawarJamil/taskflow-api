import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendCreated, sendSuccess } from "../../utils/ApiResponse.js";
import * as taskService from "./task.service.js";
import type {
  CreateTaskBody,
  UpdateTaskBody,
  AssignTaskBody,
  TaskQuery,
} from "./task.schema.js";

// ─── Param Types ──────────────────────────────────────────

type ProjectParams = { id: string };
type TaskParams = { id: string };

// ─── Task Controllers ─────────────────────────────────────

export const createTask = asyncHandler(
  async (
    req: Request<ProjectParams, unknown, CreateTaskBody>,
    res: Response
  ) => {
    const task = await taskService.createTask(
      req.params.id,
      req.user!.sub,
      {
        title: req.body.title,
        status: req.body.status,
        priority: req.body.priority,
        ...(req.body.description !== undefined && {
          description: req.body.description,
        }),
        ...(req.body.assigneeId !== undefined && {
          assigneeId: req.body.assigneeId,
        }),
        ...(req.body.dueDate !== undefined && {
          dueDate: req.body.dueDate,
        }),
      }
    );

    sendCreated(res, task, "Task created successfully");
  }
);
export const listTasks = asyncHandler(
  async (req: Request<ProjectParams>, res: Response) => {
    const query = req.query as unknown as TaskQuery;
    const result = await taskService.listTasks(req.params.id, query);

    sendSuccess(res, result.tasks, "Tasks fetched successfully", 200, result.meta);
  }
);

export const getTaskById = asyncHandler(
  async (req: Request<TaskParams>, res: Response) => {
    // req.task is attached by requireTaskAccess middleware
    // but we call service for the full taskSelect shape with all relations
    const task = await taskService.getTaskById(req.params.id);

    sendSuccess(res, task, "Task fetched successfully");
  }
);

export const updateTask = asyncHandler(
  async (
    req: Request<TaskParams, unknown, UpdateTaskBody>,
    res: Response
  ) => {
    const task = await taskService.updateTask(req.params.id, {
      ...(req.body.title !== undefined && { title: req.body.title }),
      ...(req.body.description !== undefined && {
        description: req.body.description,
      }),
      ...(req.body.status !== undefined && { status: req.body.status }),
      ...(req.body.priority !== undefined && { priority: req.body.priority }),
      ...(req.body.dueDate !== undefined && { dueDate: req.body.dueDate }),
    });

    sendSuccess(res, task, "Task updated successfully");
  }
);

export const deleteTask = asyncHandler(
  async (req: Request<TaskParams>, res: Response) => {
    await taskService.deleteTask(req.params.id, req.user!.sub);

    sendSuccess(res, null, "Task deleted successfully");
  }
);

export const assignTask = asyncHandler(
  async (
    req: Request<TaskParams, unknown, AssignTaskBody>,
    res: Response
  ) => {
    // workspaceId is available from req.membership attached by requireTaskAccess
    const task = await taskService.assignTask(
      req.params.id,
      req.body.assigneeId,
      req.membership!.workspaceId
    );

    sendSuccess(res, task, "Task assigned successfully");
  }
);