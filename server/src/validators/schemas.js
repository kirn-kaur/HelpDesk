import { z } from "zod";

const id = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID");
const roles = z.enum(["customer", "agent", "admin"]);
const statuses = z.enum([
  "Open",
  "In Progress",
  "Waiting for Customer",
  "Resolved",
  "Closed",
]);
const priorities = z.enum(["Low", "Medium", "High", "Critical"]);

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(254),
    password: z.string().min(8).max(128),
  }),
});
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1).max(128),
  }),
});
export const ticketCreateSchema = z.object({
  body: z.object({
    title: z.string().trim().min(4).max(160),
    description: z.string().trim().min(10).max(10000),
    category: id,
    priority: priorities.default("Medium"),
  }),
});
export const ticketPatchSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(4).max(160).optional(),
      description: z.string().trim().min(10).max(10000).optional(),
      priority: priorities.optional(),
      category: id.optional(),
    })
    .refine((value) => Object.keys(value).length > 0),
});
export const statusSchema = z.object({ body: z.object({ status: statuses }) });
export const assignSchema = z.object({
  body: z.object({ assignedAgent: id.nullable() }),
});
export const commentSchema = z.object({
  body: z.object({
    message: z.string().trim().min(1).max(5000),
    isInternal: z.boolean().default(false),
  }),
});
export const userRoleSchema = z.object({ body: z.object({ role: roles }) });
export const userStatusSchema = z.object({
  body: z.object({ isActive: z.boolean() }),
});
export const categorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    description: z.string().trim().max(500).optional(),
    isActive: z.boolean().optional(),
  }),
});
