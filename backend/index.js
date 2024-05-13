import express from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";
import { data } from "./data.js";
dotenv.config({ path: "./.env.local" });

const app = express();
const port = 8080;

const DATABASE = process.env.REACT_APP_DATABASE;

app.use(express.json());

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "word-repository",
  password: DATABASE,
  port: 5433,
});
db.connect();

const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};
app.use(cors(corsOptions));

app.post("/import", async (req, res) => {
console.log('startuje')
  try {
    // Rozpocznij transakcję
    await db.query("BEGIN");

    // Wstaw dane do tabeli Word i Translation
    for (const item of data) {
      const wordRes = await db.query(
        "INSERT INTO Word (word) VALUES ($1) RETURNING id",
        [item.wordEng.word]
      );
      const wordId = wordRes.rows[0].id;

      await db.query(
        "INSERT INTO Translation (word_id, language, translation, description) VALUES ($1, $2, $3, $4)",
        [wordId, "en", item.wordEng.word, item.wordEng.description]
      );
      await db.query(
        "INSERT INTO Translation (word_id, language, translation, description) VALUES ($1, $2, $3, $4)",
        [wordId, "pl", item.wordPl.word, item.wordPl.description]
      );
    }

    // Zatwierdź transakcję
    await db.query("COMMIT");
    res.status(200).json({ message: "Dane zostały pomyślnie zaimportowane." });
  } catch (error) {
    // Wycofaj transakcję w przypadku błędu
    await db.query("ROLLBACK");
    res
      .status(500)
      .json({
        message: "Wystąpił błąd podczas importowania danych.",
        error: error.message,
      });
  }
});

app.get("/api/data", (req, res) => {
  // Handle your API logic here
  const data = { message: "working" };
  res.json(data);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
