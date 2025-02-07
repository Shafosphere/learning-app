import express from "express";
import authenticateToken from "../middleware/validators/admin_and_token/authenticateToken.js";
import authorizeAdmin from "../middleware/validators/admin_and_token/authorizeAdmin.js";
import {
  getUsersList,
  updateUsers,
  searchUsers,
  deleteUser,
  learnWord,
  getRanking,
} from "../controllers/userControllers.js";

import authorizeLearn from "../middleware/validators/users/post-learnword-vali.js";

const router = express.Router();

router.get("/list", authenticateToken, authorizeAdmin, getUsersList);

router.patch("/update", authenticateToken, authorizeAdmin, updateUsers);

router.get("/search", authenticateToken, authorizeAdmin, searchUsers);

router.post("/learn-word", authenticateToken, authorizeLearn, learnWord);

router.delete("/delete/:id", authenticateToken, authorizeAdmin, deleteUser);

router.get("/ranking", getRanking);

export default router;
