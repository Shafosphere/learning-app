import { body, validationResult } from "express-validator";
import VALIDATION_RULES from "../../validationConfig.js";
import { throwErr } from "../../../errors/throwErr.js";
import { getErrorParams } from "../../getErrorParams.js";

export const updateUsersValidator = [
  // 1) Zamieniamy obiekt keyed-by-ID na tablicę z polem id
  (req, res, next) => {
    const { editedRows } = req.body;
    if (
      editedRows &&
      typeof editedRows === "object" &&
      !Array.isArray(editedRows)
    ) {
      req.body.editedRows = Object.entries(editedRows).map(([key, row]) => ({
        id: Number(key),
        ...row,
      }));
    }
    next();
  },

  // 2) Sprawdzamy, czy teraz mamy tablicę i że nie jest pusta
  body("editedRows")
    .exists({ checkFalsy: true })
    .withMessage("ERR_EDITED_ROWS_REQUIRED")
    .isArray()
    .withMessage("ERR_EDITED_ROWS_NOT_ARRAY")
    .custom((arr) => arr.length > 0)
    .withMessage("ERR_EDITED_ROWS_EMPTY"),

  // 3) ID mamy już jako pole po normalizacji, więc walidujemy dalej:
  body("editedRows.*.id").isInt({ gt: 0 }).withMessage("ERR_USER_ID_INVALID"),

  body("editedRows.*.username")
    .exists()
    .withMessage("ERR_USERNAME_REQUIRED")
    .isString()
    .withMessage("ERR_USERNAME_NOT_STRING")
    .isLength({
      min: VALIDATION_RULES.USERNAME.MIN_LENGTH,
      max: VALIDATION_RULES.USERNAME.MAX_LENGTH,
    })
    .withMessage("ERR_USERNAME_LENGTH")
    .matches(VALIDATION_RULES.USERNAME.REGEX)
    .withMessage("ERR_USERNAME_INVALID_CHARS"),

  body("editedRows.*.email")
    .exists()
    .withMessage("ERR_EMAIL_REQUIRED")
    .isEmail()
    .withMessage("ERR_INVALID_EMAIL_FORMAT")
    .isLength({ max: VALIDATION_RULES.EMAIL.MAX_LENGTH })
    .withMessage("ERR_EMAIL_TOO_LONG")
    .normalizeEmail(),

  body("editedRows.*.role")
    .exists()
    .withMessage("ERR_ROLE_REQUIRED")
    .isIn(["admin", "user", "moderator"])
    .withMessage("ERR_ROLE_INVALID"),

  body("editedRows.*.ban")
    .exists()
    .withMessage("ERR_BAN_REQUIRED")
    .isBoolean()
    .withMessage("ERR_BAN_INVALID"),

  body("editedRows.*.password")
    .optional()
    .isLength({
      min: VALIDATION_RULES.PASSWORD.MIN_LENGTH,
      max: VALIDATION_RULES.PASSWORD.MAX_LENGTH,
    })
    .withMessage("ERR_PASSWORD_LENGTH")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.UPPER)
    .withMessage("ERR_PASSWORD_UPPERCASE")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.LOWER)
    .withMessage("ERR_PASSWORD_LOWERCASE")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.DIGIT)
    .withMessage("ERR_PASSWORD_DIGIT")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.SPECIAL)
    .withMessage("ERR_PASSWORD_SPECIAL_CHAR"),

  // 4) Obsługa błędów
  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors = result.array().map((err) => ({
        field: err.param,
        message: err.msg,
        params: getErrorParams(err.msg),
      }));
      return next(throwErr("VALIDATION", errors));
    }
    next();
  },
];
