import { body, validationResult } from "express-validator";
import VALIDATION_RULES from "../validationConfig.js";

export const loginValidator = [
  // Username - min. 4, max. 20 znaków, tylko litery, cyfry i "_"
  body("username")
    .isLength({ min: VALIDATION_RULES.USERNAME.MIN_LENGTH, max: VALIDATION_RULES.USERNAME.MAX_LENGTH })
    .withMessage(
      `Username must be between ${VALIDATION_RULES.USERNAME.MIN_LENGTH} and ${VALIDATION_RULES.USERNAME.MAX_LENGTH} characters.`
    )
    .matches(VALIDATION_RULES.USERNAME.REGEX)
    .withMessage("Username can only contain letters, numbers, and underscores.")
    .trim(),

  // Password - min. 8 znaków, max. 50 znaków
  body("password")
    .isLength({ min: VALIDATION_RULES.PASSWORD.MIN_LENGTH, max: VALIDATION_RULES.PASSWORD.MAX_LENGTH })
    .withMessage(
      `Password must be between ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} and ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} characters.`
    )
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
