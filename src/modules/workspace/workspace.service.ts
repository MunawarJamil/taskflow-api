import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import type { WorkspaceRole } from "@prisma/client";

// ─── Workspace CRUD ───────────────────────────────────────

export const createWorkspace = async (userId: string, name: string) => {
  // Use transaction — workspace + owner membership must both succeed or both fail
  const workspace = await prisma.$transaction(async (tx) => {
    const ws = await tx.workspace.create({
      data: {
        name,
        ownerId: userId,
      },
    });

    // Creator automatically becomes OWNER member
    await tx.workspaceMember.create({
      data: {
        workspaceId: ws.id,
        userId,
        role: "OWNER",
      },
    });

    return ws;
  });

  return workspace;
};

export const getUserWorkspaces = async (userId: string) => {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: {
        include: {
          _count: { select: { members: true, projects: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  // Shape the response — return workspace + user's role in it
  return memberships.map((m) => ({
    ...m.workspace,
    role: m.role,
  }));
};

export const getWorkspaceById = async (workspaceId: string, userId: string) => {
  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });

  if (!membership) {
    throw new ApiError(403, "You are not a member of this workspace");
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      _count: { select: { members: true, projects: true } },
    },
  });

  if (!workspace) throw new ApiError(404, "Workspace not found");

  return { ...workspace, role: membership.role };
};

export const updateWorkspace = async (workspaceId: string, name: string) => {
  const workspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: { name },
  });

  return workspace;
};

export const deleteWorkspace = async (workspaceId: string) => {
  await prisma.workspace.delete({
    where: { id: workspaceId },
  });
};

// ─── Member Operations ────────────────────────────────────

export const inviteMember = async (
  workspaceId: string,
  email: string,
  role: WorkspaceRole,
) => {
  // Find user by email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(404, "No user found with that email");

  // Check if already a member
  const existing = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: user.id } },
  });
  if (existing)
    throw new ApiError(409, "User is already a member of this workspace");

  const membership = await prisma.workspaceMember.create({
    data: { workspaceId, userId: user.id, role },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return membership;
};

export const getWorkspaceMembers = async (workspaceId: string) => {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: {
      user: { select: { id: true, name: true, email: true, createdAt: true } },
    },
    orderBy: { joinedAt: "asc" },
  });

  return members;
};

export const removeMember = async (
  workspaceId: string,
  userId: string,
  requesterId: string,
) => {
  // Cannot remove yourself if you are the owner
  const target = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });

  if (!target) throw new ApiError(404, "Member not found in this workspace");
  if (target.role === "OWNER")
    throw new ApiError(403, "Cannot remove the workspace owner");
  if (userId === requesterId)
    throw new ApiError(400, "You cannot remove yourself");

  await prisma.workspaceMember.delete({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
};
