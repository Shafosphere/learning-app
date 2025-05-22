import { body, validationResult } from "express-validator";
import ApiError from "../../../errors/ApiError.js";

export const updateTranslationsValidator = [
  // Sprawdzamy, czy w ciele żądania znajduje się obiekt "word"
  body("word")
    .exists({ checkFalsy: true })
    .withMessage("Word object is required.")
    .isObject()
    .withMessage("Word must be an object."),

  // Sprawdzamy, czy obiekt "word" ma pole "translations" będące niepustą tablicą
  body("word.translations")
    .exists({ checkFalsy: true })
    .withMessage("Translations data is required.")
    .isArray({ min: 1 })
    .withMessage("Translations must be a non-empty array."),

  // Dla każdego tłumaczenia sprawdzamy, czy są wymagane pola
  body("word.translations.*.translation")
    .exists({ checkFalsy: true })
    .withMessage("Each translation must include the translation text.")
    .isString()
    .withMessage("Translation text must be a string.")
    .trim(),

  body("word.translations.*.word_id")
    .exists({ checkFalsy: true })
    .withMessage("Each translation must include word_id.")
    .isInt({ gt: 0 })
    .withMessage("word_id must be a positive integer."),

  body("word.translations.*.language")
    .exists({ checkFalsy: true })
    .withMessage("Each translation must include a language.")
    .isString()
    .withMessage("Language must be a string.")
    .trim(),

  // Description jest opcjonalne, ale jeśli podane, musi być ciągiem znaków
  body("word.translations.*.description")
    .optional()
    .isString()
    .withMessage("Description must be a string.")
    .trim(),

  // Middleware obsługujący błędy walidacji
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Rzucamy ApiError z kodem walidacji i szczegółami
      return next(
        new ApiError(400, "ERR_VALIDATION", "Validation error", errors.array())
      );
    }
    next();
  },
];
