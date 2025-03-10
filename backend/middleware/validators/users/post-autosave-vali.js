// auto-save-vali.js
import { body, validationResult } from "express-validator";

// Lista dozwolonych boxNames
const ALLOWED_BOXES = ["boxOne", "boxTwo", "boxThree", "boxFour", "boxFive"];

export const autoSaveValidator = [
  // Walidacja pola 'level'
  body("level")
    .exists()
    .withMessage("Level is required")
    .isIn(["B2", "C1"])
    .withMessage("Invalid level. Allowed values: B2, C1"),

  // Walidacja pola 'deviceId'
  body("deviceId")
    .exists()
    .withMessage("Device ID is required")
    .isUUID(4)
    .withMessage("Invalid device ID format. Expected UUID v4"),

  // Walidacja pola 'words'
  body("words")
    .exists()
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
    .exists()
    .withMessage("Patch number is required")
    .isInt({ min: 0 })
    .withMessage("Patch number must be a non-negative integer"),

  // Obsługa błędów walidacji
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }
    next();
  },
];
