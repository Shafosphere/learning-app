import express from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";
import { data } from "./data.js";
dotenv.config({ path: "./.env.local" });

const app = express();
const port = 8080;

const maxWordId = 614;
const minWordId = 14;

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

app.post("/data", async (req, res) => {
  const wordIds = new Set(req.body.wordIds);
  const words_used = new Set(req.body.words_used);
  let wordList = new Set();

  while (wordList.size < 20) {
    const randomWordId =
      Math.floor(Math.random() * (maxWordId - minWordId + 1)) + minWordId;

    if (!wordIds.has(randomWordId) && !words_used.has(randomWordId)) {
      wordList.add(randomWordId);
    }
  }

  wordList = Array.from(wordList);

  try {
    const results = await Promise.all(
      wordList.map(async (item) => {
        const checkResult = await db.query(
          "SELECT * FROM translation WHERE word_id = $1",
          [item]
        );
        return checkResult.rows;
      })
    );

    const formattedResults = results.map((wordPair) => {
      const wordEng = wordPair.find((w) => w.language === "en");
      const wordPl = wordPair.find((w) => w.language === "pl");
      return {
        id: wordEng.word_id,
        wordEng: {
          word: wordEng.translation,
          description: wordEng.description,
        },
        wordPl: {
          word: wordPl.translation,
          description: wordPl.description,
        },
      };
    });

    res.json({ message: "working", data: formattedResults });
  } catch (error) {
    console.error("Error fetching data:", error);
    res
      .status(500)
      .json({ message: "Error fetching data", error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// app.post("/import", async (req, res) => {
// console.log('startuje')
//   try {
//
//     await db.query("BEGIN");

//
//     for (const item of data) {
//       const wordRes = await db.query(
//         "INSERT INTO Word (word) VALUES ($1) RETURNING id",
//         [item.wordEng.word]
//       );
//       const wordId = wordRes.rows[0].id;

//       await db.query(
//         "INSERT INTO Translation (word_id, language, translation, description) VALUES ($1, $2, $3, $4)",
//         [wordId, "en", item.wordEng.word, item.wordEng.description]
//       );
//       await db.query(
//         "INSERT INTO Translation (word_id, language, translation, description) VALUES ($1, $2, $3, $4)",
//         [wordId, "pl", item.wordPl.word, item.wordPl.description]
//       );
//     }

//
//     await db.query("COMMIT");
//     res.status(200).json({ message: "Dane zostały pomyślnie zaimportowane." });
//   } catch (error) {
//
//     await db.query("ROLLBACK");
//     res
//       .status(500)
//       .json({
//         message: "Wystąpił błąd podczas importowania danych.",
//         error: error.message,
//       });
//   }
// });
