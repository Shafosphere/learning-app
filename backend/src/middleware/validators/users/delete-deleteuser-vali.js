import { param, validationResult } from "express-validator";
import ApiError from "../../../errors/ApiError.js";
import { getUserById } from "../../../repositories/user.repo.js";

export const deleteUserValidator = [
  // Sprawdzamy, czy parametr 'id' istnieje i jest dodatnią liczbą całkowitą mniejszą niż 1 000 000
  param("id")
    .exists({ checkFalsy: true })
    .withMessage("User ID is required.")
    .isInt({ gt: 0, lt: 1000000 })
    .withMessage("User ID must be a positive integer less than 1,000,000.")
    .toInt(),

  // Sprawdzamy, czy użytkownik istnieje w bazie
  param("id").custom(async (value) => {
    const user = await getUserById(value);
    if (!user) {
      throw new Error("User not found.");
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
