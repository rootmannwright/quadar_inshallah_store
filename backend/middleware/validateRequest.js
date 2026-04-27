export const validateRequest = (schema) => (req, res, next) => {
  try {
    if (schema.body) {
      req.body = schema.body.parse(req.body);
    }

    if (schema.params) {
      req.params = schema.params.parse(req.params);
    }

    if (schema.query) {
      req.query = schema.query.parse(req.query);
    }

    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Dados inválidos",
      errors: error.errors
    });
  }
};