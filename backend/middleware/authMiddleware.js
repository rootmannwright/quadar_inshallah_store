import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ================= AUTH MIDDLEWARE =================
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    return next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
};

// ================= ADMIN-ONLY MIDDLEWARE =================
const ADMIN_IPS = ["127.0.0.1", "::1"];
const ADMIN_KEYS = [process.env.ADMIN_KEY];

const adminOnly = (req, res, next) => {
  const requestIp =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress;

  const adminKey = req.headers["x-admin-key"];

  const ipAllowed = ADMIN_IPS.includes(requestIp);
  const keyAllowed = ADMIN_KEYS.includes(adminKey);

  if (!ipAllowed && !keyAllowed) {
    return res.status(403).json({
      error: "Acesso restrito a administradores",
    });
  }

  return next();
};

export { authMiddleware, adminOnly };
export default authMiddleware;