import mongoose from "mongoose";
import User from "../models/User.js";

export async function listUsers(request, response) {
  const q = request.query.q?.trim().slice(0, 160);
  const filter = q
    ? {
        $or: [
          { name: new RegExp(escapeRegex(q), "i") },
          { email: new RegExp(escapeRegex(q), "i") },
        ],
      }
    : {};
  const page = Math.max(1, Number.parseInt(request.query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(request.query.limit, 10) || 20),
  );
  const [data, total] = await Promise.all([
    User.find(filter)
      .select("name email role isActive createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);
  response.json({
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function getUser(request, response) {
  if (!mongoose.isValidObjectId(request.params.id))
    return response.status(400).json({ message: "Invalid user ID." });
  const user = await User.findById(request.params.id).select(
    "name email role isActive createdAt",
  );
  if (!user) return response.status(404).json({ message: "User not found." });
  response.json({ data: user });
}

export async function updateRole(request, response) {
  if (request.params.id === request.user.id)
    return response
      .status(400)
      .json({ message: "You cannot change your own role." });
  const current = await User.findById(request.params.id).select("role");
  if (!current)
    return response.status(404).json({ message: "User not found." });
  if (
    current.role === "admin" &&
    request.validated.body.role !== "admin" &&
    (await User.countDocuments({ role: "admin", isActive: true })) <= 1
  ) {
    return response
      .status(400)
      .json({
        message: "Keep at least one active administrator in the workspace.",
      });
  }
  const user = await User.findByIdAndUpdate(
    request.params.id,
    { role: request.validated.body.role },
    { new: true, runValidators: true },
  ).select("name email role isActive createdAt");
  response.json({ data: user });
}

export async function updateStatus(request, response) {
  if (request.params.id === request.user.id)
    return response
      .status(400)
      .json({ message: "You cannot deactivate your own account." });
  const current = await User.findById(request.params.id).select(
    "role isActive",
  );
  if (!current)
    return response.status(404).json({ message: "User not found." });
  if (
    current.role === "admin" &&
    current.isActive &&
    !request.validated.body.isActive &&
    (await User.countDocuments({ role: "admin", isActive: true })) <= 1
  ) {
    return response
      .status(400)
      .json({
        message: "Keep at least one active administrator in the workspace.",
      });
  }
  const user = await User.findByIdAndUpdate(
    request.params.id,
    { isActive: request.validated.body.isActive },
    { new: true, runValidators: true },
  ).select("name email role isActive createdAt");
  response.json({ data: user });
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
