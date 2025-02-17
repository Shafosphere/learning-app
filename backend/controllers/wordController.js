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
