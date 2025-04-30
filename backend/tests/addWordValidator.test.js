// tests/addWordValidator.test.js
import { validationResult } from "express-validator";
import { addWordValidator } from "../src/middleware/validators/word/post-addword-vali";
describe("addWordValidator", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  // helper that runs each validator in turn
  async function runAll() {
    for (const mw of addWordValidator) {
      if (typeof mw.run === "function") {
        // express-validator chain
        await mw.run(req);
      } else {
        // our final error‐handler middleware
        mw(req, res, next);
      }
    }
  }

  it("400 if word missing", async () => {
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: expect.any(Array),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 if word is not an object", async () => {
    req.body.word = "foo";
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            msg: "Word must be an object.",
            path: "word",
          }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 if translations missing or not array", async () => {
    req.body.word = {};
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);

    // now non‐array
    res.status.mockClear();
    res.json.mockClear();
    req.body.word.translations = "nope";
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
  });

  it("400 if translation entries missing fields", async () => {
    req.body.word = {
      translations: [{}],
      level: "B2",
    };
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            msg: "Each translation must have a language.",
          }),
        ]),
      })
    );
  });

  it("400 if no English translation present", async () => {
    req.body.word = {
      translations: [{ language: "pl", translation: "cześć" }],
      level: "B2",
    };
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: "English translation is required." }),
        ]),
      })
    );
  });

  it("400 if level missing or invalid", async () => {
    // missing level
    req.body.word = {
      translations: [
        { language: "en", translation: "hi" },
        { language: "pl", translation: "cześć" },
      ],
    };
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);

    // invalid level
    res.status.mockClear();
    res.json.mockClear();
    req.body.word.level = "A1";
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            msg: "Word level must be either 'B2' or 'C1'.",
          }),
        ]),
      })
    );
  });

  it("calls next() when everything is valid", async () => {
    req.body.word = {
      translations: [
        { language: "en", translation: "hello" },
        { language: "pl", translation: "witaj" },
      ],
      level: "C1",
    };
    await runAll();
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
