// tests/updateUsersValidator.test.js
// import VALIDATOR_RULES from "../middleware/validators/validationConfig.js";
// 1. Mockujemy validationConfig.js z katalogu głównego
jest.mock("../middleware/validators/validationConfig.js", () => ({
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


import { updateUsersValidator } from "../middleware/validators/users/patch-updateuser-vali";

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

  // uruchamia każdy validator, a na końcu errorHandler
  async function runAll() {
    for (const v of runValidators) {
      await v.run(req);
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
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: "editedRows is required." }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 kiedy editedRows jest pustym obiektem", async () => {
    req.body.editedRows = {};
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: "editedRows cannot be empty." }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 kiedy user ID jest brakujące", async () => {
    req.body.editedRows = { 1: { ...baseRow, id: undefined } };
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: "User ID is required." }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 kiedy user ID nie jest dodatnią liczbą", async () => {
    req.body.editedRows = { 1: { ...baseRow, id: 0 } };
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            msg: "User ID must be a positive integer.",
          }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 kiedy nazwa użytkownika jest za krótka", async () => {
    req.body.editedRows = { 1: { ...baseRow, username: "abc" } };
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            msg: `Username must be between 4 and 20 characters.`,
          }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 kiedy nazwa użytkownika zawiera niedozwolone znaki", async () => {
    req.body.editedRows = { 1: { ...baseRow, username: "bad*name" } };
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            msg: "Username can only contain letters, numbers, and underscores.",
          }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 kiedy email jest niepoprawny", async () => {
    req.body.editedRows = { 1: { ...baseRow, email: "not-an-email" } };
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: "Invalid email format." }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 kiedy rola jest niepoprawna", async () => {
    req.body.editedRows = { 1: { ...baseRow, role: "superuser" } };
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            msg: "Role must be 'admin', 'user' or 'moderator'.",
          }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 kiedy ban jest nieobecny", async () => {
    const { ban, ...noBan } = baseRow;
    req.body.editedRows = { 1: noBan };
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: "Ban status is required." }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 kiedy ban nie jest booleanem", async () => {
    req.body.editedRows = { 1: { ...baseRow, ban: "yes" } };
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: "Ban must be true or false." }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 kiedy podane hasło jest za krótkie", async () => {
    req.body.editedRows = { 1: { ...baseRow, password: "Short1!" } };
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            msg: `Password must be between 8 and 50 characters.`,
          }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 kiedy hasło nie ma wielkiej litery", async () => {
    req.body.editedRows = { 1: { ...baseRow, password: "lowercase1!" } };
    await runAll();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            msg: "Password must contain at least one uppercase letter.",
          }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
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
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
