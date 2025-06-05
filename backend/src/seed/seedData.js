// src/seed/seedData.js  (ESM)
import pool from "../db/dbClient.js";
import { data } from "./data.js";

function getLevel(id) {
  return id <= 2974 ? "B2" : "C1";
}

async function main() {
  console.log("Connecting to database:", process.env.DB_NAME);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    console.log("Clearing tables: translation, word");
    await client.query("TRUNCATE translation, word RESTART IDENTITY CASCADE;");

    const seen = new Set(); // filter for duplicate ids in data.js

    for (const row of data) {
      if (seen.has(row.id)) continue; // skip duplicates (607, 608, ...)
      seen.add(row.id);

      const level = getLevel(row.id);

      // 1) insert word; Postgres will assign id (SERIAL / IDENTITY)
      const { rows } = await client.query(
        `INSERT INTO word(word, level)
           VALUES ($1,$2)
           RETURNING id`,
        [row.wordEng.word, level]
      );
      const wordId = rows[0].id;

      // 2) insert translations – both at once
      await client.query(
        `INSERT INTO translation(word_id, language, translation, description)
           VALUES ($1,'en',$2,$3),
                  ($1,'pl',$4,$5)
         ON CONFLICT DO NOTHING`,
        [
          wordId,
          row.wordEng.word,
          row.wordEng.description,
          row.wordPl.word,
          row.wordPl.description,
        ]
      );
    }

    await client.query("COMMIT");
    console.log("✅  Seed completed successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌  Seed error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();