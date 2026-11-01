import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";
import { connectDatabase } from "../config/db.js";
import ActivityLog from "../models/ActivityLog.js";
import Category from "../models/Category.js";
import Comment from "../models/Comment.js";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";

let mongo;
let category;
const password = "correct-horse-battery-staple";

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET =
    "test-only-secret-that-is-longer-than-thirty-two-characters";
  mongo = await MongoMemoryServer.create();
  await connectDatabase(mongo.getUri());
});

beforeEach(async () => {
  await Promise.all([
    ActivityLog.deleteMany({}),
    Category.deleteMany({}),
    Comment.deleteMany({}),
    Ticket.deleteMany({}),
    User.deleteMany({}),
  ]);
  category = await Category.create({ name: "Technical support" });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});

async function createUser(role = "customer", email = `${role}@example.test`) {
  return User.create({
    name: `${role} user`,
    email,
    passwordHash: await bcrypt.hash(password, 4),
    role,
  });
}

async function csrf(client) {
  const response = await client.get("/api/auth/csrf");
  return response.body.csrfToken;
}

async function signedIn(user) {
  const client = request.agent(app);
  const token = await csrf(client);
  const response = await client
    .post("/api/auth/login")
    .set("X-CSRF-Token", token)
    .send({ email: user.email, password });
  expect(response.status).toBe(200);
  return { client, token };
}

async function makeTicket(customer) {
  return Ticket.create({
    title: "Cannot access my account",
    description: "The account sign-in page returns an error.",
    creator: customer._id,
    category: category._id,
  });
}

