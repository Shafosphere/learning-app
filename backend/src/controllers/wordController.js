// Obsługa słów i nauki
import {
  getPatchWords,
  getMaxPatchId,
  getAllMaxPatchId,
  getAllPatchLength,
  getPatchWordsByLevel,
  patchLength,
} from "../repositories/patch.repo.js";

import {
  getWordTranslations,
  getTranslationsByWordId,
  updateTranslation,
  insertTranslations,
  getLanguageWordTranslations,
} from "../repositories/translation.repo.js";

import {
  getWordsWithPagination,
  searchWordById,
  searchWordByText,
  insertWord,
  deleteWordById,
  getNumberOfWords,
  getRandomWordsByNumber,
  getRandomWord,
} from "../repositories/word.repo.js";

import { checkBan } from "../repositories/stats.repo.js";

import {
  ranking_init,
  getUserRankingPoints,
  updateUserRankingHistory,
  getRankingHistoryById,
} from "../repositories/ranking.repo.js";

import { updateUserArena } from "../repositories/arena.repo.js";

import { throwErr } from "../errors/throwErr.js";

// Funkcja pomocnicza do formatowania wyników
const formatWordResults = (results) => {
  return results.map((wordPair) => {
    const wordEng = wordPair.find((w) => w.language === "en");
    const wordPl = wordPair.find((w) => w.language === "pl");
    return {
      id: wordEng.word_id,
      wordEng: {
        word: wordEng.translation,
        description: wordEng.description,
      },
      wordPl: {
        word: wordPl.translation,
        description: wordPl.description,
      },
    };
  });
};

// information about patch
export const getPatchesInfo = async (req, res) => {
  console.log("Fetching patch information");
  try {
    const stats = await getAllMaxPatchId();
    const length = await getAllPatchLength();
    const number_words_B2 = await getNumberOfWords("B2");
    const number_words_C1 = await getNumberOfWords("C1");
    const result = {
      totalB2Patches: stats.totalB2Patches,
      totalC1Patches: stats.totalC1Patches,
      lengthB2patch: length.lengthB2patch,
      lengthC1patch: length.lengthC1patch,
      numberWordsB2: number_words_B2,
      numberWordsC1: number_words_C1,
    };
    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting information:", error);
    res.status(500).send("Server Error");
  }
};

export const getWordsByPatchAndLevel = async (req, res) => {
  const { level, patchNumber } = req.body;
  if (!patchNumber || patchNumber <= 0) {
    throwErr("INVALID_PATCH_NUMBER");
  }

  const wordIds = await getPatchWordsByLevel(patchNumber, level);
  if (!wordIds) {
    throwErr("PATCH_NOT_FOUND");
  }

  const results = await Promise.all(
    wordIds.map((id) => getWordTranslations(id))
  );
  const formatted = formatWordResults(results);

  res.status(200).json({ message: "working", data: formatted });
};

export const getWordData = async (req, res) => {
  const { wordList = [], patchNumber } = req.body;

  if (patchNumber && patchNumber > 0) {
    const wordIds = await getPatchWords(patchNumber);
    if (!wordIds) {
      throwErr("PATCH_NOT_FOUND");
    }
    const results = await Promise.all(
      wordIds.map((id) => getWordTranslations(id))
    );
    const formatted = formatWordResults(results);
    const maxPatchId = await getMaxPatchId();
    const totalPatches = await patchLength();
    const isThisLastOne = patchNumber === maxPatchId;

    res.status(200).json({
      message: "working",
      data: formatted,
      isThisLastOne,
      totalPatches,
    });
  } else {
    const results = await Promise.all(
      wordList.map((id) => getWordTranslations(id))
    );
    const formatted = formatWordResults(results);
    res.status(200).json({ message: "working", data: formatted });
  }
};

export const getWordsList = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;

  const words = await getWordsWithPagination(limit, offset);
  res.status(200).json(words);
};

export const getWordDetail = async (req, res) => {
  const { id } = req.body;
  const translations = await getTranslationsByWordId(id);
  res.status(200).json({ translations });
};

export const updateWordTranslations = async (req, res) => {
  const { word } = req.body;
  const translations = word.translations;
  await Promise.all(translations.map((t) => updateTranslation(t)));
  res.status(200).send("Translations updated successfully.");
};

export const searchWords = async (req, res) => {
  const { query } = req.query;
  const result = !isNaN(query)
    ? await searchWordById(parseInt(query))
    : await searchWordByText(query);

  res.status(200).json(result);
};

