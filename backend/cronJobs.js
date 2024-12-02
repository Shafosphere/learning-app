import cron from 'node-cron';
import pool from './dbClient.js';

export const initializeCronJobs = () => {
  cron.schedule('0 0 * * MON', async () => {
    console.log('Aktualizacja rankingu...');

    const query = `
      TRUNCATE TABLE ranking;
      INSERT INTO ranking (user_id, username, weekly_points)
      SELECT
        u.id AS user_id,
        u.username,
        COUNT(uwp.id) AS weekly_points
      FROM
        users u
      JOIN
        user_word_progress uwp ON u.id = uwp.user_id
      WHERE
        uwp.learned_at >= NOW() - INTERVAL '7 days'
        AND u.created_at <= NOW() - INTERVAL '7 days'
      GROUP BY
        u.id, u.username
      ORDER BY
        weekly_points DESC;
    `;

    try {
      await pool.query(query);
      console.log('Ranking został zaktualizowany!');
    } catch (err) {
      console.error('Błąd podczas aktualizacji rankingu:', err);
    }
  });
};
