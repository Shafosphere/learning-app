import { body, validationResult } from "express-validator";
import VALIDATION_RULES from "../../validationConfig.js";
import { getErrorParams } from "../../getErrorParams.js";
import { throwErr } from "../../../errors/throwErr.js";

export const loginValidator = [
  body("username")
    .isLength({
      min: VALIDATION_RULES.USERNAME.MIN_LENGTH,
      max: VALIDATION_RULES.USERNAME.MAX_LENGTH,
    })
    .withMessage("ERR_LOGIN_USERNAME_LENGTH")
    .matches(VALIDATION_RULES.USERNAME.REGEX)
    .withMessage("ERR_LOGIN_USERNAME_INVALID_CHARS")
    .trim(),

  body("password")
    .isLength({
      min: VALIDATION_RULES.PASSWORD.MIN_LENGTH,
      max: VALIDATION_RULES.PASSWORD.MAX_LENGTH,
    })
    .withMessage("ERR_LOGIN_PASSWORD_LENGTH")
    .trim(),

  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors = result.array().map(err => ({
        field:   err.param,
        message: err.msg,           // np. "ERR_LOGIN_USERNAME_LENGTH"
        params:  getErrorParams(err.msg),
      }));
      return next(throwErr("VALIDATION", errors));   // ← KLUCZ, nie code
    }
    next();
  },
];