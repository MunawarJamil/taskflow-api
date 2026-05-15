import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendCreated, sendSuccess } from "../../utils/ApiResponse.js";
import {
  getMe,
  loginUser,
  logoutUser,
  refreshTokens,
  registerUser,
} from "./auth.service.js";
import type { LoginInput, RefreshInput, RegisterInput } from "./auth.schema.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as RegisterInput;

  const user = await registerUser(input);

  sendCreated(res, { user }, "Account created successfully");
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as LoginInput;

  const result = await loginUser(input);

  sendSuccess(res, result, "Login successful");
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as RefreshInput;

  const tokens = await refreshTokens(refreshToken);

  sendSuccess(res, tokens, "Tokens refreshed successfully");
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as RefreshInput;

  await logoutUser(refreshToken);

  sendSuccess(res, null, "Logged out successfully");
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await getMe(req.user!.sub);

  sendSuccess(res, { user }, "User fetched successfully");
});
