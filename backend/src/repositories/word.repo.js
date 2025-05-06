import pool from "../db/dbClient.js";

export const getRandomWordsByNumber = async (count) => {
  const reults = await pool.query(
    "SELECT id FROM word ORDER BY RANDOM() LIMIT $1",
    [count]
  );
  return reults;
};

export const getNumberOfWords = async (lvl) => {
  try {
    const query = "SELECT COUNT(*) AS count FROM word WHERE level = $1";
    const values = [lvl];

    // Wykonanie zapytania
    const { rows } = await pool.query(query, values);

    // Zwrócenie wyniku
    return parseInt(rows[0].count, 10);
  } catch (error) {
    console.error("Error in getNumberOfWords:", error);
    throw error; // Przekazujemy błąd dalej, aby kontroler mógł go obsłużyć
  }
};

export const getWordsWithPagination = async (limit, offset) => {
  const result = await pool.query(
    "SELECT * FROM word ORDER BY id LIMIT $1 OFFSET $2",
    [limit, offset]
  );
  return result.rows;
};

export const searchWordById = async (id) => {
  const result = await pool.query("SELECT * FROM word WHERE id = $1", [id]);
  return result.rows;
};

// Wyszukiwanie słowa na podstawie fragmentu tekstu (`word`)
export const searchWordByText = async (text) => {
  const result = await pool.query("SELECT * FROM word WHERE word ILIKE $1", [
    `%${text}%`,
  ]);
  return result.rows;
};

export const insertWord = async (word, level) => {
  const result = await pool.query(
    "INSERT INTO word (word, level) VALUES ($1, $2) RETURNING id",
    [word, level]
  );
  return result.rows[0].id;
};

export const deleteWordById = async (wordId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Usunięcie tłumaczeń powiązanych ze słowem
    await client.query("DELETE FROM translation WHERE word_id = $1", [wordId]);

    // Usunięcie słowa
    await client.query("DELETE FROM word WHERE id = $1", [wordId]);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Pobieranie dostępnych identyfikatorów słów
export const getAvailableWordIds = async () => {
  try {
    const result = await pool.query("SELECT id FROM word");
    return result.rows.map((row) => row.id);
  } catch (error) {
    console.error("Error while fetching available word IDs:", error);
    throw error;
  }
};

export const getAvailableWords = async () => {
  try {
    const result = await pool.query("SELECT id, level FROM word");
    return result.rows;
  } catch (error) {
    console.error("Error while fetching available word IDs:", error);
    throw error;
  }
};

export const insertWordIntoUserProgress = async (client, userId, wordId) => {
  await client.query(
    "INSERT INTO user_word_progress (user_id, word_id) VALUES ($1, $2)",
    [userId, wordId]
  );
};

export const getRandomWord = async (difficulty) => {
  const result = await pool.query(
    "SELECT id FROM word WHERE level = $1 ORDER BY random()LIMIT 1",
    [difficulty]
  );
  return result;
};
