import { body, validationResult } from "express-validator";

const allowedPageNames = ["flashcards", "vocabulary_C1", "vocabulary_B2"];

export const pageNameValidator = [
  // Sprawdzamy, czy parametr "page_name" istnieje i jest typu string
  body("page_name")
    .exists({ checkFalsy: true })
    .withMessage("Brakuje parametru 'page_name' w treści żądania.")
    .isString()
    .withMessage("'page_name' musi być ciągiem znaków.")
    .trim()
    // Sprawdzamy, czy wartość po przycięciu należy do listy dozwolonych
    .custom((value) => {
      if (!allowedPageNames.includes(value)) {
        throw new Error(
          `Nieprawidłowa wartość 'page_name'. Dozwolone wartości to: ${allowedPageNames.join(", ")}.`
        );
      }
      return true;
    }),

  // Middleware do obsługi błędów walidacji
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];
