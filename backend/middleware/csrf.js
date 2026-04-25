// middleware/csrf.js
import crypto from "crypto";

const COOKIE = "x-csrf-token";
const isProd = process.env.NODE_ENV === "production";

function generateToken(req, res) {
  const token = crypto.randomBytes(32).toString("hex");

  res.cookie(COOKIE, token, {
    httpOnly: false,
    sameSite: "strict",
    secure: isProd,
    path: "/",
  });

  return token;
}

function doubleCsrfProtection(req, res, next) {
  const SAFE = ["GET", "HEAD", "OPTIONS"];
  if (SAFE.includes(req.method)) return next();

  const fromHeader = req.headers["x-csrf-token"];
  const fromCookie = req.cookies?.[COOKIE];

  if (!fromHeader || !fromCookie || fromHeader !== fromCookie) {
    return res.status(403).json({
      success: false,
      code: "EBADCSRFTOKEN",
      message: "Token CSRF inválido.",
    });
  }

  next();
}

export { generateToken, doubleCsrfProtection };