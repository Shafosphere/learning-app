// tests/wordControllerExtended.test.js
import {
  getWordDetail,
  updateWordTranslations,
  searchWords,
  addWord,
  deleteWord,
  getRankingWord,
  getRandomWords,
  submitAnswer,
  getRankingHistory,
} from "../controllers/wordController.js";

import * as model from "../models/userModel.js";

describe("wordController", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, query: {}, user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
  });

  describe("getWordDetail", () => {
    it("should return translations on success", async () => {
      model.getTranslationsByWordId = jest.fn().mockResolvedValue([{ id: 1 }]);
      req.body.id = 123;
      await getWordDetail(req, res);
      expect(model.getTranslationsByWordId).toHaveBeenCalledWith(123);
      expect(res.json).toHaveBeenCalledWith({ translations: [{ id: 1 }] });
    });

    it("should send 500 on error", async () => {
      model.getTranslationsByWordId = jest
        .fn()
        .mockRejectedValue(new Error("boom"));
      req.body.id = 1;
      await getWordDetail(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });

  describe("updateWordTranslations", () => {
    it("should update and send 200", async () => {
      const translations = [{}, {}];
      req.body.word = { translations };
      model.updateTranslation = jest.fn().mockResolvedValue();
      await updateWordTranslations(req, res);
      expect(model.updateTranslation).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        "Translations updated successfully."
      );
    });

    it("should send 500 on error", async () => {
      req.body.word = { translations: [{}] };
      model.updateTranslation = jest.fn().mockRejectedValue(new Error("fail"));
      await updateWordTranslations(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });

  describe("searchWords", () => {
    it("should call searchWordById for numeric query", async () => {
      req.query.query = "42";
      model.searchWordById = jest.fn().mockResolvedValue(["ok"]);
      await searchWords(req, res);
      expect(model.searchWordById).toHaveBeenCalledWith(42);
      expect(res.json).toHaveBeenCalledWith(["ok"]);
    });

    it("should call searchWordByText for non-numeric", async () => {
      req.query.query = "foo";
      model.searchWordByText = jest.fn().mockResolvedValue(["bar"]);
      await searchWords(req, res);
      expect(model.searchWordByText).toHaveBeenCalledWith("foo");
      expect(res.json).toHaveBeenCalledWith(["bar"]);
    });

    it("should send 500 on error", async () => {
      req.query.query = "x";
      model.searchWordByText = jest.fn().mockRejectedValue(new Error("oops"));
      await searchWords(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Server Error");
    });
  });

  describe("addWord", () => {
    const goodTranslations = [
      { language: "en", translation: "e", description: "d" },
      { language: "pl", translation: "p", description: "d2" },
    ];

    it("400 if missing translations", async () => {
      req.body = {};
      await addWord(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith("Translations data is missing.");
    });

    it("400 if no English", async () => {
      req.body = { translations: [{ language: "pl" }], level: "B2" };
      await addWord(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith("English translation is required.");
    });

    it("400 on wrong level", async () => {
      req.body = { translations: goodTranslations, level: "A1" };
      await addWord(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith("Wrong level");
    });

    it("200 on success", async () => {
      req.body = { translations: goodTranslations, level: "C1" };
      model.insertWord = jest.fn().mockResolvedValue(77);
      model.insertTranslations = jest.fn().mockResolvedValue();
      await addWord(req, res);
      expect(model.insertWord).toHaveBeenCalledWith("e", "C1");
      expect(model.insertTranslations).toHaveBeenCalledWith(
        77,
        goodTranslations
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith("Word added successfully.");
    });

    it("500 on model error", async () => {
      req.body = { translations: goodTranslations, level: "B2" };
      model.insertWord = jest.fn().mockRejectedValue(new Error("db"));
      await addWord(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        "An error occurred while adding the word."
      );
    });
  });

  describe("deleteWord", () => {
    it("200 on success", async () => {
      req.params.id = "5";
      model.deleteWordById = jest.fn().mockResolvedValue();
      await deleteWord(req, res);
      expect(model.deleteWordById).toHaveBeenCalledWith("5");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        "Word and its translations deleted successfully."
      );
    });
    it("500 on error", async () => {
      req.params.id = "5";
      model.deleteWordById = jest.fn().mockRejectedValue(new Error());
      await deleteWord(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        "An error occurred while deleting the word."
      );
    });
  });

  describe("getRankingWord", () => {
    beforeEach(() => {
      req.user.id = 99;
    });

    it("403 if banned", async () => {
      model.checkBan = jest.fn().mockResolvedValue({ rows: [{ ban: true }] });
      await getRankingWord(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Account banned" });
    });

    it("200 on happy path", async () => {
      // 1) not banned
      model.checkBan = jest.fn().mockResolvedValue({ rows: [{ ban: false }] });
      model.ranking_init = jest.fn().mockResolvedValue();
      model.getUserRankingPoints = jest
        .fn()
        .mockResolvedValue({ rows: [{ current_points: 200 }] });
      // pick difficulty: B2 tier for 200 => always B2
      // pick a word
      model.getRandomWord = jest.fn().mockResolvedValue({ rows: [{ id: 7 }] });
      // two languages present
      model.getLanguageWordTranslations = jest.fn().mockResolvedValue([
        { language: "en", translation: "E" },
        { language: "pl", translation: "P" },
      ]);
      // stub randomness: first for difficulty, then for language
      jest
        .spyOn(Math, "random")
        .mockReturnValueOnce(0.0) // <=tier.B2 => B2
        .mockReturnValueOnce(0.9); // >0.5 => pick 'en'
      await getRankingWord(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      // payload: [wordId, translation, lang]
      expect(res.json).toHaveBeenCalledWith([7, "P", "pl"]);
    });

    it("404 if no words", async () => {
      model.checkBan = jest.fn().mockResolvedValue({ rows: [{ ban: false }] });
      model.ranking_init = jest.fn();
      model.getUserRankingPoints = jest
        .fn()
        .mockResolvedValue({ rows: [{ current_points: 0 }] });
      model.getRandomWord = jest.fn().mockResolvedValue({ rows: [] });
      await getRankingWord(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Words missing" });
    });

    it("404 if translation missing", async () => {
      model.checkBan = jest.fn().mockResolvedValue({ rows: [{ ban: false }] });
      model.ranking_init = jest.fn();
      model.getUserRankingPoints = jest
        .fn()
        .mockResolvedValue({ rows: [{ current_points: 0 }] });
      model.getRandomWord = jest.fn().mockResolvedValue({ rows: [{ id: 1 }] });
      model.getLanguageWordTranslations = jest.fn().mockResolvedValue([]);
      await getRankingWord(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Translation is missing",
      });
    });
  });

  describe("getRandomWords", () => {
    it("200 with mapped content", async () => {
      req.query.count = "2";
      model.getRandomWordsByNumber = jest
        .fn()
        .mockResolvedValue({ rows: [{ id: 1 }, { id: 2 }] });
      // for each id stub translations
      model.getWordTranslations = jest
        .fn()
        .mockResolvedValueOnce([{ language: "en", translation: "E1" }])
        .mockResolvedValueOnce([{ language: "pl", translation: "P2" }]);
      // random picks: first <0.5 => pl => content 'Brak tłumaczenia' (no pl in 1?), second >=0.5 => en
      jest
        .spyOn(Math, "random")
        .mockReturnValueOnce(0.4)
        .mockReturnValueOnce(0.6);
      await getRandomWords(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      const sent = res.json.mock.calls[0][0];
      expect(sent).toEqual([
        { id: 1, content: "Brak tłumaczenia" },
        { id: 2, content: "Brak tłumaczenia" },
      ]);
    });

    it("500 on error", async () => {
      model.getRandomWordsByNumber = jest.fn().mockRejectedValue(new Error());
      await getRandomWords(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Server error");
    });
  });

  describe("submitAnswer", () => {
    beforeEach(() => {
      req.user.id = 11;
      req.body = {
        wordId: 5,
        userAnswer: "YES",
        lang: "en",
        startTime: Date.now() - 50,
      };
    });

    it("403 if banned", async () => {
      model.checkBan = jest.fn().mockResolvedValue({ rows: [{ ban: true }] });
      await submitAnswer(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Account banned" });
    });

    it("200 correct answer path", async () => {
      model.checkBan = jest.fn().mockResolvedValue({ rows: [{ ban: false }] });
      model.getWordTranslations = jest.fn().mockResolvedValue([
        { language: "en", translation: "yes" },
        { language: "pl", translation: "tak" },
      ]);
      model.getUserRankingPoints = jest
        .fn()
        .mockResolvedValue({
          rows: [{ current_points: 10, current_streak: 1 }],
        });
      model.updateUserArena = jest.fn().mockResolvedValue();
      model.updateUserRankingHistory = jest.fn().mockResolvedValue();
      req.body.userAnswer = "yes"; // correct
      await submitAnswer(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      const payload = res.json.mock.calls[0][0];
      expect(payload.success).toBe(true);
      expect(payload.isCorrect).toBe(true);
      expect(payload.newPoints).toBe(15);
      expect(payload.streak).toBe(2);
    });

    it("200 incorrect answer path", async () => {
      model.checkBan = jest.fn().mockResolvedValue({ rows: [{ ban: false }] });
      model.getWordTranslations = jest
        .fn()
        .mockResolvedValue([{ language: "en", translation: "yes" }]);
      model.getUserRankingPoints = jest
        .fn()
        .mockResolvedValue({
          rows: [{ current_points: 10, current_streak: 1 }],
        });
      model.updateUserArena = jest.fn();
      model.updateUserRankingHistory = jest.fn();
      req.body.userAnswer = "no"; // wrong
      await submitAnswer(req, res);
      const payload = res.json.mock.calls[0][0];
      expect(payload.isCorrect).toBe(false);
      expect(payload.newPoints).toBe(5);
      expect(payload.streak).toBe(0);
    });

    it("500 on exception", async () => {
      model.checkBan = jest.fn().mockRejectedValue(new Error());
      await submitAnswer(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });
  });

  describe("getRankingHistory", () => {
    it("200 returns reversed points", async () => {
      req.user.id = 77;
      model.getRankingHistoryById = jest
        .fn()
        .mockResolvedValue({
          rows: [{ points_after: 1 }, { points_after: 2 }, { points_after: 3 }],
        });
      await getRankingHistory(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([3, 2, 1]);
    });

    it("500 on error", async () => {
      req.user.id = 77;
      model.getRankingHistoryById = jest.fn().mockRejectedValue(new Error());
      await getRankingHistory(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });
  });
});
