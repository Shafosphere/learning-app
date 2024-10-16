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
  deleteUserAccount,
  getUsersList,
  updateUsers,
  searchUsers,
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

router.delete("/delete", authenticateToken, deleteUserAccount);

router.get("/list", authenticateToken, authorizeAdmin, getUsersList);

router.patch("/userupdate", authenticateToken, authorizeAdmin, updateUsers);

router.get("/search-user", authenticateToken, authorizeAdmin, searchUsers);

export default router;


app.delete("/delete-account", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    // Delete the user account
    await db.query("DELETE FROM users WHERE id = $1", [userId]);

    // Clear the token
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.status(200).json({
      success: true,
      message: "Account deleted and logged out successfully.",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete account." });
  }
});