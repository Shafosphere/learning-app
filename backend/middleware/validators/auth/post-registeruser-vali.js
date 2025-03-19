// backend/validators/registerValidator.js

import { body, validationResult } from "express-validator";
import VALIDATION_RULES from "../validationConfig.js";

export const registerValidator = [
  // Walidacja username
  body("username")
    .isLength({
      min: VALIDATION_RULES.USERNAME.MIN_LENGTH,
      max: VALIDATION_RULES.USERNAME.MAX_LENGTH,
    })
    .withMessage("ERROR_USERNAME_LENGTH")
    .matches(VALIDATION_RULES.USERNAME.REGEX)
    .withMessage("ERROR_USERNAME_REGEX")
    .trim(),

  // Walidacja email
  body("email")
    .isEmail()
    .withMessage("ERROR_EMAIL_FORMAT")
    .isLength({ max: VALIDATION_RULES.EMAIL.MAX_LENGTH })
    .withMessage("ERROR_EMAIL_MAX_LENGTH")
    .normalizeEmail(),

  // Walidacja password
  body("password")
    .isLength({
      min: VALIDATION_RULES.PASSWORD.MIN_LENGTH,
      max: VALIDATION_RULES.PASSWORD.MAX_LENGTH,
    })
    .withMessage("ERROR_PASSWORD_LENGTH")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.UPPER)
    .withMessage("ERROR_PASSWORD_NO_UPPER")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.LOWER)
    .withMessage("ERROR_PASSWORD_NO_LOWER")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.DIGIT)
    .withMessage("ERROR_PASSWORD_NO_DIGIT")
    .matches(VALIDATION_RULES.PASSWORD.REGEX.SPECIAL)
    .withMessage("ERROR_PASSWORD_NO_SPECIAL")
    .trim(),

  // Middleware do obsługi błędów walidacji
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Modyfikujemy strukturę, tak aby w polu 'code' pojawiła się nazwa błędu
      // (można też wrzucić w 'msg', ale 'code' bywa bardziej czytelne)
      const errorResponse = errors.array().map((err) => ({
        param: err.param,
        code: err.msg, // np. "ERROR_USERNAME_LENGTH"
      }));
      return res.status(400).json({ errors: errorResponse });
    }
    next();
  },
];
