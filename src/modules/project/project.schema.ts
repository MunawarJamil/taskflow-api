import { z } from "zod";

// ─── Project Schemas ──────────────────────────────────────

export const createProjectSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters")
      .trim(),
    description: z
      .string()
      .max(500, "Description must be at most 500 characters")
      .trim()
      .optional(),
  }),
  params: z.object({
    id: z.string().cuid("Invalid workspace ID"),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters")
      .trim()
      .optional(),
    description: z
      .string()
      .max(500, "Description must be at most 500 characters")
      .trim()
      .optional(),
  }),
  params: z.object({
    id: z.string().cuid("Invalid project ID"),
  }),
});

export const projectParamsSchema = z.object({
  params: z.object({
    id: z.string().cuid("Invalid project ID"),
  }),
});

export const workspaceProjectsParamsSchema = z.object({
  params: z.object({
    id: z.string().cuid("Invalid workspace ID"),
  }),
});

// ─── Inferred Types ───────────────────────────────────────

export type CreateProjectBody = z.infer<typeof createProjectSchema>["body"];
export type UpdateProjectBody = z.infer<typeof updateProjectSchema>["body"];
