import { body, validationResult } from "express-validator";
import ApiError from "../../../errors/ApiError.js";
import VALIDATION_RULES from "../../validationConfig.js";

export const updateUsersValidator = [
  // 1) Zamieniamy obiekt keyed-by-ID na tablicę z polem id:
  (req, res, next) => {
    const { editedRows } = req.body;
    if (
      editedRows &&
      typeof editedRows === "object" &&
      !Array.isArray(editedRows)
    ) {
      req.body.editedRows = Object.entries(editedRows).map(
        ([key, row]) => ({ id: Number(key), ...row })
      );
    }
    next();
  },

  // 2) Sprawdzamy, czy teraz mamy tablicę i że nie jest pusta:
  body("editedRows")
    .exists({ checkFalsy: true })
    .withMessage("editedRows is required.")
    .isArray()
    .withMessage("editedRows must be an array.")
    .custom((arr) => arr.length > 0)
    .withMessage("editedRows cannot be empty."),

  // 3) ID mamy już jako pole po normalizacji, więc walidujemy dalej:
  body("editedRows.*.id")
    .isInt({ gt: 0 })
    .withMessage("User ID must be a positive integer."),

  body("editedRows.*.username")
    .exists()
    .withMessage("Username is required.")
    .isString()
    .withMessage("Username must be a string.")
    .isLength({
      min: VALIDATION_RULES.USERNAME.MIN_LENGTH,
      max: VALIDATION_RULES.USERNAME.MAX_LENGTH,
    })
    .withMessage(
      `Username must be between ${VALIDATION_RULES.USERNAME.MIN_LENGTH} and ${VALIDATION_RULES.USERNAME.MAX_LENGTH} characters.`
    )
    .matches(VALIDATION_RULES.USERNAME.REGEX)
    .withMessage(
      "Username can only contain letters, numbers, and underscores."
    ),

  body("editedRows.*.email")
    .exists()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Invalid email format.")
    .isLength({ max: VALIDATION_RULES.EMAIL.MAX_LENGTH })
    .withMessage(
      `Email cannot be longer than ${VALIDATION_RULES.EMAIL.MAX_LENGTH} characters.`
    )
    .normalizeEmail(),

  body("editedRows.*.role")
    .exists()
    .withMessage("Role is required.")
    .isIn(["admin", "user", "moderator"])
    .withMessage("Role must be 'admin', 'user' or 'moderator'."),

  body("editedRows.*.ban")
    .exists()
    .withMessage("Ban status is required.")
    .isBoolean()
    .withMessage("Ban must be true or false."),

  body("editedRows.*.password")
    .optional()
    .isLength({
      min: VALIDATION_RULES.PASSWORD.MIN_LENGTH,
      max: VALIDATION_RULES.PASSWORD.MAX_LENGTH,
    })
    .withMessage(
      `Password must be between ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} and ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} characters.`
    )
    .matches(VALIDATION_RULES.PASSWORD.REGEX.UPPER)
    .withMessage("Password must contain at least one uppercase letter.")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.LOWER)
    .withMessage("Password must contain at least one lowercase letter.")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.DIGIT)
    .withMessage("Password must contain at least one number.")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.SPECIAL)
    .withMessage("Password must contain at least one special character."),

  // 4) Obsługa błędów:
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
