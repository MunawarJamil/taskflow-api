import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";

// Brute-force protection for credential endpoints.
// Counts per-IP; `trust proxy` in app.ts ensures the real client IP is used.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: () => {
    throw ApiError.tooManyRequests(
      "Too many attempts — please try again in a few minutes",
    );
  },
});

// Looser limit for token refresh — legitimate clients may refresh often.
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: () => {
    throw ApiError.tooManyRequests("Too many refresh attempts");
  },
});
