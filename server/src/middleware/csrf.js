import crypto from "node:crypto";

export function csrfToken(_request, response) {
  const token = crypto.randomBytes(32).toString("hex");
  response.cookie("helpdesk_csrf", token, {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  response.json({ csrfToken: token });
}

export function protectCsrf(request, response, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return next();
  const cookie = request.cookies?.helpdesk_csrf;
  const header = request.get("x-csrf-token");
  const origin = request.get("origin");
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  if (
    !cookie ||
    !header ||
    cookie !== header ||
    (origin && origin !== clientUrl)
  ) {
    return response
      .status(403)
      .json({
        message:
          "Request could not be verified. Refresh the page and try again.",
      });
  }
  next();
}
