import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import { register } from "./auth.controller.js";
import { registerSchema } from "./auth.schema.js";

const router: Router = Router();
router.post("/register", validate(registerSchema), register);

export default router;
