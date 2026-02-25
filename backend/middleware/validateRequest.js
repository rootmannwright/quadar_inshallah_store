// backend/middleware/validateRequest.js
export function validateRequest(schema) {
    return (req, res, next) => {
        try {
            schema.parse({
                body: req.body,
                params: req.params,
                query: req.query
            });
            next();
        } catch (err) {
            res.status(400).json({
                success: false,
                message: "Invalid request data",
                errors: err.errors
            });
        }
    };
}
