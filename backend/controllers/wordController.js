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
  insertWord, insertTranslations, deleteWordById,
} from "../models/userModel";

// B2 >= 3264 < C1
const maxWordId = 5260;
const minWordId = 1;
const b2 = 3264;

export const getInformation = (req, res) => {
  const data = {
    b2: b2,
    minWordId: minWordId,
    maxWordId: maxWordId,
  };
  res.json(data);
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

      // Pobranie największego patch_id
      const maxPatchId = await getMaxPatchId();
      const isThisLastOne = patchNumber === maxPatchId;

      res.json({ message: "working", data: formattedResults, isThisLastOne });
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
    console.log(response_data);
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

    console.log("Search result:", result);
    res.json(result);
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).send("Server Error");
  }
};

export const addWord = async (req, res) => {
  const { translations } = req.body;

  // Znalezienie tłumaczenia angielskiego
  const englishTranslation = translations.find((t) => t.language === "en");
  if (!englishTranslation) {
    return res.status(400).send("English translation is required.");
  }

  const word = englishTranslation.translation;

  try {
    // Wstawienie słowa i uzyskanie nowego ID słowa
    const wordId = await insertWord(word);

    // Wstawienie tłumaczeń
    await insertTranslations(wordId, translations);

    res.status(200).send("Word added successfully.");
  } catch (error) {
    console.error("Error while adding the word:", error);
    res.status(500).send("An error occurred while adding the word.");
  }
};

export const deleteWord = async (req, res) => {
  const { id } = req.body;

  try {
    // Usunięcie słowa i jego tłumaczeń
    await deleteWordById(id);

    res.status(200).send("Word and its translations deleted successfully.");
  } catch (error) {
    console.error("Error while deleting the word:", error);
    res.status(500).send("An error occurred while deleting the word.");
  }
};