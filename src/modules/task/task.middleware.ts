import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import type { WorkspaceRole, Task } from "@prisma/client";

// ─── Augment Express Request ──────────────────────────────

declare global {
  namespace Express {
    interface Request {
      task?: Task;
    }
  }
}

// ─── Task Access Middleware ───────────────────────────────
// Resolution chain: taskId → Task → projectId → Project → workspaceId → WorkspaceMember
// Single DB query using nested select — one round trip, three hops

export const requireTaskAccess = (roles?: WorkspaceRole[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const rawId = req.params.id;
      const taskId = typeof rawId === "string" ? rawId : undefined;
      const userId = req.user!.sub;

      if (!taskId) {
        throw ApiError.badRequest("Invalid task ID");
      }

      // Single query — resolves task + project + workspace in one round trip
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          project: {
            select: {
              id: true,
              workspaceId: true,
            },
          },
        },
      });

      if (!task) {
        throw ApiError.notFound("Task not found");
      }

      // Verify workspace membership
      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: task.project.workspaceId,
            userId,
          },
        },
        select: { id: true, role: true, workspaceId: true, userId: true },
      });

      if (!membership) {
        throw ApiError.forbidden("You are not a member of this workspace");
      }

      // Check role if required
      if (roles && !roles.includes(membership.role)) {
        throw ApiError.forbidden(
          "You do not have permission to perform this action"
        );
      }

      // Attach to request for downstream use
      req.task = task;
      req.membership = {
        id: membership.id,
        role: membership.role,
        workspaceId: membership.workspaceId,
        userId: membership.userId,
      };

      next();
    } catch (err) {
      next(err);
    }
  };
};