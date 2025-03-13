// Obsługa słów i nauki
import {
  getPatchWords,
  getWordTranslations,
  getMaxPatchId,
  getWordsWithPagination,
  getTranslationsByWordId,
  updateTranslation,
  searchWordById,
  searchWordByText,
  insertWord,
  insertTranslations,
  deleteWordById,
  patchLength,
  getAllMaxPatchId,
  getPatchWordsByLevel,
  getAllPatchLength,
  getNumberOfWords,
  getRandomWordsByNumber,
  checkBan,
  ranking_init,
  getUserRankingPoints,
  getRandomWord,
  getLanguageWordTranslations,
  updateUserRankingGame,
  updateUserRankingHistory,
  getRankingHistoryById,
} from "../models/userModel.js";

//information about patch
export const getPatchesInfo = async (req, res) => {
  try {
    const stats = await getAllMaxPatchId();
    const length = await getAllPatchLength();
    const number_words_B2 = await getNumberOfWords("B2");
    const number_words_C1 = await getNumberOfWords("C1");
    const result = {
      totalB2Patches: stats.totalB2Patches,
      totalC1Patches: stats.totalC1Patches,
      lengthB2patch: length.lengthB2patch,
      lengthC1patch: length.lengthC1patch,
      numberWordsB2: number_words_B2,
      numberWordsC1: number_words_C1,
    };
    res.status(200).json(result); // Zwracanie statystyk
  } catch (error) {
    console.error("Error getting information:", error);
    res.status(500).send("Server Error");
  }
};

