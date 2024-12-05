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
  body("avatar")
    .optional() // Avatar is optional, validate only if provided
    .isInt({ min: 1, max: 4 }) // Check if it's an integer between 1 and 4
    .withMessage("Avatar must be a number between 1 and 4"),
];
