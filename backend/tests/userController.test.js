// tests/userController.test.js

// Mock repositories and DB client
jest.mock("../src/repositories/user.repo.js");
jest.mock("../src/repositories/ranking.repo.js");
jest.mock("../src/repositories/translation.repo.js");
jest.mock("../src/repositories/patch.repo.js");
jest.mock("../src/repositories/arena.repo.js");
jest.mock("../src/db/dbClient.js");

// ręczne mocki – zwracamy obiekt z metodami jest.fn()
jest.mock("../src/repositories/word.repo.js", () => ({
  __esModule: true,
  insertWordIntoUserProgress: jest.fn(),
}));

jest.mock("../src/repositories/autosave.repo.js", () => ({
  __esModule: true,
  insertOrUpdateUserAutosave: jest.fn(),
  getAutosaveData: jest.fn(),
}));

import pool from "../src/db/dbClient.js";
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
} from "../src/controllers/userControllers.js";

import {
  getUsersWithPagination,
  updateUserInDb,
  searchUserById,
  searchUserByEmail,
  searchUserByUsername,
  deleteUserByID,
  getUserIdFromProgress,
  deleteDataUserByUserID as deleteDataUserByIDUserRepo,
} from "../src/repositories/user.repo.js";
import { insertWordIntoUserProgress } from "../src/repositories/word.repo.js";
import {
  userRankingUpdate,
  getTopRankingUsersFlashcard,
} from "../src/repositories/ranking.repo.js";
import {
  insertOrUpdateUserAutosave,
  getAutosaveData,
} from "../src/repositories/autosave.repo.js";
import { getBatchWordTranslations } from "../src/repositories/translation.repo.js";
import { resetPatchNumberByUserID } from "../src/repositories/patch.repo.js";
import { getTopArenaUsers } from "../src/repositories/arena.repo.js";

// Helper for Express res
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn();
  res.cookie = jest.fn();
  return res;
};

