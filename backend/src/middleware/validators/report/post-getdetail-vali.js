import { body, validationResult } from "express-validator";
import { getReportById } from "../../../repositories/userModel.js";

export const getDetailReportValidator = [
  // Sprawdzamy, czy `id` istnieje i jest poprawną liczbą całkowitą
  body("id")
    .exists({ checkFalsy: true })
    .withMessage("Report ID is required.")
    .isInt({ gt: 0 })
    .withMessage("Report ID must be a positive integer."),

  // Sprawdzamy, czy raport istnieje w bazie
  body("id").custom(async (value) => {
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
