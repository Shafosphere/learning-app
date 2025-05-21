import express from "express";
import catchAsync from "../errors/catchAsync.js";
import authenticateToken from "../middleware/validators/admin_token/authenticateToken.js";
import authorizeAdmin from "../middleware/validators/admin_token/authorizeAdmin.js";
import {
  getUsersList,
  updateUsers,
  searchUsers,
  deleteUser,
  learnWord,
  getRankingFlashcard,
  autoSave,
  autoLoad,
  autoDelete,
  getArena,
} from "../controllers/userControllers.js";

import { deleteUserValidator } from "../middleware/validators/users/delete-deleteuser-vali.js";
import { learnWordValidator } from "../middleware/validators/users/post-learnword-vali.js";
import { updateUsersValidator } from "../middleware/validators/users/patch-updateuser-vali.js";
import { autoSaveValidator } from "../middleware/validators/users/post-autosave-vali.js";
const router = express.Router();

router.get(
  "/list",
  authenticateToken,
  authorizeAdmin,
  catchAsync(getUsersList)
);

router.patch(
  "/update",
  authenticateToken,
  authorizeAdmin,
  updateUsersValidator,
  catchAsync(updateUsers)
);

router.get(
  "/search",
  authenticateToken,
  authorizeAdmin,
  catchAsync(searchUsers)
);

router.post(
  "/learn-word",
  authenticateToken,
  learnWordValidator,
  catchAsync(learnWord)
);

router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeAdmin,
  deleteUserValidator,
  catchAsync(deleteUser)
);

router.post(
  "/auto-save",
  authenticateToken,
  autoSaveValidator,
  catchAsync(autoSave)
);

router.post("/auto-load", authenticateToken, catchAsync(autoLoad));

router.post("/auto-delete", authenticateToken, catchAsync(autoDelete));

router.get("/ranking-flashcard", catchAsync(getRankingFlashcard));

router.get("/ranking-arena", catchAsync(getArena));

export default router;
