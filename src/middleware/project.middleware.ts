import type { Request, Response, NextFunction } from "express";

import type { WorkspaceRole } from "@prisma/client";
import type { Project } from "@prisma/client";
import { ApiError } from "../utils/ApiError.js";
import prisma from "../lib/prisma.js";

// ─── Augment Express Request ──────────────────────────────

declare global {
  namespace Express {
    interface Request {
      project?: Project;
    }
  }
}

// ─── Project Access Middleware ────────────────────────────

export const requireProjectAccess = (roles?: WorkspaceRole[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const rawId = req.params.id;
      const projectId = typeof rawId === "string" ? rawId : undefined;
      const userId = req.user!.sub;
      if (!projectId) {
        throw ApiError.badRequest("Invalid project ID");
      }

      // Step 1 — fetch project to get its workspaceId

      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw ApiError.notFound("Project not found");
      }

      // Step 2 — verify user is a member of the project's workspace
      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: project.workspaceId, // comes from Prisma — already string ✓
            userId, // narrowed above from req.user!.sub ✓
          },
        },
      });

      if (!membership) {
        throw ApiError.forbidden("You are not a member of this workspace");
      }

      // Step 3 — check role if required
      if (roles && !roles.includes(membership.role)) {
        throw ApiError.forbidden(
          "You do not have permission to perform this action",
        );
      }

      // Step 4 — attach both for downstream use
      req.project = project;
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
