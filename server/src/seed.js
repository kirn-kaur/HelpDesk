import "./config/env.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDatabase } from "./config/db.js";
import Category from "./models/Category.js";
import User from "./models/User.js";

const adminValues = [
  process.env.ADMIN_NAME,
  process.env.ADMIN_EMAIL,
  process.env.ADMIN_PASSWORD,
];
if (adminValues.some(Boolean) && adminValues.some((value) => !value))
  throw new Error(
    "Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD together, or leave all three blank.",
  );
if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length < 12)
  throw new Error("ADMIN_PASSWORD must contain at least 12 characters.");

await connectDatabase();
try {
  for (const name of [
    "Account access",
    "Billing",
    "Technical support",
    "Product feedback",
  ]) {
    await Category.updateOne(
      { name },
      { $setOnInsert: { name, isActive: true } },
      { upsert: true },
    );
  }
  if (process.env.ADMIN_EMAIL) {
    const email = process.env.ADMIN_EMAIL.toLowerCase();
    const existing = await User.findOne({ email });
    if (existing && existing.role !== "admin")
      throw new Error(
        "ADMIN_EMAIL belongs to a non-admin account. Use an unused email or promote the account in the admin panel.",
      );
    if (!existing)
      await User.create({
        name: process.env.ADMIN_NAME,
        email,
        passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
        role: "admin",
        isActive: true,
      });
    console.log(`Admin account ready for ${email}`);
  } else {
    console.log(
      "Default ticket categories ready. Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD to create an admin.",
    );
  }
} finally {
  await mongoose.disconnect();
}
