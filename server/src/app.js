import "./config/env.js";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { csrfToken, protectCsrf } from "./middleware/csrf.js";
import { asyncHandler } from "./middleware/asyncHandler.js";
import authRoutes from "./routes/authRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_request, response) => {
  response.status(200).json({ status: "ok", service: "helpdesk-api" });
});

app.get("/api/auth/csrf", csrfToken);
app.use("/api", protectCsrf);
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
);
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);

app.use((_request, response) =>
  response.status(404).json({ message: "Route not found." }),
);
app.use((error, _request, response, _next) => {
  if (error.code === 11000)
    return response
      .status(409)
      .json({ message: "That value is already in use." });
  if (error.name === "ValidationError")
    return response.status(400).json({ message: error.message });
  if (error.name === "CastError")
    return response.status(400).json({ message: "Invalid ID." });
  if (error.type === "entity.parse.failed")
    return response
      .status(400)
      .json({ message: "Request body must be valid JSON." });
  if (process.env.NODE_ENV !== "production") console.error(error);
  response
    .status(500)
    .json({ message: "Something went wrong. Please try again." });
});

export default app;
