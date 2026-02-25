const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Usuário não autenticado" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Acesso restrito a administradores" });
  }

  return next(); // return added for consistent-return
};

export default adminOnly;
export { adminOnly };