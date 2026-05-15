export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly isOperational: boolean; //Expected error or server bug?

  constructor(
    statusCode: number,
    message: string,
    options: { code?: string; details?: unknown; isOperational?: boolean } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = options.code ?? "ERR_INTERNAL";
    this.details = options.details;
    this.isOperational = options.isOperational ?? true;
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message = "Bad Request", details?: unknown) {
    return new ApiError(400, message, { code: "ERR_BAD_REQUEST", details });
  }
  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message, { code: "ERR_UNAUTHORIZED" });
  }
  static forbidden(message = "Forbidden") {
    return new ApiError(403, message, { code: "ERR_FORBIDDEN" });
  }
  static notFound(message = "Not Found") {
    return new ApiError(404, message, { code: "ERR_NOT_FOUND" });
  }
  static conflict(message = "Conflict") {
    return new ApiError(409, message, { code: "ERR_CONFLICT" });
  }
  static tooManyRequests(message = "Too Many Requests", details?: unknown) {
    return new ApiError(429, message, {
      code: "ERR_TOO_MANY_REQUESTS",
      details,
    });
  }
  static internal(message = "Internal Server Error") {
    return new ApiError(500, message, {
      code: "ERR_INTERNAL",
      isOperational: false,
    });
  }
}
