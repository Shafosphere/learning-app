import { body, validationResult } from "express-validator";
import VALIDATION_RULES from "../../validationConfig.js";
import { getErrorParams } from "../../getErrorParams.js";
import { throwErr } from "../../../errors/throwErr.js";

export const resetPasswordValidationRules = [
  /* ─────────── TOKEN ─────────── */
  body("token").notEmpty().withMessage("ERR_RESET_TOKEN_REQUIRED"),

  /* ─────────── NEW PASSWORD ─────────── */
  body("password")
    .isLength({
      min: VALIDATION_RULES.PASSWORD.MIN_LENGTH,
      max: VALIDATION_RULES.PASSWORD.MAX_LENGTH,
    })
    .withMessage("ERR_RESET_PASSWORD_LENGTH")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.UPPER)
    .withMessage("ERR_RESET_PASSWORD_UPPERCASE")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.LOWER)
    .withMessage("ERR_RESET_PASSWORD_LOWERCASE")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.DIGIT)
    .withMessage("ERR_RESET_PASSWORD_DIGIT")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.SPECIAL)
    .withMessage("ERR_RESET_PASSWORD_SPECIAL")
    .trim(),

  /* ─────────── OBSŁUGA BŁĘDÓW ─────────── */
  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors = result.array().map((err) => ({
        field: err.param,
        message: err.msg, // „ERR_…”
        params: getErrorParams(err.msg),
      }));
      return next(throwErr("VALIDATION", errors)); // klucz mapy ERRORS
    }
    next();
  },
];
