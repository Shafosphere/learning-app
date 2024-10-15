// Operacje na bazie danych
import pool from "../dbClient.js";

export const getReportById = async (report_id) => {
  const result = await pool.query(
    `SELECT reports.*, users.username 
       FROM reports 
       JOIN users ON reports.user_id = users.id 
       WHERE reports.id = $1`,
    [report_id]
  );
  return result.rows[0];
};

export const getReports = async () => {
  const result = await pool.query(
    "SELECT report_type AS type, description AS desc, created_at AS time, id AS id FROM reports"
  );
  return result.rows;
};

export const updateReport = async (translation) => {
  await pool.query(
    `UPDATE translation
    SET translation = $1, description = $2
    WHERE word_id = $3 AND language = $4`,
    [
      translation.translation,
      translation.description,
      translation.word_id,
      translation.language,
    ]
  );
};

export const deleteReport = async (id) => {
  await pool.query(`DELETE FROM reports WHERE id = $1`, [id]);
};

export const createUser = async (username, email, hashedPassword) => {
  const result = await pool.query(
    "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, 'user') RETURNING id",
    [username, email, hashedPassword]
  );
  return result.rows[0].id; // Zwracamy ID nowo utworzonego użytkownika
};

// Funkcja pobierająca słowo na podstawie tłumaczenia i języka
export const getWordByTranslation = async (language, translation) => {
  const result = await pool.query(
    "SELECT * FROM Translation WHERE language = $1 AND translation = $2",
    [language, translation]
  );
  return result.rows[0]; // Zwracamy pierwszy wynik lub `undefined`, jeśli nie ma wyniku
};

// Funkcja dodająca raport do bazy danych
export const insertReport = async (userId, reportType, wordId, description) => {
  const result = await pool.query(
    "INSERT INTO reports (user_id, report_type, word_id, description) VALUES ($1, $2, $3, $4) RETURNING id",
    [userId, reportType, wordId, description]
  );
  return result.rows[0].id; // Zwracamy ID nowo utworzonego raportu
};

export const getUserByUsername = async (username) => {
  const result = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  return result.rows[0]; // Zwracamy użytkownika, jeśli istnieje
};

// Funkcja aktualizująca czas ostatniego logowania użytkownika
export const updateLastLogin = async (userId) => {
  await pool.query(
    "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1",
    [userId]
  );
};

export const getPatchWords = async (patchNumber) => {
  const result = await pool.query(
    "SELECT word_ids FROM word_patches WHERE patch_id = $1",
    [patchNumber]
  );

  if (result.rows.length === 0) {
    return null;
  }

  let wordIds = result.rows[0].word_ids;

  // Jeśli dane są w formacie tekstowym, przekształć je do formatu JSON
  if (typeof wordIds === "string") {
    wordIds = `[${wordIds}]`;
    wordIds = JSON.parse(wordIds);
  } else if (typeof wordIds === "object" && wordIds !== null) {
    wordIds = wordIds.map(Number);
  }

  return wordIds;
};

// Pobranie tłumaczeń dla słowa na podstawie `word_id`
export const getWordTranslations = async (wordId) => {
  const result = await pool.query(
    "SELECT * FROM translation WHERE word_id = $1",
    [wordId]
  );
  return result.rows;
};

// Pobranie maksymalnego numeru patcha
export const getMaxPatchId = async () => {
  const result = await pool.query(
    "SELECT MAX(patch_id) as max_patch_id FROM word_patches"
  );
  return result.rows[0].max_patch_id;
};

export const getUserByUserName = async (username) => {
  const result = await pool.query(
    "SELECT email FROM users WHERE username = $1",
    [username]
  );
  return result.rows[0];
};

// Pobranie użytkownika na podstawie ID
export const getUserById = async (userId) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [
    userId,
  ]);
  return result.rows[0];
};

// Aktualizacja danych użytkownika
export const updateUserById = async (userId, { username, email, password }) => {
  await pool.query(
    "UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4",
    [username, email, password, userId]
  );
};

export const deleteUserById = async (userId) => {
  await pool.query("DELETE FROM users WHERE id = $1", [userId]);
};

export const getWordsWithPagination = async (limit, offset) => {
  const result = await pool.query(
    "SELECT * FROM word ORDER BY id LIMIT $1 OFFSET $2",
    [limit, offset]
  );
  return result.rows;
};
