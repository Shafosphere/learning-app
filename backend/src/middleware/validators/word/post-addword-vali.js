import { body, validationResult } from "express-validator";
import ApiError from "../../../errors/ApiError.js";

export const addWordValidator = [
  // Sprawdzamy, czy w ciele żądania znajduje się obiekt "word"
  body("word")
    .exists({ checkFalsy: true })
    .withMessage("Word object is required.")
    .isObject()
    .withMessage("Word must be an object."),

  // Sprawdzamy, czy "translations" istnieje i jest tablicą
  body("word.translations")
    .exists({ checkFalsy: true })
    .withMessage("Translations data is missing.")
    .isArray({ min: 1 })
    .withMessage("Translations must be a non-empty array."),

  // Dla każdego tłumaczenia sprawdzamy, czy są właściwe pola
  body("word.translations.*.language")
    .exists({ checkFalsy: true })
    .withMessage("Each translation must have a language.")
    .isString(),
  body("word.translations.*.translation")
    .exists({ checkFalsy: true })
    .withMessage("Each translation must have a translation text.")
    .isString(),

  // Sprawdzamy, czy w tłumaczeniach znajduje się tłumaczenie angielskie
  body("word.translations").custom((translations) => {
    const hasEnglish = translations.some((t) => t.language === "en");
    if (!hasEnglish) {
      throw new Error("English translation is required.");
    }
    return true;
  }),

  // Walidacja poziomu słowa
  body("word.level")
    .exists({ checkFalsy: true })
    .withMessage("Word level is required.")
    .isIn(["B2", "C1"])
    .withMessage("Word level must be either 'B2' or 'C1'."),

  // Middleware obsługujący błędy walidacji
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new ApiError(400, "ERR_VALIDATION", "Validation error", errors.array())
      );
    }
    next();
  },
];
