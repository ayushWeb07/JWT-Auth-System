import { Router } from "express";
import healthRouter from "./health.router.ts";

const router = Router();

// setup all the v1 app routes
router.use("/health", healthRouter);

export default router;
