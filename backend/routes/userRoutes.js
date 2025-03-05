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
  autoSave,
  autoLoad,
  autoDelete
} from "../controllers/userControllers.js";

import { deleteUserValidator } from "../middleware/validators/users/delete-deleteuser-vali.js";
import { learnWordValidator } from "../middleware/validators/users/post-learnword-vali.js";
import { updateUsersValidator } from "../middleware/validators/users/patch-updateuser-vali.js";
const router = express.Router();

router.get("/list", authenticateToken, authorizeAdmin, getUsersList);

router.patch(
  "/update",
  authenticateToken,
  authorizeAdmin,
  updateUsersValidator,
  updateUsers
);

router.get("/search", authenticateToken, authorizeAdmin, searchUsers);

router.post("/learn-word", authenticateToken, learnWordValidator, learnWord);

router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeAdmin,
  deleteUserValidator,
  deleteUser
);

router.post("/auto-save", authenticateToken, autoSave);

router.post("/auto-load", authenticateToken, autoLoad);

router.post("/auto-delete", authenticateToken, autoDelete);

router.get("/ranking", getRanking);

export default router;