export const getWordsByPatchAndLevel = async (req, res) => {
  const { level, patchNumber } = req.body;
  if (patchNumber && patchNumber > 0) {
    try {
      // Pobranie listy słów na podstawie patcha
      const wordIds = await getPatchWordsByLevel(patchNumber, level);

      if (!wordIds) {
        return res.status(404).json({ message: "Patch nie znaleziony" });
      }

      // Pobranie tłumaczeń dla każdego `wordId`
      const results = await Promise.all(
        wordIds.map(async (id) => {
          return await getWordTranslations(id);
        })
      );

      // Formatowanie wyników
      const formattedResults = formatWordResults(results);

      res.json({
        message: "working",
        data: formattedResults,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      res
        .status(500)
        .json({ message: "Error fetching data", error: error.message });
    }
  }
};

export const getWordData = async (req, res) => {
  const { wordList, patchNumber } = req.body;

  if (patchNumber && patchNumber > 0) {
    console.log(`Pobieranie danych dla patcha numer ${patchNumber}`);
    try {
      // Pobranie listy słów na podstawie patcha
      const wordIds = await getPatchWords(patchNumber);

      if (!wordIds) {
        return res.status(404).json({ message: "Patch nie znaleziony" });
      }

      // Pobranie tłumaczeń dla każdego `wordId`
      const results = await Promise.all(
        wordIds.map(async (id) => {
          return await getWordTranslations(id);
        })
      );

      // Formatowanie wyników
      const formattedResults = formatWordResults(results);

      // Pobranie największego patch_id oraz całkowitej liczby patchy

      const maxPatchId = await getMaxPatchId();
      const totalPatches = await patchLength(); // Zmieniono nazwę zmiennej na totalPatches
      console.log(totalPatches);
      const isThisLastOne = patchNumber === maxPatchId;

      res.json({
        message: "working",
        data: formattedResults,
        isThisLastOne,
        totalPatches, // Zmieniono nazwę zmiennej na totalPatches
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      res
        .status(500)
        .json({ message: "Error fetching data", error: error.message });
    }
  } else {
    // Obsługa logiki, gdy nie ma podanego `patchNumber`
    try {
      const results = await Promise.all(
        wordList.map(async (id) => {
          return await getWordTranslations(id);
        })
      );

      // Formatowanie wyników
      const formattedResults = formatWordResults(results);

      res.json({ message: "working", data: formattedResults });
    } catch (error) {
      console.error("Error fetching data:", error);
      res
        .status(500)
        .json({ message: "Error fetching data", error: error.message });
    }
  }
};

// Funkcja pomocnicza do formatowania wyników
const formatWordResults = (results) => {
  return results.map((wordPair) => {
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
};

export const getWordsList = async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  console.log(`Fetching words for page: ${page}, limit: ${limit}`);

  try {
    const offset = (page - 1) * limit;
    console.log(`Calculated offset: ${offset}`);

    // Pobranie słów z modelu
    const words = await getWordsWithPagination(parseInt(limit), offset);
    console.log("Fetched words:", words);

    res.status(200).json(words); // Zwracanie statusu 200 z danymi słów
  } catch (error) {
    console.error("Error fetching words:", error);
    res.status(500).send("Server Error");
  }
};

export const getWordDetail = async (req, res) => {
  const { id } = req.body;
  try {
    // Pobranie tłumaczeń z modelu
    const translations = await getTranslationsByWordId(id);

    const response_data = {
      translations: translations,
    };
    res.json(response_data);
  } catch (error) {
    console.error("Error fetching word details:", error);
    return res.status(500).send("Internal Server Error");
  }
};

export const updateWordTranslations = async (req, res) => {
  const { word } = req.body;

  try {
    const translations = word.translations;

    // Aktualizowanie tłumaczeń słowa
    await Promise.all(
      translations.map(async (translation) => {
        await updateTranslation(translation);
      })
    );

    res.status(200).send("Translations updated successfully.");
  } catch (error) {
    console.error("Error updating translations:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const searchWords = async (req, res) => {
  const { query } = req.query;

  try {
    let result;

    if (!isNaN(query)) {
      // Jeśli query jest liczbą (wyszukiwanie po ID)
      result = await searchWordById(parseInt(query));
    } else {
      // Jeśli query jest ciągiem znaków (wyszukiwanie po nazwie)
      result = await searchWordByText(query);
    }

    res.json(result);
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).send("Server Error");
  }
};

export const addWord = async (req, res) => {
  // Wyciągnięcie 'word' z 'req.body'
  const word = req.body;
  console.log(word);
  // Sprawdź, czy 'word' jest zdefiniowane i ma 'translations'
  if (!word || !word.translations) {
    return res.status(400).send("Translations data is missing.");
  }

  const { translations } = word; // Wyciągnięcie 'translations' z 'word'

  // Znalezienie tłumaczenia angielskiego
  const englishTranslation = translations.find((t) => t.language === "en");
  if (!englishTranslation) {
    return res.status(400).send("English translation is required.");
  }

  const wordText = englishTranslation.translation;

  //Sprawdzenie poziomu
  if (word.level !== "B2" && word.level !== "C1") {
    return res.status(400).send("Wrong level");
  }

  const wordLevel = word.level;

  try {
    // Wstawienie słowa i uzyskanie nowego ID słowa
    const wordId = await insertWord(wordText, wordLevel);

    // Wstawienie tłumaczeń
    await insertTranslations(wordId, translations);

    res.status(200).send("Word added successfully.");
  } catch (error) {
    console.error("Error while adding the word:", error);
    res.status(500).send("An error occurred while adding the word.");
  }
};

export const deleteWord = async (req, res) => {
  const { id } = req.params; // Pobranie ID ze ścieżki

  try {
    // Usunięcie słowa i jego tłumaczeń
    await deleteWordById(id);

    res.status(200).send("Word and its translations deleted successfully.");
  } catch (error) {
    console.error("Error while deleting the word:", error);
    res.status(500).send("An error occurred while deleting the word.");
  }
};

export const getRankingWord = async (req, res) => {
  const userId = req.user.id;

  try {
    const banCheck = await checkBan(userId);

    if (banCheck.rows[0]?.ban) {
      return res.status(403).json({ error: "Account banned" });
    }

    await ranking_init(userId);

    const pointsResult = await getUserRankingPoints(userId);

    const points = pointsResult.rows[0]?.current_points || 1000;

    const probabilityTiers = [
      { max: 500, B2: 1.0, C1: 0.0 },
      { max: 1000, B2: 0.9, C1: 0.1 },
      { max: 1500, B2: 0.7, C1: 0.3 },
      { max: 2000, B2: 0.5, C1: 0.5 },
      { max: 2500, B2: 0.4, C1: 0.6 },
      { max: 3000, B2: 0.1, C1: 0.9 },
    ];

    const tier = probabilityTiers.find((t) => points <= t.max) || {
      B2: 0.0,
      C1: 1.0,
    };
    const difficulty = Math.random() <= tier.B2 ? "B2" : "C1";

    const wordResult = await getRandomWord(difficulty);

    if (wordResult.rows.length === 0) {
      return res.status(404).json({ error: "Words missing" });
    }
    const wordId = wordResult.rows[0].id;

    const translationsResult = await getLanguageWordTranslations(wordId);

    const randomLang = Math.random() < 0.5 ? "en" : "pl";
    const translation = translationsResult.find(
      (t) => t.language === randomLang
    );

    if (!translation) {
      return res.status(404).json({ error: "Translation is missing" });
    }

    res.status(200).json([wordId, translation.translation]);
  } catch (error) {
    console.error("Error getting information:", error);
    res.status(500).send("Server Error");
  }
};

export const getRandomWords = async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 10;

    const randomWordsQuery = await getRandomWordsByNumber(count);
    const wordIds = randomWordsQuery.rows.map((row) => row.id);

    const wordsData = await Promise.all(
      wordIds.map((id) => getWordTranslations(id))
    );

    const result = wordsData.map((translations, index) => {
      const language = Math.random() < 0.5 ? "pl" : "en";
      const translation = translations.find((t) => t.language === language);
      return {
        id: wordIds[index],
        content: translation?.translation || "Brak tłumaczenia",
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server error");
  }
};

const getDifficultyTier = (points) => {
  const tiers = [
    { max: 500, tier: "B2" },
    { max: 1000, tier: "B2" },
    { max: 1500, tier: "B2" },
    { max: 2000, tier: "B2/C1" },
    { max: 2500, tier: "C1" },
    { max: 3000, tier: "C1" },
  ];

  const found = tiers.find((t) => points <= t.max);
  return found ? found.tier : "C1";
};

// controllers/rankingController.js
export const submitAnswer = async (req, res) => {
  const userId = req.user.id;
  const { wordId, userAnswer, startTime } = req.body;

  try {
    // 1. Sprawdź bana
    const banCheck = await checkBan(userId);
    if (banCheck.rows[0]?.ban)
      return res.status(403).json({ error: "Account banned" });

    // 2. Pobierz poprawne tłumaczenia
    const translations = await getWordTranslations(wordId);
    const correctAnswers = translations.map((t) => t.translation.toLowerCase());

    // 3. Oblicz czas odpowiedzi
    const responseTimeMs = Date.now() - startTime;

    // 4. Sprawdź poprawność
    const isCorrect = correctAnswers.includes(userAnswer.trim().toLowerCase());

    // 5. Pobierz aktualny stan
    const pointsResult = await getUserRankingPoints(userId);
    const pointsBefore = pointsResult.rows[0]?.current_points || 1000;
    const streakBefore = pointsResult.rows[0]?.current_streak || 0;

    // 6. Oblicz nowe punkty i streak
    const pointsDelta = isCorrect ? 5 : -5;
    let pointsAfter = Math.min(Math.max(pointsBefore + pointsDelta, 0), 9999);
    let newStreak = isCorrect ? streakBefore + 1 : 0;

    // 7. Aktualizuj ranking
    await updateUserRankingGame(pointsAfter, newStreak, userId);

    // 8. Zapisz historię
    const tier = getDifficultyTier(pointsBefore);
    await updateUserRankingHistory(
      userId,
      wordId,
      userAnswer,
      isCorrect,
      pointsBefore,
      pointsAfter,
      responseTimeMs,
      tier,
      newStreak
    );

    const allTranslations = translations.map((t) => ({
      language: t.language,
      translation: t.translation,
    }));

    res.status(200).json({
      success: true,
      isCorrect,
      newPoints: pointsAfter,
      streak: newStreak,
      correctTranslations: allTranslations,
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getRankingHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await getRankingHistoryById(userId, 10);

    const history = result.rows.map((row) => row.points_after).reverse();
    res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching ranking history:", error);
    res.status(500).json({ error: "Server error" });
  }
};
