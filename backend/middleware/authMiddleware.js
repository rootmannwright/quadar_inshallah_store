import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* =====================================================
   AUTH MIDDLEWARE
===================================================== */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Token não fornecido ou formato inválido",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (!decoded.userId) {
      return res.status(401).json({
        error: "Token inválido",
      });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        error: "Usuário não encontrado",
      });
    }

    // Anexa usuário completo ao request
    req.user = user;

    return next();
  // eslint-disable-next-line no-unused-vars
  } catch (err) {
    return res.status(401).json({
      error: "Token inválido ou expirado",
    });
  }
};

/* =====================================================
   ADMIN ONLY (Role-Based Access Control)
===================================================== */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      error: "Acesso restrito a administradores",
    });
  }

  return next();
};

export { authMiddleware, adminOnly };
export default authMiddleware;