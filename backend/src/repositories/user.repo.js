export const createUser = async (username, email, hashedPassword) => {
  const result = await pool.query(
    "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, 'user') RETURNING id",
    [username, email, hashedPassword]
  );
  return result.rows[0].id; // Zwracamy ID nowo utworzonego użytkownika
};

export const getUserByUsername = async (username) => {
  const result = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  return result.rows[0]; // Zwracamy użytkownika, jeśli istnieje
};
export const getUserByUserName = async (username) => {
  const result = await pool.query(
    "SELECT email, avatar FROM users WHERE username = $1",
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

// Pobranie użytkownika na podstawie email
export const getUserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows;
};

export const updateUserById = async (userId, updates) => {
  const fields = [];
  const values = [];
  let index = 1;

  // Iteracja po polach, które mają zostać zaktualizowane
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      fields.push(`${key} = $${index}`);
      values.push(value);
      index++;
    }
  }

  if (fields.length === 0) {
    throw new Error("Brak danych do aktualizacji.");
  }

  const query = `UPDATE users SET ${fields.join(", ")} WHERE id = $${index}`;
  values.push(userId);

  await pool.query(query, values);
};

export const deleteUserByID = async (userId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query("DELETE FROM user_word_progress WHERE user_id = $1", [
      userId,
    ]);
    await client.query("DELETE FROM user_autosave WHERE user_id = $1", [
      userId,
    ]);
    await client.query("DELETE FROM ranking WHERE user_id = $1", [userId]);
    await client.query("DELETE FROM arena WHERE user_id = $1", [userId]);
    await client.query("DELETE FROM users WHERE id = $1", [userId]);

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const getUsersWithPagination = async (limit, offset) => {
  const result = await pool.query(
    `SELECT 
         users.id, 
         users.username, 
         users.email, 
         users.role, 
         users.created_at, 
         users.last_login, 
         ranking.ban 
       FROM 
         users
       LEFT JOIN 
         ranking 
       ON 
         users.id = ranking.user_id
       ORDER BY 
         users.id 
       LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
};

// Wyszukiwanie użytkownika na podstawie identyfikatora (`id`)
export const searchUserById = async (id) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows;
};

// Wyszukiwanie użytkownika na podstawie adresu e-mail (`email`)
export const searchUserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email ILIKE $1", [
    `%${email}%`,
  ]);
  return result.rows;
};

// Wyszukiwanie użytkownika na podstawie nazwy użytkownika (`username`)
export const searchUserByUsername = async (username) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE username ILIKE $1",
    [`%${username}%`]
  );
  return result.rows;
};

export const updateUserInDb = async ({ id, username, email, role, ban }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const userResult = await client.query(
      "UPDATE users SET username = $1, email = $2, role = $3 WHERE id = $4",
      [username, email, role, id]
    );

    const rankingResult = await client.query(
      "UPDATE ranking SET ban = $1 WHERE user_id = $2",
      [ban, id]
    );

    await client.query("COMMIT");
    return { userResult, rankingResult };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating user in database:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const incrementUserActivity = async (activity_type, activity_date) => {
  const result = await pool.query(
    `INSERT INTO user_activity_stats (activity_date, activity_type, activity_count)
      VALUES ($1, $2, 1)
      ON CONFLICT (activity_date, activity_type)
      DO UPDATE SET activity_count = user_activity_stats.activity_count + 1
      RETURNING *;`,
    [activity_date, activity_type]
  );
  return result.rows[0];
};

export const fetchUserActivityData = async () => {
  const query = `
      SELECT activity_date, activity_type, activity_count
      FROM user_activity_stats
    `;
  const { rows } = await pool.query(query);
  return rows;
};

export const getUserIdFromProgress = async (client, userId, wordId) => {
  const result = await client.query(
    "SELECT id FROM user_word_progress WHERE user_id = $1 AND word_id = $2",
    [userId, wordId]
  );
  return result;
};

export const deleteDataUserByUserID = async (client, userId, level) => {
  const query = `
      DELETE FROM user_autosave
      WHERE user_id = $1 AND level = $2
    `;
  await client.query(query, [userId, level]);
};
