// Zmodyfikowana funkcja insertOrUpdateUserAutosave
export const insertOrUpdateUserAutosave = async (
  client,
  userId,
  level,
  words,
  device_identifier,
  patchNumber
) => {
  const query = `
      INSERT INTO user_autosave (user_id, level, words, device_identifier, 
        ${level === "B2" ? "patch_number_b2" : "patch_number_c1"})
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, level)
      DO UPDATE SET
        words = EXCLUDED.words,
        device_identifier = EXCLUDED.device_identifier,
        ${level === "B2" ? "patch_number_b2" : "patch_number_c1"} = EXCLUDED.${
    level === "B2" ? "patch_number_b2" : "patch_number_c1"
  },
        last_saved = NOW();
    `;
  const values = [
    userId,
    level,
    JSON.stringify(words),
    device_identifier,
    patchNumber,
  ];
  await client.query(query, values);
};

// Zmodyfikowana funkcja pomocnicza, która pobiera dane z uwzględnieniem level
export const getAutosaveData = async (client, userId, level) => {
  const result = await client.query(
    "SELECT * FROM user_autosave WHERE user_id = $1 AND level = $2",
    [userId, level]
  );
  return result.rows[0] || null;
};
