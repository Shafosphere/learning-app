import { body, validationResult } from "express-validator";
import VALIDATION_RULES from "../validationConfig.js";

export const resetPasswordLinkValidationRules = [
  // Walidacja emaila - musi być poprawnym adresem i mieć max. 255 znaków
  body("email")
    .isEmail()
    .withMessage("Invalid email format.")
    .isLength({ max: VALIDATION_RULES.EMAIL.MAX_LENGTH })
    .withMessage(`Email cannot exceed ${VALIDATION_RULES.EMAIL.MAX_LENGTH} characters.`)
    .normalizeEmail(),

  // Walidacja języka - opcjonalny, może być tylko "pl" lub "en"
  body("language")
    .optional()
    .isIn(["pl", "en"])
    .withMessage("Language must be 'pl' or 'en'."),

  // Middleware obsługujący błędy walidacji
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
