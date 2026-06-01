import { Router } from "express";
import * as authController from "../../controllers/auth.controller.ts";

import { validateRequestBody } from "../../validators/request.validator.ts";

import * as usersValidator from "../../validators/users.validator.ts";

const router = Router();

router.post(
	"/register",
	validateRequestBody(usersValidator.createUserSchema),
	authController.createUser,
);

export default router;
