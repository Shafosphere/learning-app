import { body, validationResult } from "express-validator";
import ApiError from "../../../errors/ApiError.js";
import VALIDATION_RULES from "../../validationConfig.js";
import { getErrorParams } from "../../getErrorParams.js";

export const accountUpdateValidationRules = [
  // Username - optional but must meet length and character requirements
  body("username")
    .optional()
    .trim()
    .isLength({
      min: VALIDATION_RULES.USERNAME.MIN_LENGTH,
      max: VALIDATION_RULES.USERNAME.MAX_LENGTH,
    })
    .withMessage("ERR_USERNAME_LENGTH")
    .matches(VALIDATION_RULES.USERNAME.REGEX)
    .withMessage("ERR_USERNAME_INVALID_CHARS"),

  // Email - optional but must be valid email and max length
  body("email")
    .optional()
    .isEmail()
    .withMessage("ERR_INVALID_EMAIL_FORMAT")
    .isLength({ max: VALIDATION_RULES.EMAIL.MAX_LENGTH })
    .withMessage("ERR_EMAIL_TOO_LONG")
    .normalizeEmail(),

  // Old password - optional but must meet length requirements
  body("oldPass")
    .optional()
    .trim()
    .isLength({
      min: VALIDATION_RULES.PASSWORD.MIN_LENGTH,
      max: VALIDATION_RULES.PASSWORD.MAX_LENGTH,
    })
    .withMessage("ERR_PASSWORD_LENGTH"),

  // New password - optional but must be secure
  body("newPass")
    .optional()
    .trim()
    .isLength({
      min: VALIDATION_RULES.PASSWORD.MIN_LENGTH,
      max: VALIDATION_RULES.PASSWORD.MAX_LENGTH,
    })
    .withMessage("ERR_PASSWORD_LENGTH")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.UPPER)
    .withMessage("ERR_PASSWORD_UPPERCASE")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.LOWER)
    .withMessage("ERR_PASSWORD_LOWERCASE")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.DIGIT)
    .withMessage("ERR_PASSWORD_DIGIT")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.SPECIAL)
    .withMessage("ERR_PASSWORD_SPECIAL_CHAR"),

  // Confirm password - optional, trim and must match newPass
  body("confirmPass")
    .optional()
    .trim()
    .custom((value, { req }) => {
      if (req.body.newPass && value !== req.body.newPass) {
        throw new Error("ERR_PASSWORD_MISMATCH");
      }
      return true;
    }),

  // Avatar - optional but must be integer between 1 and 4
  body("avatar")
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage("ERR_INVALID_AVATAR"),

  // Middleware obsługujący błędy walidacji
  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors = result.array().map((err) => ({
        field: err.param,
        message: err.msg,
        params: getErrorParams(err.msg),
      }));
      return next(
        new ApiError(400, "ERR_VALIDATION", "Validation error", errors)
      );
    }
    next();
  },
];
