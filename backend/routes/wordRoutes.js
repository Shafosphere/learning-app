import express from "express";
import {
  getInformation,
  getWordData,
  getWordsList,
  getWordDetail,
  updateWordTranslations,
  searchWords,
  addWord,
  deleteWord,
  getPatchesInfo,
} from "../controllers/wordController.js";
import authenticateToken from "../middleware/authenticateToken.js";
import authorizeAdmin from "../middleware/authorizeAdmin.js";

const router = express.Router();

router.get("/information", getInformation);

router.post("/data", getWordData);

router.get("/patch-info", getPatchesInfo);

router.get("/list", authenticateToken, authorizeAdmin, getWordsList);

router.post("/detail", authenticateToken, authorizeAdmin, getWordDetail);

router.patch("/update-translations", authenticateToken, authorizeAdmin, updateWordTranslations);

router.patch("/update-word", )

router.get("/search", authenticateToken, authorizeAdmin, searchWords);

router.post("/add", authenticateToken, authorizeAdmin, addWord);

router.delete("/delete/:id", authenticateToken, authorizeAdmin, deleteWord);

export default router;
