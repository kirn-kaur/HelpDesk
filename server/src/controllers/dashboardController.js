import Ticket from "../models/Ticket.js";
import User from "../models/User.js";

export async function stats(request, response) {
  const { user } = request;
  const scope =
    user.role === "customer"
      ? { creator: user._id }
      : user.role === "agent"
        ? { $or: [{ assignedAgent: user._id }, { assignedAgent: null }] }
        : {};
  const [total, byStatus, byPriority, recent, users, workload] =
    await Promise.all([
      Ticket.countDocuments(scope),
      Ticket.aggregate([
        { $match: scope },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Ticket.aggregate([
        { $match: scope },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),
      Ticket.find(scope)
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate("creator", "name")
        .populate("assignedAgent", "name")
        .populate("category", "name"),
      user.role === "admin"
        ? User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }])
        : [],
      user.role === "admin"
        ? Ticket.aggregate([
            {
              $match: {
                assignedAgent: { $ne: null },
                status: { $nin: ["Resolved", "Closed"] },
              },
            },
            { $group: { _id: "$assignedAgent", count: { $sum: 1 } } },
            {
              $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "agent",
              },
            },
            { $unwind: "$agent" },
            { $project: { _id: 0, name: "$agent.name", count: 1 } },
          ])
        : [],
    ]);
  const statusCounts = Object.fromEntries(
    byStatus.map(({ _id, count }) => [_id, count]),
  );
  const priorityCounts = Object.fromEntries(
    byPriority.map(({ _id, count }) => [_id, count]),
  );
  const userCounts = Object.fromEntries(
    users.map(({ _id, count }) => [_id, count]),
  );
  response.json({
    data: {
      total,
      open: statusCounts.Open ?? 0,
      inProgress: statusCounts["In Progress"] ?? 0,
      waiting: statusCounts["Waiting for Customer"] ?? 0,
      resolved: statusCounts.Resolved ?? 0,
      closed: statusCounts.Closed ?? 0,
      highPriority: (priorityCounts.High ?? 0) + (priorityCounts.Critical ?? 0),
      statusDistribution: byStatus.map(({ _id, count }) => ({
        name: _id,
        value: count,
      })),
      priorityDistribution: byPriority.map(({ _id, count }) => ({
        name: _id,
        value: count,
      })),
      userCounts,
      totalUsers: Object.values(userCounts).reduce(
        (sum, value) => sum + value,
        0,
      ),
      workload,
      recent,
    },
  });
}

export async function trends(request, response) {
  const scope =
    request.user.role === "agent"
      ? { $or: [{ assignedAgent: request.user._id }, { assignedAgent: null }] }
      : {};
  const since = new Date();
  since.setDate(since.getDate() - 29);
  const rows = await Ticket.aggregate([
    { $match: { ...scope, createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        created: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  response.json({
    data: rows.map((row) => ({
      date: row._id,
      created: row.created,
      resolved: row.resolved,
    })),
  });
}
