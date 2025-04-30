// tests/resetPasswordValidationRules.test.js

// Mock validationConfig and getErrorParams before importing the validator
jest.mock("../middleware/validators/validationConfig.js", () => ({
  __esModule: true,
  default: {
    PASSWORD: {
      MIN_LENGTH: 8,
      MAX_LENGTH: 50,
      REGEX: {
        UPPER: /[A-Z]/,
        LOWER: /[a-z]/,
        DIGIT: /[0-9]/,
        SPECIAL: /[\W_]/,
      },
    },
  },
}));
jest.mock("../middleware/getErrorParams.js", () => ({
  getErrorParams: jest.fn(),
}));


import { resetPasswordValidationRules } from "../src/middleware/validators/auth/post-resetPass-vali.js";
import { getErrorParams } from "../middleware/getErrorParams.js";

describe("resetPasswordValidationRules", () => {
  let req, res, next;
  const validators = resetPasswordValidationRules;
  const errorHandler = validators[validators.length - 1];
  const runValidators = validators.slice(0, -1);

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    getErrorParams.mockReset().mockReturnValue({ param: "value" });
  });

  async function runAll() {
    for (const v of runValidators) {
      await v.run(req);
    }
    errorHandler(req, res, next);
  }

  it("400 when token is missing", async () => {
    req.body = { password: "Valid1!a" };
    await runAll();

    expect(res.status).toHaveBeenCalledWith(400);
    const errors = res.json.mock.calls[0][0].errors;
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "ERR_RESET_TOKEN_REQUIRED",
          params: { param: "value" },
        }),
      ])
    );
    expect(getErrorParams).toHaveBeenCalledWith("ERR_RESET_TOKEN_REQUIRED");
    expect(next).not.toHaveBeenCalled();
  });

  it("400 when password is too short", async () => {
    req.body = { token: "tok123", password: "Aa1!" };
    await runAll();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(getErrorParams).toHaveBeenCalledWith("ERR_RESET_PASSWORD_LENGTH");
    expect(res.json.mock.calls[0][0].errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: "ERR_RESET_PASSWORD_LENGTH" }),
      ])
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 when password missing uppercase", async () => {
    req.body = { token: "tok123", password: "lowercase1!" };
    await runAll();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(getErrorParams).toHaveBeenCalledWith("ERR_RESET_PASSWORD_UPPERCASE");
    expect(res.json.mock.calls[0][0].errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: "ERR_RESET_PASSWORD_UPPERCASE" }),
      ])
    );
  });

  it("400 when password missing lowercase", async () => {
    req.body = { token: "tok123", password: "UPPERCASE1!" };
    await runAll();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(getErrorParams).toHaveBeenCalledWith("ERR_RESET_PASSWORD_LOWERCASE");
  });

  it("400 when password missing digit", async () => {
    req.body = { token: "tok123", password: "NoDigits!" };
    await runAll();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(getErrorParams).toHaveBeenCalledWith("ERR_RESET_PASSWORD_DIGIT");
  });

  it("400 when password missing special char", async () => {
    req.body = { token: "tok123", password: "NoSpecial1" };
    await runAll();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(getErrorParams).toHaveBeenCalledWith("ERR_RESET_PASSWORD_SPECIAL");
  });

  it("calls next() when token and password are valid", async () => {
    req.body = { token: "tok123", password: "GoodPass1!" };
    await runAll();

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
