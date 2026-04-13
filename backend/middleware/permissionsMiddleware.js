// middleware/permissionsMiddleware.js
export function permissionsMiddleware(allowedRoles) {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: "Unauthorized", message: "Unauthorized" });
        }

        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({ error: "Forbidden", message: "Forbidden" });
        }

       return next();
    };
}