import jwt from 'jsonwebtoken';
import { config } from '../config.js';

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token; // Pobieranie tokenu z ciasteczka
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
    req.user = user; // Przypisywanie użytkownika do req, aby inne funkcje mogły z niego korzystać
    next(); // Kontynuacja przetwarzania żądania
  });
};

export default authenticateToken;
