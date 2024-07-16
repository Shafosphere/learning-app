import express from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";
import cookieParser from "cookie-parser"; // Importuj cookie-parser
dotenv.config({ path: "./.env.local" });
import jwt from "jsonwebtoken";

// import { data } from "./data.js";
const app = express();
const port = 8080;

// B2 > 2974 < C1
const maxWordId = 2974;
const minWordId = 1;

const DATABASE = process.env.REACT_APP_DATABASE;

app.use(express.json());
app.use(cookieParser());

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
    { expiresIn: "1h" }
  );
};

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.REACT_APP_TOKEN_KEY, (err, user) => {
    if (err) return res.sendStatus(401);
    req.user = user;
    next();
  });
};

const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied.",
    });
  }
  next();
};

app.post(
  "/data-reports",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const response = await db.query(
        "SELECT report_type AS type, description AS desc, created_at AS time, id AS id FROM reports"
      );
      const data = response.rows;
      res.json(data); // Zwrócenie wszystkich wyników
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

app.post(
  "/detail-report",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    const { id } = req.body;
    const report_id = id;
    try {
      const report_data = await db.query(
        `SELECT reports.*, users.username 
         FROM reports 
         JOIN users ON reports.user_id = users.id 
         WHERE reports.id = $1`,
        [report_id]
      );

      if (report_data.rows.length === 0) {
        return res.status(404).send("Report not found");
      }

      const report = report_data.rows[0];
      let response_data = { ...report };

      if (report.report_type === "word_issue" && report.word_id) {
        try {
          const translation_data = await db.query(
            "SELECT * FROM translation WHERE word_id = $1",
            [report.word_id]
          );

          response_data.translations = translation_data.rows;
        } catch (error) {
          console.error(error);
          return res.status(500).send("Internal Server Error");
        }
      }

      console.log(response_data);
      res.json(response_data);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

app.patch(
  "/detail-update",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    const { report } = req.body;
    try {
      const translations = report.translations;

      for (const translation of translations) {
        await db.query(
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
      }

      res.status(200).send("Translations updated successfully.");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

app.delete(
  "/detail-delete",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    const { id } = req.body;
    try {
      await db.query(`DELETE FROM reports WHERE id = $1`, [id]);

      res.status(200).send("Report has been deleted.");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

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

app.get("/check-auth", authenticateToken, (req, res) => {
  res.status(200).json({ loggedIn: true, user: req.user });
});

app.post("/report", authenticateToken, async (req, res) => {
  const { reportType, word, description, language } = req.body;
  const userId = req.user.id; // Pobieranie user_id z tokenu

  console.log(reportType, word, description, language, userId);

  try {
    let wordId = null;

    if (reportType === "word_issue") {
      const wordResult = await db.query(
        "SELECT * FROM Translation WHERE language = $1 AND translation = $2",
        [language, word]
      );

      if (wordResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Word not found in the specified language.",
        });
      }

      wordId = wordResult.rows[0].word_id;
    }

    // Dodanie raportu
    const result = await db.query(
      "INSERT INTO reports (user_id, report_type, word_id, description) VALUES ($1, $2, $3, $4) RETURNING id",
      [userId, reportType, wordId, description]
    );

    res.status(201).json({
      success: true,
      message: "Report received",
      reportId: result.rows[0].id,
    });
  } catch (error) {
    console.error("Error while reporting:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your report.",
    });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const userResult = await db.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
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
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict", // lub 'Lax'
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

app.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
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

app.post("/account-data", authenticateToken, async (req, res) => {
  const username = req.user.username; 
  let email;

  try {
    const userResult = await db.query(
      "SELECT email FROM users WHERE username = $1",
      [username]
    );
    email = userResult.rows[0].email; 
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred on the server.",
    });
  }

  res.status(200).json({
    success: true,
    message: "Data received",
    username: req.user.username,
    email: email,
  });
});

const accountUpdateValidationRules = [
  body("username").optional().isLength({ min: 4 }).trim().escape(),
  body("email").optional().isEmail().normalizeEmail(),
  body("oldPass").optional().isLength({ min: 6 }).trim(),
  body("newPass").optional().isLength({ min: 6 }).trim(),
  body("confirmPass").optional().custom((value, { req }) => {
    if (value !== req.body.newPass) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
];

app.patch('/account-update', authenticateToken, accountUpdateValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, oldPass, newPass } = req.body;
  const userId = req.user.id; // Assuming the user ID is available after authentication

  try {
    // Fetch current user data
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check old password if provided
    if (oldPass && !await bcrypt.compare(oldPass, user.password)) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    // Hash new password if provided
    let hashedPassword = user.password;
    if (newPass) {
      hashedPassword = await bcrypt.hash(newPass, 10);
    }

    // Update user data
    const updatedUser = {
      username: username || user.username,
      email: email || user.email,
      password: hashedPassword,
    };

    await db.query(
      'UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4',
      [updatedUser.username, updatedUser.email, updatedUser.password, userId]
    );

    // Generate a new token
    const newToken = generateToken(updatedUser);

    // Clear the old token and set the new token
    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3600000, // 1 hour
    });

    res.status(200).json({ success: true, message: 'Account updated successfully!', token: newToken });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update account.' });
  }
});

app.delete('/delete-account', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    // Delete the user account
    await db.query('DELETE FROM users WHERE id = $1', [userId]);

    // Clear the token
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.status(200).json({ success: true, message: 'Account deleted and logged out successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to delete account.' });
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
