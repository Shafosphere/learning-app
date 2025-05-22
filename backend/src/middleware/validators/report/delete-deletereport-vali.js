import { param, validationResult } from "express-validator";
import ApiError from "../../../errors/ApiError.js";
import { getReportById } from "../../../repositories/report.repo.js";

export const deleteReportValidator = [
  // Sprawdzamy, czy id istnieje i jest poprawną liczbą całkowitą
  param("id")
    .exists()
    .withMessage("Report ID is required.")
    .isInt({ gt: 0 })
    .withMessage("Report ID must be a positive integer."),

  // Sprawdzamy, czy raport istnieje w bazie
  param("id").custom(async (value) => {
    const report = await getReportById(value);
    if (!report) {
      throw new Error("Report not found.");
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
