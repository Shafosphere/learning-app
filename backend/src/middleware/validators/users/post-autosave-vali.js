import { body, validationResult } from "express-validator";
import { throwErr } from "../../../errors/throwErr.js";
import { getErrorParams } from "../../getErrorParams.js";

// Lista dozwolonych boxNames
const ALLOWED_BOXES = ["boxOne", "boxTwo", "boxThree", "boxFour", "boxFive"];

export const autoSaveValidator = [
  /* ─────────── LEVEL ─────────── */
  body("level")
    .exists({ checkFalsy: true })
    .withMessage("ERR_LEVEL_REQUIRED")
    .isIn(["B2", "C1"])
    .withMessage("ERR_LEVEL_INVALID"),

  /* ─────────── DEVICE ID ─────────── */
  body("deviceId")
    .exists({ checkFalsy: true })
    .withMessage("ERR_DEVICE_ID_REQUIRED")
    .isUUID(4)
    .withMessage("ERR_DEVICE_ID_INVALID"),

  /* ─────────── WORDS ARRAY ─────────── */
  body("words")
    .exists({ checkFalsy: true })
    .withMessage("ERR_WORDS_REQUIRED")
    .isArray({ min: 1 })
    .withMessage("ERR_WORDS_NOT_ARRAY")
    .custom((words) => {
      for (const word of words) {
        if (!word.id || typeof word.id !== "number" || word.id < 1) {
          throw new Error("ERR_WORD_ID_INVALID");
        }
        if (!ALLOWED_BOXES.includes(word.boxName)) {
          throw new Error("ERR_BOX_NAME_INVALID");
        }
      }
      return true;
    }),

  /* ─────────── PATCH NUMBER ─────────── */
  body("patchNumber")
    .exists({ checkFalsy: true })
    .withMessage("ERR_PATCH_NUMBER_REQUIRED")
    .isInt({ min: 0 })
    .withMessage("ERR_PATCH_NUMBER_INVALID")
    .toInt(),

  /* ─────────── HANDLE VALIDATION ERRORS ─────────── */
  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors = result.array().map((err) => ({
        field: err.param,
        message: err.msg, // np. "ERR_LEVEL_INVALID"
        params: getErrorParams(err.msg),
      }));
      return next(throwErr("VALIDATION", errors));
    }
    next();
  },
];
