import pool from "../db/dbClient.js";

export const updateLastLogin = async (userId) => {
  await pool.query(
    "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1",
    [userId]
  );
};

export const fetchGlobalData = async () => {
  const result = await pool.query(`
      SELECT 
        (SELECT COUNT(DISTINCT language) FROM translation) AS total_languages,
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM word) AS total_words,
        (SELECT COUNT(*) FROM reports) AS total_reports,
        (SELECT COUNT(*) FROM word WHERE level = 'B2') AS total_b2_words,
        (SELECT COUNT(*) FROM word WHERE level = 'C1') AS total_c1_words,
        (SELECT COUNT(*) FROM users WHERE DATE(last_login) = CURRENT_DATE) AS users_logged_in_today,
        (SELECT visit_count FROM page_visit_stats WHERE page_name = 'flashcards' AND DATE(stat_date) = CURRENT_DATE) AS today_flashcard_visitors,
        (SELECT visit_count FROM page_visit_stats WHERE page_name = 'vocabulary_C1' AND DATE(stat_date) = CURRENT_DATE) AS today_vocabulary_c1_visitors,
        (SELECT visit_count FROM page_visit_stats WHERE page_name = 'vocabulary_B2' AND DATE(stat_date) = CURRENT_DATE) AS today_vocabulary_b2_visitors
    `);
  return result.rows[0];
};

export const fetchVisitsData = async () => {
  const result = await pool.query(`
      SELECT
        stat_date,
        page_name,
        visit_count
      FROM
        page_visit_stats
      WHERE
        stat_date >= CURRENT_DATE - INTERVAL '6 days'
      ORDER BY
        stat_date ASC
    `);
  return result.rows;
};

export const increasingEntrances = async ({ page_name, today }) => {
  try {
    await pool.query(
      `INSERT INTO page_visit_stats (page_name, stat_date, visit_count)
         VALUES ($1, $2, 1)
         ON CONFLICT (page_name, stat_date)
         DO UPDATE SET visit_count = page_visit_stats.visit_count + 1`,
      [page_name, today]
    );
  } catch (error) {
    console.error("Error in increasingEntrances:", error);
    throw error;
  }
};

export const checkBan = async (userId) => {
  const result = await pool.query(
    "SELECT ban FROM ranking WHERE user_id = $1",
    [userId]
  );
  return result;
};
