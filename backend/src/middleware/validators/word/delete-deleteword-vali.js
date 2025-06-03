import { param, validationResult } from "express-validator";
import { throwErr } from "../../../errors/throwErr.js";
import { getErrorParams } from "../../getErrorParams.js";

export const deleteWordValidator = [
  /* ─────────── ID EXISTS & IS POSITIVE INT ─────────── */
  param("id")
    .exists({ checkFalsy: true })
    .withMessage("ERR_WORD_ID_REQUIRED")
    .isInt({ gt: 0 })
    .withMessage("ERR_WORD_ID_INVALID")
    .toInt(),

  /* ─────────── HANDLE VALIDATION ERRORS ─────────── */
  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors = result.array().map((err) => ({
        field: err.param,
        message: err.msg, // "ERR_WORD_ID_REQUIRED" or "ERR_WORD_ID_INVALID"
        params: getErrorParams(err.msg),
      }));
      return next(throwErr("VALIDATION", errors));
    }
    next();
  },
];
