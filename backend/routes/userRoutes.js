import express from "express";
import authenticateToken from "../middleware/authenticateToken.js";
import authorizeAdmin from "../middleware/authorizeAdmin.js";
import {
  getUsersList,
  updateUsers,
  searchUsers,
  deleteUser,
  learnWord,
  getRanking,
} from "../controllers/userControllers.js";

const router = express.Router();

router.get("/list", authenticateToken, authorizeAdmin, getUsersList);

router.patch("/update", authenticateToken, authorizeAdmin, updateUsers);

router.get("/search", authenticateToken, authorizeAdmin, searchUsers);

router.post("/learn-word", authenticateToken, learnWord);

router.delete("/delete/:id", authenticateToken, authorizeAdmin, deleteUser);

router.get('/ranking', getRanking);

export default router;
