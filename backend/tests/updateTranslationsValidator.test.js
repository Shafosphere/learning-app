// tests/updateTranslationsValidator.test.js
import { updateTranslationsValidator } from "../src/middleware/validators/word/patch-updatetranslation-vali";
describe("updateTranslationsValidator", () => {
  let req, res, next;
  const validators = updateTranslationsValidator;
  const errorHandler = validators[validators.length - 1];
  const runValidators = validators.slice(0, -1);

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  // Helper to run all validator middlewares then the error handler
  async function runAll() {
    for (const validator of runValidators) {
      await validator.run(req);
    }
    errorHandler(req, res, next);
  }

  it("returns 400 when word object is missing", async () => {
    await expect(runAll()).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        code: "ERR_VALIDATION",
        details: expect.arrayContaining([
          expect.objectContaining({ message: "ERR_WORD_OBJECT_REQUIRED" }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("returns 400 when word is not an object", async () => {
    req.body.word = "not an object";

    await expect(runAll()).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        code: "ERR_VALIDATION",
        details: expect.arrayContaining([
          expect.objectContaining({ message: "ERR_WORD_NOT_OBJECT" }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("returns 400 when translations data is missing", async () => {
    req.body.word = {};
    await expect(runAll()).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        code: "ERR_VALIDATION",
        details: expect.arrayContaining([
          expect.objectContaining({ message: "ERR_TRANSLATIONS_REQUIRED" }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("returns 400 when translations is not an array or is empty", async () => {
    // Not an array
    req.body.word = { translations: "foo" };

    await expect(runAll()).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        code: "ERR_VALIDATION",
        details: expect.arrayContaining([
          expect.objectContaining({ message: "ERR_TRANSLATIONS_NOT_ARRAY" }),
        ]),
      })
    );

    // Empty array
    jest.clearAllMocks();
    req.body.word = { translations: [] };

    await expect(runAll()).rejects.toEqual(
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
    req.body.word = {
      translations: [
        { translation: 123, word_id: -1, language: {}, description: 456 },
      ],
    };

    await expect(runAll()).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        code: "ERR_VALIDATION",
        details: expect.arrayContaining([
          expect.objectContaining({
            message: "ERR_TRANSLATION_TEXT_NOT_STRING",
          }),
          expect.objectContaining({ message: "ERR_WORD_ID_INVALID" }),
          expect.objectContaining({ message: "ERR_LANGUAGE_NOT_STRING" }),
          expect.objectContaining({ message: "ERR_DESCRIPTION_NOT_STRING" }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("calls next() when all data is valid", async () => {
    req.body.word = {
      translations: [
        {
          translation: "tekst",
          word_id: 1,
          language: "pl",
          description: "opis",
        },
      ],
    };
    await runAll();

    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
