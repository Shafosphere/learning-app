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
};4


for (const translation of translations) {
  await db.query(
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
}