import { z } from "zod";

// ─── Workspace Schemas ────────────────────────────────────

export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters")
      .trim(),
  }),
});

export const updateWorkspaceSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters")
      .trim(),
  }),
  params: z.object({
    id: z.string().cuid("Invalid workspace ID"),
  }),
});

export const workspaceParamsSchema = z.object({
  params: z.object({
    id: z.string().cuid("Invalid workspace ID"),
  }),
});

// ─── Member Schemas ───────────────────────────────────────

export const inviteMemberSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
  }),
  params: z.object({
    id: z.string().cuid("Invalid workspace ID"),
  }),
});

export const removeMemberSchema = z.object({
  params: z.object({
    id: z.string().cuid("Invalid workspace ID"),
    userId: z.string().cuid("Invalid user ID"),
  }),
});

// ─── Inferred Types ───────────────────────────────────────
// Body-only types — controllers read `req.body` after validation middleware.

export type CreateWorkspaceBody = z.infer<typeof createWorkspaceSchema>["body"];
export type UpdateWorkspaceBody = z.infer<typeof updateWorkspaceSchema>["body"];
export type InviteMemberBody = z.infer<typeof inviteMemberSchema>["body"];
