// tests/loginValidator.test.js

// Mock validationConfig and getErrorParams before importing the validator
jest.mock("../middleware/validators/validationConfig.js", () => ({
  __esModule: true,
  default: {
    USERNAME: { MIN_LENGTH: 4, MAX_LENGTH: 20, REGEX: /^[a-zA-Z0-9_]+$/ },
    PASSWORD: { MIN_LENGTH: 8, MAX_LENGTH: 50 },
  },
}));
jest.mock("../middleware/getErrorParams.js", () => ({
  getErrorParams: jest.fn(),
}));

import VALIDATION_RULES from "../src/middleware/validationConfig.js";
import { getErrorParams } from "../src/middleware/getErrorParams.js";
import { loginValidator } from "../src/middleware/validators/auth/post-loginUser-vali.js";

describe("loginValidator", () => {
  let req, res, next;
  const [usernameValidator, passwordValidator, errorHandler] = loginValidator;

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
    await usernameValidator.run(req);
    await passwordValidator.run(req);
    errorHandler(req, res, next);
  }

  it("400 when username is missing", async () => {
    req.body = { password: "ValidPass1" };
    await runAll();

    expect(res.status).toHaveBeenCalledWith(400);
    const errors = res.json.mock.calls[0][0].errors;
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "ERR_LOGIN_USERNAME_LENGTH",
          params: { foo: "bar" },
        }),
      ])
    );
    expect(getErrorParams).toHaveBeenCalledWith("ERR_LOGIN_USERNAME_LENGTH");
    expect(next).not.toHaveBeenCalled();
  });

  it("400 when username too short", async () => {
    req.body = { username: "abc", password: "ValidPass1" };
    await runAll();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(getErrorParams).toHaveBeenCalledWith("ERR_LOGIN_USERNAME_LENGTH");
  });

  it("400 when username has invalid characters", async () => {
    req.body = { username: "bad*name", password: "ValidPass1" };
    await runAll();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(getErrorParams).toHaveBeenCalledWith(
      "ERR_LOGIN_USERNAME_INVALID_CHARS"
    );
  });

  it("400 when password is missing", async () => {
    req.body = { username: "validUser" };
    await runAll();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(getErrorParams).toHaveBeenCalledWith("ERR_LOGIN_PASSWORD_LENGTH");
    expect(next).not.toHaveBeenCalled();
  });

  it("400 when password too short", async () => {
    req.body = { username: "validUser", password: "short" };
    await runAll();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(getErrorParams).toHaveBeenCalledWith("ERR_LOGIN_PASSWORD_LENGTH");
  });

  it("calls next() when both fields valid", async () => {
    req.body = { username: "validUser", password: "ValidPass1" };
    await runAll();

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
