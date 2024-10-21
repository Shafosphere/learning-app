import express from "express";
import authenticateToken from "../middleware/authenticateToken.js";
import authorizeAdmin from "../middleware/authorizeAdmin.js";
import {
  getUsersList,
  updateUserById,
  searchUsers,
} from "../controllers/userControllers.js";

const router = express.Router();

router.get("/list", authenticateToken, authorizeAdmin, getUsersList);

router.patch("/update", authenticateToken, authorizeAdmin, updateUserById);

router.get("/search", authenticateToken, authorizeAdmin, searchUsers);

export default router;
