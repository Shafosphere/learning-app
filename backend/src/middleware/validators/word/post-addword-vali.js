import { body, validationResult } from "express-validator";
import { throwErr } from "../../../errors/throwErr.js";
import { getErrorParams } from "../../getErrorParams.js";

export const addWordValidator = [
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

  /* ─── EACH TRANSLATION.LANGUAGE ─── */
  body("word.translations.*.language")
    .exists({ checkFalsy: true })
    .withMessage("ERR_TRANSLATION_LANGUAGE_REQUIRED")
    .isString()
    .withMessage("ERR_TRANSLATION_LANGUAGE_NOT_STRING")
    .trim(),

  /* ─── EACH TRANSLATION.TEXT ─── */
  body("word.translations.*.translation")
    .exists({ checkFalsy: true })
    .withMessage("ERR_TRANSLATION_TEXT_REQUIRED")
    .isString()
    .withMessage("ERR_TRANSLATION_TEXT_NOT_STRING")
    .trim(),

  /* ─── ENGLISH TRANSLATION REQUIRED ─── */
  body("word.translations").custom((translations) => {
    const hasEnglish =
      Array.isArray(translations) &&
      translations.some((t) => t.language === "en");
    if (!hasEnglish) {
      throw new Error("ERR_ENGLISH_TRANSLATION_REQUIRED");
    }
    return true;
  }),

  /* ─────────── WORD LEVEL ─────────── */
  body("word.level")
    .exists({ checkFalsy: true })
    .withMessage("ERR_WORD_LEVEL_REQUIRED")
    .isIn(["B2", "C1"])
    .withMessage("ERR_WORD_LEVEL_INVALID"),

  /* ─────────── HANDLE VALIDATION ERRORS ─────────── */
  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors = result.array().map((err) => ({
        field: err.param,
        message: err.msg, // e.g. "ERR_WORD_NOT_OBJECT"
        params: getErrorParams(err.msg),
      }));
      return next(throwErr("VALIDATION", errors));
    }
    next();
  },
];
