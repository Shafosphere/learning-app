export const userRankingUpdate = async (userId, username) => {
  await pool.query(
    `
      INSERT INTO ranking (user_id, username, flashcard_points)
      VALUES ($1, $2, 1)
      ON CONFLICT (user_id) DO UPDATE
      SET flashcard_points = ranking.flashcard_points + 1, last_updated = NOW();
      `,
    [userId, username]
  );
};

export const getTopRankingUsersFlashcard = async (limit) => {
  const query = `
      SELECT users.username,
      users.avatar,
      ranking.flashcard_points AS points
      FROM ranking
      JOIN users ON ranking.user_id = users.id
      WHERE ranking.ban = false
      ORDER BY ranking.flashcard_points DESC
      LIMIT $1;
    `;
  const values = [limit];
  const result = await pool.query(query, values);
  return result.rows;
};

export const ranking_init = async (userId) => {
  await pool.query(
    "INSERT INTO arena (user_id, current_points) VALUES ($1, 1000) ON CONFLICT (user_id) DO NOTHING",
    [userId]
  );
};

export const getUserRankingPoints = async (userId) => {
  const result = await pool.query(
    "SELECT current_points FROM arena WHERE user_id = $1",
    [userId]
  );
  return result;
};

export const updateUserRankingHistory = async (
  userId,
  wordId,
  userAnswer,
  isCorrect,
  pointsBefore,
  pointsAfter,
  responseTimeMs,
  tier,
  newStreak
) => {
  await pool.query(
    "INSERT INTO answer_history (user_id, word_id, given_answer, is_correct,points_before, points_after, response_time_ms,difficulty_tier, streak) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
    [
      userId,
      wordId,
      userAnswer,
      isCorrect,
      pointsBefore,
      pointsAfter,
      responseTimeMs,
      tier,
      newStreak,
    ]
  );
};

export const getRankingHistoryById = async (userId, number) => {
  const result = await pool.query(
    "SELECT points_after FROM answer_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2",
    [userId, number]
  );
  return result; // Zwracamy już same wiersze
};
