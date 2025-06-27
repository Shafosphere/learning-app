// tests/wordController.test.js
import {
  getPatchesInfo,
  getWordsByPatchAndLevel,
  getWordData,
  getWordsList,
} from "../src/controllers/wordController.js";

// 1) Mockujemy dokładnie te moduły, których używa kontroler:
jest.mock("../src/repositories/patch.repo.js", () => ({
  getAllMaxPatchId: jest.fn(),
  getAllPatchLength: jest.fn(),
  getPatchWordsByLevel: jest.fn(),
  getPatchWords: jest.fn(),
  getMaxPatchId: jest.fn(),
  patchLength: jest.fn(),
}));

jest.mock("../src/repositories/word.repo.js", () => ({
  getNumberOfWords: jest.fn(),
  getWordsWithPagination: jest.fn(),
}));

jest.mock("../src/repositories/translation.repo.js", () => ({
  getWordTranslations: jest.fn(),
}));

// 2) Importujemy zmockowane modele:
import * as patchModel from "../src/repositories/patch.repo.js";
import * as wordModel from "../src/repositories/word.repo.js";
import * as translationModel from "../src/repositories/translation.repo.js";

describe("wordController", () => {
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
      patchModel.getAllMaxPatchId.mockResolvedValue({
        totalB2Patches: 2,
        totalC1Patches: 3,
      });
      patchModel.getAllPatchLength.mockResolvedValue({
        lengthB2patch: 20,
        lengthC1patch: 30,
      });
      wordModel.getNumberOfWords
        .mockResolvedValueOnce(100) // B2
        .mockResolvedValueOnce(200); // C1

      const res = mockRes();
      await getPatchesInfo({}, res);

      expect(patchModel.getAllMaxPatchId).toHaveBeenCalled();
      expect(patchModel.getAllPatchLength).toHaveBeenCalled();
      expect(wordModel.getNumberOfWords).toHaveBeenCalledTimes(2);
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
      patchModel.getAllMaxPatchId.mockRejectedValue(new Error("fail"));
      const res = mockRes();
      await getPatchesInfo({}, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Server Error");
    });
  });

  describe("getWordsByPatchAndLevel", () => {
    it("gdy patch nie istnieje → 404", async () => {
      patchModel.getPatchWordsByLevel.mockResolvedValue(null);
      const req = { body: { patchNumber: 5, level: "B2" } };
      const res = mockRes();

      await expect(getWordsByPatchAndLevel(req, res)).rejects.toEqual(
        expect.objectContaining({
          statusCode: 404,
          code: "ERR_PATCH_NOT_FOUND",
        })
      );

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("gdy patch istnieje → sformatowane dane", async () => {
      const ids = [1, 2];
      patchModel.getPatchWordsByLevel.mockResolvedValue(ids);
      translationModel.getWordTranslations
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

      expect(patchModel.getPatchWordsByLevel).toHaveBeenCalledWith(5, "C1");
      expect(translationModel.getWordTranslations).toHaveBeenCalledTimes(2);
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
      patchModel.getPatchWordsByLevel.mockResolvedValue([1]);
      translationModel.getWordTranslations.mockRejectedValue(new Error("oops"));
      const req = { body: { patchNumber: 1, level: "B2" } };
      const res = mockRes();

      await expect(getWordsByPatchAndLevel(req, res)).rejects.toThrow("oops");

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("getWordData", () => {
    it("patchNumber>0 i patch nie istnieje → 404", async () => {
      patchModel.getPatchWords.mockResolvedValue(null);
      const req = { body: { patchNumber: 2 } };
      const res = mockRes();

      await expect(getWordData(req, res)).rejects.toEqual(
        expect.objectContaining({
          statusCode: 404,
          code: "ERR_PATCH_NOT_FOUND",
        })
      );

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("patchNumber>0 → zwraca data, isThisLastOne i totalPatches", async () => {
      patchModel.getPatchWords.mockResolvedValue([10]);
      translationModel.getWordTranslations.mockResolvedValueOnce([
        { language: "en", word_id: 10, translation: "x", description: "y" },
        { language: "pl", word_id: 10, translation: "xPL", description: "yPL" },
      ]);
      patchModel.getMaxPatchId.mockResolvedValue(2);
      patchModel.patchLength.mockResolvedValue(5);

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
      translationModel.getWordTranslations.mockResolvedValueOnce([
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
      patchModel.getPatchWords.mockResolvedValue([1]);
      translationModel.getWordTranslations.mockRejectedValue(new Error("fail"));
      const req = { body: { patchNumber: 1 } };
      const res = mockRes();

      await expect(getWordData(req, res)).rejects.toThrow("fail");

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("getWordsList", () => {
    it("zwraca paginowaną listę słów i status 200", async () => {
      const fakeWords = [{ id: 1 }, { id: 2 }];
      wordModel.getWordsWithPagination.mockResolvedValue(fakeWords);

      const req = { query: { page: "2", limit: "10" } };
      const res = mockRes();

      await getWordsList(req, res);

      expect(wordModel.getWordsWithPagination).toHaveBeenCalledWith(10, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeWords);
    });

    it("obsługuje błąd → 500", async () => {
      wordModel.getWordsWithPagination.mockRejectedValue(new Error("db"));
      const req = { query: {} };
      const res = mockRes();

      await expect(getWordsList(req, res)).rejects.toThrow("db");

      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
    });
  });
});
