// tests/pageNameValidator.test.js
import { pageNameValidator } from "../src/middleware/validators/analytics/post-visit-vali";

describe("pageNameValidator middleware", () => {
  let req, res, next;
  const [validator, errorHandler] = pageNameValidator;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  async function runAll() {
    await validator.run(req);
    errorHandler(req, res, next);
  }

  it("passes and trims valid page_name", async () => {
    req.body.page_name = " flashcards ";
    await runAll();
    expect(req.body.page_name).toBe("flashcards");
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("400 if page_name is missing", async () => {
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);
    const errs = res.json.mock.calls[0][0].errors;
    expect(errs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "Brakuje parametru 'page_name' w treści żądania.",
          path: "page_name",
        }),
      ])
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 if page_name is not a string", async () => {
    req.body.page_name = 123;
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);
    const errs = res.json.mock.calls[0][0].errors;
    expect(errs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "'page_name' musi być ciągiem znaków.",
          path: "page_name",
        }),
      ])
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 if page_name is not one of the allowed values", async () => {
    req.body.page_name = "invalidPage";
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);
    const errs = res.json.mock.calls[0][0].errors;
    expect(errs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "Nieprawidłowa wartość 'page_name'. Dozwolone wartości to: flashcards, vocabulary_C1, vocabulary_B2.",
          path: "page_name",
        }),
      ])
    );
    expect(next).not.toHaveBeenCalled();
  });
});
