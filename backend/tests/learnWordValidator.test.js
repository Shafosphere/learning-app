// tests/learnWordValidator.test.js

// 1) Mockujemy dokładnie ten plik, którego używa validator:
jest.mock("../src/repositories/word.repo.js", () => ({
  searchWordById: jest.fn(),
}));
import { searchWordById } from "../src/repositories/word.repo.js";

import { learnWordValidator } from "../src/middleware/validators/users/post-learnword-vali.js";

describe("learnWordValidator", () => {
  let req, res, next;
  const [idValidator, customValidator, errorHandler] = learnWordValidator;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  // helper uruchamiający wszystkie kroki walidacji
  async function runValidation() {
    await idValidator.run(req);
    await customValidator.run(req);
    errorHandler(req, res, next);
  }

  it("400 jeśli wordId jest pusty", async () => {
    await runValidation();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: "Word ID is required." }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 jeśli wordId nie jest liczbą całkowitą > 0", async () => {
    req.body.wordId = "foo";
    await runValidation();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            msg: "Word ID must be a positive integer.",
          }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 jeśli słowo nie istnieje w bazie", async () => {
    req.body.wordId = "123";
    searchWordById.mockResolvedValue(null);

    await runValidation();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: "Word not found." }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("wywołuje next() gdy walidacja przejdzie pomyślnie", async () => {
    req.body.wordId = "456";
    searchWordById.mockResolvedValue({ id: 456, text: "przykład" });

    await runValidation();
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
