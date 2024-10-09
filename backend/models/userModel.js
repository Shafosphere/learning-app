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
  const result = await pool.query(
    "SELECT * FROM users WHERE username = $1",
    [username]
  );
  return result.rows[0]; // Zwracamy użytkownika, jeśli istnieje
};

// Funkcja aktualizująca czas ostatniego logowania użytkownika
export const updateLastLogin = async (userId) => {
  await pool.query(
    "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1",
    [userId]
  );
};