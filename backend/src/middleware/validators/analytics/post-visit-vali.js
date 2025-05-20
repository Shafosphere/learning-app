import { body, validationResult } from "express-validator";
import ApiError from "../../../errors/ApiError.js";
const allowedPageNames = ["flashcards", "vocabulary_C1", "vocabulary_B2"];

export const pageNameValidator = [
  body("page_name")
    .exists({ checkFalsy: true })
    .withMessage("Brakuje parametru 'page_name'.")
    .isString()
    .withMessage("'page_name' musi być ciągiem znaków.")
    .trim()
    .custom((value) => {
      if (!allowedPageNames.includes(value)) {
        throw new Error(
          `Nieprawidłowa wartość 'page_name'`
        );
      }
      return true;
    }),

  // ten middleware zamiast res.status od razu robi next(ApiError)
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // tworzymy ApiError z details = tablica błędów
      return next(
        new ApiError(400, "ERR_VALIDATION", "Validation error", errors.array())
      );
    }
    next();
  },
];
