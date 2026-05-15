import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

import { ApiError } from "../utils/ApiError.js";
import { logger } from "../config/logger.js";

export const errorMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  logger.error(error);

  // Custom API errors
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.flatten().fieldErrors,
    });
  }

  //   Prisma known errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Resource already exists",
      });
    }
  }

  // Unknown server errors
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};
