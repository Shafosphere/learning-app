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

export const registerValidator = [
  body("username")
    .isLength({ min: 4, max: 20 })
    .withMessage("ERR_USERNAME_LENGTH")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("ERR_USERNAME_INVALID_CHARS")
    .trim(),

  body("email")
    .isEmail()
    .withMessage("ERR_INVALID_EMAIL")
    .isLength({ max: 255 })
    .withMessage("ERR_EMAIL_TOO_LONG")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 8, max: 50 })
    .withMessage("ERR_PASSWORD_LENGTH")
    .matches(/[A-Z]/)
    .withMessage("ERR_PASSWORD_UPPERCASE")
    .matches(/[a-z]/)
    .withMessage("ERR_PASSWORD_LOWERCASE")
    .matches(/[0-9]/)
    .withMessage("ERR_PASSWORD_DIGIT")
    .matches(/[!@#$%^&*]/)
    .withMessage("ERR_PASSWORD_SPECIAL_CHAR")
    .trim(),

  (req, res, next) => {
    const errors = validationResult(req)
      .array()
      .map((error) => ({
        ...error,
        params: getErrorParams(error.msg),
      }));

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    next();
  },
];
