import type { Request, Response } from "express";

import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendCreated, sendSuccess } from "../../utils/ApiResponse.js";

import * as workspaceService from "./workspace.service.js";

import type {
  CreateWorkspaceBody,
  UpdateWorkspaceBody,
  InviteMemberBody,
} from "./workspace.schema.js";

// ───────────────────────────────────────────────────────────
// Param shapes — validate middleware guarantees these are present
// ───────────────────────────────────────────────────────────

type WorkspaceParams = { id: string };
type MemberParams = { id: string; userId: string };

// ───────────────────────────────────────────────────────────
// Workspace Controllers
// ───────────────────────────────────────────────────────────

export const createWorkspace = asyncHandler(
  async (req: Request<unknown, unknown, CreateWorkspaceBody>, res: Response) => {
    const { name } = req.body;

    const workspace = await workspaceService.createWorkspace(
      req.user!.sub,
      name,
    );

    sendCreated(res, { workspace }, "Workspace created successfully");
  },
);

export const getUserWorkspaces = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaces = await workspaceService.getUserWorkspaces(req.user!.sub);

    sendSuccess(res, { workspaces }, "Workspaces fetched successfully");
  },
);

export const getWorkspaceById = asyncHandler(
  async (req: Request<WorkspaceParams>, res: Response) => {
    const workspace = await workspaceService.getWorkspaceById(
      req.params.id,
      req.user!.sub,
    );

    sendSuccess(res, { workspace }, "Workspace fetched successfully");
  },
);

export const updateWorkspace = asyncHandler(
  async (
    req: Request<WorkspaceParams, unknown, UpdateWorkspaceBody>,
    res: Response,
  ) => {
    const { name } = req.body;

    const workspace = await workspaceService.updateWorkspace(
      req.params.id,
      name,
    );

    sendSuccess(res, { workspace }, "Workspace updated successfully");
  },
);

export const deleteWorkspace = asyncHandler(
  async (req: Request<WorkspaceParams>, res: Response) => {
    await workspaceService.deleteWorkspace(req.params.id);

    sendSuccess(res, null, "Workspace deleted successfully");
  },
);

// ───────────────────────────────────────────────────────────
// Member Controllers
// ───────────────────────────────────────────────────────────

export const inviteMember = asyncHandler(
  async (
    req: Request<WorkspaceParams, unknown, InviteMemberBody>,
    res: Response,
  ) => {
    const { email, role } = req.body;

    const membership = await workspaceService.inviteMember(
      req.params.id,
      email,
      role,
    );

    sendCreated(res, { membership }, "Member invited successfully");
  },
);

export const getWorkspaceMembers = asyncHandler(
  async (req: Request<WorkspaceParams>, res: Response) => {
    const members = await workspaceService.getWorkspaceMembers(req.params.id);

    sendSuccess(res, { members }, "Members fetched successfully");
  },
);

export const removeMember = asyncHandler(
  async (req: Request<MemberParams>, res: Response) => {
    await workspaceService.removeMember(
      req.params.id,
      req.params.userId,
      req.user!.sub,
    );

    sendSuccess(res, null, "Member removed successfully");
  },
);
