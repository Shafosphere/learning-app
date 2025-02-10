import { param, validationResult } from "express-validator";
import { getUserById } from "../../../models/userModel.js";

export const deleteUserValidator = [
  // Sprawdzamy, czy id istnieje i jest poprawną liczbą całkowitą
  param("id")
    .exists({ checkFalsy: true })
    .withMessage("User ID is required.")
    .isInt({ gt: 0, lt: 1000000 })
    .withMessage("User ID must be a positive integer less than 1,000,000.")
    .toInt(),

  // Opcjonalne: sprawdzamy, czy użytkownik istnieje w bazie przed usunięciem
  param("id").custom(async (value) => {
    const user = await getUserById(value);
    if (!user) {
      throw new Error("User not found.");
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
