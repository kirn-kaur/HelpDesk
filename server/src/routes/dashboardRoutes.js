import { Router } from "express";
import { stats, trends } from "../controllers/dashboardController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();
router.use(requireAuth);
router.get("/stats", asyncHandler(stats));
router.get("/trends", requireRole("admin", "agent"), asyncHandler(trends));
export default router;