describe("authentication and access control", () => {
  it("serves the API health check", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("registers customers, hashes passwords, and signs in", async () => {
    const client = request.agent(app);
    const token = await csrf(client);
    const created = await client
      .post("/api/auth/register")
      .set("X-CSRF-Token", token)
      .send({
        name: "Taylor Customer",
        email: "taylor@example.test",
        password,
      });
    expect(created.status).toBe(201);
    expect(created.body.data.role).toBe("customer");
    expect(created.body.data.passwordHash).toBeUndefined();
    expect(
      (
        await User.findOne({ email: "taylor@example.test" }).select(
          "+passwordHash",
        )
      ).passwordHash,
    ).not.toBe(password);
    expect((await client.get("/api/auth/me")).status).toBe(200);

    const badClient = request.agent(app);
    const badToken = await csrf(badClient);
    const invalid = await badClient
      .post("/api/auth/login")
      .set("X-CSRF-Token", badToken)
      .send({ email: "taylor@example.test", password: "incorrect-password" });
    expect(invalid.status).toBe(401);
  });

  it("requires authentication and validates CSRF on writes", async () => {
    expect((await request(app).get("/api/tickets")).status).toBe(401);
    const client = request.agent(app);
    await csrf(client);
    expect((await client.post("/api/tickets").send({})).status).toBe(403);
  });

  it("blocks customers from another customer’s private ticket", async () => {
    const owner = await createUser("customer", "owner@example.test");
    const stranger = await createUser("customer", "stranger@example.test");
    const ticket = await makeTicket(owner);
    const { client } = await signedIn(stranger);
    expect((await client.get(`/api/tickets/${ticket.id}`)).status).toBe(404);
    const list = await client.get("/api/tickets");
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(0);
  });
});

describe("ticket workflows and permissions", () => {
  it("creates a ticket for the authenticated customer and ignores protected fields", async () => {
    const customer = await createUser("customer");
    const admin = await createUser("admin");
    const session = await signedIn(customer);
    const response = await session.client
      .post("/api/tickets")
      .set("X-CSRF-Token", session.token)
      .send({
        title: "Cannot access my account",
        description: "The account sign-in page returns an error.",
        category: category.id,
        priority: "High",
        status: "Closed",
        creator: admin.id,
        assignedAgent: admin.id,
      });
    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe("Open");
    expect(String(response.body.data.creator._id)).toBe(customer.id);
    expect(response.body.data.assignedAgent).toBeNull();
    expect(response.body.data.ticketNumber).toMatch(/^HD-/);
  });

  it("allows an admin to assign a ticket and an agent to update its status", async () => {
    const owner = await createUser("customer", "owner@example.test");
    const admin = await createUser("admin", "admin@example.test");
    const agent = await createUser("agent", "agent@example.test");
    const ticket = await makeTicket(owner);
    const adminSession = await signedIn(admin);
    const assigned = await adminSession.client
      .patch(`/api/tickets/${ticket.id}/assign`)
      .set("X-CSRF-Token", adminSession.token)
      .send({ assignedAgent: agent.id });
    expect(assigned.status).toBe(200);
    expect(String(assigned.body.data.assignedAgent._id)).toBe(agent.id);

    const agentSession = await signedIn(agent);
    const changed = await agentSession.client
      .patch(`/api/tickets/${ticket.id}/status`)
      .set("X-CSRF-Token", agentSession.token)
      .send({ status: "In Progress" });
    expect(changed.status).toBe(200);
    expect(changed.body.data.status).toBe("In Progress");
    expect(
      await ActivityLog.countDocuments({
        ticket: ticket._id,
        action: "status_changed",
      }),
    ).toBe(1);
  });

  it("keeps internal notes out of customer responses", async () => {
    const owner = await createUser("customer", "owner@example.test");
    const staff = await createUser("agent", "agent@example.test");
    const ticket = await makeTicket(owner);
    const customerSession = await signedIn(owner);
    const forbiddenNote = await customerSession.client
      .post(`/api/tickets/${ticket.id}/comments`)
      .set("X-CSRF-Token", customerSession.token)
      .send({ message: "Private note", isInternal: true });
    expect(forbiddenNote.status).toBe(403);
    const reply = await customerSession.client
      .post(`/api/tickets/${ticket.id}/comments`)
      .set("X-CSRF-Token", customerSession.token)
      .send({ message: "Could you take a look?" });
    expect(reply.status).toBe(201);
    const staffSession = await signedIn(staff);
    const note = await staffSession.client
      .post(`/api/tickets/${ticket.id}/comments`)
      .set("X-CSRF-Token", staffSession.token)
      .send({ message: "Check the account history.", isInternal: true });
    expect(note.status).toBe(201);
    const visible = await customerSession.client.get(
      `/api/tickets/${ticket.id}/comments`,
    );
    expect(visible.status).toBe(200);
    expect(visible.body.data).toHaveLength(1);
    expect(visible.body.data[0].message).toBe("Could you take a look?");
    expect(
      (await staffSession.client.get(`/api/tickets/${ticket.id}/comments`)).body
        .data,
    ).toHaveLength(2);
  });

  it("limits user management to admins and returns live dashboard totals", async () => {
    const customer = await createUser("customer", "customer@example.test");
    const admin = await createUser("admin", "admin@example.test");
    await makeTicket(customer);
    const customerSession = await signedIn(customer);
    expect((await customerSession.client.get("/api/users")).status).toBe(403);
    const customerStats = await customerSession.client.get(
      "/api/dashboard/stats",
    );
    expect(customerStats.body.data.total).toBe(1);
    expect(customerStats.body.data.open).toBe(1);
    const adminSession = await signedIn(admin);
    const users = await adminSession.client.get("/api/users");
    expect(users.status).toBe(200);
    expect(users.body.data).toHaveLength(2);
    const promoted = await adminSession.client
      .patch(`/api/users/${customer.id}/role`)
      .set("X-CSRF-Token", adminSession.token)
      .send({ role: "agent" });
    expect(promoted.status).toBe(200);
    expect(promoted.body.data.role).toBe("agent");
  });

  it("prevents the last active administrator from being removed", async () => {
    const admin = await createUser("admin", "admin@example.test");
    const session = await signedIn(admin);
    const deactivated = await session.client
      .patch(`/api/users/${admin.id}/status`)
      .set("X-CSRF-Token", session.token)
      .send({ isActive: false });
    expect(deactivated.status).toBe(400);
    expect((await User.findById(admin.id)).isActive).toBe(true);
  });

  it("allows a customer to reopen a resolved ticket but rejects unrelated status changes", async () => {
    const customer = await createUser("customer");
    const ticket = await makeTicket(customer);
    ticket.status = "Resolved";
    await ticket.save();
    const session = await signedIn(customer);
    const reopened = await session.client
      .patch(`/api/tickets/${ticket.id}/status`)
      .set("X-CSRF-Token", session.token)
      .send({ status: "Open" });
    expect(reopened.status).toBe(200);
    expect(reopened.body.data.status).toBe("Open");
    const forbidden = await session.client
      .patch(`/api/tickets/${ticket.id}/status`)
      .set("X-CSRF-Token", session.token)
      .send({ status: "Closed" });
    expect(forbidden.status).toBe(403);
  });
});
