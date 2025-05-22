import { body, validationResult } from "express-validator";

import ApiError from "../../../errors/ApiError.js";

export const getWordDetailValidator = [
  // Sprawdzamy, czy id istnieje i jest poprawną liczbą całkowitą
  body("id")
    .exists({ checkFalsy: true })
    .withMessage("Word ID is required.")
    .isInt({ gt: 0, lt: 100000 })
    .withMessage("Word ID must be a positive integer less than 100000."),

  // Middleware do obsługi błędów walidacji
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
