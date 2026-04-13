// middleware/validateRequest.js
export const validateRequest = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid request data",
      errors: error.errors,
    });
  }
};