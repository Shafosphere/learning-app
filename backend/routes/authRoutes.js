import express from "express";

import authenticateToken from "../middleware/authenticateToken";
import authorizeAdmin from "../middleware/authorizeAdmin";
import { body } from "express-validator";
import {
  registerUser,
  adminWelcome,
  userWelcome,
  loginUser,
  logoutUser,
  userInformation,
  updateUserAccount,
} from "../controllers/authController";

import { accountUpdateValidationRules } from "../accountValidators";

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


export default router;
