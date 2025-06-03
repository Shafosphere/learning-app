import { body, validationResult } from "express-validator";
import ApiError from "../../../errors/ApiError.js";
const allowedPageNames = ["flashcards", "vocabulary_C1", "vocabulary_B2"];

export const pageNameValidator = [
  /* ─────────── PAGE_NAME ─────────── */
  body("page_name")
    .exists({ checkFalsy: true })
    .withMessage("ERR_PAGE_NAME_MISSING")
    .isString()
    .withMessage("ERR_PAGE_NAME_NOT_STRING")
    .trim()
    .custom((value) => {
      if (!allowedPageNames.includes(value)) {
        throw new Error("ERR_PAGE_NAME_INVALID");
      }
      return true;
    }),

  /* ─────────── OBSŁUGA BŁĘDÓW ─────────── */
  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors = result.array().map((err) => ({
        field: err.param,
        message: err.msg, // „ERR_…”
        params: getErrorParams(err.msg), // (brak parametrów – zwróci {})
      }));
      return next(throwErr("VALIDATION", errors)); // klucz mapy ERRORS
    }
    next();
  },
];
