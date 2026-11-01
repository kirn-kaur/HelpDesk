import { Router } from "express";
import {
  assignSchema,
  commentSchema,
  statusSchema,
  ticketCreateSchema,
  ticketPatchSchema,
} from "../validators/schemas.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import {
  assignTicket,
  createComment,
  createTicket,
  getTicket,
  listComments,
  listTickets,
  updateStatus,
  updateTicket,
} from "../controllers/ticketController.js";

const router = Router();
router.use(requireAuth);
router.get("/", asyncHandler(listTickets));
router.post("/", validate(ticketCreateSchema), asyncHandler(createTicket));
router.get("/:id", asyncHandler(getTicket));
router.patch("/:id", validate(ticketPatchSchema), asyncHandler(updateTicket));
router.patch(
  "/:id/assign",
  requireRole("admin"),
  validate(assignSchema),
  asyncHandler(assignTicket),
);
router.patch("/:id/status", validate(statusSchema), asyncHandler(updateStatus));
router.get("/:id/comments", asyncHandler(listComments));
router.post(
  "/:id/comments",
  validate(commentSchema),
  asyncHandler(createComment),
);
export default router;
