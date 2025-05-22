import { body, validationResult } from "express-validator";
import ApiError from "../../../errors/ApiError.js";
import VALIDATION_RULES from "../../validationConfig.js";
import { getErrorParams } from "../../getErrorParams.js";

export const resetPasswordLinkValidationRules = [
  // Walidacja adresu e-mail
  body("email")
    .isEmail()
    .withMessage("ERR_INVALID_EMAIL_FORMAT")
    .isLength({ max: VALIDATION_RULES.EMAIL.MAX_LENGTH })
    .withMessage("ERR_EMAIL_TOO_LONG")
    .normalizeEmail(),

  // Walidacja języka (opcjonalnie)
  body("language")
    .optional()
    .isIn(["pl", "en"])
    .withMessage("ERR_INVALID_LANGUAGE"),

  // Middleware do obsługi błędów walidacji
  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors = result.array().map((error) => ({
        field: error.param,
        message: error.msg,
        params: getErrorParams(error.msg),
      }));
      return next(
        new ApiError(400, "ERR_VALIDATION", "Validation error", errors)
      );
    }
    next();
  },
];
