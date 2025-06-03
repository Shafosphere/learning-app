import { body, validationResult } from "express-validator";
import { searchWordById } from "../../../repositories/word.repo.js";
import { throwErr } from "../../../errors/throwErr.js";
import { getErrorParams } from "../../getErrorParams.js";

export const updateReportValidator = [
  /* ─────────── REPORT OBJECT ─────────── */
  body("report")
    .exists({ checkFalsy: true })
    .withMessage("ERR_REPORT_OBJECT_REQUIRED")
    .isObject()
    .withMessage("ERR_REPORT_OBJECT_NOT_OBJECT"),

  /* ─────────── TRANSLATIONS ARRAY ─────────── */
  body("report.translations")
    .exists({ checkFalsy: true })
    .withMessage("ERR_TRANSLATIONS_REQUIRED")
    .isArray({ min: 1 })
    .withMessage("ERR_TRANSLATIONS_NOT_ARRAY"),

  /* ─────────── EACH TRANSLATION.TEXT ─────────── */
  body("report.translations.*.translation")
    .exists({ checkFalsy: true })
    .withMessage("ERR_TRANSLATION_TEXT_REQUIRED")
    .isString()
    .withMessage("ERR_TRANSLATION_TEXT_NOT_STRING")
    .isLength({ max: 500 })
    .withMessage("ERR_TRANSLATION_TEXT_TOO_LONG")
    .trim(),

  /* ─────────── EACH TRANSLATION.DESCRIPTION ─────────── */
  body("report.translations.*.description")
    .optional()
    .isString()
    .withMessage("ERR_DESCRIPTION_NOT_STRING")
    .isLength({ max: 1000 })
    .withMessage("ERR_DESCRIPTION_TOO_LONG")
    .trim(),

  /* ─────────── EACH TRANSLATION.WORD_ID ─────────── */
  body("report.translations.*.word_id")
    .exists()
    .withMessage("ERR_WORD_ID_REQUIRED")
    .isInt({ gt: 0 })
    .withMessage("ERR_WORD_ID_INVALID"),

  /* ─────────── EACH TRANSLATION.LANGUAGE ─────────── */
  body("report.translations.*.language")
    .exists()
    .withMessage("ERR_LANGUAGE_REQUIRED")
    .isIn(["pl", "en"])
    .withMessage("ERR_LANGUAGE_INVALID"),

  /* ─────────── WORD_ID EXISTS IN DB ─────────── */
  body("report.translations.*.word_id").custom(async (value) => {
    const word = await searchWordById(value);
    if (!word) {
      throw new Error("ERR_WORD_ID_NOT_FOUND");
    }
    return true;
  }),

  /* ─────────── HANDLE VALIDATION ERRORS ─────────── */
  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors = result.array().map((err) => ({
        field: err.param,
        message: err.msg,
        params: getErrorParams(err.msg),
      }));
      return next(throwErr("VALIDATION", errors));
    }
    next();
  },
];
