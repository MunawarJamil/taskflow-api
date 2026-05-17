import { verifyAccessToken, type AccessTokenPayload } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";
import type { Request, Response, NextFunction } from "express";
// Extend Express Request type to carry authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  // 1. Check header exists and is Bearer format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw ApiError.unauthorized("Access token required");
  }

  // 2. Extract token
  const token = authHeader.split(" ")[1];

  // 3. Verify — throws if expired or tampered
  try {
    const payload = verifyAccessToken(token!);
    req.user = payload; // attach to request for downstream use
    next();
  } catch {
    throw ApiError.unauthorized("Invalid or expired access token");
  }
};

// export const requireAuth = [authenticate];
