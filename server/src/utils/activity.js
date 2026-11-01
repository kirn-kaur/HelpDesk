import ActivityLog from "../models/ActivityLog.js";

export function logActivity(ticket, actor, action, details = {}) {
  return ActivityLog.create({ ticket, actor, action, details });
}
