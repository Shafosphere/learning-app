import { body, validationResult } from "express-validator";
import VALIDATION_RULES from "../../validationConfig.js";

export const accountUpdateValidationRules = [
  // Username - optional but must meet length and character requirements
  body("username")
    .optional()
    .trim()
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

  // Email - optional but must be valid email and max length
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format.")
    .isLength({ max: VALIDATION_RULES.EMAIL.MAX_LENGTH })
    .withMessage(
      `Email cannot exceed ${VALIDATION_RULES.EMAIL.MAX_LENGTH} characters.`
    )
    .normalizeEmail(),

  // Old password - optional but must meet length requirements
  body("oldPass")
    .optional()
    .trim()
    .isLength({
      min: VALIDATION_RULES.PASSWORD.MIN_LENGTH,
      max: VALIDATION_RULES.PASSWORD.MAX_LENGTH,
    })
    .withMessage(
      `Old password must be between ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} and ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} characters.`
    ),

  // New password - optional but must be secure
  body("newPass")
    .optional()
    .trim()
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
    .withMessage("New password must contain at least one special character."),

  // Confirm password - optional, trim and must match newPass
  body("confirmPass")
    .optional()
    .trim()
    .custom((value, { req }) => {
      if (req.body.newPass && value !== req.body.newPass) {
        throw new Error("Passwords do not match.");
      }
      return true;
    }),

  // Avatar - optional but must be integer between 1 and 4
  body("avatar")
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage("Avatar must be a number between 1 and 4."),

  // Error handler middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
