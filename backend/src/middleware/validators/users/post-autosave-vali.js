import { body, validationResult } from "express-validator";
import ApiError from "../../../errors/ApiError.js";

// Lista dozwolonych boxNames
const ALLOWED_BOXES = ["boxOne", "boxTwo", "boxThree", "boxFour", "boxFive"];

export const autoSaveValidator = [
  // Walidacja pola 'level'
  body("level")
    .exists({ checkFalsy: true })
    .withMessage("Level is required")
    .isIn(["B2", "C1"])
    .withMessage("Invalid level. Allowed values: B2, C1"),

  // Walidacja pola 'deviceId'
  body("deviceId")
    .exists({ checkFalsy: true })
    .withMessage("Device ID is required")
    .isUUID(4)
    .withMessage("Invalid device ID format. Expected UUID v4"),

  // Walidacja pola 'words'
  body("words")
    .exists({ checkFalsy: true })
    .withMessage("Words array is required")
    .isArray({ min: 1 })
    .withMessage("Words must be a non-empty array")
    .custom((words) => {
      for (const word of words) {
        if (!word.id || typeof word.id !== "number" || word.id < 1) {
          throw new Error("Invalid word ID. Must be a positive number");
        }
        if (!ALLOWED_BOXES.includes(word.boxName)) {
          throw new Error(
            `Invalid boxName. Allowed values: ${ALLOWED_BOXES.join(", ")}`
          );
        }
      }
      return true;
    }),

  // Walidacja pola 'patchNumber'
  body("patchNumber")
    .exists({ checkFalsy: true })
    .withMessage("Patch number is required")
    .isInt({ min: 0 })
    .withMessage("Patch number must be a non-negative integer"),

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
