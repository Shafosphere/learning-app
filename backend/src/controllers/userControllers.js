// Obsługa użytkowników
import ApiError from "../errors/ApiError.js";
import {
  searchUserById,
  searchUserByEmail,
  searchUserByUsername,
  getUsersWithPagination,
  updateUserInDb,
  deleteUserByID,
  getUserIdFromProgress,
  deleteDataUserByUserID,
} from "../repositories/user.repo.js";

// Postęp użytkownika ze słowami
import { insertWordIntoUserProgress } from "../repositories/word.repo.js";

// Ranking użytkowników
import {
  userRankingUpdate,
  getTopRankingUsersFlashcard,
} from "../repositories/ranking.repo.js";

// Autosave użytkownika
import {
  insertOrUpdateUserAutosave,
  getAutosaveData,
} from "../repositories/autosave.repo.js";

// Tłumaczenia słów
import { getBatchWordTranslations } from "../repositories/translation.repo.js";

// Reset patchy dla użytkownika
import { resetPatchNumberByUserID } from "../repositories/patch.repo.js";

// Arena użytkowników
import { getTopArenaUsers } from "../repositories/arena.repo.js";

import pool from "../db/dbClient.js";

export const getUsersList = async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;
  const users = await getUsersWithPagination(parseInt(limit), offset);
  res.status(200).json(users);
};

export const updateUsers = async (req, res) => {
  const { editedRows } = req.body;
  const updatePromises = Object.values(editedRows).map(user => updateUserInDb(user));
  await Promise.all(updatePromises);
  res.status(200).json({ success: true, message: "Users updated successfully." });
};

export const searchUsers = async (req, res) => {
  const { query } = req.query;
  let result;
  if (!isNaN(query)) {
    result = await searchUserById(parseInt(query));
  } else if (query.includes("@")) {
    result = await searchUserByEmail(query);
  } else {
    result = await searchUserByUsername(query);
  }
  if (!result || result.length === 0) {
    throw new ApiError(404, "ERR_NO_RECORDS", "No records found");
  }
  res.status(200).json(result);
};

export const deleteUser = async (req, res) => {
  const userId = req.params.id;
  await deleteUserByID(userId);
  res.status(200).json({ success: true, message: "User deleted successfully." });
};

export const learnWord = async (req, res) => {
  const client = await pool.connect();
  const userId = req.user.id;
  const username = req.user.username;
  const wordId = req.body.wordId;
  try {
    await client.query("BEGIN");
    const checkResult = await getUserIdFromProgress(client, userId, wordId);
    if (checkResult.rows.length > 0) {
      throw new ApiError(400, "ERR_ALREADY_LEARNED", "You have already learned this word.");
    }
    await insertWordIntoUserProgress(client, userId, wordId);
    await userRankingUpdate(userId, username);
    await client.query("COMMIT");
    res.status(200).json({ message: "Word added to progress and ranking updated." });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const getRankingFlashcard = async (req, res) => {
  const topUsers = await getTopRankingUsersFlashcard(10);
  res.status(200).json(topUsers);
};

export const getArena = async (req, res) => {
  const topUsers = await getTopArenaUsers(10);
  res.status(200).json(topUsers);
};

export const autoSave = async (req, res) => {
  const client = await pool.connect();
  const { level, deviceId, words, patchNumber } = req.body;
  try {
    await insertOrUpdateUserAutosave(client, req.user.id, level, words, deviceId, patchNumber);
    res.status(200).json({ message: "Dane odebrane" });
  } finally {
    client.release();
  }
};

export const autoLoad = async (req, res) => {
  const client = await pool.connect();
  try {
    const { level, } = req.body;
    const autosaveData = await getAutosaveData(client, req.user.id, level);
    if (!autosaveData) {
      throw new ApiError(404, "ERR_NO_AUTOSAVE", "Brak zapisanych danych");
    }
    const wordsFromSave = autosaveData.words;
    const wordIds = [...new Set(wordsFromSave.map(w => w.id))];
    const translations = await getBatchWordTranslations(client, wordIds);
    const formattedWords = wordsFromSave
      .map(word => {
        const t = translations.find(tr => tr.word_id === word.id);
        return t && { id: word.id, boxName: word.boxName,
          wordEng: { word: t.en_translation, description: t.en_description },
          wordPl: { word: t.pl_translation, description: t.pl_description }
        };
      })
      .filter(Boolean);
    res.status(200).json({
      message: "Dane odebrane",
      username: req.user.username,
      level: autosaveData.level,
      words: formattedWords,
      last_saved: autosaveData.last_saved,
      patchNumber: autosaveData[`patch_number_${level.toLowerCase()}`],
    });
  } finally {
    client.release();
  }
};


export const autoDelete = async (req, res) => {
  const client = await pool.connect();
  const { level } = req.body;
  try {
    await deleteDataUserByUserID(client, req.user.id, level);
    await resetPatchNumberByUserID(client, req.user.id, level);
    res.status(200).json({ success: true });
  } finally {
    client.release();
  }
};
