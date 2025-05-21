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
  getRankingWord,
  getRandomWords,
  submitAnswer,
  getRankingHistory,
} from "../controllers/wordController.js";

import catchAsync from "../errors/catchAsync.js";
import authenticateToken from "../middleware/validators/admin_token/authenticateToken.js";
import authorizeAdmin from "../middleware/validators/admin_token/authorizeAdmin.js";
import authorizeData from "../middleware/validators/word/post-data-vali.js";
import authorizePatchAndLevel from "../middleware/validators/word/post-patchdata-vali.js";
import authorizeList from "../middleware/validators/word/get-list-vali.js";
import { addWordValidator } from "../middleware/validators/word/post-addword-vali.js";
import { deleteWordValidator } from "../middleware/validators/word/delete-deleteword-vali.js";
import { updateTranslationsValidator } from "../middleware/validators/word/patch-updatetranslation-vali.js";
import { getWordDetailValidator } from "../middleware/validators/word/post-getworddetail-vali.js";
const router = express.Router();

router.post("/data", authorizeData, catchAsync(getWordData));

router.post(
  "/patch-data",
  authorizePatchAndLevel,
  catchAsync(getWordsByPatchAndLevel)
);

router.get("/patch-info", catchAsync(getPatchesInfo));

router.get("/ranking-word", authenticateToken, catchAsync(getRankingWord));

router.get("/random-words", catchAsync(getRandomWords));

router.get("/history", authenticateToken, catchAsync(getRankingHistory));

router.post("/submit-answer", authenticateToken, catchAsync(submitAnswer));

router.get(
  "/list",
  authenticateToken,
  authorizeAdmin,
  authorizeList,
  catchAsync(getWordsList)
);

router.post(
  "/detail",
  authenticateToken,
  authorizeAdmin,
  getWordDetailValidator,
  catchAsync(getWordDetail)
);

router.patch(
  "/update-translations",
  authenticateToken,
  authorizeAdmin,
  updateTranslationsValidator,
  catchAsync(updateWordTranslations)
);

router.get(
  "/search",
  authenticateToken,
  authorizeAdmin,
  catchAsync(searchWords)
);

router.post(
  "/add",
  authenticateToken,
  authorizeAdmin,
  addWordValidator,
  catchAsync(addWord)
);

router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeAdmin,
  deleteWordValidator,
  catchAsync(deleteWord)
);

export default router;
