import { param, validationResult } from "express-validator";
import ApiError from "../../../errors/ApiError.js";

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
      // Rzucamy ApiError z kodem walidacji i szczegółami
      return next(
        new ApiError(400, "ERR_VALIDATION", "Validation error", errors.array())
      );
    }
    next();
  },
];
