import { Router } from "express";
import * as usersController from "../../controllers/users.controller.ts";
import { authHandler } from "../../middlewares/auth.middleware.ts";

const router = Router();

router.get("/me", authHandler, usersController.getCurrentUser);

export default router;
