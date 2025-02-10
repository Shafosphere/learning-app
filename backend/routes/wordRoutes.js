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
import { addWordValidator } from "../middleware/validators/word/post-addword-vali.js";
import { deleteWordValidator } from "../middleware/validators/word/delete-deleteword-vali.js";
import { updateTranslationsValidator } from "../middleware/validators/word/patch-updatetranslation-vali.js";
import { getWordDetailValidator } from "../middleware/validators/word/post-getworddetail-vali.js";
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

router.post(
  "/detail",
  authenticateToken,
  authorizeAdmin,
  getWordDetailValidator,
  getWordDetail
);

router.patch(
  "/update-translations",
  authenticateToken,
  authorizeAdmin,
  updateTranslationsValidator,
  updateWordTranslations
);

router.get("/search", authenticateToken, authorizeAdmin, searchWords);

router.post(
  "/add",
  authenticateToken,
  authorizeAdmin,
  addWordValidator,
  addWord
);

router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeAdmin,
  deleteWordValidator,
  deleteWord
);

export default router;
