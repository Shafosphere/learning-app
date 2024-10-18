import express from "express";
import {
  getInformation,
  getWordData,
  getWordsList,
  getWordDetail,
  updateWordTranslations,
  searchWords,
  addWord, deleteWord,
} from "../controllers/wordController.js";
import authenticateToken from "../middleware/authenticateToken.js";
import authorizeAdmin from "../middleware/authorizeAdmin.js";

const router = express.Router();

router.get("/information", getInformation);

router.post("/data", getWordData);

router.get("/list", authenticateToken, authorizeAdmin, getWordsList);

router.post("/detail", authenticateToken, authorizeAdmin, getWordDetail);

router.patch(
  "/update",
  authenticateToken,
  authorizeAdmin,
  updateWordTranslations
);

router.get("/search", authenticateToken, authorizeAdmin, searchWords);

router.post("/add", authenticateToken, authorizeAdmin, addWord);

router.delete("/word-delete", authenticateToken, authorizeAdmin, deleteWord);

export default router;
