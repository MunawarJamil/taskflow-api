import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import type { Prisma } from "@prisma/client";

// ─── Shared select ────────────────────────────────────────

const commentSelect = {
  id: true,
  content: true,
  createdAt: true,
  user: {
    select: { id: true, name: true, email: true },
  },
  task: {
    select: { id: true, title: true },
  },
} satisfies Prisma.CommentSelect;

// ─── Comment CRUD ─────────────────────────────────────────

export const createComment = async (
  taskId: string,
  userId: string,
  content: string
) => {
  // Verify task exists
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true },
  });

  if (!task) throw ApiError.notFound("Task not found");

  const comment = await prisma.comment.create({
    data: {
      taskId,
      userId,
      content,
    },
    select: commentSelect,
  });

  return comment;
};

export const getTaskComments = async (taskId: string) => {
  // Verify task exists
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true },
  });

  if (!task) throw ApiError.notFound("Task not found");

  const comments = await prisma.comment.findMany({
    where: { taskId },
    select: commentSelect,
    orderBy: { createdAt: "asc" }, // oldest first — natural conversation order
  });

  return comments;
};

export const deleteComment = async (commentId: string, userId: string) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true, userId: true },
  });

  if (!comment) throw ApiError.notFound("Comment not found");

  // Only the author can delete their own comment
  if (comment.userId !== userId) {
    throw ApiError.forbidden("You can only delete your own comments");
  }

  await prisma.comment.delete({ where: { id: commentId } });
};