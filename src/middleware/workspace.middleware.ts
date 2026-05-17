import type { Request, Response, NextFunction } from "express";

import { ApiError } from "../utils/ApiError.js";
import type { WorkspaceRole } from "@prisma/client";
import prisma from "../lib/prisma.js";

// ─── Augment Express Request ──────────────────────────────

declare global {
  namespace Express {
    interface Request {
      membership?: {
        id: string;
        role: WorkspaceRole;
        workspaceId: string;
        userId: string;
      };
    }
  }
}

// ─── RBAC Middleware Factory ──────────────────────────────

export const requireWorkspaceMember = (roles?: WorkspaceRole[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const rawId = req.params.id;
      const workspaceId = typeof rawId === "string" ? rawId : undefined;

      if (!workspaceId) {
        throw ApiError.badRequest("Invalid workspace id");
      }

      const userId = req.user!.sub;

      const membership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId } },
      });

      // Not a member at all
      if (!membership) {
        throw ApiError.forbidden("You are not a member of this workspace");
      }

      // Member exists but role not sufficient
      if (roles && !roles.includes(membership.role)) {
        throw ApiError.forbidden(
          "You do not have permission to perform this action",
        );
      }

      // Attach membership to request for downstream use
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
