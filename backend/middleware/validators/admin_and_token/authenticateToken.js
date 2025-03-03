import jwt from "jsonwebtoken";
import { config } from "../../../config.js";

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(403).json({
      success: false,
      message: "Token not found. Please login.",
    });
  }

  jwt.verify(token, config.tokenKey, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token. Please login again.",
      });
    }
    req.user = {
      ...user,
      expiresAt: user.exp * 1000 // Konwersja sekund na milisekundy
    };
    next();
  });
};

export default authenticateToken;
