// Obsługa użytkowników
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

  try {
    const offset = (page - 1) * limit;

    const users = await getUsersWithPagination(parseInt(limit), offset);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Server Error");
  }
};

export const updateUsers = async (req, res) => {
  const { editedRows } = req.body;

  try {
    // Iteracja po użytkownikach i aktualizacja w bazie danych
    const updatePromises = Object.values(editedRows).map(async (user) => {
      await updateUserInDb(user);
    });

    // Czekanie na zakończenie wszystkich operacji aktualizacji
    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: "Users updated successfully.",
    });
  } catch (error) {
    console.error("Error updating users:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing user update.",
    });
  }
};

export const searchUsers = async (req, res) => {
  const { query } = req.query;

  try {
    let result;

    if (!isNaN(query)) {
      // Jeśli query jest liczbą (wyszukiwanie po ID)
      result = await searchUserById(parseInt(query));
    } else if (query.includes("@")) {
      // Jeśli query jest emailem
      result = await searchUserByEmail(query);
    } else {
      // Jeśli query jest nazwą użytkownika (username)
      result = await searchUserByUsername(query);
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "No records found" });
    }

    console.log("Search result:", result);
    res.json(result);
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).send("Server Error");
  }
};

export const deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    await deleteUserByID(userId);
    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting user.",
    });
  }
};

export const learnWord = async (req, res) => {
  const client = await pool.connect(); // Pobierz klienta z puli
  const userId = req.user.id;
  const username = req.user.username;
  const wordId = req.body.wordId;

  try {
    await client.query("BEGIN"); // Rozpocznij transakcję

    // Sprawdzenie, czy użytkownik już nauczył się tego słowa
    const checkResult = await getUserIdFromProgress(client, userId, wordId);
    if (checkResult.rows.length > 0) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ message: "You have already learned this word." });
    }

    // Wstawienie rekordu do `user_word_progress`
    await insertWordIntoUserProgress(client, userId, wordId);

    // Aktualizacja `ranking`
    await userRankingUpdate(userId, username);

    await client.query("COMMIT");

    res
      .status(200)
      .json({ message: "Word added to progress and ranking updated." });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error adding word:", err.message);
    res.status(500).json({ message: "Server error." });
  } finally {
    client.release();
  }
};

export const getRankingFlashcard = async (req, res) => {
  try {
    const topUsers = await getTopRankingUsersFlashcard(10);
    res.status(200).json(topUsers);
  } catch (error) {
    console.error("Błąd podczas pobierania rankingu:", error);
    res
      .status(500)
      .json({ message: "Błąd serwera podczas pobierania rankingu." });
  }
};

export const getArena = async (req, res) => {
  try {
    const topUsers = await getTopArenaUsers(10);
    res.status(200).json(topUsers);
  } catch (error) {
    console.error("Błąd podczas pobierania rankingu:", error);
    res
      .status(500)
      .json({ message: "Błąd serwera podczas pobierania rankingu." });
  }
};

export const autoSave = async (req, res) => {
  const username = req.user.username;
  const userId = req.user.id;
  const { level, deviceId, words, patchNumber } = req.body;
  // console.log("Username:", username);
  // console.log("Data:", level, deviceId);
  // console.log("Data:", words);

  try {
    const client = await pool.connect();
    try {
      await insertOrUpdateUserAutosave(
        client,
        userId,
        level,
        words,
        deviceId,
        patchNumber
      );
      res.status(200).json({ message: "Dane odebrane" });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Błąd podczas autozapisu:", error);
    res.status(500).json({ message: "Błąd serwera podczas autozapisu." });
  }
};

export const autoLoad = async (req, res) => {
  const userId = req.user.id;
  const username = req.user.username;
  const { level, deviceId } = req.body;

  try {
    const client = await pool.connect(); // Dodaj połączenie z puli

    try {
      console.log("wczytywanie nicku i levela:", userId, level);
      const autosaveData = await getAutosaveData(client, userId, level); // Przekaż client
      // console.log("Autosave data:", autosaveData);

      if (!autosaveData) {
        console.log("Brak zapisanych danych");
        return res.status(404).json({ message: "Brak zapisanych danych" });
      }

      const wordsFromSave = autosaveData.words; // Usuń JSON.parse()
      // console.log("Words from save:", wordsFromSave);

      const wordIds = [...new Set(wordsFromSave.map((w) => w.id))];
      // console.log("Unique word IDs:", wordIds);

      const translations = await getBatchWordTranslations(client, wordIds); // Przekaż client
      // console.log("Tłumaczenia:", translations);

      const formattedWords = wordsFromSave
        .map((word) => {
          const translation = translations.find((t) => t.word_id === word.id);
          return (
            translation && {
              id: word.id,
              boxName: word.boxName,
              wordEng: {
                word: translation.en_translation,
                description: translation.en_description,
              },
              wordPl: {
                word: translation.pl_translation,
                description: translation.pl_description,
              },
            }
          );
        })
        .filter(Boolean);

      console.log("Level:", autosaveData.level);
      console.log("Level:", autosaveData.last_saved);

      // TYLKO JEDNA ODPOWIEDŹ
      res.status(200).json({
        message: "Dane odebrane",
        username,
        level: autosaveData.level,
        words: formattedWords,
        last_saved: autosaveData.last_saved,
        patchNumber: autosaveData[`patch_number_${level.toLowerCase()}`],
      });
    } finally {
      client.release(); // Zwolnij połączenie
    }
  } catch (error) {
    console.error("Błąd:", error);
    res.status(500).json({
      message: "Błąd serwera",
      error: error.message,
    });
  }
};

// controllers/userController.js
export const autoDelete = async (req, res) => {
  const userId = req.user.id;
  const { level } = req.body;

  try {
    const client = await pool.connect();
    try {
      // Wywołaj funkcję usuwającą dane dla danego poziomu
      await deleteDataUserByUserID(client, userId, level);

      // Wywołaj funkcję resetującą numer patcha
      await resetPatchNumberByUserID(client, userId, level);

      res.status(200).json({ success: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Błąd podczas resetowania progresu:", error);
    res.status(500).json({ message: "Błąd serwera podczas resetowania" });
  }
};
