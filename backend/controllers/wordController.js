// Obsługa słów i nauki
import {
  getPatchWords,
  getWordTranslations,
  getMaxPatchId,
  getWordsWithPagination,
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