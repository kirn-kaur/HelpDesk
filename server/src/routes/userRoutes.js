import { Router } from "express";
import {
  getUser,
  listUsers,
  updateRole,
  updateStatus,
} from "../controllers/userController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { userRoleSchema, userStatusSchema } from "../validators/schemas.js";

const router = Router();
router.use(requireAuth, requireRole("admin"));
router.get("/", asyncHandler(listUsers));
router.get("/:id", asyncHandler(getUser));
router.patch("/:id/role", validate(userRoleSchema), asyncHandler(updateRole));
router.patch(
  "/:id/status",
  validate(userStatusSchema),
  asyncHandler(updateStatus),
);
export default router;
