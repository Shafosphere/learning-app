import { body, validationResult } from "express-validator";
import ApiError from "../../../errors/ApiError.js";
import VALIDATION_RULES from "../../validationConfig.js";
import { getErrorParams } from "../../getErrorParams.js";

export const resetPasswordValidationRules = [
  // Token resetujący jest wymagany
  body("token").notEmpty().withMessage("ERR_RESET_TOKEN_REQUIRED"),

  // Nowe hasło – silna walidacja
  body("password")
    .isLength({
      min: VALIDATION_RULES.PASSWORD.MIN_LENGTH,
      max: VALIDATION_RULES.PASSWORD.MAX_LENGTH,
    })
    .withMessage("ERR_RESET_PASSWORD_LENGTH")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.UPPER)
    .withMessage("ERR_RESET_PASSWORD_UPPERCASE")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.LOWER)
    .withMessage("ERR_RESET_PASSWORD_LOWERCASE")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.DIGIT)
    .withMessage("ERR_RESET_PASSWORD_DIGIT")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.SPECIAL)
    .withMessage("ERR_RESET_PASSWORD_SPECIAL")
    .trim(),

  // Middleware obsługujący błędy walidacji
  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      // Używamy getErrorParams, aby uzyskać dodatkowe dane do każdego błędu
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
