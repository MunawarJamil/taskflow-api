import { z } from "zod";
import { TaskPriority, TaskStatus } from "@prisma/client";

// ─── Task Schemas ─────────────────────────────────────────

export const createTaskSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(2, "Title must be at least 2 characters")
      .max(200, "Title must be at most 200 characters")
      .trim(),
    description: z
      .string()
      .max(2000, "Description must be at most 2000 characters")
      .trim()
      .optional(),
    status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
    priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
    assigneeId: z.string().cuid("Invalid assignee ID").optional(),
    dueDate: z.coerce.date().optional(),
  }),
  params: z.object({
    id: z.string().cuid("Invalid project ID"),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(2, "Title must be at least 2 characters")
      .max(200, "Title must be at most 200 characters")
      .trim()
      .optional(),
    description: z
      .string()
      .max(2000, "Description must be at most 2000 characters")
      .trim()
      .optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    dueDate: z.coerce.date().optional(),
  }),
  params: z.object({
    id: z.string().cuid("Invalid task ID"),
  }),
});

export const assignTaskSchema = z.object({
  body: z.object({
    assigneeId: z.string().cuid("Invalid assignee ID"),
  }),
  params: z.object({
    id: z.string().cuid("Invalid task ID"),
  }),
});

export const taskParamsSchema = z.object({
  params: z.object({
    id: z.string().cuid("Invalid task ID"),
  }),
});

export const projectTasksParamsSchema = z.object({
  params: z.object({
    id: z.string().cuid("Invalid project ID"),
  }),
});

// ─── Query Schema — filter, sort, paginate ────────────────

export const taskQuerySchema = z.object({
  query: z.object({
    // Filters
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    assigneeId: z.string().cuid("Invalid assignee ID").optional(),

    // Sorting
    sortBy: z
      .enum(["createdAt", "dueDate", "priority", "status", "title"])
      .default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),

    // Pagination
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

// ─── Combined schema for GET /projects/:id/tasks ──────────

export const listTasksSchema = z.object({
  params: z.object({
    id: z.string().cuid("Invalid project ID"),
  }),
  query: taskQuerySchema.shape.query,
});

// ─── Inferred Types ───────────────────────────────────────

export type CreateTaskBody = z.infer<typeof createTaskSchema>["body"];
export type UpdateTaskBody = z.infer<typeof updateTaskSchema>["body"];
export type AssignTaskBody = z.infer<typeof assignTaskSchema>["body"];
export type TaskQuery = z.infer<typeof taskQuerySchema>["query"];
export type TaskParams = z.infer<typeof taskParamsSchema>["params"];
export type ProjectTasksParams = z.infer<
  typeof projectTasksParamsSchema
>["params"];
