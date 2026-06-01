import { Router } from "express";
import healthRouter from "./health.router.ts";
import authRouter from "./auth.router.ts";

const router = Router();

// setup all the v1 app routes
router.use("/health", healthRouter);
router.use("/auth", authRouter);

export default router;
