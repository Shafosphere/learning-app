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
export const getWordByTranslation = async (translation) => {
  const result = await pool.query(
    "SELECT * FROM Translation WHERE translation = $1",
    [translation]
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

export const getPatchWordsByLevel = async (patchNumber, level) => {
  let table;

  table = level === "B2" ? "b2_patches" : "c1_patches";
  const queryText = `SELECT word_ids FROM ${table} WHERE patch_id = $1`;

  const result = await pool.query(queryText, [patchNumber]);
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

// Pobranie maksymalnego numeru patchy
export const getAllMaxPatchId = async () => {
  try {
    const B2_result = await pool.query(
      "SELECT MAX(patch_id) as max_B2_patch_id FROM b2_patches"
    );
    const C1_result = await pool.query(
      "SELECT MAX(patch_id) as max_C1_patch_id FROM c1_patches"
    );

    const result = {
      totalB2Patches: B2_result.rows[0].max_b2_patch_id || 0,
      totalC1Patches: C1_result.rows[0].max_c1_patch_id || 0,
    };

    return result;
  } catch (error) {
    console.error("Error fetching max patch ids:", error);
    throw error;
  }
};

export const getAllPatchLength = async () => {
  try {
    const B2_result = await pool.query(
      "SELECT COUNT(*) as total_b2_patches FROM b2_patches"
    );

    const C1_result = await pool.query(
      "SELECT COUNT(*) as total_c1_patches FROM c1_patches"
    );

    const result = {
      lengthB2patch: parseInt(B2_result.rows[0].total_b2_patches, 10) || 0,
      lengthC1patch: parseInt(C1_result.rows[0].total_c1_patches, 10) || 0,
    };

    return result;
  } catch (error) {
    console.error("Error in getAllPatchLength:", error);
    throw error; // Przekazujemy błąd dalej, aby kontroler mógł go obsłużyć
  }
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

// Aktualizacja danych użytkownika
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

export const getTranslationsByWordId = async (wordId) => {
  const result = await pool.query(
    "SELECT * FROM translation WHERE word_id = $1",
    [wordId]
  );
  return result.rows;
};

// Aktualizacja tłumaczenia na podstawie `word_id` i `language`
export const updateTranslation = async (translation) => {
  const {
    translation: translationText,
    description,
    word_id,
    language,
  } = translation;

  await pool.query(
    `UPDATE translation
     SET translation = $1, description = $2
     WHERE word_id = $3 AND language = $4`,
    [translationText, description, word_id, language]
  );

  if (language === "en") {
    await pool.query(
      `UPDATE word
       SET word = $1
       WHERE id = $2`,
      [translationText, word_id]
    );
  }
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

export const insertWord = async (word, level) => {
  const result = await pool.query(
    "INSERT INTO word (word, level) VALUES ($1, $2) RETURNING id",
    [word, level]
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
    await client.query("BEGIN");
    await client.query("DELETE FROM word_patches");
    console.log("Old patches have been deleted.");

    await client.query(
      "ALTER SEQUENCE word_patches_patch_id_seq RESTART WITH 1"
    );
    console.log("Patch ID sequence has been reset.");

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(
      "Error while deleting old patches and resetting sequence:",
      error
    );
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
      await client.query("INSERT INTO word_patches (word_ids) VALUES ($1)", [
        patchIdsJson,
      ]);
      console.log(`Patch created with IDs: ${patchIds}`);
    }

    if (remainingIds.length > 0) {
      const remainingIdsJson = JSON.stringify(remainingIds);
      await client.query("INSERT INTO word_patches (word_ids) VALUES ($1)", [
        remainingIdsJson,
      ]);
      console.log(`Last patch created with IDs: ${remainingIds}`);
    }

    console.log("All patches have been generated successfully.");
  } catch (error) {
    console.error("Error while generating patches:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const deleteOldNeWPatches = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Usuwanie patchy z tabeli b2_patches
    await client.query("DELETE FROM b2_patches");
    console.log("Old B2 patches have been deleted.");

    // Resetowanie sekwencji dla b2_patches
    await client.query("ALTER SEQUENCE b2_patches_patch_id_seq RESTART WITH 1");
    console.log("B2 Patch ID sequence has been reset.");

    // Usuwanie patchy z tabeli c1_patches
    await client.query("DELETE FROM c1_patches");
    console.log("Old C1 patches have been deleted.");

    // Resetowanie sekwencji dla c1_patches
    await client.query("ALTER SEQUENCE c1_patches_patch_id_seq RESTART WITH 1");
    console.log("C1 Patch ID sequence has been reset.");

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(
      "Error while deleting old patches and resetting sequences:",
      error
    );
    throw error;
  } finally {
    client.release();
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

export const generateNewPatchesBatch = async (patchSize) => {
  const client = await pool.connect();
  try {
    const availableWords = await getAvailableWords(); // Zwraca { id, level }

    // Rozdzielenie słówek na B2 i C1
    const b2Words = availableWords.filter((word) => word.level === "B2");
    const c1Words = availableWords.filter((word) => word.level === "C1");

    // Funkcja do generowania patchy dla danego poziomu
    const generatePatchesForLevel = async (wordsArray, tableName) => {
      const remainingIds = [...wordsArray.map((word) => word.id)];

      while (remainingIds.length >= patchSize) {
        const patchIds = [];
        for (let i = 0; i < patchSize; i++) {
          const randomIndex = Math.floor(Math.random() * remainingIds.length);
          patchIds.push(remainingIds[randomIndex]);
          remainingIds.splice(randomIndex, 1);
        }

        const patchIdsJson = JSON.stringify(patchIds);
        await client.query(`INSERT INTO ${tableName} (word_ids) VALUES ($1)`, [
          patchIdsJson,
        ]);
        console.log(`Patch created in ${tableName} with IDs: ${patchIds}`);
      }

      // Dodanie pozostałych słów jako ostatniego patcha
      if (remainingIds.length > 0) {
        const remainingIdsJson = JSON.stringify(remainingIds);
        await client.query(`INSERT INTO ${tableName} (word_ids) VALUES ($1)`, [
          remainingIdsJson,
        ]);
        console.log(
          `Last patch created in ${tableName} with IDs: ${remainingIds}`
        );
      }
    };

    // Generowanie patchy dla B2
    await generatePatchesForLevel(b2Words, "b2_patches");
    // Generowanie patchy dla C1
    await generatePatchesForLevel(c1Words, "c1_patches");

    console.log("All patches have been generated successfully.");
  } catch (error) {
    console.error("Error while generating patches:", error);
    throw error;
  } finally {
    client.release();
  }
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

export const patchLength = async () => {
  try {
    const totalPatchesResult = await pool.query(
      "SELECT COUNT(*) as total_patches FROM word_patches"
    );
    return parseInt(totalPatchesResult.rows[0].total_patches, 10);
  } catch (error) {
    console.error("Error in patchLength:", error);
    throw error; // Przekazujemy błąd dalej, aby kontroler mógł go obsłużyć
  }
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

export const insertWordIntoUserProgress = async (client, userId, wordId) => {
  await client.query(
    "INSERT INTO user_word_progress (user_id, word_id) VALUES ($1, $2)",
    [userId, wordId]
  );
};

export const userRankingUpdate = async (client, userId) => {
  await client.query(
    `
    INSERT INTO ranking (user_id, weekly_points)
    VALUES ($1, 1)
    ON CONFLICT (user_id) DO UPDATE
    SET weekly_points = ranking.weekly_points + 1, last_updated = NOW();
    `,
    [userId]
  );
};

export const getTopRankingUsers = async (limit) => {
  const query = `
    SELECT users.username, users.avatar, ranking.weekly_points
    FROM ranking
    JOIN users ON ranking.user_id = users.id
    WHERE ranking.ban = false
    ORDER BY ranking.weekly_points DESC
    LIMIT $1;
  `;
  const values = [limit];
  const result = await pool.query(query, values);
  return result.rows;
};

export const insertOrUpdateUserAutosave = async (
  client,
  userId,
  level,
  words,
  device_identifier
) => {
  const query = `
    INSERT INTO user_autosave (user_id, level, words, device_identifier)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id, level)
    DO UPDATE SET
      words = EXCLUDED.words,
      device_identifier = EXCLUDED.device_identifier,
      last_saved = NOW();
  `;
  const values = [userId, level, JSON.stringify(words), device_identifier];
  await client.query(query, values);
};

// Zmodyfikowana funkcja pomocnicza, która pobiera dane z uwzględnieniem level
export const getAutosaveData = async (client, userId, level) => {
  const result = await client.query(
    "SELECT * FROM user_autosave WHERE user_id = $1 AND level = $2",
    [userId, level]
  );
  console.log("Wynik zapytania:", result.rows[0]);
  return result.rows[0] || null;
};

export const getBatchWordTranslations = async (client, wordIds) => {
  if (wordIds.length === 0) return [];

  const query = `
    SELECT 
      t1.word_id,
      t1.translation as en_translation,
      t1.description as en_description,
      t2.translation as pl_translation,
      t2.description as pl_description
    FROM translation t1
    LEFT JOIN translation t2 
      ON t1.word_id = t2.word_id 
      AND t2.language = 'pl'
    WHERE t1.language = 'en'
      AND t1.word_id = ANY($1)
  `;
  console.log("Wykonuję zapytanie:", query, wordIds);
  const result = await client.query(query, [wordIds]);
  return result.rows;
};