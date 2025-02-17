import {
  searchUserById,
  searchUserByEmail,
  searchUserByUsername,
  getUsersWithPagination,
  updateUserInDb,
  deleteUserByID,
  getUserIdFromProgress,
  insertWordIntoUserProgress,
  userRankingUpdate,
  getTopRankingUsers,
} from "../models/userModel.js";

import pool from "../dbClient.js";

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
    await userRankingUpdate(client, userId, username);

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

export const getRanking = async (req, res) => {
  try {
    const topUsers = await getTopRankingUsers(10);
    res.status(200).json(topUsers);
  } catch (error) {
    console.error("Błąd podczas pobierania rankingu:", error);
    res
      .status(500)
      .json({ message: "Błąd serwera podczas pobierania rankingu." });
  }
};