export const addWord = async (req, res) => {
  const word = req.body;
  if (!word || !word.translations) {
    throwErr("MISSING_TRANSLATIONS");
  }
  const english = word.translations.find((t) => t.language === "en");
  if (!english) {
    throwErr("MISSING_ENGLISH");
  }
  if (!["B2", "C1"].includes(word.level)) {
    throwErr("INVALID_LEVEL");
  }

  const wordId = await insertWord(english.translation, word.level);
  await insertTranslations(wordId, word.translations);
  res.status(200).send("Word added successfully.");
};

export const deleteWord = async (req, res) => {
  const { id } = req.params;
  await deleteWordById(id);
  res.status(200).send("Word and its translations deleted successfully.");
};

export const getRankingWord = async (req, res) => {
  const userId = req.user.id;
  const banCheck = await checkBan(userId);
  if (banCheck.rows[0]?.ban) {
    throwErr("ACCOUNT_BANNED");
  }

  await ranking_init(userId);
  const pointsRes = await getUserRankingPoints(userId);
  const points = pointsRes.rows[0]?.current_points || 1000;

  const tiers = [
    { max: 500, B2: 1.0, C1: 0.0 },
    { max: 1000, B2: 0.9, C1: 0.1 },
    { max: 1500, B2: 0.7, C1: 0.3 },
    { max: 2000, B2: 0.5, C1: 0.5 },
    { max: 2500, B2: 0.4, C1: 0.6 },
    { max: 3000, B2: 0.1, C1: 0.9 },
  ];
  const tier = tiers.find((t) => points <= t.max) || { B2: 0.0, C1: 1.0 };
  const difficulty = Math.random() <= tier.B2 ? "B2" : "C1";

  const wordRes = await getRandomWord(difficulty);
  if (wordRes.rows.length === 0) {
    throwErr("WORDS_MISSING");
  }
  const wordId = wordRes.rows[0].id;

  const translationsRes = await getLanguageWordTranslations(wordId);
  const randomLang = Math.random() < 0.5 ? "en" : "pl";
  const translation = translationsRes.find((t) => t.language === randomLang);
  if (!translation) {
    throwErr("TRANSLATION_MISSING");
  }

  res.status(200).json([wordId, translation.translation, randomLang]);
};

export const getRandomWords = async (req, res) => {
  const count = parseInt(req.query.count) || 10;
  const randomWords = await getRandomWordsByNumber(count);
  const wordIds = randomWords.rows.map((r) => r.id);
  const wordsData = await Promise.all(
    wordIds.map((id) => getWordTranslations(id))
  );
  const result = wordsData.map((translations, i) => {
    const lang = Math.random() < 0.5 ? "pl" : "en";
    const tr = translations.find((t) => t.language === lang);
    return { id: wordIds[i], content: tr?.translation || "Brak tłumaczenia" };
  });
  res.status(200).json(result);
};

// controllers/rankingController.js
export const submitAnswer = async (req, res) => {
  const userId = req.user.id;
  const { wordId, userAnswer, lang, startTime } = req.body;

  const banCheck = await checkBan(userId);
  if (banCheck.rows[0]?.ban) {
    throwErr("ACCOUNT_BANNED");
  }

  const translations = await getWordTranslations(wordId);
  const correct = translations
    .filter((t) => t.language === lang)
    .map((t) => t.translation.toLowerCase());

  const responseTimeMs = Date.now() - startTime;
  const isCorrect = correct.includes(userAnswer.trim().toLowerCase());

  const pointsRes = await getUserRankingPoints(userId);
  const before = pointsRes.rows[0]?.current_points || 1000;
  const streakBefore = pointsRes.rows[0]?.current_streak || 0;
  const delta = isCorrect ? 5 : -5;
  const after = Math.min(Math.max(before + delta, 0), 9999);
  const newStreak = isCorrect ? streakBefore + 1 : 0;

  await updateUserArena(after, newStreak, userId);
  const tierLabel =
    correct.length > 0 ? (after <= 2000 ? "B2" : "C1") : "B2";
  
  await updateUserRankingHistory(
    userId,
    wordId,
    userAnswer,
    isCorrect,
    before,
    after,
    responseTimeMs,
    tierLabel,
    newStreak
  );

  res.status(200).json({
    success: true,
    isCorrect,
    newPoints: after,
    streak: newStreak,
    correctTranslations: translations.filter((t) => t.language === lang),
  });
};

export const getRankingHistory = async (req, res) => {
  const userId = req.user.id;
  const result = await getRankingHistoryById(userId, 10);
  const history = result.rows.map((row) => row.points_after).reverse();
  res.status(200).json(history);
};
