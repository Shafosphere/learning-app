import { param, validationResult } from "express-validator";

export const deleteWordValidator = [
  // Sprawdzamy, czy parametr 'id' istnieje i jest dodatnią liczbą całkowitą
  param("id")
    .exists()
    .withMessage("Word id is required.")
    .isInt({ gt: 0 })
    .withMessage("Word id must be a positive integer."),

  // Middleware obsługujący błędy walidacji
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];
