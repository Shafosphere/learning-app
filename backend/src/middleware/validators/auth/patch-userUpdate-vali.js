import { body, validationResult } from "express-validator";
import ApiError from "../../../errors/ApiError.js";
import VALIDATION_RULES from "../../validationConfig.js";
import { getErrorParams } from "../../getErrorParams.js";

export const accountUpdateValidationRules = [
  /* ─────────── USERNAME ─────────── */
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

  /* ─────────── EMAIL ─────────── */
  body("email")
    .optional()
    .isEmail()
    .withMessage("ERR_INVALID_EMAIL_FORMAT")
    .isLength({ max: VALIDATION_RULES.EMAIL.MAX_LENGTH })
    .withMessage("ERR_EMAIL_TOO_LONG")
    .normalizeEmail(),

  /* ─────────── OLD PASSWORD ─────────── */
  body("oldPass")
    .optional()
    .trim()
    .isLength({
      min: VALIDATION_RULES.PASSWORD.MIN_LENGTH,
      max: VALIDATION_RULES.PASSWORD.MAX_LENGTH,
    })
    .withMessage("ERR_PASSWORD_LENGTH"),

  /* ─────────── NEW PASSWORD ─────────── */
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

  /* ─────────── CONFIRM PASSWORD ─────────── */
  body("confirmPass")
    .optional()
    .trim()
    .custom((value, { req }) => {
      if (req.body.newPass && value !== req.body.newPass) {
        throw new Error("ERR_PASSWORD_MISMATCH"); // trafia do errors[]
      }
      return true;
    }),

  /* ─────────── AVATAR ─────────── */
  body("avatar")
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage("ERR_INVALID_AVATAR"),

  /* ─────────── OBSŁUGA BŁĘDÓW ─────────── */
  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors = result.array().map((err) => ({
        field: err.param,
        message: err.msg, // np. "ERR_PASSWORD_MISMATCH"
        params: getErrorParams(err.msg),
      }));
      return next(throwErr("VALIDATION", errors)); // klucz mapy ERRORS
    }
    next();
  },
];
