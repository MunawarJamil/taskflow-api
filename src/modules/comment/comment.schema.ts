import { z } from "zod";

// ─── Comment Schemas ──────────────────────────────────────

export const createCommentSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, "Comment cannot be empty")
      .max(2000, "Comment must be at most 2000 characters")
      .trim(),
  }),
  params: z.object({
    id: z.string().cuid("Invalid task ID"),
  }),
});

export const commentParamsSchema = z.object({
  params: z.object({
    id: z.string().cuid("Invalid comment ID"),
  }),
});

export const taskCommentsParamsSchema = z.object({
  params: z.object({
    id: z.string().cuid("Invalid task ID"),
  }),
});

// ─── Inferred Types ───────────────────────────────────────

export type CreateCommentBody = z.infer<typeof createCommentSchema>["body"];
