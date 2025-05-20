import jwt from "jsonwebtoken";
import { config } from "../../../config/config.js";
import ApiError from "../../../errors/ApiError.js";

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return next(new ApiError(
      403,
      "ERR_TOKEN_NOT_FOUND",
      "Token not found"
    ));
  }

  jwt.verify(token, config.tokenKey, (err, user) => {
    if (err) {
      return next(new ApiError(
        403,
        "ERR_INVALID_TOKEN",
        "Invalid token"
      ));
    }
    req.user = {
      ...user,
      expiresAt: user.exp * 1000
    };
    next();
  });
};

export default authenticateToken;