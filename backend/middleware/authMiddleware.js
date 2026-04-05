// ==========================
// AUTH MIDDLEWARE
// ==========================
export function authMiddleware(req, res, next) {
  try {
    // exemplo simples (ajusta pro teu JWT depois)
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Não autorizado" });
    }

    next();
  } catch {
    res.status(401).json({ message: "Token inválido" });
  }
}

// ==========================
// ADMIN ONLY
// ==========================
export function adminOnly(req, res, next) {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Acesso negado (admin apenas)" });
    }

    next();
  } catch {
    res.status(403).json({ message: "Erro de permissão" });
  }
}

export default authMiddleware;