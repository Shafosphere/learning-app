// tests/getWordDetailValidator.test.js
import { getWordDetailValidator } from "../middleware/validators/word/post-getworddetail-vali";
describe("getWordDetailValidator", () => {
  let req, res, next;
  // express-validator’s `body()` returns a middleware object
  // which also exposes a `.run(req)` helper to populate req with validation results.
  const [idValidator, errorHandler] = getWordDetailValidator;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it("returns 400 when id is missing", async () => {
    await idValidator.run(req);
    errorHandler(req, res, next);

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

  it("returns 400 when id is not an integer", async () => {
    req.body.id = "foo";
    await idValidator.run(req);
    errorHandler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            msg: "Word ID must be a positive integer less than 100000.",
          }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 when id ≤ 0 or ≥ 100000", async () => {
    req.body.id = 0;
    await idValidator.run(req);
    errorHandler(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();

    jest.clearAllMocks();
    req.body.id = 100000;
    await idValidator.run(req);
    errorHandler(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() when id is valid", async () => {
    req.body.id = 12345;
    await idValidator.run(req);
    errorHandler(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
