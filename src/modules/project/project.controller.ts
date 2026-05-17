import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendCreated, sendSuccess } from "../../utils/ApiResponse.js";
import * as projectService from "./project.service.js";
import type { CreateProjectBody, UpdateProjectBody } from "./project.schema.js";

// ─── Param Types ──────────────────────────────────────────

type WorkspaceParams = { id: string };
type ProjectParams = { id: string };

// ─── Project Controllers ──────────────────────────────────

export const createProject = asyncHandler(
  async (
    req: Request<WorkspaceParams, unknown, CreateProjectBody>,
    res: Response,
  ) => {
    const project = await projectService.createProject(
      req.params.id,
      req.user!.sub,
      req.body.name,
      req.body.description,
    );

    sendCreated(res, project, "Project created successfully");
  },
);

export const getWorkspaceProjects = asyncHandler(
  async (req: Request<WorkspaceParams>, res: Response) => {
    const projects = await projectService.getWorkspaceProjects(req.params.id);

    sendSuccess(res, projects, "Projects fetched successfully");
  },
);

export const getProjectById = asyncHandler(
  async (req: Request<ProjectParams>, res: Response) => {
    const project = await projectService.getProjectById(req.params.id);

    sendSuccess(res, project, "Project fetched successfully");
  },
);
export const updateProject = asyncHandler(
  async (
    req: Request<ProjectParams, unknown, UpdateProjectBody>,
    res: Response,
  ) => {
    const { name, description } = req.body;

    const project = await projectService.updateProject(req.params.id, {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
    });

    sendSuccess(res, project, "Project updated successfully");
  },
);

export const deleteProject = asyncHandler(
  async (req: Request<ProjectParams>, res: Response) => {
    await projectService.deleteProject(req.params.id);

    sendSuccess(res, null, "Project deleted successfully");
  },
);
