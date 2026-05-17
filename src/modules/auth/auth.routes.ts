import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import { login, logout, me, refresh, register } from "./auth.controller.js";
import { loginSchema, refreshSchema, registerSchema } from "./auth.schema.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  authLimiter,
  refreshLimiter,
} from "../../middleware/rateLimit.middleware.js";

const router: Router = Router();
router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/refresh", refreshLimiter, validate(refreshSchema), refresh);
router.post("/logout", validate(refreshSchema), logout);
router.get("/me", authenticate, me);

export default router;
