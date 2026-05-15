import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";

import { ApiError } from "../utils/ApiError.js";
import { logger } from "../config/logger.js";

export const errorMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // Only log unexpected errors — operational errors are noise
  if (!(error instanceof ApiError) || !error.isOperational) {
    logger.error(error);
  }

  // Custom API errors
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      code: error.code,
      message: error.message,
      ...(error.details ? { errors: error.details } : {}),
    });
  }

  // Prisma unique constraint — fallback if service doesn't catch it
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        code: "ERR_CONFLICT",
        message: "Resource already exists",
      });
    }
  }

  // Unknown server errors
  return res.status(500).json({
    success: false,
    code: "ERR_INTERNAL",
    message: "Internal Server Error",
  });
};
