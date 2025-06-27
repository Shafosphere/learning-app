// tests/updateUsersValidator.test.js

// 1) Mockujemy validationConfig.js, którego używa validator:
jest.mock("../src/middleware/validationConfig.js", () => ({
  __esModule: true,
  default: {
    USERNAME: { MIN_LENGTH: 4, MAX_LENGTH: 20, REGEX: /^[a-zA-Z0-9_]+$/ },
    EMAIL: { MAX_LENGTH: 255 },
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

import { updateUsersValidator } from "../src/middleware/validators/users/patch-updateuser-vali.js";

describe("updateUsersValidator", () => {
  let req, res, next;
  // wyciągamy wszystkie kroki walidacji
  const validators = updateUsersValidator;
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

  // Helper to execute validators sequentially and then call error handler
  async function runAll() {
    for (const v of runValidators) {
      if (typeof v === "function" && !v.run) {
        await v(req, res, () => {});
      } else {
        await v.run(req);
      }
    }
    errorHandler(req, res, next);
  }

  const baseRow = {
    id: 1,
    username: "valid_user",
    email: "user@example.com",
    role: "user",
    ban: false,
    // password opcjonalnie
  };

  it("400 kiedy editedRows jest brakujące", async () => {
    await expect(runAll()).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        code: "ERR_VALIDATION",
        details: expect.arrayContaining([
          expect.objectContaining({ message: "ERR_EDITED_ROWS_REQUIRED" }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("400 kiedy editedRows jest pustym obiektem", async () => {
    req.body.editedRows = {};
    await expect(runAll()).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        code: "ERR_VALIDATION",
        details: expect.arrayContaining([
          expect.objectContaining({ message: "ERR_EDITED_ROWS_EMPTY" }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("400 kiedy user ID jest brakujące", async () => {
    req.body.editedRows = { 1: { ...baseRow, id: undefined } };
    await expect(runAll()).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        code: "ERR_VALIDATION",
        details: expect.arrayContaining([
          expect.objectContaining({ message: "ERR_USER_ID_INVALID" }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("400 kiedy user ID nie jest dodatnią liczbą", async () => {
    req.body.editedRows = { 1: { ...baseRow, id: 0 } };
    await expect(runAll()).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        code: "ERR_VALIDATION",
        details: expect.arrayContaining([
          expect.objectContaining({ message: "ERR_USER_ID_INVALID" }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("400 kiedy nazwa użytkownika jest za krótka", async () => {
    req.body.editedRows = { 1: { ...baseRow, username: "abc" } };
    await expect(runAll()).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        code: "ERR_VALIDATION",
        details: expect.arrayContaining([
          expect.objectContaining({ message: "ERR_USERNAME_LENGTH" }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("400 kiedy nazwa użytkownika zawiera niedozwolone znaki", async () => {
    req.body.editedRows = { 1: { ...baseRow, username: "bad*name" } };
    await expect(runAll()).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        code: "ERR_VALIDATION",
        details: expect.arrayContaining([
          expect.objectContaining({ message: "ERR_USERNAME_INVALID_CHARS" }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("400 kiedy email jest niepoprawny", async () => {
    req.body.editedRows = { 1: { ...baseRow, email: "not-an-email" } };
    await expect(runAll()).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        code: "ERR_VALIDATION",
        details: expect.arrayContaining([
          expect.objectContaining({ message: "ERR_INVALID_EMAIL_FORMAT" }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("400 kiedy rola jest niepoprawna", async () => {
    req.body.editedRows = { 1: { ...baseRow, role: "superuser" } };
    await expect(runAll()).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        code: "ERR_VALIDATION",
        details: expect.arrayContaining([
          expect.objectContaining({ message: "ERR_ROLE_INVALID" }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("400 kiedy ban jest nieobecny", async () => {
    const { ban, ...noBan } = baseRow;
    req.body.editedRows = { 1: noBan };
    await expect(runAll()).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        code: "ERR_VALIDATION",
        details: expect.arrayContaining([
          expect.objectContaining({ message: "ERR_BAN_REQUIRED" }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("400 kiedy ban nie jest booleanem", async () => {
    req.body.editedRows = { 1: { ...baseRow, ban: "yes" } };
    await expect(runAll()).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        code: "ERR_VALIDATION",
        details: expect.arrayContaining([
          expect.objectContaining({ message: "ERR_BAN_INVALID" }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("400 kiedy podane hasło jest za krótkie", async () => {
    req.body.editedRows = { 1: { ...baseRow, password: "Short1!" } };
    await expect(runAll()).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        code: "ERR_VALIDATION",
        details: expect.arrayContaining([
          expect.objectContaining({ message: "ERR_PASSWORD_LENGTH" }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("400 kiedy hasło nie ma wielkiej litery", async () => {
    req.body.editedRows = { 1: { ...baseRow, password: "lowercase1!" } };
    await expect(runAll()).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        code: "ERR_VALIDATION",
        details: expect.arrayContaining([
          expect.objectContaining({ message: "ERR_PASSWORD_UPPERCASE" }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("wywołuje next() gdy wszystkie pola są poprawne", async () => {
    req.body.editedRows = {
      1: {
        id: 2,
        username: "good_user",
        email: "good@example.com",
        role: "admin",
        ban: true,
        password: "ValidPass1!",
      },
    };
    await runAll();
    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});