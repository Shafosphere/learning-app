import jwt from "jsonwebtoken";
import { config } from "../../../config.js";

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(403).json({
      success: true,
      message: "ERR_TOKEN_NOT_FOUND",
      code: "ERR_TOKEN_NOT_FOUND"
    });
  }

  jwt.verify(token, config.tokenKey, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: true,
        message: "ERR_INVALID_TOKEN", 
        code: "ERR_INVALID_TOKEN"
      });
    }
    
    req.user = {
      ...user,
      expiresAt: user.exp * 1000
    };
    next();
  });
};

export default authenticateToken;
