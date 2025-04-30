// tests/resetPasswordLinkValidationRules.test.js

// Mock validationConfig and getErrorParams before importing the validator
jest.mock("../middleware/validators/validationConfig.js", () => ({
  __esModule: true,
  default: {
    EMAIL: { MAX_LENGTH: 255 },
  },
}));
jest.mock("../middleware/getErrorParams.js", () => ({
  getErrorParams: jest.fn(),
}));

import VALIDATION_RULES from "../src/middleware/validationConfig.js";
import { getErrorParams } from "../src/middleware/getErrorParams.js";
import { resetPasswordLinkValidationRules } from "../src/middleware/validators/auth/post-resetLink-vali.js";
describe("resetPasswordLinkValidationRules", () => {
  let req, res, next;
  const [emailValidator, languageValidator, errorHandler] =
    resetPasswordLinkValidationRules;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    getErrorParams.mockReset().mockReturnValue({ foo: "bar" });
  });

  async function runAll() {
    await emailValidator.run(req);
    await languageValidator.run(req);
    errorHandler(req, res, next);
  }

  it("400 when email is missing", async () => {
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);
    const errors = res.json.mock.calls[0][0].errors;
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "ERR_INVALID_EMAIL_FORMAT",
          params: { foo: "bar" },
        }),
      ])
    );
    expect(getErrorParams).toHaveBeenCalledWith("ERR_INVALID_EMAIL_FORMAT");
    expect(next).not.toHaveBeenCalled();
  });

  it("400 when email format is invalid", async () => {
    req.body.email = "not-an-email";
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(getErrorParams).toHaveBeenCalledWith("ERR_INVALID_EMAIL_FORMAT");
  });

  it("400 when email is too long", async () => {
    const longLocal = "a".repeat(VALIDATION_RULES.EMAIL.MAX_LENGTH + 1);
    req.body.email = `${longLocal}@example.com`;
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(getErrorParams).toHaveBeenCalledWith("ERR_EMAIL_TOO_LONG");
  });

  it("next() when email valid and language omitted", async () => {
    req.body.email = "User@Example.Com";
    await runAll();
    expect(next).toHaveBeenCalled();
  });

  it("400 when language invalid", async () => {
    req.body.email = "user@example.com";
    req.body.language = "fr";
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(getErrorParams).toHaveBeenCalledWith("ERR_INVALID_LANGUAGE");
    expect(next).not.toHaveBeenCalled();
  });

  it("next() when both email and language valid", async () => {
    req.body.email = "user@example.com";
    req.body.language = "pl";
    await runAll();
    expect(next).toHaveBeenCalled();
  });
});
