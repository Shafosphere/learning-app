// tests/userControllers.test.js
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import * as model from "../models/userModel.js";
import pool from "../dbClient.js";
import {
  getUsersList,
  updateUsers,
  searchUsers,
  deleteUser,
  learnWord,
  getRankingFlashcard,
  getArena,
  autoSave,
  autoLoad,
  autoDelete,
} from "../controllers/userControllers.js";

// pomocniczy stub dla res
function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

jest.mock("../models/userModel.js");
jest.mock("../dbClient.js");

describe("userControllers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUsersList", () => {
    it("200 → zwraca listę użytkowników", async () => {
      const fakeUsers = [{ id: 1 }, { id: 2 }];
      model.getUsersWithPagination.mockResolvedValue(fakeUsers);

      const req = { query: { page: "2", limit: "10" } };
      const res = makeRes();

      await getUsersList(req, res);

      expect(model.getUsersWithPagination).toHaveBeenCalledWith(10, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeUsers);
    });

    it("500 → w razie błędu zwraca Server Error", async () => {
      model.getUsersWithPagination.mockRejectedValue(new Error("oops"));

      const req = { query: {} };
      const res = makeRes();

      await getUsersList(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Server Error");
    });
  });

  describe("updateUsers", () => {
    it("200 → aktualizuje wszystkich i zwraca success:true", async () => {
      model.updateUserInDb.mockResolvedValue();
      const req = { body: { editedRows: { a: { id: 1 }, b: { id: 2 } } } };
      const res = makeRes();

      await updateUsers(req, res);

      expect(model.updateUserInDb).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Users updated successfully.",
      });
    });

    it("500 → w razie błędu zwraca success:false", async () => {
      model.updateUserInDb.mockRejectedValue(new Error("fail"));
      const req = { body: { editedRows: { x: { id: 42 } } } };
      const res = makeRes();

      await updateUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "An error occurred while processing user update.",
      });
    });
  });

  describe("searchUsers", () => {
    it("numer jako query → searchUserById", async () => {
      const fake = [{ id: 3 }];
      model.searchUserById.mockResolvedValue(fake);
      const req = { query: { query: "123" } };
      const res = makeRes();

      await searchUsers(req, res);

      expect(model.searchUserById).toHaveBeenCalledWith(123);
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    it("email jako query → searchUserByEmail", async () => {
      const fake = [{ email: "a@b" }];
      model.searchUserByEmail.mockResolvedValue(fake);
      const req = { query: { query: "a@b.com" } };
      const res = makeRes();

      await searchUsers(req, res);

      expect(model.searchUserByEmail).toHaveBeenCalledWith("a@b.com");
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    it("username jako query → searchUserByUsername", async () => {
      const fake = [{ username: "xyz" }];
      model.searchUserByUsername.mockResolvedValue(fake);
      const req = { query: { query: "xyz" } };
      const res = makeRes();

      await searchUsers(req, res);

      expect(model.searchUserByUsername).toHaveBeenCalledWith("xyz");
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    it("404 jeżeli wynik pusty", async () => {
      model.searchUserById.mockResolvedValue([]);
      const req = { query: { query: "1" } };
      const res = makeRes();

      await searchUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "No records found" });
    });

    it("500 w razie błędu", async () => {
      model.searchUserById.mockRejectedValue(new Error("err"));
      const req = { query: { query: "1" } };
      const res = makeRes();

      await searchUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Server Error");
    });
  });

  describe("deleteUser", () => {
    it("200 → usuwa i zwraca success:true", async () => {
      model.deleteUserByID.mockResolvedValue();
      const req = { params: { id: "5" } };
      const res = makeRes();

      await deleteUser(req, res);

      expect(model.deleteUserByID).toHaveBeenCalledWith("5");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User deleted successfully.",
      });
    });

    it("500 w razie błędu", async () => {
      model.deleteUserByID.mockRejectedValue(new Error("bad"));
      const req = { params: { id: "5" } };
      const res = makeRes();

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "An error occurred while deleting user.",
      });
    });
  });

  describe("learnWord", () => {
    let client;
    beforeEach(() => {
      client = { query: jest.fn(), release: jest.fn() };
      pool.connect.mockResolvedValue(client);
    });

    it("400 jeżeli już się uczył", async () => {
      client.query.mockResolvedValueOnce(); // BEGIN
      model.getUserIdFromProgress.mockResolvedValue({ rows: [{}] });
      const req = { user: { id: 7, username: "u" }, body: { wordId: 9 } };
      const res = makeRes();

      await learnWord(req, res);

      expect(client.query).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "You have already learned this word.",
      });
    });

    it("200 happy path", async () => {
      client.query.mockResolvedValue(); // BEGIN
      model.getUserIdFromProgress.mockResolvedValue({ rows: [] });
      model.insertWordIntoUserProgress.mockResolvedValue();
      model.userRankingUpdate.mockResolvedValue();
      const req = { user: { id: 7, username: "u" }, body: { wordId: 9 } };
      const res = makeRes();

      await learnWord(req, res);

      expect(client.query).toHaveBeenCalledWith("COMMIT");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Word added to progress and ranking updated.",
      });
    });

    it("500 w razie wyjątku", async () => {
      client.query.mockResolvedValue(); // BEGIN
      model.getUserIdFromProgress.mockRejectedValue(new Error("err"));
      const req = { user: { id: 7, username: "u" }, body: { wordId: 9 } };
      const res = makeRes();

      await learnWord(req, res);

      expect(client.query).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error." });
    });
  });

  describe("getRankingFlashcard & getArena", () => {
    it("200 → getRankingFlashcard", async () => {
      const fake = [{ u: 1 }];
      model.getTopRankingUsersFlashcard.mockResolvedValue(fake);
      const res = makeRes();
      await getRankingFlashcard({}, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fake);
    });
    it("500 → getRankingFlashcard", async () => {
      model.getTopRankingUsersFlashcard.mockRejectedValue(new Error());
      const res = makeRes();
      await getRankingFlashcard({}, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it("200 → getArena", async () => {
      const fake = [{ a: 2 }];
      model.getTopArenaUsers.mockResolvedValue(fake);
      const res = makeRes();
      await getArena({}, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fake);
    });
    it("500 → getArena", async () => {
      model.getTopArenaUsers.mockRejectedValue(new Error());
      const res = makeRes();
      await getArena({}, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("autoSave", () => {
    it("200 → zapisuje autosave", async () => {
      const client = { release: jest.fn() };
      pool.connect.mockResolvedValue(client);
      model.insertOrUpdateUserAutosave.mockResolvedValue();

      const req = {
        user: { id: 5, username: "u" },
        body: { level: "B2", deviceId: "d", words: [], patchNumber: 1 },
      };
      const res = makeRes();

      await autoSave(req, res);

      expect(model.insertOrUpdateUserAutosave).toHaveBeenCalledWith(
        client,
        5,
        "B2",
        [],
        "d",
        1
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Dane odebrane" });
      expect(client.release).toHaveBeenCalled();
    });

    it("500 → w razie błędu", async () => {
      pool.connect.mockRejectedValue(new Error());
      const res = makeRes();
      await autoSave({ user: {}, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("autoLoad", () => {
    let client;
    beforeEach(() => {
      client = { release: jest.fn() };
      pool.connect.mockResolvedValue(client);
    });

    it("404 → brak danych", async () => {
      model.getAutosaveData.mockResolvedValue(null);
      const req = {
        user: { id: 9, username: "x" },
        body: { level: "B2", deviceId: "d" },
      };
      const res = makeRes();

      await autoLoad(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Brak zapisanych danych",
      });
      expect(client.release).toHaveBeenCalled();
    });

    it("200 → zwraca formatowane słowa", async () => {
      const saved = {
        level: "C1",
        last_saved: "T",
        words: [
          { id: 1, boxName: "a" },
          { id: 2, boxName: "b" },
          { id: 1, boxName: "a" },
        ],
        patch_number_c1: 3,
      };
      model.getAutosaveData.mockResolvedValue(saved);

      const translations = [
        {
          word_id: 1,
          en_translation: "E1",
          en_description: "d1",
          pl_translation: "P1",
          pl_description: "pd1",
        },
        {
          word_id: 2,
          en_translation: "E2",
          en_description: "d2",
          pl_translation: "P2",
          pl_description: "pd2",
        },
      ];
      model.getBatchWordTranslations.mockResolvedValue(translations);

      const req = {
        user: { id: 9, username: "x" },
        body: { level: "C1", deviceId: "d" },
      };
      const res = makeRes();

      await autoLoad(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const payload = res.json.mock.calls[0][0];
      expect(payload).toEqual({
        message: "Dane odebrane",
        username: "x",
        level: "C1",
        words: [
          {
            id: 1,
            boxName: "a",
            wordEng: { word: "E1", description: "d1" },
            wordPl: { word: "P1", description: "pd1" },
          },
          {
            id: 2,
            boxName: "b",
            wordEng: { word: "E2", description: "d2" },
            wordPl: { word: "P2", description: "pd2" },
          },
          {
            id: 1,
            boxName: "a",
            wordEng: { word: "E1", description: "d1" },
            wordPl: { word: "P1", description: "pd1" },
          },
        ],
        last_saved: "T",
        patchNumber: 3,
      });
      expect(client.release).toHaveBeenCalled();
    });

    it("500 → gdy wyjątek", async () => {
      pool.connect.mockRejectedValue(new Error());
      const res = makeRes();
      await autoLoad({ user: {}, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("autoDelete", () => {
    let client;
    beforeEach(() => {
      client = { release: jest.fn() };
      pool.connect.mockResolvedValue(client);
    });

    it("200 → usuwa i zwraca success", async () => {
      model.deleteDataUserByUserID.mockResolvedValue();
      model.resetPatchNumberByUserID.mockResolvedValue();
      const req = { user: { id: 7 }, body: { level: "C1" } };
      const res = makeRes();

      await autoDelete(req, res);

      expect(model.deleteDataUserByUserID).toHaveBeenCalledWith(
        client,
        7,
        "C1"
      );
      expect(model.resetPatchNumberByUserID).toHaveBeenCalledWith(
        client,
        7,
        "C1"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it("500 → gdy wyjątek", async () => {
      pool.connect.mockRejectedValue(new Error());
      const res = makeRes();
      await autoDelete({ user: { id: 7 }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
