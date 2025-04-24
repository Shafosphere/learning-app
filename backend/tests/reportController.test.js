// tests/reportControllerExtended.test.js
import {
  getDetailReport,
  getDataReports,
  updateReportTranslations,
  deleteReportData,
  createReport,
} from "../controllers/reportController.js";
import * as model from "../models/userModel.js";

describe("reportController", () => {
  let req, res;

  beforeEach(() => {
    // Przygotuj świeże req/res i wycisz console.error
    req = { body: {}, params: {}, user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.clearAllMocks();
  });

  describe("getDetailReport", () => {
    it("404 when report not found", async () => {
      model.getReportById = jest.fn().mockResolvedValue(null);
      req.body.id = 7;

      await getDetailReport(req, res);

      expect(model.getReportById).toHaveBeenCalledWith(7);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Report not found" });
    });

    it("500 on translations-fetch error", async () => {
      // raport typu word_issue, ale fetch tłumaczeń rzuca
      model.getReportById = jest.fn().mockResolvedValue({
        id: 1,
        report_type: "word_issue",
        word_id: 42,
        description: "X",
      });
      model.getWordTranslations = jest
        .fn()
        .mockRejectedValue(new Error("fail"));
      req.body.id = 1;

      await getDetailReport(req, res);

      expect(model.getWordTranslations).toHaveBeenCalledWith(42);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error fetching translations.",
      });
    });

    it("200 returns plain report if not word_issue", async () => {
      const report = { id: 2, report_type: "other", description: "OK" };
      model.getReportById = jest.fn().mockResolvedValue(report);
      req.body.id = 2;

      await getDetailReport(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      // zwrócony obiekt powinien być taki sam jak modelowy
      expect(res.json).toHaveBeenCalledWith(report);
    });

    it("200 returns report + translations for word_issue", async () => {
      const report = {
        id: 3,
        report_type: "word_issue",
        word_id: 99,
        foo: "bar",
      };
      const translations = [{ language: "en", translation: "t" }];
      model.getReportById = jest.fn().mockResolvedValue(report);
      model.getWordTranslations = jest.fn().mockResolvedValue(translations);
      req.body.id = 3;

      await getDetailReport(req, res);

      expect(model.getWordTranslations).toHaveBeenCalledWith(99);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ ...report, translations });
    });
  });

  describe("getDataReports", () => {
    it("200 returns array from model", async () => {
      const data = [{ id: 1 }, { id: 2 }];
      model.getReports = jest.fn().mockResolvedValue(data);

      await getDataReports(req, res);

      expect(model.getReports).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(data);
    });

    it("500 on model error", async () => {
      model.getReports = jest.fn().mockRejectedValue(new Error("db"));
      await getDataReports(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });

  describe("updateReportTranslations", () => {
    it("200 on happy path", async () => {
      // przygotuj trzy tłumaczenia
      const translations = [{ id: 1 }, { id: 2 }];
      req.body.report = { translations };
      model.updateReport = jest.fn().mockResolvedValue();

      await updateReportTranslations(req, res);

      // każdy updateReport powinien być wywołany
      expect(model.updateReport).toHaveBeenCalledTimes(translations.length);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Translations updated successfully.",
      });
    });

    it("500 on model error", async () => {
      req.body.report = { translations: [{ id: 1 }] };
      model.updateReport = jest.fn().mockRejectedValue(new Error("err"));

      await updateReportTranslations(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Internal Server Error.",
      });
    });
  });

  describe("deleteReportData", () => {
    it("200 on delete", async () => {
      req.params.id = "55";
      model.deleteReport = jest.fn().mockResolvedValue();

      await deleteReportData(req, res);

      expect(model.deleteReport).toHaveBeenCalledWith("55");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith("Report has been deleted.");
    });

    it("500 on model error", async () => {
      req.params.id = "77";
      model.deleteReport = jest.fn().mockRejectedValue(new Error("oops"));

      await deleteReportData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });

  describe("createReport", () => {
    beforeEach(() => {
      req.user.id = 123;
    });

    it("201 for non-word_issue", async () => {
      req.body = { reportType: "other", word: "x", description: "d" };
      model.insertReport = jest.fn().mockResolvedValue(999);

      await createReport(req, res);

      expect(model.insertReport).toHaveBeenCalledWith(123, "other", null, "d");
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Report received",
        reportId: 999,
      });
    });

    it("404 when word_issue but no word found", async () => {
      req.body = { reportType: "word_issue", word: "foo", description: "d" };
      model.getWordByTranslation = jest.fn().mockResolvedValue(null);

      await createReport(req, res);

      expect(model.getWordByTranslation).toHaveBeenCalledWith("foo");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Word not found",
      });
    });

    it("201 for word_issue and word found", async () => {
      req.body = { reportType: "word_issue", word: "foo", description: "d" };
      model.getWordByTranslation = jest.fn().mockResolvedValue({ word_id: 77 });
      model.insertReport = jest.fn().mockResolvedValue(888);

      await createReport(req, res);

      expect(model.insertReport).toHaveBeenCalledWith(
        123,
        "word_issue",
        77,
        "d"
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Report received",
        reportId: 888,
      });
    });

    it("500 on getWordByTranslation throw", async () => {
      req.body = { reportType: "word_issue", word: "foo", description: "d" };
      model.getWordByTranslation = jest.fn().mockRejectedValue(new Error("x"));
      await createReport(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "An error occurred while processing your report.",
      });
    });

    it("500 on insertReport throw", async () => {
      req.body = { reportType: "other", word: "x", description: "d" };
      model.insertReport = jest.fn().mockRejectedValue(new Error("x"));
      await createReport(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "An error occurred while processing your report.",
      });
    });
  });
});
