import express from "express";

import authenticateToken from "../middleware/authenticateToken.js";
import authorizeAdmin from "../middleware/authorizeAdmin.js";
import { body } from "express-validator";
import {
  registerUser,
  adminWelcome,
  userWelcome,
  loginUser,
  logoutUser,
  userInformation,
  updateUserAccount,
  deleteUserAccount,
  sendUserResetLink,
  resetPassword,
} from "../controllers/authController.js";

import { accountUpdateValidationRules } from "../accountValidators.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("username").isLength({ min: 4 }).trim().escape(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }).trim(),
  ],
  registerUser
);

router.get("/admin", authenticateToken, authorizeAdmin, adminWelcome);

router.get("/user", authenticateToken, userWelcome);

router.post("/login", loginUser);

router.post("/logout", logoutUser);

router.post("/information", authenticateToken, userInformation);

router.patch("/update", authenticateToken, accountUpdateValidationRules, updateUserAccount);

router.delete("/delete", authenticateToken, deleteUserAccount);

router.post("/send-reset-link", sendUserResetLink)

router.post('/reset-password', resetPassword);

export default router;
// resertUserPassword