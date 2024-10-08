// Middleware do weryfikacji tokenu JWT
import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token; // Pobieranie tokenu z ciasteczka
  if (!token) {
    return res.status(403).json({
      success: false,
      message: "Token not found. Please login.",
    });
  }

  jwt.verify(token, process.env.REACT_APP_TOKEN_KEY, (err, user) => {
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