describe("userController", () => {
  afterEach(() => jest.clearAllMocks());

  describe("getUsersList", () => {
    it("returns paginated users", async () => {
      const fakeUsers = [{ id: 1 }, { id: 2 }];
      getUsersWithPagination.mockResolvedValue(fakeUsers);
      const req = { query: { page: "2", limit: "10" } };
      const res = mockRes();

      await getUsersList(req, res);
      expect(getUsersWithPagination).toHaveBeenCalledWith(10, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeUsers);
    });

    it("handles error", async () => {
      getUsersWithPagination.mockRejectedValue(new Error("db"));
      const req = { query: {} };
      const res = mockRes();

      await expect(getUsersList(req, res)).rejects.toThrow("db");

      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
    });
  });

  describe("updateUsers", () => {
    it("updates multiple users successfully", async () => {
      updateUserInDb.mockResolvedValue();
      const editedRows = { 1: { id: 1 }, 2: { id: 2 } };
      const req = { body: { editedRows } };
      const res = mockRes();

      await updateUsers(req, res);
      expect(updateUserInDb).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Users updated successfully.",
      });
    });

    it("handles error during update", async () => {
      updateUserInDb.mockRejectedValue(new Error("fail"));
      const req = { body: { editedRows: { 1: { id: 1 } } } };
      const res = mockRes();

      await expect(updateUsers(req, res)).rejects.toThrow("fail");

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("searchUsers", () => {
    it("search by id returns results", async () => {
      const records = [{ id: 3 }];
      searchUserById.mockResolvedValue(records);
      const req = { query: { query: "3" } };
      const res = mockRes();

      await searchUsers(req, res);
      expect(searchUserById).toHaveBeenCalledWith(3);
      expect(res.json).toHaveBeenCalledWith(records);
    });

    it("search by email returns results", async () => {
      const records = [{ email: "a@b.com" }];
      searchUserByEmail.mockResolvedValue(records);
      const req = { query: { query: "a@b.com" } };
      const res = mockRes();

      await searchUsers(req, res);
      expect(searchUserByEmail).toHaveBeenCalledWith("a@b.com");
      expect(res.json).toHaveBeenCalledWith(records);
    });

    it("search by username returns results", async () => {
      const records = [{ username: "user" }];
      searchUserByUsername.mockResolvedValue(records);
      const req = { query: { query: "user" } };
      const res = mockRes();

      await searchUsers(req, res);
      expect(searchUserByUsername).toHaveBeenCalledWith("user");
      expect(res.json).toHaveBeenCalledWith(records);
    });

    it("no records returns 404", async () => {
      searchUserByUsername.mockResolvedValue([]);
      const req = { query: { query: "none" } };
      const res = mockRes();

      await expect(searchUsers(req, res)).rejects.toEqual(
        expect.objectContaining({ statusCode: 404, code: "ERR_NO_RECORDS" })
      );

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("handles error", async () => {
      searchUserByUsername.mockRejectedValue(new Error("err"));
      const req = { query: { query: "x" } };
      const res = mockRes();

      await expect(searchUsers(req, res)).rejects.toThrow("err");

      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
    });
  });

  describe("deleteUser", () => {
    it("deletes user successfully", async () => {
      deleteUserByID.mockResolvedValue();
      const req = { params: { id: "5" } };
      const res = mockRes();

      await deleteUser(req, res);
      expect(deleteUserByID).toHaveBeenCalledWith("5");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User deleted successfully.",
      });
    });

    it("handles error", async () => {
      deleteUserByID.mockRejectedValue(new Error("fail"));
      const req = { params: { id: "5" } };
      const res = mockRes();

      await expect(deleteUser(req, res)).rejects.toThrow("fail");

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("learnWord", () => {
    const mockClient = { query: jest.fn(), release: jest.fn() };
    beforeEach(() => {
      pool.connect.mockResolvedValue(mockClient);
    });

    it("returns 400 if word already learned", async () => {
      getUserIdFromProgress.mockResolvedValue({ rows: [{}] });
      const req = { user: { id: 1, username: "u" }, body: { wordId: 10 } };
      const res = mockRes();

      await expect(learnWord(req, res)).rejects.toEqual(
        expect.objectContaining({
          statusCode: 400,
          code: "ERR_ALREADY_LEARNED",
        })
      );

      expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(mockClient.release).toHaveBeenCalled();
    });

    it("adds word and commits on success", async () => {
      mockClient.query.mockResolvedValue();
      getUserIdFromProgress.mockResolvedValue({ rows: [] });
      insertWordIntoUserProgress.mockResolvedValue();
      userRankingUpdate.mockResolvedValue();

      const req = { user: { id: 2, username: "u2" }, body: { wordId: 20 } };
      const res = mockRes();

      await learnWord(req, res);
      expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
      expect(insertWordIntoUserProgress).toHaveBeenCalledWith(
        mockClient,
        2,
        20
      );
      expect(userRankingUpdate).toHaveBeenCalledWith(2, "u2");
      expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Word added to progress and ranking updated.",
      });
      expect(mockClient.release).toHaveBeenCalled();
    });

    it("handles error and rolls back", async () => {
      mockClient.query.mockResolvedValue();
      getUserIdFromProgress.mockRejectedValue(new Error("oops"));
      const req = { user: { id: 3, username: "u3" }, body: { wordId: 30 } };
      const res = mockRes();

      await expect(learnWord(req, res)).rejects.toThrow("oops");
      expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe("getRankingFlashcard", () => {
    it("returns top ranking", async () => {
      const tops = [{ user: "a" }];
      getTopRankingUsersFlashcard.mockResolvedValue(tops);
      const res = mockRes();

      await getRankingFlashcard({}, res);
      expect(getTopRankingUsersFlashcard).toHaveBeenCalledWith(10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(tops);
    });

    it("handles error", async () => {
      getTopRankingUsersFlashcard.mockRejectedValue(new Error());
      const res = mockRes();

      await expect(getRankingFlashcard({}, res)).rejects.toThrow();

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("getArena", () => {
    it("returns top arena users", async () => {
      const arena = [{ id: 1 }];
      getTopArenaUsers.mockResolvedValue(arena);
      const res = mockRes();

      await getArena({}, res);
      expect(getTopArenaUsers).toHaveBeenCalledWith(10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(arena);
    });

    it("handles error", async () => {
      getTopArenaUsers.mockRejectedValue(new Error());
      const res = mockRes();

      await expect(getArena({}, res)).rejects.toThrow();

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("autoSave", () => {
    const mockClient = { release: jest.fn() };
    beforeEach(() => {
      pool.connect.mockResolvedValue(mockClient);
    });

    it("saves data successfully", async () => {
      insertOrUpdateUserAutosave.mockResolvedValue();
      const req = {
        user: { id: 1, username: "u" },
        body: { level: "B2", deviceId: "d", words: [], patchNumber: 1 },
      };
      const res = mockRes();

      await autoSave(req, res);
      expect(insertOrUpdateUserAutosave).toHaveBeenCalledWith(
        mockClient,
        1,
        "B2",
        [],
        "d",
        1
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Dane odebrane" });
      expect(mockClient.release).toHaveBeenCalled();
    });

    it("handles error", async () => {
      pool.connect.mockRejectedValue(new Error("conn"));
      const req = { user: { id: 1, username: "u" }, body: {} };
      const res = mockRes();

      await expect(autoSave(req, res)).rejects.toThrow("conn");

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("autoLoad", () => {
    const mockClient = { release: jest.fn() };
    beforeEach(() => {
      pool.connect.mockResolvedValue(mockClient);
    });

    it("returns 404 when no autosave", async () => {
      getAutosaveData.mockResolvedValue(null);
      const req = {
        user: { id: 1, username: "u" },
        body: { level: "B2", deviceId: "d" },
      };
      const res = mockRes();

      await expect(autoLoad(req, res)).rejects.toEqual(
        expect.objectContaining({ statusCode: 404, code: "ERR_NO_AUTOSAVE" })
      );

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(mockClient.release).toHaveBeenCalled();
    });

    it("loads and formats data on success", async () => {
      const words = [{ id: 5, boxName: "box" }];
      const translations = [
        {
          word_id: 5,
          en_translation: "e",
          en_description: "ed",
          pl_translation: "p",
          pl_description: "pd",
        },
      ];
      getAutosaveData.mockResolvedValue({
        words,
        level: "B2",
        last_saved: "2025-05-09",
        patch_number_b2: 3,
      });
      getBatchWordTranslations.mockResolvedValue(translations);
      const req = {
        user: { id: 2, username: "u2" },
        body: { level: "B2", deviceId: "d" },
      };
      const res = mockRes();

      await autoLoad(req, res);
      expect(getBatchWordTranslations).toHaveBeenCalledWith(mockClient, [5]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Dane odebrane",
        username: "u2",
        level: "B2",
        words: [
          {
            id: 5,
            boxName: "box",
            wordEng: { word: "e", description: "ed" },
            wordPl: { word: "p", description: "pd" },
          },
        ],
        last_saved: "2025-05-09",
        patchNumber: 3,
      });
      expect(mockClient.release).toHaveBeenCalled();
    });

    it("handles error", async () => {
      pool.connect.mockRejectedValue(new Error("fail"));
      const req = {
        user: { id: 2, username: "u2" },
        body: { level: "B2", deviceId: "d" },
      };
      const res = mockRes();

      await expect(autoLoad(req, res)).rejects.toThrow("fail");

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("autoDelete", () => {
    const mockClient = { release: jest.fn() };
    beforeEach(() => {
      pool.connect.mockResolvedValue(mockClient);
    });

    it("deletes data and resets patch", async () => {
      deleteDataUserByIDUserRepo.mockResolvedValue();
      resetPatchNumberByUserID.mockResolvedValue();
      const req = { user: { id: 7 }, body: { level: "C1" } };
      const res = mockRes();

      await autoDelete(req, res);
      expect(deleteDataUserByIDUserRepo).toHaveBeenCalledWith(
        mockClient,
        7,
        "C1"
      );
      expect(resetPatchNumberByUserID).toHaveBeenCalledWith(
        mockClient,
        7,
        "C1"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
      expect(mockClient.release).toHaveBeenCalled();
    });

    it("handles error", async () => {
      pool.connect.mockRejectedValue(new Error("err"));
      const req = { user: { id: 7 }, body: { level: "C1" } };
      const res = mockRes();

      await expect(autoDelete(req, res)).rejects.toThrow("err");

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
