import express from "express";
import authenticateToken from "../middleware/authenticateToken.js";
import authorizeAdmin from "../middleware/authorizeAdmin.js";
import {
  getUsersList,
  updateUserById,
  searchUsers,
} from "../controllers/userControllers.js";

const router = express.Router();

router.get("/userlist", authenticateToken, authorizeAdmin, getUsersList);

router.patch("/userupdate", authenticateToken, authorizeAdmin, updateUserById);

router.get("/usersearch", authenticateToken, authorizeAdmin, searchUsers);

export default router;
