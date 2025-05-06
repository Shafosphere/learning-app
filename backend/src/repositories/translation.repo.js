import pool from "../db/dbClient.js";

// Funkcja pobierająca słowo na podstawie tłumaczenia i języka
export const getWordByTranslation = async (translation) => {
  const result = await pool.query(
    "SELECT * FROM Translation WHERE translation = $1",
    [translation]
  );
  return result.rows[0]; // Zwracamy pierwszy wynik lub `undefined`, jeśli nie ma wyniku
};

// Pobranie tłumaczeń dla słowa na podstawie `word_id`
export const getWordTranslations = async (wordId) => {
  const result = await pool.query(
    "SELECT * FROM translation WHERE word_id = $1",
    [wordId]
  );
  return result.rows;
};

export const getTranslationsByWordId = async (wordId) => {
  const result = await pool.query(
    "SELECT * FROM translation WHERE word_id = $1",
    [wordId]
  );
  return result.rows;
};

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
  const result = await client.query(query, [wordIds]);
  return result.rows;
};

export const getLanguageWordTranslations = async (wordId) => {
  const result = await pool.query(
    "SELECT translation, language FROM translation WHERE word_id = $1",
    [wordId]
  );
  return result.rows; // Zwracamy już same wiersze
};
