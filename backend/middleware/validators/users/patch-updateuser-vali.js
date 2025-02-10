import { body, validationResult } from "express-validator";
import VALIDATION_RULES from "../validationConfig.js";

export const updateUsersValidator = [
  // Sprawdzamy, czy editedRows istnieje i jest obiektem
  body("editedRows")
    .exists({ checkFalsy: true })
    .withMessage("editedRows is required.")
    .isObject()
    .withMessage("editedRows must be an object."),

  // Sprawdzamy, czy editedRows nie jest pusty
  body("editedRows")
    .custom((value) => Object.keys(value).length > 0)
    .withMessage("editedRows cannot be empty."),

  // Sprawdzamy każde pole użytkownika
  body("editedRows.*.id")
    .exists()
    .withMessage("User ID is required.")
    .isInt({ gt: 0 })
    .withMessage("User ID must be a positive integer."),

  body("editedRows.*.username")
    .exists()
    .withMessage("Username is required.")
    .isString()
    .withMessage("Username must be a string.")
    .isLength({
      min: VALIDATION_RULES.USERNAME.MIN_LENGTH,
      max: VALIDATION_RULES.USERNAME.MAX_LENGTH,
    })
    .withMessage(
      `Username must be between ${VALIDATION_RULES.USERNAME.MIN_LENGTH} and ${VALIDATION_RULES.USERNAME.MAX_LENGTH} characters.`
    )
    .matches(VALIDATION_RULES.USERNAME.REGEX)
    .withMessage(
      "Username can only contain letters, numbers, and underscores."
    ),

  body("editedRows.*.email")
    .exists()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Invalid email format.")
    .isLength({ max: VALIDATION_RULES.EMAIL.MAX_LENGTH })
    .withMessage(
      `Email cannot be longer than ${VALIDATION_RULES.EMAIL.MAX_LENGTH} characters.`
    )
    .normalizeEmail(),

  body("editedRows.*.role")
    .exists()
    .withMessage("Role is required.")
    .isIn(["admin", "user", "moderator"])
    .withMessage("Role must be 'admin', 'user' or 'moderator'."),

  body("editedRows.*.ban")
    .exists()
    .withMessage("Ban status is required.")
    .isBoolean()
    .withMessage("Ban must be true or false."),

  // (Opcjonalnie) Walidacja hasła, jeśli edytowanie hasła jest możliwe
  body("editedRows.*.password")
    .optional()
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
    .withMessage("Password must contain at least one number.")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.SPECIAL)
    .withMessage("Password must contain at least one special character."),

  // Middleware obsługujący błędy walidacji
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];
