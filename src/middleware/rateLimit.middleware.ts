import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";

const isTest = process.env.NODE_ENV === "test";

// Brute-force protection for credential endpoints.
// Counts per-IP; `trust proxy` in app.ts ensures the real client IP is used.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: isTest ? 0 : 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => isTest,
  handler: () => {
    throw ApiError.tooManyRequests(
      "Too many attempts — please try again in a few minutes",
    );
  },
});

// Looser limit for token refresh — legitimate clients may refresh often.
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isTest ? 0 : 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => isTest,
  handler: () => {
    throw ApiError.tooManyRequests("Too many refresh attempts");
  },
});
