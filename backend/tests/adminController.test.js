// tests/adminController.test.js

import {
  getGlobalData,
  getVisitsData,
  getUserActivityData,
  generatePatches,
} from "../src/controllers/adminController.js";
import * as statsRepo from "../src/repositories/stats.repo.js";
import * as patchRepo from "../src/repositories/patch.repo.js";
import * as userRepo from "../src/repositories/user.repo.js";
import { format, eachDayOfInterval } from "date-fns";

jest.mock("../src/repositories/stats.repo.js");
jest.mock("../src/repositories/patch.repo.js");
jest.mock("../src/repositories/user.repo.js");
jest.mock("date-fns", () => ({
  eachDayOfInterval: jest.fn(),
  format: jest.fn(),
}));

describe("adminController", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe("getGlobalData", () => {
    it("200 with data", async () => {
      const fake = { total_users: 10 };
      statsRepo.fetchGlobalData.mockResolvedValue(fake);

      await getGlobalData(req, res);

      expect(statsRepo.fetchGlobalData).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    it("500 on error", async () => {
      statsRepo.fetchGlobalData.mockRejectedValue(new Error("boom"));

      await getGlobalData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Server Error");
    });
  });

  describe("getVisitsData", () => {
    const d1 = new Date("2021-01-01T00:00:00Z");
    const d2 = new Date("2021-01-02T00:00:00Z");

    beforeEach(() => {
      eachDayOfInterval.mockReturnValue([d1, d2]);
      format.mockImplementation((date, pattern) => {
        if (pattern === "yyyy-MM-dd") {
          return date.toISOString().slice(0, 10);
        }
        return `M${date.getUTCDate()}`; // "M1", "M2"
      });
    });

    it("200 builds chartData correctly", async () => {
      statsRepo.fetchVisitsData.mockResolvedValue([
        { stat_date: d1, page_name: "A", visit_count: 5 },
      ]);

      await getVisitsData(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        labels: ["M1", "M2"],
        datasets: [
          {
            label: "A",
            data: [5, 0],
            backgroundColor: expect.any(String),
          },
        ],
      });
    });

    it("500 on error", async () => {
      statsRepo.fetchVisitsData.mockRejectedValue(new Error("fail"));

      await getVisitsData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Server Error");
    });
  });

  describe("getUserActivityData", () => {
    const d1 = new Date("2021-02-01T00:00:00Z");
    const d2 = new Date("2021-02-02T00:00:00Z");

    beforeAll(() => {
      jest.useFakeTimers("modern");
      jest.setSystemTime(d2);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    beforeEach(() => {
      eachDayOfInterval.mockReturnValue([d1, d2]);
      format.mockImplementation((date, pattern) => {
        if (pattern === "yyyy-MM-dd") {
          return date.toISOString().slice(0, 10);
        }
        return `M${date.getUTCDate()}`;
      });
    });

    it("200 builds chartData correctly", async () => {
      userRepo.fetchUserActivityData.mockResolvedValue([
        {
          activity_date: d1.toISOString(),
          activity_type: "X",
          activity_count: 3,
        },
      ]);

      await getUserActivityData(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        labels: ["M1", "M2"],
        datasets: [
          {
            label: "X",
            data: [3, 0],
            backgroundColor: expect.any(String),
          },
        ],
      });
    });

    it("500 on error", async () => {
      userRepo.fetchUserActivityData.mockRejectedValue(new Error("oops"));

      await getUserActivityData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Server Error");
    });
  });

  describe("generatePatches", () => {
    it("200 on success", async () => {
      patchRepo.deleteOldNeWPatches.mockResolvedValue();
      patchRepo.generateNewPatchesBatch.mockResolvedValue();

      await generatePatches(req, res);

      expect(patchRepo.deleteOldNeWPatches).toHaveBeenCalled();
      expect(patchRepo.generateNewPatchesBatch).toHaveBeenCalledWith(30);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        "Patches have been generated successfully."
      );
    });

    it("500 on error", async () => {
      patchRepo.deleteOldNeWPatches.mockRejectedValue(new Error("err"));

      await generatePatches(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        "An error occurred while generating patches."
      );
    });
  });
});
