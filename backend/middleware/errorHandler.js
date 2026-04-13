// middleware/errorHandler.js
const errorHandler = (err, req, res,) => {
  console.error("❌ ERROR:", err);

  if (err.name === "CastError") {
    return res.status(400).json({
      message: "ID inválido"
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: Object.values(err.errors).map(e => e.message).join(", ")
    });
  }

  res.status(err.status || 500).json({
    message: err.message || "Erro interno do servidor"
  });
};

export default errorHandler;