import mongoose from "mongoose";
import ActivityLog from "../models/ActivityLog.js";
import Category from "../models/Category.js";
import Comment from "../models/Comment.js";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import { logActivity } from "../utils/activity.js";

const populateTicket = (query) =>
  query
    .populate("creator", "name email role")
    .populate("assignedAgent", "name email")
    .populate("category", "name");

async function ticketAccess(request, response) {
  if (!mongoose.isValidObjectId(request.params.id)) {
    response.status(400).json({ message: "Invalid ticket ID." });
    return null;
  }
  const ticket = await populateTicket(Ticket.findById(request.params.id));
  if (!ticket) {
    response.status(404).json({ message: "Ticket not found." });
    return null;
  }
  const { user } = request;
  const isCustomerOwner =
    user.role === "customer" && ticket.creator._id.equals(user._id);
  const isStaffAllowed =
    ["admin", "agent"].includes(user.role) &&
    (user.role === "admin" ||
      !ticket.assignedAgent ||
      ticket.assignedAgent._id.equals(user._id));
  if (!isCustomerOwner && !isStaffAllowed) {
    response.status(404).json({ message: "Ticket not found." });
    return null;
  }
  return ticket;
}

export async function listTickets(request, response) {
  const { user } = request;
  const filter = {};
  if (user.role === "customer") filter.creator = user._id;
  if (user.role === "agent")
    filter.$or = [{ assignedAgent: user._id }, { assignedAgent: null }];
  const { status, priority, category, assignedAgent } = request.query;
  const q =
    typeof request.query.q === "string" ? request.query.q.slice(0, 160) : "";
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) {
    if (!mongoose.isValidObjectId(category))
      return response.status(400).json({ message: "Invalid category ID." });
    filter.category = new mongoose.Types.ObjectId(category);
  }
  if (assignedAgent && user.role === "admin") {
    if (!mongoose.isValidObjectId(assignedAgent))
      return response.status(400).json({ message: "Invalid agent ID." });
    filter.assignedAgent = new mongoose.Types.ObjectId(assignedAgent);
  }
  if (q)
    filter.$and = [
      ...(filter.$and ?? []),
      {
        $or: [
          { title: new RegExp(escapeRegex(q), "i") },
          { ticketNumber: new RegExp(escapeRegex(q), "i") },
        ],
      },
    ];
  const page = Math.max(1, Number.parseInt(request.query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(request.query.limit, 10) || 10),
  );
  if (request.query.sort === "priority") {
    const rows = await Ticket.aggregate([
      { $match: filter },
      {
        $addFields: {
          priorityRank: {
            $switch: {
              branches: [
                { case: { $eq: ["$priority", "Critical"] }, then: 4 },
                { case: { $eq: ["$priority", "High"] }, then: 3 },
                { case: { $eq: ["$priority", "Medium"] }, then: 2 },
                { case: { $eq: ["$priority", "Low"] }, then: 1 },
              ],
              default: 0,
            },
          },
        },
      },
      { $sort: { priorityRank: -1, updatedAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      { $unset: "priorityRank" },
    ]);
    const positions = new Map(
      rows.map((row, index) => [String(row._id), index]),
    );
    const [ordered, total] = await Promise.all([
      populateTicket(Ticket.find({ _id: { $in: rows.map((row) => row._id) } })),
      Ticket.countDocuments(filter),
    ]);
    ordered.sort(
      (a, b) => positions.get(String(a._id)) - positions.get(String(b._id)),
    );
    return response.json({
      data: ordered,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  }
  const sort =
    request.query.sort === "oldest" ? { createdAt: 1 } : { updatedAt: -1 };
  const [tickets, total] = await Promise.all([
    populateTicket(
      Ticket.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit),
    ),
    Ticket.countDocuments(filter),
  ]);
  response.json({
    data: tickets,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function createTicket(request, response) {
  const category = await Category.findOne({
    _id: request.validated.body.category,
    isActive: true,
  });
  if (!category)
    return response.status(400).json({ message: "Choose an active category." });
  const ticket = await Ticket.create({
    ...request.validated.body,
    creator: request.user._id,
  });
  await logActivity(ticket._id, request.user._id, "created");
  response
    .status(201)
    .json({ data: await populateTicket(Ticket.findById(ticket._id)) });
}

export async function getTicket(request, response) {
  const ticket = await ticketAccess(request, response);
  if (!ticket) return;
  const commentFilter = {
    ticket: ticket._id,
    ...(request.user.role === "customer" ? { isInternal: false } : {}),
  };
  const [comments, activities] = await Promise.all([
    Comment.find(commentFilter)
      .populate("author", "name role")
      .sort({ createdAt: 1 }),
    request.user.role === "admin"
      ? ActivityLog.find({ ticket: ticket._id })
          .populate("actor", "name")
          .sort({ createdAt: -1 })
      : [],
  ]);
  response.json({ data: { ticket, comments, activities } });
}

export async function updateTicket(request, response) {
  const ticket = await ticketAccess(request, response);
  if (!ticket) return;
  if (!["admin", "agent"].includes(request.user.role))
    return response
      .status(403)
      .json({ message: "Only support staff can edit ticket details." });
  const changes = request.validated.body;
  if (
    changes.category &&
    !(await Category.exists({ _id: changes.category, isActive: true }))
  )
    return response.status(400).json({ message: "Choose an active category." });
  const before = { ...ticket.toObject() };
  Object.assign(ticket, changes);
  await ticket.save();
  for (const key of Object.keys(changes))
    if (String(before[key]) !== String(changes[key]))
      await logActivity(ticket._id, request.user._id, `${key}_changed`, {
        from: before[key],
        to: changes[key],
      });
  response.json({ data: await populateTicket(Ticket.findById(ticket._id)) });
}

export async function assignTicket(request, response) {
  const ticket = await ticketAccess(request, response);
  if (!ticket) return;
  if (request.user.role !== "admin")
    return response
      .status(403)
      .json({ message: "Only administrators can assign tickets." });
  const { assignedAgent } = request.validated.body;
  if (
    assignedAgent &&
    !(await User.exists({ _id: assignedAgent, role: "agent", isActive: true }))
  )
    return response
      .status(400)
      .json({ message: "Choose an active support agent." });
  const oldAgent = ticket.assignedAgent?._id?.toString() ?? null;
  ticket.assignedAgent = assignedAgent;
  await ticket.save();
  await logActivity(ticket._id, request.user._id, "assigned", {
    from: oldAgent,
    to: assignedAgent,
  });
  response.json({ data: await populateTicket(Ticket.findById(ticket._id)) });
}

export async function updateStatus(request, response) {
  const ticket = await ticketAccess(request, response);
  if (!ticket) return;
  const nextStatus = request.validated.body.status;
  const isCustomerReopen =
    request.user.role === "customer" &&
    ticket.status === "Resolved" &&
    nextStatus === "Open";
  if (request.user.role === "customer" && !isCustomerReopen)
    return response
      .status(403)
      .json({ message: "You may reopen a resolved ticket." });
  if (!["customer", "agent", "admin"].includes(request.user.role))
    return response
      .status(403)
      .json({ message: "You cannot change ticket status." });
  const previous = ticket.status;
  const transitions = {
    Open: ["In Progress", "Waiting for Customer", "Resolved", "Closed"],
    "In Progress": ["Open", "Waiting for Customer", "Resolved", "Closed"],
    "Waiting for Customer": ["Open", "In Progress", "Resolved", "Closed"],
    Resolved: ["Open", "In Progress", "Closed"],
    Closed: request.user.role === "admin" ? ["Open"] : [],
  };
  if (
    previous !== nextStatus &&
    !isCustomerReopen &&
    !transitions[previous]?.includes(nextStatus)
  ) {
    return response
      .status(400)
      .json({
        message: `A ticket cannot move from ${previous} to ${nextStatus}.`,
      });
  }
  ticket.status = nextStatus;
  ticket.resolvedAt = nextStatus === "Resolved" ? new Date() : null;
  await ticket.save();
  await logActivity(ticket._id, request.user._id, "status_changed", {
    from: previous,
    to: nextStatus,
  });
  response.json({ data: await populateTicket(Ticket.findById(ticket._id)) });
}

export async function listComments(request, response) {
  const ticket = await ticketAccess(request, response);
  if (!ticket) return;
  const comments = await Comment.find({
    ticket: ticket._id,
    ...(request.user.role === "customer" ? { isInternal: false } : {}),
  })
    .populate("author", "name role")
    .sort({ createdAt: 1 });
  response.json({ data: comments });
}

export async function createComment(request, response) {
  const ticket = await ticketAccess(request, response);
  if (!ticket) return;
  const { message, isInternal } = request.validated.body;
  if (request.user.role === "customer" && ticket.status === "Closed")
    return response
      .status(403)
      .json({ message: "Closed tickets cannot receive new replies." });
  if (isInternal && !["agent", "admin"].includes(request.user.role))
    return response
      .status(403)
      .json({ message: "Internal notes are for support staff only." });
  const comment = await Comment.create({
    ticket: ticket._id,
    author: request.user._id,
    message,
    isInternal,
  });
  if (
    !isInternal &&
    ["Resolved", "Closed"].includes(ticket.status) &&
    request.user.role === "customer"
  )
    ticket.status = "Open";
  await ticket.save();
  await logActivity(
    ticket._id,
    request.user._id,
    isInternal ? "internal_note_added" : "reply_added",
  );
  response
    .status(201)
    .json({ data: await comment.populate("author", "name role") });
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
