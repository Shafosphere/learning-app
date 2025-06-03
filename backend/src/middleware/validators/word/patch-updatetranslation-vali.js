import { body, validationResult } from "express-validator";
import { throwErr } from "../../../errors/throwErr.js";
import { getErrorParams } from "../../getErrorParams.js";

export const updateTranslationsValidator = [
  /* ─────────── WORD OBJECT ─────────── */
  body("word")
    .exists({ checkFalsy: true })
    .withMessage("ERR_WORD_OBJECT_REQUIRED")
    .isObject()
    .withMessage("ERR_WORD_NOT_OBJECT"),

  /* ─────────── TRANSLATIONS ARRAY ─────────── */
  body("word.translations")
    .exists({ checkFalsy: true })
    .withMessage("ERR_TRANSLATIONS_REQUIRED")
    .isArray({ min: 1 })
    .withMessage("ERR_TRANSLATIONS_NOT_ARRAY"),

  /* ─────────── EACH TRANSLATION.TEXT ─────────── */
  body("word.translations.*.translation")
    .exists({ checkFalsy: true })
    .withMessage("ERR_TRANSLATION_TEXT_REQUIRED")
    .isString()
    .withMessage("ERR_TRANSLATION_TEXT_NOT_STRING")
    .trim(),

  /* ─────────── EACH TRANSLATION.WORD_ID ─────────── */
  body("word.translations.*.word_id")
    .exists({ checkFalsy: true })
    .withMessage("ERR_WORD_ID_REQUIRED")
    .isInt({ gt: 0 })
    .withMessage("ERR_WORD_ID_INVALID")
    .toInt(),

  /* ─────────── EACH TRANSLATION.LANGUAGE ─────────── */
  body("word.translations.*.language")
    .exists({ checkFalsy: true })
    .withMessage("ERR_LANGUAGE_REQUIRED")
    .isString()
    .withMessage("ERR_LANGUAGE_NOT_STRING")
    .trim(),

  /* ─────────── TRANSLATION.DESCRIPTION ─────────── */
  body("word.translations.*.description")
    .optional()
    .isString()
    .withMessage("ERR_DESCRIPTION_NOT_STRING")
    .trim(),

  /* ─────────── HANDLE VALIDATION ERRORS ─────────── */
  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors = result.array().map((err) => ({
        field: err.param,
        message: err.msg, // e.g. "ERR_TRANSLATION_TEXT_NOT_STRING"
        params: getErrorParams(err.msg),
      }));
      return next(throwErr("VALIDATION", errors));
    }
    next();
  },
];
