import { body, validationResult } from "express-validator";
import ApiError from "../../../errors/ApiError.js";
import { searchWordById } from "../../../repositories/word.repo.js";

export const learnWordValidator = [
  // Sprawdzamy, czy wordId istnieje i jest poprawną liczbą całkowitą
  body("wordId")
    .exists({ checkFalsy: true })
    .withMessage("Word ID is required.")
    .isInt({ gt: 0 })
    .withMessage("Word ID must be a positive integer.")
    .toInt(),

  // Sprawdzamy, czy słowo istnieje w bazie
  body("wordId").custom(async (value) => {
    const word = await searchWordById(value);
    if (!word) {
      throw new Error("Word not found.");
    }
    return true;
  }),

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
