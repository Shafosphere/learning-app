import { body, validationResult } from "express-validator";
import { searchWordById } from "../../../repositories/word.repo.js";
import { throwErr } from "../../../errors/throwErr.js";
import { getErrorParams } from "../../getErrorParams.js";

export const learnWordValidator = [
  /* ─────────── WORD ID ─────────── */
  body("wordId")
    .exists({ checkFalsy: true })
    .withMessage("ERR_WORD_ID_REQUIRED")
    .isInt({ gt: 0 })
    .withMessage("ERR_WORD_ID_INVALID")
    .toInt(),

  /* ─────────── WORD EXISTS ─────────── */
  body("wordId").custom(async (value) => {
    const word = await searchWordById(value);
    if (!word) {
      throw new Error("ERR_WORD_NOT_FOUND");
    }
    return true;
  }),

  /* ─────────── HANDLE VALIDATION ERRORS ─────────── */
  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors = result.array().map((err) => ({
        field: err.param,
        message: err.msg, // np. "ERR_WORD_ID_INVALID" lub "ERR_WORD_NOT_FOUND"
        params: getErrorParams(err.msg),
      }));
      return next(throwErr("VALIDATION", errors));
    }
    next();
  },
];
