export const getTopArenaUsers = async (limit) => {
  const query = `
      SELECT
        users.username,
        users.avatar,
        arena.current_points AS points
      FROM arena
      JOIN users ON arena.user_id = users.id
      JOIN ranking ON ranking.user_id = users.id
      WHERE ranking.ban = false
      ORDER BY arena.current_points DESC
      LIMIT $1;
    `;

  const values = [limit];
  const result = await pool.query(query, values);

  return result.rows;
};

export const updateUserArena = async (pointsAfter, newStreak, userId) => {
  await pool.query(
    `
      UPDATE arena SET
        current_points = $1,
        current_streak = $2,
        last_answered = NOW()
      WHERE user_id = $3
    `,
    [pointsAfter, newStreak, userId]
  );
};
