import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendCreated } from "../../utils/ApiResponse.js";
import { registerUser } from "./auth.service.js";
import type { RegisterInput } from "./auth.schema.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as RegisterInput;

  const user = await registerUser(input);

  sendCreated(res, { user }, "Account created successfully");
});
