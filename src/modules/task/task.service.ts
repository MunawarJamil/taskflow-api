import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import type { TaskPriority, TaskStatus, Prisma } from "@prisma/client";
import type { TaskQuery } from "./task.schema.js";

// ─── Shared select — used on every task query ─────────────
// Defined once, reused everywhere. Change here = changes everywhere.
// Never select passwordHash or sensitive fields via accidental spread.

const taskSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  dueDate: true,
  createdAt: true,
  assigneeId: true,
  createdById: true,
  project: {
    select: { id: true, name: true, workspaceId: true },
  },
  assignee: {
    select: { id: true, name: true, email: true },
  },
  createdBy: {
    select: { id: true, name: true, email: true },
  },
  _count: {
    select: { comments: true },
  },
} satisfies Prisma.TaskSelect;

// ─── Priority order map for in-memory sort fallback ──────
// Prisma cannot natively sort by enum semantic order,
// so we map priority to a numeric weight for correct ordering.

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  URGENT: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

// ─── Build Prisma orderBy from query params ───────────────

const buildOrderBy = (
  sortBy: TaskQuery["sortBy"],
  order: TaskQuery["order"],
): Prisma.TaskOrderByWithRelationInput[] => {
  // Priority needs special handling — DB sorts alphabetically,
  // not by severity. We handle it post-query (see listTasks).
  if (sortBy === "priority") {
    // Fall back to createdAt for DB query; sort in memory after fetch
    return [{ createdAt: order }];
  }

  return [{ [sortBy]: order }];
};

// ─── Build Prisma where from query filters ────────────────

const buildWhere = (
  projectId: string,
  filters: Pick<TaskQuery, "status" | "priority" | "assigneeId">,
): Prisma.TaskWhereInput => {
  return {
    projectId,
    ...(filters.status !== undefined && { status: filters.status }),
    ...(filters.priority !== undefined && { priority: filters.priority }),
    ...(filters.assigneeId !== undefined && {
      assigneeId: filters.assigneeId,
    }),
  };
};

// ─── Task CRUD ────────────────────────────────────────────

export const createTask = async (
  projectId: string,
  createdById: string,
  data: {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    assigneeId?: string;
    dueDate?: Date;
  },
) => {
  // If assigneeId provided, verify they are a member of the workspace
  if (data.assigneeId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { workspaceId: true },
    });

    if (!project) throw ApiError.notFound("Project not found");

    const isMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: project.workspaceId,
          userId: data.assigneeId,
        },
      },
    });

    if (!isMember) {
      throw ApiError.badRequest("Assignee is not a member of this workspace");
    }
  }

  const task = await prisma.task.create({
    data: {
      projectId,
      createdById,
      title: data.title,
      status: data.status,
      priority: data.priority,
      ...(data.description !== undefined && { description: data.description }),
      ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
      ...(data.dueDate !== undefined && { dueDate: data.dueDate }),
    },
    select: taskSelect,
  });

  return task;
};

export const listTasks = async (projectId: string, query: TaskQuery) => {
  const { status, priority, assigneeId, sortBy, order, page, limit } = query;

  const where = buildWhere(projectId, { status, priority, assigneeId });
  const orderBy = buildOrderBy(sortBy, order);
  const skip = (page - 1) * limit;

  // Run count and data fetch in parallel — single round trip to DB
  const [total, tasks] = await prisma.$transaction([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      select: taskSelect,
      orderBy,
      skip,
      take: limit,
    }),
  ]);

  // Post-query sort for priority — correct semantic order (URGENT > HIGH > MEDIUM > LOW)
  const sorted =
    sortBy === "priority"
      ? tasks.sort((a, b) => {
          const diff =
            PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
          // Stable secondary sort by createdAt when priorities are equal
          return diff !== 0
            ? order === "asc"
              ? -diff
              : diff
            : b.createdAt.getTime() - a.createdAt.getTime();
        })
      : tasks;

  return {
    tasks: sorted,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

export const getTaskById = async (taskId: string) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: taskSelect,
  });

  if (!task) throw ApiError.notFound("Task not found");

  return task;
};

export const updateTask = async (
  taskId: string,
  data: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: Date;
  },
) => {
  const existing = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true },
  });

  if (!existing) throw ApiError.notFound("Task not found");

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.dueDate !== undefined && { dueDate: data.dueDate }),
    },
    select: taskSelect,
  });

  return task;
};

export const deleteTask = async (taskId: string, userId: string) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      createdById: true,
      project: { select: { workspaceId: true } },
    },
  });

  if (!task) throw ApiError.notFound("Task not found");

  // Verify requester is creator OR OWNER/ADMIN — checked via membership
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: task.project.workspaceId,
        userId,
      },
    },
    select: { role: true },
  });

  const isPrivileged =
    membership?.role === "OWNER" || membership?.role === "ADMIN";
  const isCreator = task.createdById === userId;

  if (!isPrivileged && !isCreator) {
    throw ApiError.forbidden(
      "Only the task creator, ADMIN, or OWNER can delete this task",
    );
  }

  await prisma.task.delete({ where: { id: taskId } });
};

export const assignTask = async (
  taskId: string,
  assigneeId: string,
  workspaceId: string,
) => {
  // Verify assignee is a workspace member before assigning
  const isMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId: assigneeId },
    },
  });

  if (!isMember) {
    throw ApiError.badRequest("Assignee is not a member of this workspace");
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { assigneeId },
    select: taskSelect,
  });

  return task;
};
