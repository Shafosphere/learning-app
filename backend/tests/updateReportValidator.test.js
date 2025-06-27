// tests/updateReportValidator.test.js

// 1) Mockujemy dokładnie ten plik, którego używa validator:
jest.mock("../src/repositories/word.repo.js", () => ({
  searchWordById: jest.fn(),
}));
import { searchWordById } from "../src/repositories/word.repo.js";

import { updateReportValidator } from "../src/middleware/validators/report/patch-updatereporttrans-vali.js";

describe("updateReportValidator", () => {
  let req, res, next;
  const validators = updateReportValidator;
  const errorHandler = validators[validators.length - 1];
  const runValidators = validators.slice(0, -1);

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  async function runValidation() {
    for (const v of runValidators) {
      await v.run(req);
    }
    errorHandler(req, res, next);
  }

  it("returns 400 when report object is missing", async () => {
    await expect(runValidation()).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        code: "ERR_VALIDATION",
        details: expect.arrayContaining([
          expect.objectContaining({ message: "ERR_REPORT_OBJECT_REQUIRED" }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("returns 400 when report is not an object", async () => {
    req.body.report = "not-an-object";
    await expect(runValidation()).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        code: "ERR_VALIDATION",
        details: expect.arrayContaining([
          expect.objectContaining({ message: "ERR_REPORT_OBJECT_NOT_OBJECT" }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("returns 400 when translations array is missing or empty", async () => {
    req.body.report = {};

    await expect(runValidation()).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        code: "ERR_VALIDATION",
        details: expect.arrayContaining([
          expect.objectContaining({ message: "ERR_TRANSLATIONS_REQUIRED" }),
        ]),
      })
    );

    jest.clearAllMocks();
    req.body.report = { translations: [] };

    await expect(runValidation()).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        code: "ERR_VALIDATION",
        details: expect.arrayContaining([
          expect.objectContaining({ message: "ERR_TRANSLATIONS_NOT_ARRAY" }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid translation items", async () => {
    req.body.report = {
      translations: [
        {
          translation: 123,
          description: 456,
          word_id: 0,
          language: "de",
        },
      ],
    };

    await expect(runValidation()).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        code: "ERR_VALIDATION",
        details: expect.arrayContaining([
          expect.objectContaining({
            message: "ERR_TRANSLATION_TEXT_NOT_STRING",
          }),
          expect.objectContaining({ message: "ERR_DESCRIPTION_NOT_STRING" }),
          expect.objectContaining({ message: "ERR_WORD_ID_INVALID" }),
          expect.objectContaining({ message: "ERR_LANGUAGE_INVALID" }),
          expect.objectContaining({ message: "ERR_WORD_ID_NOT_FOUND" }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("returns 400 when word_id not found in database", async () => {
    req.body.report = {
      translations: [
        { translation: "ok", description: "desc", word_id: 42, language: "en" },
      ],
    };
    searchWordById.mockResolvedValue(null);
    await expect(runValidation()).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        code: "ERR_VALIDATION",
        details: expect.arrayContaining([
          expect.objectContaining({ message: "ERR_WORD_ID_NOT_FOUND" }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("calls next() when all fields are valid", async () => {
    req.body.report = {
      translations: [
        {
          translation: "hello",
          description: "desc",
          word_id: 7,
          language: "pl",
        },
      ],
    };
    searchWordById.mockResolvedValue({ id: 7, text: "hello" });
    await runValidation();
    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
