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

router.post(
	"/login",
	validateRequestBody(authValidator.loginSchema),
	authController.loginUser,
);

router.post("/refresh", authController.refreshAccessToken);

router.post("/logout", authController.logoutUser);

router.post("/logout-all", authController.logoutUserFromAllSessions);

router.post(
	"/send-otp-for-verification",
	validateRequestBody(authValidator.sendOtpForVerificationSchema),
	authController.sendOtpForVerification,
);

router.post(
	"/verify-otp",
	validateRequestBody(authValidator.verifyOtpSchema),
	authController.verifyOtp,
);

export default router;
