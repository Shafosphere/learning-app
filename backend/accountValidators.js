import { body } from "express-validator";

export const accountUpdateValidationRules = [
  body("username").optional().isLength({ min: 4 }).trim().escape(),
  body("email").optional().isEmail().normalizeEmail(),
  body("oldPass").optional().isLength({ min: 6 }).trim(),
  body("newPass").optional().isLength({ min: 6 }).trim(),
  body("confirmPass")
    .optional()
    .custom((value, { req }) => {
      if (value !== req.body.newPass) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];