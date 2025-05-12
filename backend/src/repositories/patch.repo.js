import pool from "../db/dbClient.js";
import { getAvailableWords } from "./word.repo.js";

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

export const resetPatchNumberByUserID = async (client, userId, level) => {
  const query = `
      UPDATE user_autosave
      SET ${level === "B2" ? "patch_number_b2 = 1" : "patch_number_c1 = 1"}
      WHERE user_id = $1
    `;
  await client.query(query, [userId]);
};
