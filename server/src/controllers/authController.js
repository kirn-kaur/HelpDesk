import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
});

export async function register(request, response) {
  const { name, email, password } = request.validated.body;
  const normalizedEmail = email.toLowerCase();
  if (await User.exists({ email: normalizedEmail }))
    return response
      .status(409)
      .json({ message: "An account with that email already exists." });
  const user = await User.create({
    name,
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 12),
    role: "customer",
  });
  setSession(user, response);
  response.status(201).json({ data: publicUser(user) });
}

export async function login(request, response) {
  const { email, password } = request.validated.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+passwordHash",
  );
  if (
    !user ||
    !user.isActive ||
    !(await bcrypt.compare(password, user.passwordHash))
  ) {
    return response
      .status(401)
      .json({ message: "Email or password is incorrect." });
  }
  setSession(user, response);
  response.json({ data: publicUser(user) });
}

export function logout(_request, response) {
  response.clearCookie("helpdesk_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  response.json({ data: { loggedOut: true } });
}

export function me(request, response) {
  response.json({ data: publicUser(request.user) });
}

function setSession(user, response) {
  const token = jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
  response.cookie("helpdesk_token", token, cookieOptions());
}
