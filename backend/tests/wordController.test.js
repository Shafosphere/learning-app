// tests/wordController.test.js
import {
  getPatchesInfo,
  getWordsByPatchAndLevel,
  getWordData,
  getWordsList,
} from "../controllers/wordController.js";

// mockujemy całą warstwę modeli
jest.mock("../models/userModel.js", () => ({
  getAllMaxPatchId: jest.fn(),
  getAllPatchLength: jest.fn(),
  getNumberOfWords: jest.fn(),
  getPatchWordsByLevel: jest.fn(),
  getWordTranslations: jest.fn(),
  getPatchWords: jest.fn(),
  getMaxPatchId: jest.fn(),
  patchLength: jest.fn(),
  getWordsWithPagination: jest.fn(),
}));

import * as model from "../src/repositories/userModel.js";

describe("wordController", () => {
  // helper do tworzenia fałszywego `res`
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };

  afterEach(() => jest.clearAllMocks());

  describe("getPatchesInfo", () => {
    it("powinno zwrócić poprawne statystyki", async () => {
      model.getAllMaxPatchId.mockResolvedValue({
        totalB2Patches: 2,
        totalC1Patches: 3,
      });
      model.getAllPatchLength.mockResolvedValue({
        lengthB2patch: 20,
        lengthC1patch: 30,
      });
      model.getNumberOfWords
        .mockResolvedValueOnce(100) // B2
        .mockResolvedValueOnce(200); // C1

      const req = {};
      const res = mockRes();

      await getPatchesInfo(req, res);

      expect(model.getAllMaxPatchId).toHaveBeenCalled();
      expect(model.getAllPatchLength).toHaveBeenCalled();
      expect(model.getNumberOfWords).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        totalB2Patches: 2,
        totalC1Patches: 3,
        lengthB2patch: 20,
        lengthC1patch: 30,
        numberWordsB2: 100,
        numberWordsC1: 200,
      });
    });

    it("powinno obsłużyć błąd i zwrócić 500", async () => {
      model.getAllMaxPatchId.mockRejectedValue(new Error("fail"));
      const req = {};
      const res = mockRes();

      await getPatchesInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Server Error");
    });
  });

  describe("getWordsByPatchAndLevel", () => {
    it("gdy patch nie istnieje → 404", async () => {
      model.getPatchWordsByLevel.mockResolvedValue(null);
      const req = { body: { patchNumber: 5, level: "B2" } };
      const res = mockRes();

      await getWordsByPatchAndLevel(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Patch nie znaleziony",
      });
    });

    it("gdy patch istnieje → sformatowane dane", async () => {
      const ids = [1, 2];
      // każde wywołanie zwraca parę tłumaczeń [en,pl]
      model.getPatchWordsByLevel.mockResolvedValue(ids);
      model.getWordTranslations
        .mockResolvedValueOnce([
          {
            language: "en",
            word_id: 1,
            translation: "one",
            description: "uno",
          },
          {
            language: "pl",
            word_id: 1,
            translation: "jeden",
            description: "raz",
          },
        ])
        .mockResolvedValueOnce([
          {
            language: "en",
            word_id: 2,
            translation: "two",
            description: "dos",
          },
          {
            language: "pl",
            word_id: 2,
            translation: "dwa",
            description: "dwa",
          },
        ]);

      const req = { body: { patchNumber: 5, level: "C1" } };
      const res = mockRes();

      await getWordsByPatchAndLevel(req, res);

      expect(model.getPatchWordsByLevel).toHaveBeenCalledWith(5, "C1");
      expect(model.getWordTranslations).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith({
        message: "working",
        data: [
          {
            id: 1,
            wordEng: { word: "one", description: "uno" },
            wordPl: { word: "jeden", description: "raz" },
          },
          {
            id: 2,
            wordEng: { word: "two", description: "dos" },
            wordPl: { word: "dwa", description: "dwa" },
          },
        ],
      });
    });

    it("obsługa błędu → 500", async () => {
      model.getPatchWordsByLevel.mockResolvedValue([1]);
      model.getWordTranslations.mockRejectedValue(new Error("oops"));
      const req = { body: { patchNumber: 1, level: "B2" } };
      const res = mockRes();

      await getWordsByPatchAndLevel(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Error fetching data" })
      );
    });
  });

  describe("getWordData", () => {
    it("patchNumber>0 i patch nie istnieje → 404", async () => {
      model.getPatchWords.mockResolvedValue(null);
      const req = { body: { patchNumber: 2 } };
      const res = mockRes();

      await getWordData(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Patch nie znaleziony",
      });
    });

    it("patchNumber>0 → zwraca data, isThisLastOne i totalPatches", async () => {
      model.getPatchWords.mockResolvedValue([10]);
      model.getWordTranslations.mockResolvedValueOnce([
        { language: "en", word_id: 10, translation: "x", description: "y" },
        { language: "pl", word_id: 10, translation: "xPL", description: "yPL" },
      ]);
      model.getMaxPatchId.mockResolvedValue(2);
      model.patchLength.mockResolvedValue(5);

      const req = { body: { patchNumber: 2 } };
      const res = mockRes();

      await getWordData(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "working",
        data: [
          {
            id: 10,
            wordEng: { word: "x", description: "y" },
            wordPl: { word: "xPL", description: "yPL" },
          },
        ],
        isThisLastOne: true,
        totalPatches: 5,
      });
    });

    it("bez patchNumber → zwraca tylko message i data", async () => {
      model.getWordTranslations.mockResolvedValueOnce([
        { language: "en", word_id: 7, translation: "e", description: "d" },
        { language: "pl", word_id: 7, translation: "p", description: "q" },
      ]);

      const req = { body: { wordList: [7] } };
      const res = mockRes();

      await getWordData(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "working",
        data: [
          {
            id: 7,
            wordEng: { word: "e", description: "d" },
            wordPl: { word: "p", description: "q" },
          },
        ],
      });
    });

    it("obsługuje błąd → 500", async () => {
      model.getPatchWords.mockResolvedValue([1]);
      model.getWordTranslations.mockRejectedValue(new Error("fail"));
      const req = { body: { patchNumber: 1 } };
      const res = mockRes();

      await getWordData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Error fetching data" })
      );
    });
  });

  describe("getWordsList", () => {
    it("zwraca paginowaną listę słów i status 200", async () => {
      const fakeWords = [{ id: 1 }, { id: 2 }];
      model.getWordsWithPagination.mockResolvedValue(fakeWords);

      const req = { query: { page: "2", limit: "10" } };
      const res = mockRes();

      await getWordsList(req, res);

      // offset = (2-1)*10 = 10
      expect(model.getWordsWithPagination).toHaveBeenCalledWith(10, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeWords);
    });

    it("obsługuje błąd → 500", async () => {
      model.getWordsWithPagination.mockRejectedValue(new Error("db"));
      const req = { query: {} };
      const res = mockRes();

      await getWordsList(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Server Error");
    });
  });
});
