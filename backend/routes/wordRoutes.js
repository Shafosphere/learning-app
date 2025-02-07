import express from "express";
import {
  getWordData,
  getWordsList,
  getWordDetail,
  updateWordTranslations,
  searchWords,
  addWord,
  deleteWord,
  getPatchesInfo,
  getWordsByPatchAndLevel,
} from "../controllers/wordController.js";
import authenticateToken from "../middleware/validators/admin_and_token/authenticateToken.js";
import authorizeAdmin from "../middleware/validators/admin_and_token/authorizeAdmin.js";
import authorizeData from "../middleware/validators/word/post-data-vali.js";
import authorizePatchAndLevel from "../middleware/validators/word/post-patchdata-vali.js";
import authorizeList from "../middleware/validators/word/get-list-vali.js";

const router = express.Router();

router.post("/data", authorizeData, getWordData);

router.post("/patch-data", authorizePatchAndLevel, getWordsByPatchAndLevel);

router.get("/patch-info", getPatchesInfo);

router.get(
  "/list",
  authenticateToken,
  authorizeAdmin,
  authorizeList,
  getWordsList
);

router.post("/detail", authenticateToken, authorizeAdmin, getWordDetail);

router.patch(
  "/update-translations",
  authenticateToken,
  authorizeAdmin,
  updateWordTranslations
);

router.patch("/update-word");

router.get("/search", authenticateToken, authorizeAdmin, searchWords);

router.post("/add", authenticateToken, authorizeAdmin, addWord);

router.delete("/delete/:id", authenticateToken, authorizeAdmin, deleteWord);

export default router;
