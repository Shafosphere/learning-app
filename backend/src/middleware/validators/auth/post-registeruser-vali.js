import { body, validationResult } from "express-validator";
import VALIDATION_RULES from "../../validationConfig.js";
import { getErrorParams } from "../../getErrorParams.js";
import { throwErr } from "../../../errors/throwErr.js";

export const registerValidator = [
  /* ─────────── USERNAME ─────────── */
  body("username")
    .isLength({
      min: VALIDATION_RULES.USERNAME.MIN_LENGTH,
      max: VALIDATION_RULES.USERNAME.MAX_LENGTH,
    })
    .withMessage("ERR_USERNAME_LENGTH")
    .matches(VALIDATION_RULES.USERNAME.REGEX)
    .withMessage("ERR_USERNAME_INVALID_CHARS")
    .trim(),

  /* ─────────── EMAIL ─────────── */
  body("email")
    .isEmail()
    .withMessage("ERR_INVALID_EMAIL")
    .isLength({ max: VALIDATION_RULES.EMAIL.MAX_LENGTH })
    .withMessage("ERR_EMAIL_TOO_LONG")
    .normalizeEmail(),

  /* ─────────── PASSWORD ─────────── */
  body("password")
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
    .withMessage("ERR_PASSWORD_SPECIAL_CHAR")
    .trim(),

  /* ─────────── obsługa błędów ─────────── */
  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors = result.array().map((err) => ({
        field: err.param,
        message: err.msg, // „ERR_…”
        params: getErrorParams(err.msg), // {min}/{max} itp.
      }));
      return next(throwErr("VALIDATION", errors)); // ← KLUCZ z mapy ERRORS
    }
    next();
  },
];
