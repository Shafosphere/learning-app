import { body, validationResult } from "express-validator";
import { throwErr } from "../../../errors/throwErr.js";
import VALIDATION_RULES from "../../validationConfig.js";
import { getErrorParams } from "../../getErrorParams.js";

export const resetPasswordLinkValidationRules = [
  /* ─────────── EMAIL ─────────── */
  body("email")
    .isEmail()
    .withMessage("ERR_INVALID_EMAIL_FORMAT")
    .isLength({ max: VALIDATION_RULES.EMAIL.MAX_LENGTH })
    .withMessage("ERR_EMAIL_TOO_LONG")
    .normalizeEmail(),

  /* ─────────── LANGUAGE (opcjonalny) ─────────── */
  body("language")
    .optional()
    .isIn(["pl", "en"])
    .withMessage("ERR_INVALID_LANGUAGE"),

  /* ─────────── obsługa błędów ─────────── */
  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors = result.array().map((err) => ({
        field: err.param, // "email" / "language"
        message: err.msg, // np. "ERR_INVALID_EMAIL_FORMAT"
        params: getErrorParams(err.msg),
      }));
      return next(throwErr("VALIDATION", errors)); // ⇦ KLUCZ mapy ERRORS
    }
    next();
  },
];
