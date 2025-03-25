import { body, validationResult } from "express-validator";
import VALIDATION_RULES from "../validationConfig.js";
import { getErrorParams } from "../../getErrorParams.js";

// const getErrorParams = (msg) => {
//   switch (msg) {
//     case "ERR_USERNAME_LENGTH":
//       return {
//         min: VALIDATION_RULES.USERNAME.MIN_LENGTH,
//         max: VALIDATION_RULES.USERNAME.MAX_LENGTH,
//       };
//     case "ERR_EMAIL_TOO_LONG":
//       return { max: VALIDATION_RULES.EMAIL.MAX_LENGTH };
//     case "ERR_PASSWORD_LENGTH":
//       return {
//         min: VALIDATION_RULES.PASSWORD.MIN_LENGTH,
//         max: VALIDATION_RULES.PASSWORD.MAX_LENGTH,
//       };
//     default:
//       return {};
//   }
// };

export const resetPasswordLinkValidationRules = [
  // Walidacja adresu e-mail
  body("email")
    .isEmail()
    .withMessage("ERR_INVALID_EMAIL_FORMAT") // Zwracamy kod błędu
    .isLength({ max: VALIDATION_RULES.EMAIL.MAX_LENGTH })
    .withMessage("ERR_EMAIL_TOO_LONG")
    .normalizeEmail(),

  // Walidacja języka (opcjonalnie)
  body("language")
    .optional()
    .isIn(["pl", "en"])
    .withMessage("ERR_INVALID_LANGUAGE"),

  // Middleware do obsługi błędów walidacji
  (req, res, next) => {
    const errors = validationResult(req)
      .array()
      .map((error) => ({
        ...error,
        params: getErrorParams(error.msg), // Dołącz parametry, jeśli potrzebne
      }));

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    next();
  },
];
