// src/middleware/errorHandler.js
export default function errorHandler(err, req, res, next) {
  console.error(err);

  res.status(err.statusCode || 500).json({
    code: err.code || "ERR_SERVER",
    message: err.message || "Unknown error.",
    errors: err.details || undefined,
  });
}
