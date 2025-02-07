import { body, validationResult } from "express-validator";
import VALIDATION_RULES from "../validationConfig.js";

export const accountUpdateValidationRules = [
  // Username - opcjonalnie, ale musi spełniać wymagania
  body("username")
    .optional()
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

  // Email - opcjonalnie, ale musi być poprawnym adresem email i mieć max. 255 znaków
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format.")
    .isLength({ max: VALIDATION_RULES.EMAIL.MAX_LENGTH })
    .withMessage(
      `Email cannot exceed ${VALIDATION_RULES.EMAIL.MAX_LENGTH} characters.`
    )
    .normalizeEmail(),

  // Old password - opcjonalnie, ale musi mieć min. 8 znaków
  body("oldPass")
    .optional()
    .isLength({
      min: VALIDATION_RULES.PASSWORD.MIN_LENGTH,
      max: VALIDATION_RULES.PASSWORD.MAX_LENGTH,
    })
    .withMessage(
      `Old password must be between ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} and ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} characters.`
    )
    .trim(),

  // New password - opcjonalnie, ale musi być bezpieczne
  body("newPass")
    .optional()
    .isLength({
      min: VALIDATION_RULES.PASSWORD.MIN_LENGTH,
      max: VALIDATION_RULES.PASSWORD.MAX_LENGTH,
    })
    .withMessage(
      `New password must be between ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} and ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} characters.`
    )
    .matches(VALIDATION_RULES.PASSWORD.REGEX.UPPER)
    .withMessage("New password must contain at least one uppercase letter.")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.LOWER)
    .withMessage("New password must contain at least one lowercase letter.")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.DIGIT)
    .withMessage("New password must contain at least one digit.")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.SPECIAL)
    .withMessage("New password must contain at least one special character.")
    .trim(),

  // Confirm password - musi być zgodne z newPass, ale tylko jeśli newPass jest podane
  body("confirmPass")
    .optional()
    .custom((value, { req }) => {
      if (req.body.newPass && value !== req.body.newPass) {
        throw new Error("Passwords do not match.");
      }
      return true;
    }),

  // Avatar - jeśli podano, musi być liczbą 1-4
  body("avatar")
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage("Avatar must be a number between 1 and 4."),

  // Middleware obsługujący błędy walidacji
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
