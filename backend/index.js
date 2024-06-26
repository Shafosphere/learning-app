import express from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";
dotenv.config({ path: "./.env.local" });
import jwt from 'jsonwebtoken';

// import { data } from "./data.js";
const app = express();
const port = 8080;


// B2 > 2974 < C1 
const maxWordId = 2974;
const minWordId = 1;

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

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    process.env.REACT_APP_TOKEN_KEY,
    {expiresIn: '1h'}
  );
}

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};


const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: "Access denied.",
    });
  }
  next();
};

app.post(
  "/register",
  [
    body("username").isLength({ min: 4 }).trim().escape(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }).trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await db.query(
        "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, 'user') RETURNING id",
        [username, email, hashedPassword]
      );

      res.status(201).json({ success: true, userId: result.rows[0].id });
    } catch (error) {
      console.error("Registration error:", error);
      if (error.code === "23505") {
        // unique violation
        res.status(409).json({
          success: false,
          message: "Username or email already exists.",
        });
      } else {
        res.status(500).json({
          success: false,
          message: "An error occurred during registration.",
        });
      }
    }
  }
);

app.get("/admin", authenticateToken, authorizeAdmin, (req, res) => {
  res.json({
    success: true,
    message: "Welcome admin!",
  });
});


app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const userResult = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    const user = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    const token = generateToken(user);

    // Ustaw ciasteczko z tokenem
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict', // lub 'Lax'
      maxAge: 3600000, // 1 godzina
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during login.",
    });
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});


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

//     await db.query("BEGIN");


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


//     await db.query("COMMIT");
//     res.status(200).json({ message: "Dane zostały pomyślnie zaimportowane." });
//   } catch (error) {

//     await db.query("ROLLBACK");
//     res
//       .status(500)
//       .json({
//         message: "Wystąpił błąd podczas importowania danych.",
//         error: error.message,
//       });
//   }
// });