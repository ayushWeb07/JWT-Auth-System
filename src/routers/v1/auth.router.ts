import { Router } from "express";
import * as authController from "../../controllers/auth.controller.ts";
import * as authValidator from "../../validators/auth.validator.ts";
import { validateRequestBody } from "../../validators/request.validator.ts";

const router = Router();

router.post(
	"/register",
	validateRequestBody(authValidator.registerSchema),
	authController.registerUser,
);

export default router;
