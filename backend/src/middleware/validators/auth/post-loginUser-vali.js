import { body, validationResult } from "express-validator";
import ApiError from "../../../errors/ApiError.js";
import VALIDATION_RULES from "../../validationConfig.js";
import { getErrorParams } from "../../getErrorParams.js";

export const loginValidator = [
  // Username validation
  body("username")
    .isLength({
      min: VALIDATION_RULES.USERNAME.MIN_LENGTH,
      max: VALIDATION_RULES.USERNAME.MAX_LENGTH,
    })
    .withMessage("ERR_LOGIN_USERNAME_LENGTH")
    .matches(VALIDATION_RULES.USERNAME.REGEX)
    .withMessage("ERR_LOGIN_USERNAME_INVALID_CHARS")
    .trim(),

  // Password validation
  body("password")
    .isLength({
      min: VALIDATION_RULES.PASSWORD.MIN_LENGTH,
      max: VALIDATION_RULES.PASSWORD.MAX_LENGTH,
    })
    .withMessage("ERR_LOGIN_PASSWORD_LENGTH")
    .trim(),

  // Middleware for handling validation errors
  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors = result.array().map((err) => ({
        field: err.param,
        message: err.msg,
        params: getErrorParams(err.msg),
      }));
      return next(
        new ApiError(400, "ERR_VALIDATION", "Validation error", errors)
      );
    }
    next();
  },
];
