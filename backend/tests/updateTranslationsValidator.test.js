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
    await runAll();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: "Word object is required." }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 when word is not an object", async () => {
    req.body.word = "not an object";
    await runAll();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: "Word must be an object." }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 when translations data is missing", async () => {
    req.body.word = {};
    await runAll();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: "Translations data is required." }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 when translations is not an array or is empty", async () => {
    // Not an array
    req.body.word = { translations: "foo" };
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: "Translations must be a non-empty array." }),
        ]),
      })
    );

    // Empty array
    jest.clearAllMocks();
    req.body.word = { translations: [] };
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: "Translations must be a non-empty array." }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid translation items", async () => {
    req.body.word = {
      translations: [
        { translation: 123, word_id: -1, language: {}, description: 456 },
      ],
    };
    await runAll();

    const errors = res.json.mock.calls[0][0].errors;
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: "Translation text must be a string." }),
        expect.objectContaining({ msg: "word_id must be a positive integer." }),
        expect.objectContaining({ msg: "Language must be a string." }),
        expect.objectContaining({ msg: "Description must be a string." }),
      ])
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() when all data is valid", async () => {
    req.body.word = {
      translations: [
        { translation: "tekst", word_id: 1, language: "pl", description: "opis" },
      ],
    };
    await runAll();

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
