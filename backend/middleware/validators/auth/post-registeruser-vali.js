import { body, validationResult } from "express-validator";
import VALIDATION_RULES from "../validationConfig.js";

export const registerValidator = [
  // Walidacja username - min. 4, max. 20 znaków, tylko litery, cyfry i "_"
  body("username")
    .isLength({
      min: VALIDATION_RULES.USERNAME.MIN_LENGTH,
      max: VALIDATION_RULES.USERNAME.MAX_LENGTH,
    })
    .withMessage(
      `Username must be between ${VALIDATION_RULES.USERNAME.MIN_LENGTH} and ${VALIDATION_RULES.USERNAME.MAX_LENGTH} characters.`
    )
    .matches(VALIDATION_RULES.USERNAME.REGEX)
    .withMessage("Username can only contain letters, numbers, and underscores.")
    .trim(),

  // Walidacja email - musi być poprawnym adresem i mieć max. 255 znaków
  body("email")
    .isEmail()
    .withMessage("Invalid email format.")
    .isLength({ max: VALIDATION_RULES.EMAIL.MAX_LENGTH })
    .withMessage(
      `Email cannot exceed ${VALIDATION_RULES.EMAIL.MAX_LENGTH} characters.`
    )
    .normalizeEmail(),

  // Walidacja password - min. 8 znaków, wielka litera, cyfra, znak specjalny
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

  // Middleware do obsługi błędów walidacji
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
