import { param, validationResult } from "express-validator";
import { getReportById } from "../../../models/userModel.js";
export const deleteReportValidator = [
  // Sprawdzamy, czy id istnieje i jest poprawną liczbą całkowitą
  param("id")
    .exists()
    .withMessage("Report ID is required.")
    .isInt({ gt: 0 })
    .withMessage("Report ID must be a positive integer."),

  // Opcjonalne: sprawdzamy, czy raport istnieje w bazie
  param("id").custom(async (value) => {
    const report = await getReportById(value);
    if (!report) {
      throw new Error("Report not found.");
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
