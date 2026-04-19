import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Não autorizado: header ausente",
      });
    }

    // aceita "Bearer token" mesmo com espaços extras ou variação de caixa
    const [scheme, token] = authHeader.trim().split(" ");

    if (!scheme || scheme.toLowerCase() !== "bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Não autorizado: formato inválido do token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.userId || decoded.id,
      role: decoded.role || "user",
      email: decoded.email,
    };

    return next();
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