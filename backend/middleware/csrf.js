import { doubleCsrf } from "csrf-csrf";

const {
  invalidCsrfTokenError,
  generateCsrfToken,
  validateRequest,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => {
    if (!process.env.CSRF_SECRET) throw new Error("CSRF_SECRET não definida");
    return process.env.CSRF_SECRET;
  },

  getSessionIdentifier: (req) => req.ip,

  cookieName: "csrf-secret",

  cookieOptions: {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
  },

  getTokenFromRequest: (req) =>
    req.headers["x-csrf-token"] ?? req.body?._csrf ?? null,

  size: 64,
});

export {
  invalidCsrfTokenError,
  generateCsrfToken,
  validateRequest,
  doubleCsrfProtection,
};