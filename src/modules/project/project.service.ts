import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";

// ─── Project CRUD ─────────────────────────────────────────

export const createProject = async (
  workspaceId: string,
  userId: string,
  name: string,
  description?: string
) => {
  // Verify workspace exists
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) throw ApiError.notFound("Workspace not found");

  const project = await prisma.project.create({
    data: {
      workspaceId,
      name,
      // only include description if it was actually provided
      ...(description !== undefined && { description }),
    },
    include: {
      _count: { select: { tasks: true } },
    },
  });

  return project;
};

export const getWorkspaceProjects = async (workspaceId: string) => {
  const projects = await prisma.project.findMany({
    where: { workspaceId },
    include: {
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return projects;
};

export const getProjectById = async (projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      _count: { select: { tasks: true } },
      workspace: {
        select: { id: true, name: true },
      },
    },
  });

  if (!project) throw ApiError.notFound("Project not found");

  return project;
};

export const updateProject = async (
  projectId: string,
  data: { name?: string; description?: string }
) => {
  // Verify project exists before updating
  const existing = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!existing) throw ApiError.notFound("Project not found");

  const project = await prisma.project.update({
    where: { id: projectId },
    data,
    include: {
      _count: { select: { tasks: true } },
    },
  });

  return project;
};

export const deleteProject = async (projectId: string) => {
  const existing = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!existing) throw ApiError.notFound("Project not found");

  await prisma.project.delete({
    where: { id: projectId },
  });
};