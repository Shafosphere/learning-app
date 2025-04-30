import { body, validationResult } from "express-validator";
import { searchWordById } from "../../../repositories/userModel.js";

export const learnWordValidator = [
  // Sprawdzamy, czy wordId istnieje i jest poprawną liczbą całkowitą
  body("wordId")
    .exists({ checkFalsy: true })
    .withMessage("Word ID is required.")
    .isInt({ gt: 0 })
    .withMessage("Word ID must be a positive integer.")
    .toInt(),

  // Opcjonalne: sprawdzamy, czy słowo istnieje w bazie
  body("wordId").custom(async (value) => {
    const word = await searchWordById(value);
    if (!word) {
      throw new Error("Word not found.");
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
