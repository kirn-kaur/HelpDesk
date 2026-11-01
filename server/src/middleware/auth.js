import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler } from "./asyncHandler.js";

export const requireAuth = asyncHandler(async (request, response, next) => {
  const token = request.cookies?.helpdesk_token;
  if (!token)
    return response
      .status(401)
      .json({ message: "Please sign in to continue." });
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return response
      .status(401)
      .json({ message: "Your session has expired. Please sign in again." });
  }
  const user = await User.findById(payload.sub);
  if (!user || !user.isActive)
    return response
      .status(401)
      .json({ message: "This account is unavailable." });
  request.user = user;
  next();
});

export const requireRole =
  (...roles) =>
  (request, response, next) => {
    if (!roles.includes(request.user.role))
      return response
        .status(403)
        .json({ message: "You do not have permission to do that." });
    next();
  };
