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

// B2 >= 3264 < C1
const maxWordId = 5260;
const minWordId = 1;
const b2 = 3264;

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
  if (!token) {
    return res.status(403).json({
      success: false,
      message: "Token not found. Please login.",
    });
  }

  jwt.verify(token, process.env.REACT_APP_TOKEN_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token. Please login again.",
      });
    }
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

    await db.query(
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1",
      [user.id]
    );

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

app.get("/pre-data", async (req, res) => {
  console.log("pre-data");
  const data = {
    b2: b2,
    minWordId: minWordId,
    maxWordId: maxWordId,
  };
  res.json(data);
});

app.post("/data", async (req, res) => {
  const wordList = req.body.wordList;
  const patchNumber = req.body.patchNumber;

  if (patchNumber && patchNumber > 0) {
    console.log(`Pobieranie danych dla patcha numer ${patchNumber}`);
    try {
      const result = await db.query(
        "SELECT word_ids FROM word_patches WHERE patch_id = $1",
        [patchNumber]
      );

      if (result.rows.length === 0) {
        console.log('cos nie dziala: ' + result);
        return res.status(404).json({ message: "Patch nie znaleziony" });
      }

      let wordIds = result.rows[0].word_ids;

      // Jeśli dane są w formacie tekstowym, przekształć je do formatu JSON
      if (typeof wordIds === 'string') {
        wordIds = `[${wordIds}]`; // Dodanie nawiasów do stworzenia poprawnego JSON
        wordIds = JSON.parse(wordIds); // Parsowanie do tablicy
      } else if (typeof wordIds === 'object' && wordIds !== null) {
        // Jeżeli wordIds jest już obiektem JSON
        wordIds = wordIds.map(Number); // Upewnij się, że elementy są liczbami
      }

      console.log('word_ids:', wordIds);

      const results = await Promise.all(
        wordIds.map(async (id) => {
          const checkResult = await db.query(
            "SELECT * FROM translation WHERE word_id = $1",
            [id]
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

      const maxPatchResult = await db.query("SELECT MAX(patch_id) as max_patch_id FROM word_patches");
      const maxPatchId = maxPatchResult.rows[0].max_patch_id;

      const isThisLastOne = (patchNumber === maxPatchId);

      console.log('zwracam:', formattedResults);
      res.json({ message: "working", data: formattedResults, isThisLastOne });
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ message: "Error fetching data", error: error.message });
    }
  } else {
    // Obsługa dla starej logiki, jeśli patchNumber nie jest podany
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
      res.status(500).json({ message: "Error fetching data", error: error.message });
    }
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
  body("confirmPass")
    .optional()
    .custom((value, { req }) => {
      if (value !== req.body.newPass) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

app.patch(
  "/account-update",
  authenticateToken,
  accountUpdateValidationRules,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, oldPass, newPass } = req.body;
    const userId = req.user.id; // Assuming the user ID is available after authentication

    try {
      // Fetch current user data
      const userResult = await db.query("SELECT * FROM users WHERE id = $1", [
        userId,
      ]);
      const user = userResult.rows[0];

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check old password if provided
      if (oldPass && !(await bcrypt.compare(oldPass, user.password))) {
        return res.status(400).json({ message: "Old password is incorrect" });
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
        "UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4",
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

      res.status(200).json({
        success: true,
        message: "Account updated successfully!",
        token: newToken,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to update account." });
    }
  }
);

app.delete("/delete-account", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    // Delete the user account
    await db.query("DELETE FROM users WHERE id = $1", [userId]);

    // Clear the token
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.status(200).json({
      success: true,
      message: "Account deleted and logged out successfully.",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete account." });
  }
});

app.get("/words", authenticateToken, authorizeAdmin, async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  console.log(`Fetching words for page: ${page}, limit: ${limit}`);
  try {
    const offset = (page - 1) * limit;
    console.log(`Calculated offset: ${offset}`);
    const result = await db.query(
      "SELECT * FROM word ORDER BY id LIMIT $1 OFFSET $2",
      [parseInt(limit), offset]
    );
    console.log("Fetched words:", result.rows);
    res.status(200).json(result.rows); // Returning status 200
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.get("/users", authenticateToken, authorizeAdmin, async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  const offset = (page - 1) * limit;
  try {
    const result = await db.query(
      "SELECT id, username, email, role, created_at, last_login FROM users ORDER BY id LIMIT $1 OFFSET $2",
      [parseInt(limit), offset]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Server Error");
  }
});

app.get("/global-data", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        (SELECT COUNT(DISTINCT language) FROM translation) AS liczba_jezykow,
        (SELECT COUNT(*) FROM users) AS liczba_uzytkownikow,
        (SELECT COUNT(*) FROM word) AS liczba_slowek,
        (SELECT COUNT(*) FROM reports) AS liczba_raportow
    `);

    res.status(200).json(result.rows[0]); // Zwracamy pierwszy wiersz jako obiekt
  } catch (err) {
    console.error("Error fetching global data:", err);
    res.status(500).send("Server Error");
  }
});

app.post(
  "/word-detail",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    const { id } = req.body;

    try {
      const translation_data = await db.query(
        "SELECT * FROM translation WHERE word_id = $1",
        [id]
      );

      const response_data = {
        translations: translation_data.rows,
      };
      console.log(response_data);
      res.json(response_data);
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal Server Error");
    }
  }
);

app.patch(
  "/word-update",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    const { word } = req.body;
    try {
      const translations = word.translations;

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

app.patch(
  "/users-update",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    const { users } = req.body;
    console.log(users);
    try {
      res.status(200).send("Users updated successfully.");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

app.get("/search", authenticateToken, authorizeAdmin, async (req, res) => {
  const { query } = req.query;

  try {
    let result;
    if (!isNaN(query)) {
      // Jeśli query jest liczbą
      result = await db.query("SELECT * FROM word WHERE id = $1", [
        parseInt(query),
      ]);
    } else {
      // Jeśli query jest ciągiem znaków
      result = await db.query("SELECT * FROM word WHERE word ILIKE $1", [
        `%${query}%`,
      ]);
    }
    console.log(result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.get("/search-user", authenticateToken, authorizeAdmin, async (req, res) => {
  const { query } = req.query;

  try {
    let result;
    if (!isNaN(query)) {
      // Jeśli query jest liczbą
      result = await db.query("SELECT * FROM users WHERE id = $1", [
        parseInt(query),
      ]);
    } else if (query.includes("@")) {
      // Jeśli query jest emailem
      result = await db.query("SELECT * FROM users WHERE email ILIKE $1", [
        `%${query}%`,
      ]);
    } else {
      // Jeśli query jest tekstem
      result = await db.query("SELECT * FROM users WHERE username ILIKE $1", [
        `%${query}%`,
      ]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No records found" });
    }

    console.log(result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post("/add-word", authenticateToken, authorizeAdmin, async (req, res) => {
  const { translations } = req.body;

  // Find the English translation
  const englishTranslation = translations.find((t) => t.language === "en");
  if (!englishTranslation) {
    return res.status(400).send("English translation is required.");
  }

  const word = englishTranslation.translation;

  try {
    // Insert the word and get the new word ID
    const wordResult = await db.query(
      "INSERT INTO word (word) VALUES ($1) RETURNING id",
      [word]
    );
    const wordId = wordResult.rows[0].id;

    // Prepare translation promises
    const translationPromises = translations.map((translation) => {
      return db.query(
        "INSERT INTO translation (word_id, language, translation, description) VALUES ($1, $2, $3, $4)",
        [
          wordId,
          translation.language,
          translation.translation,
          translation.description,
        ]
      );
    });

    // Execute all translation queries
    await Promise.all(translationPromises);

    res.status(200).send("Word added successfully.");
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while adding the word.");
  }
});

app.delete(
  "/word-delete",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    const { id } = req.body;

    try {
      await db.query("BEGIN");

      await db.query("DELETE FROM translation WHERE word_id = $1", [id]);

      await db.query("DELETE FROM word WHERE id = $1", [id]);

      await db.query("COMMIT");
      res.status(200).send("Word and its translations deleted successfully.");
    } catch (err) {
      await db.query("ROLLBACK");
      console.error(err);
      res.status(500).send("An error occurred while deleting the word.");
    } finally {
      client.release();
    }
  }
);

app.post(
  "/generate-patches",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    console.log("start-gene");

    // Funkcja do usuwania starych patchy
    async function deleteOldPatches() {
      try {
        // Usuń wszystkie stare patche
        await db.query('DELETE FROM word_patches');
        console.log('Stare patche zostały usunięte.');
    
        // Resetuj sekwencję SERIAL dla patch_id
        await db.query('ALTER SEQUENCE word_patches_patch_id_seq RESTART WITH 1');
        console.log('Sekwencja patch_id została zresetowana.');
      } catch (error) {
        console.error('Błąd podczas usuwania starych patchy i resetowania sekwencji:', error);
        throw error;
      }
    }

    async function getUsedWordIds() {
      try {
        const result = await db.query("SELECT word_ids FROM word_patches");
        console.log("Wynik zapytania:", result); // Logowanie wyniku zapytania

        const rows = result.rows; // Poprawne uzyskiwanie wierszy
        console.log("Rows:", rows); // Logowanie wierszy dla lepszego zrozumienia

        const usedIds = new Set();

        rows.forEach((row) => {
          const wordIds = JSON.parse(row.word_ids);
          wordIds.forEach((id) => usedIds.add(id));
        });

        return usedIds;
      } catch (error) {
        console.error("Błąd podczas pobierania użytych ID słów:", error);
        throw error;
      }
    }

    async function getAvailableWordIds() {
      try {
        const result = await db.query("SELECT id FROM word");
        console.log("Wynik zapytania:", result); // Logowanie wyniku zapytania

        const rows = result.rows; // Poprawne uzyskiwanie wierszy
        console.log("Rows:", rows); // Logowanie wierszy dla lepszego zrozumienia

        if (!Array.isArray(rows)) {
          throw new TypeError("Wynik zapytania nie jest iterowalny");
        }

        return rows.map((row) => row.id);
      } catch (error) {
        console.error("Błąd podczas pobierania dostępnych ID słów:", error);
        throw error;
      }
    }

    async function generatePatches(patchSize) {
      const availableWordIds = await getAvailableWordIds();
      const remainingIds = [...availableWordIds];
    
      while (remainingIds.length >= patchSize) {
        const patchIds = [];
        for (let i = 0; i < patchSize; i++) {
          const randomIndex = Math.floor(Math.random() * remainingIds.length);
          patchIds.push(remainingIds[randomIndex]);
          remainingIds.splice(randomIndex, 1);
        }
    
        // Upewnij się, że patchIds jest w formacie JSON
        const patchIdsJson = JSON.stringify(patchIds);
    
        await db.query('INSERT INTO word_patches (word_ids) VALUES ($1)', [patchIdsJson]);
        console.log(`Patch stworzony z ID: ${patchIds}`);
      }
    
      // Dodaj ostatni patch, jeśli pozostało mniej niż patchSize ID
      if (remainingIds.length > 0) {
        const remainingIdsJson = JSON.stringify(remainingIds);
    
        await db.query('INSERT INTO word_patches (word_ids) VALUES ($1)', [remainingIdsJson]);
        console.log(`Ostatni patch stworzony z ID: ${remainingIds}`);
      }
    
      console.log('Wszystkie patche zostały wygenerowane.');
    }
    

    try {
      // Usuń stare patche przed generowaniem nowych
      await deleteOldPatches();

      // Generuj nowe patche
      await generatePatches(30); // Rozmiar patcha można modyfikować
      res.status(200).send("Patche zostały wygenerowane.");
    } catch (error) {
      console.error("Błąd podczas generowania patchy:", error);
      res.status(500).send("Wystąpił problem podczas generowania patchy.");
    }
  }
);

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
