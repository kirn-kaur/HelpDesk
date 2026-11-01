import { Router } from "express";
import mongoose from "mongoose";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "../controllers/categoryController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { categorySchema } from "../validators/schemas.js";

const router = Router();
router.use(requireAuth);
router.get("/", asyncHandler(listCategories));
router.post(
  "/",
  requireRole("admin"),
  validate(categorySchema),
  asyncHandler(createCategory),
);
router.patch(
  "/:id",
  requireRole("admin"),
  validate(categorySchema),
  asyncHandler(updateCategory),
);
router.delete("/:id", requireRole("admin"), asyncHandler(deleteCategory));
router.param("id", (request, response, next, id) =>
  mongoose.isValidObjectId(id)
    ? next()
    : response.status(400).json({ message: "Invalid category ID." }),
);
export default router;
