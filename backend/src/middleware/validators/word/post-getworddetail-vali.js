import { body, validationResult } from "express-validator";
import { throwErr } from "../../../errors/throwErr.js";
import { getErrorParams } from "../../getErrorParams.js";

export const getWordDetailValidator = [
  /* ─────────── WORD ID EXISTS & IS POSITIVE INT < 100000 ─────────── */
  body("id")
    .exists({ checkFalsy: true })
    .withMessage("ERR_WORD_ID_REQUIRED")
    .isInt({ gt: 0, lt: 100000 })
    .withMessage("ERR_WORD_ID_INVALID")
    .toInt(),

  /* ─────────── HANDLE VALIDATION ERRORS ─────────── */
  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors = result.array().map(err => ({
        field:   err.param,
        message: err.msg,               // "ERR_WORD_ID_REQUIRED" lub "ERR_WORD_ID_INVALID"
        params:  getErrorParams(err.msg),
      }));
      return next(throwErr("VALIDATION", errors));
    }
    next();
  },
];