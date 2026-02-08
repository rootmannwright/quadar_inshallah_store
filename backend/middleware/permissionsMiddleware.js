
export function permissionsMiddleware(allowedRoles) {
    return (req, res, next) => {
        const user = req.user;

        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized", message: "Unauthorized" });
        }

        if (!allowedRoles.includes(req.userRole)) {
            return res.status(403).json({ error: "Forbidden", message: "Forbidden" });
        }

        next();
    };
}