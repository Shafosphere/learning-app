import { body, validationResult } from "express-validator";
import VALIDATION_RULES from "../../validationConfig.js";
import { getErrorParams } from "../../getErrorParams.js";

export const resetPasswordLinkValidationRules = [
  // Walidacja adresu e-mail
  body("email")
    .isEmail()
    .withMessage("ERR_INVALID_EMAIL_FORMAT") // Zwracamy kod błędu
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
    const errors = validationResult(req)
      .array()
      .map((error) => ({
        ...error,
        params: getErrorParams(error.msg), // Dołącz parametry, jeśli potrzebne
      }));

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    next();
  },
];
