import { Router } from "express";
import { dashboardController } from "./dashboard.controller.js";
import verifyToken from "../../middlewares/verify-token.js";

const router = Router();

// GET /api/dashboard/stats: Role-aware metrics for student, tutor, or admin
router.get("/stats", verifyToken, dashboardController.getStats);

export default router;
