const adminOnly = (req, res, next) => {
    if (!req.user) {
        // authmiddleware must be used before this middleware to set req.user
        return res.status(401).json({ error: "Usuário não autenticado" });
    }
    // verify user role
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Acesso restrito a administradores" });
    }
    next();
};

export default adminOnly;
export { adminOnly};