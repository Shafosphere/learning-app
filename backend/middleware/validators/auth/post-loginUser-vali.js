import { body, validationResult } from "express-validator";
import VALIDATION_RULES from "../validationConfig.js";

const getErrorParams = (msg) => {
  switch (msg) {
    case "ERR_USERNAME_LENGTH":
      return {
        min: VALIDATION_RULES.USERNAME.MIN_LENGTH,
        max: VALIDATION_RULES.USERNAME.MAX_LENGTH,
      };
    case "ERR_EMAIL_TOO_LONG":
      return { max: VALIDATION_RULES.EMAIL.MAX_LENGTH };
    case "ERR_PASSWORD_LENGTH":
      return {
        min: VALIDATION_RULES.PASSWORD.MIN_LENGTH,
        max: VALIDATION_RULES.PASSWORD.MAX_LENGTH,
      };
    default:
      return {};
  }
};

export const loginValidator = [
  // Username
  body("username")
    .isLength({
      min: VALIDATION_RULES.USERNAME.MIN_LENGTH,
      max: VALIDATION_RULES.USERNAME.MAX_LENGTH,
    })
    .withMessage("ERR_LOGIN_USERNAME_LENGTH") // <-- zamiast zwykłego tekstu
    .matches(VALIDATION_RULES.USERNAME.REGEX)
    .withMessage("ERR_LOGIN_USERNAME_INVALID_CHARS") // <-- kolejny kod
    .trim(),

  // Password
  body("password")
    .isLength({
      min: VALIDATION_RULES.PASSWORD.MIN_LENGTH,
      max: VALIDATION_RULES.PASSWORD.MAX_LENGTH,
    })
    .withMessage("ERR_LOGIN_PASSWORD_LENGTH")
    .trim(),

  // Middleware obsługujący błędy
  (req, res, next) => {
    // Zbierz wszystkie błędy
    let errors = validationResult(req).array();

    if (errors.length > 0) {
      // Dodajemy parametry wg. klucza
      errors = errors.map((err) => ({
        ...err,
        params: getErrorParams(err.msg),
      }));
      return res.status(400).json({ errors });
    }
    next();
  },
];
