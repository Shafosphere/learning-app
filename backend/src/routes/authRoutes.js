import express from "express";

import authenticateToken from "../middleware/validators/admin_token/authenticateToken.js";
import authorizeAdmin from "../middleware/validators/admin_token/authorizeAdmin.js";
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
  getRequirements
} from "../controllers/authController.js";

import { registerValidator } from "../middleware/validators/auth/post-registeruser-vali.js";
import { loginValidator } from "../middleware/validators/auth/post-loginUser-vali.js";
import { loginRateLimiter } from "../middleware/rateLimiter.js";
import { accountUpdateValidationRules } from "../middleware/validators/auth/patch-userUpdate-vali.js";
import { resetPasswordLinkValidationRules } from "../middleware/validators/auth/post-resetLink-vali.js";
import { resetPasswordValidationRules } from "../middleware/validators/auth/post-resetPass-vali.js";
import { deleteUserValidator } from "../middleware/validators/auth/delete-deleteuser-vali.js";
import { getUserInformationValidator } from "../middleware/validators/auth/post-information-vali.js";
const router = express.Router();

router.post("/register", registerValidator, registerUser);

router.get("/admin", authenticateToken, authorizeAdmin, adminWelcome);

router.get("/user", authenticateToken, userWelcome);

router.post("/login", loginRateLimiter, loginValidator, loginUser);

router.post("/logout", authenticateToken, logoutUser);

router.post("/information", authenticateToken, getUserInformationValidator, userInformation);

router.get("/requirements", getRequirements)

router.patch(
  "/update",
  authenticateToken,
  accountUpdateValidationRules,
  updateUserAccount
);

router.delete(
  "/delete",
  authenticateToken,
  deleteUserValidator,
  deleteUserAccount
);

router.post(
  "/send-reset-link",
  resetPasswordLinkValidationRules,
  sendUserResetLink
);

router.post("/reset-password", resetPasswordValidationRules, resetPassword);

export default router;
