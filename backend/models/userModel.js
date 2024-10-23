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

export const deleteUserByID = async (userId) => {
  await pool.query("DELETE FROM users WHERE id = $1", [userId]);
};

export const getWordsWithPagination = async (limit, offset) => {
  const result = await pool.query(
    "SELECT * FROM word ORDER BY id LIMIT $1 OFFSET $2",
    [limit, offset]
  );
  return result.rows;
};

export const getUsersWithPagination = async (limit, offset) => {
  const result = await pool.query(
    "SELECT id, username, email, role, created_at, last_login FROM users ORDER BY id LIMIT $1 OFFSET $2",
    [limit, offset]
  );
  return result.rows;
};

export const fetchGlobalData = async () => {
  const result = await pool.query(`
    SELECT 
      (SELECT COUNT(DISTINCT language) FROM translation) AS liczba_jezykow,
      (SELECT COUNT(*) FROM users) AS liczba_uzytkownikow,
      (SELECT COUNT(*) FROM word) AS liczba_slowek,
      (SELECT COUNT(*) FROM reports) AS liczba_raportow
  `);
  return result.rows[0];
};

export const getTranslationsByWordId = async (wordId) => {
  const result = await pool.query(
    "SELECT * FROM translation WHERE word_id = $1",
    [wordId]
  );
  return result.rows;
};

// Aktualizacja tłumaczenia na podstawie `word_id` i `language`
export const updateTranslation = async (translation) => {
  const { translation: translationText, description, word_id, language } = translation;
  
  await pool.query(
    `UPDATE translation
     SET translation = $1, description = $2
     WHERE word_id = $3 AND language = $4`,
    [translationText, description, word_id, language]
  );
};

export const searchWordById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM word WHERE id = $1",
    [id]
  );
  return result.rows;
};

// Wyszukiwanie słowa na podstawie fragmentu tekstu (`word`)
export const searchWordByText = async (text) => {
  const result = await pool.query(
    "SELECT * FROM word WHERE word ILIKE $1",
    [`%${text}%`]
  );
  return result.rows;
};

// Wyszukiwanie użytkownika na podstawie identyfikatora (`id`)
export const searchUserById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE id = $1",
    [id]
  );
  return result.rows;
};

// Wyszukiwanie użytkownika na podstawie adresu e-mail (`email`)
export const searchUserByEmail = async (email) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email ILIKE $1",
    [`%${email}%`]
  );
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

export const insertWord = async (word) => {
  const result = await pool.query(
    "INSERT INTO word (word) VALUES ($1) RETURNING id",
    [word]
  );
  return result.rows[0].id;
};

// Wstawienie tłumaczeń dla danego słowa
export const insertTranslations = async (wordId, translations) => {
  const translationPromises = translations.map((translation) => {
    return pool.query(
      "INSERT INTO translation (word_id, language, translation, description) VALUES ($1, $2, $3, $4)",
      [
        wordId,
        translation.language,
        translation.translation,
        translation.description,
      ]
    );
  });

  // Wykonanie wszystkich zapytań do wstawienia tłumaczeń
  await Promise.all(translationPromises);
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

export const deleteOldPatches = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM word_patches');
    console.log('Old patches have been deleted.');

    await client.query('ALTER SEQUENCE word_patches_patch_id_seq RESTART WITH 1');
    console.log('Patch ID sequence has been reset.');

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error while deleting old patches and resetting sequence:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Pobieranie dostępnych identyfikatorów słów
export const getAvailableWordIds = async () => {
  try {
    const result = await pool.query('SELECT id FROM word');
    return result.rows.map((row) => row.id);
  } catch (error) {
    console.error("Error while fetching available word IDs:", error);
    throw error;
  }
};

// Generowanie nowych patchy
export const generatePatchesBatch = async (patchSize) => {
  const client = await pool.connect();
  try {
    const availableWordIds = await getAvailableWordIds();
    const remainingIds = [...availableWordIds];

    while (remainingIds.length >= patchSize) {
      const patchIds = [];
      for (let i = 0; i < patchSize; i++) {
        const randomIndex = Math.floor(Math.random() * remainingIds.length);
        patchIds.push(remainingIds[randomIndex]);
        remainingIds.splice(randomIndex, 1);
      }

      const patchIdsJson = JSON.stringify(patchIds);
      await client.query('INSERT INTO word_patches (word_ids) VALUES ($1)', [patchIdsJson]);
      console.log(`Patch created with IDs: ${patchIds}`);
    }

    if (remainingIds.length > 0) {
      const remainingIdsJson = JSON.stringify(remainingIds);
      await client.query('INSERT INTO word_patches (word_ids) VALUES ($1)', [remainingIdsJson]);
      console.log(`Last patch created with IDs: ${remainingIds}`);
    }

    console.log('All patches have been generated successfully.');
  } catch (error) {
    console.error("Error while generating patches:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const updateUserInDb = async ({ id, username, email, role }) => {
  try {
    const result = await pool.query(
      "UPDATE users SET username = $1, email = $2, role = $3 WHERE id = $4",
      [username, email, role, id]
    );
    return result;
  } catch (error) {
    console.error("Error updating user in database:", error);
    throw error; // Przekazujemy błąd dalej, aby kontroler mógł go obsłużyć
  }
};