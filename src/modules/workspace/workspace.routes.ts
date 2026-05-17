import { Router } from "express";
import * as workspaceController from "./workspace.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  workspaceParamsSchema,
  inviteMemberSchema,
  removeMemberSchema,
} from "./workspace.schema.js";
import { requireWorkspaceMember } from "../../middleware/workspace.middleware.js";

const router: Router = Router();

// ─── Workspace Routes ─────────────────────────────────────

router.post(
  "/",
  authenticate,
  validate(createWorkspaceSchema),
  workspaceController.createWorkspace,
);

router.get("/", authenticate, workspaceController.getUserWorkspaces);

router.get(
  "/:id",
  authenticate,
  validate(workspaceParamsSchema),
  requireWorkspaceMember(),
  workspaceController.getWorkspaceById,
);

router.patch(
  "/:id",
  authenticate,
  validate(updateWorkspaceSchema),
  requireWorkspaceMember(["OWNER", "ADMIN"]),
  workspaceController.updateWorkspace,
);

router.delete(
  "/:id",
  authenticate,
  validate(workspaceParamsSchema),
  requireWorkspaceMember(["OWNER"]),
  workspaceController.deleteWorkspace,
);

// ─── Member Routes ────────────────────────────────────────

router.post(
  "/:id/members",
  authenticate,
  validate(inviteMemberSchema),
  requireWorkspaceMember(["OWNER", "ADMIN"]),
  workspaceController.inviteMember,
);

router.get(
  "/:id/members",
  authenticate,
  validate(workspaceParamsSchema),
  requireWorkspaceMember(),
  workspaceController.getWorkspaceMembers,
);

router.delete(
  "/:id/members/:userId",
  authenticate,
  validate(removeMemberSchema),
  requireWorkspaceMember(["OWNER", "ADMIN"]),
  workspaceController.removeMember,
);

export default router;
