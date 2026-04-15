import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  try {    
    // Extract token from Authorization header.
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Não autorizado: token ausente",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Não autorizado: token ausente",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.userId || decoded.id,
      role: decoded.role || "user",
      email: decoded.email,
    };

    next();
  } catch (err) {
    console.error("[AUTH ERROR]", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Sessão expirada, faça login novamente",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Token inválido",
    });
  }
}

export default authMiddleware;