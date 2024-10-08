// Middleware do autoryzacji administratora
import jwt from "jsonwebtoken";

const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied.",
    });
  }
  next();
};

export default authorizeAdmin;