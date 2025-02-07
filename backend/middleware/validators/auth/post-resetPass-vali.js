import { body, validationResult } from "express-validator";
import VALIDATION_RULES from "../validationConfig.js";

export const resetPasswordValidationRules = [
  // Token resetujący jest wymagany
  body("token").notEmpty().withMessage("Reset token is required."),

  // Nowe hasło - silna walidacja
  body("password")
    .isLength({
      min: VALIDATION_RULES.PASSWORD.MIN_LENGTH,
      max: VALIDATION_RULES.PASSWORD.MAX_LENGTH,
    })
    .withMessage(
      `Password must be between ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} and ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} characters.`
    )
    .matches(VALIDATION_RULES.PASSWORD.REGEX.UPPER)
    .withMessage("Password must contain at least one uppercase letter.")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.LOWER)
    .withMessage("Password must contain at least one lowercase letter.")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.DIGIT)
    .withMessage("Password must contain at least one digit.")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.SPECIAL)
    .withMessage("Password must contain at least one special character.")
    .trim(),

  // Middleware obsługujący błędy walidacji
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
