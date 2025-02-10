import { body, validationResult } from "express-validator";
import { searchWordById } from "../../../models/userModel.js";
export const updateReportValidator = [
  // Sprawdzamy, czy `report` istnieje i jest obiektem
  body("report")
    .exists({ checkFalsy: true })
    .withMessage("Report object is required.")
    .isObject()
    .withMessage("Report must be an object."),

  // Sprawdzamy, czy `report.translations` to niepusta tablica
  body("report.translations")
    .exists({ checkFalsy: true })
    .withMessage("Translations array is required.")
    .isArray({ min: 1 })
    .withMessage("Translations must be a non-empty array."),

  // Sprawdzamy każde pole w `translations`
  body("report.translations.*.translation")
    .exists({ checkFalsy: true })
    .withMessage("Each translation must include text.")
    .isString()
    .withMessage("Translation must be a string.")
    .isLength({ max: 500 })
    .withMessage("Translation cannot exceed 500 characters.")
    .trim(),

  body("report.translations.*.description")
    .optional()
    .isString()
    .withMessage("Description must be a string.")
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters.")
    .trim(),

  body("report.translations.*.word_id")
    .exists()
    .withMessage("word_id is required.")
    .isInt({ gt: 0 })
    .withMessage("word_id must be a positive integer."),

  body("report.translations.*.language")
    .exists()
    .withMessage("Language is required.")
    .isIn(["pl", "en"])
    .withMessage("Language must be 'pl' or 'en'."),

  // Opcjonalne: sprawdzamy, czy `word_id` istnieje w bazie
  body("report.translations.*.word_id").custom(async (value) => {
    const word = await searchWordById(value);
    if (!word) {
      throw new Error("word_id not found in database.");
    }
  }),

  // Middleware obsługujący błędy walidacji
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];
