import type { Response } from "express";

interface ApiResponseBody<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>; // pagination etc. later
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200,
  meta?: Record<string, unknown>,
): void => {
  const body: ApiResponseBody<T> = {
    success: true,
    message,
    data,
  };

  if (meta) body.meta = meta;

  res.status(statusCode).json(body);
};

export const sendCreated = <T>(
  res: Response,
  data: T,
  message = "Created successfully",
): void => {
  sendSuccess(res, data, message, 201);
};

export const ok = <T>(data: T, message = "Success"): ApiResponseBody<T> => ({
  success: true,
  message,
  data,
});
