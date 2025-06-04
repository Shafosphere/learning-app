import jwt from "jsonwebtoken";
import { config } from "../../../config/config.js";
import { throwErr } from "../../../errors/throwErr.js";

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return next(throwErr("TOKEN_NOT_FOUND")); // 403
  }

  jwt.verify(token, config.tokenKey, (err, user) => {
    if (err) {
      return next(throwErr("INVALID_TOKEN")); // 403
    }
    req.user = {
      ...user,
      expiresAt: user.exp * 1000,
    };
    next();
  });
};

export default authenticateToken;