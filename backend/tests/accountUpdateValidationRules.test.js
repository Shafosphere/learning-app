// tests/accountUpdateValidationRules.test.js
import VALIDATION_RULES from "../middleware/validators/validationConfig.js";
import { accountUpdateValidationRules } from "../middleware/validators/auth/patch-userUpdate-vali.js";

describe("accountUpdateValidationRules", () => {
  let req, res, next;
  const validators = accountUpdateValidationRules;
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

  async function runAll() {
    for (const v of runValidators) {
      await v.run(req);
    }
    errorHandler(req, res, next);
  }

  it("passes when no fields are provided", async () => {
    await runAll();
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("400 when username too short", async () => {
    req.body.username = "aaa";
    await runAll();
    const errs = res.json.mock.calls[0][0].errors;
    expect(res.status).toHaveBeenCalledWith(400);
    expect(errs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: `Username must be between ${VALIDATION_RULES.USERNAME.MIN_LENGTH} and ${VALIDATION_RULES.USERNAME.MAX_LENGTH} characters.`,
          path: "username",
        }),
      ])
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 when username has invalid characters", async () => {
    req.body.username = "invalid*user";
    await runAll();
    const errs = res.json.mock.calls[0][0].errors;
    expect(res.status).toHaveBeenCalledWith(400);
    expect(errs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "Username can only contain letters, numbers, and underscores.",
          path: "username",
        }),
      ])
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 when email format is invalid", async () => {
    req.body.email = "not-an-email";
    await runAll();
    const errs = res.json.mock.calls[0][0].errors;
    expect(res.status).toHaveBeenCalledWith(400);
    expect(errs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "Invalid email format.",
          path: "email",
        }),
      ])
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 when email is too long", async () => {
    const longLocal = "a".repeat(260);
    req.body.email = `${longLocal}@mail.com`;
    await runAll();
    const errs = res.json.mock.calls[0][0].errors;
    expect(res.status).toHaveBeenCalledWith(400);
    expect(errs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: `Email cannot exceed ${VALIDATION_RULES.EMAIL.MAX_LENGTH} characters.`,
          path: "email",
        }),
      ])
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 when oldPass too short", async () => {
    req.body.oldPass = "short";
    await runAll();
    const errs = res.json.mock.calls[0][0].errors;
    expect(res.status).toHaveBeenCalledWith(400);
    expect(errs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: `Old password must be between ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} and ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} characters.`,
          path: "oldPass",
        }),
      ])
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 when newPass missing uppercase", async () => {
    req.body.newPass = "lowercase1!";
    await runAll();
    const errs = res.json.mock.calls[0][0].errors;
    expect(res.status).toHaveBeenCalledWith(400);
    expect(errs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "New password must contain at least one uppercase letter.",
          path: "newPass",
        }),
      ])
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 when newPass missing lowercase", async () => {
    req.body.newPass = "UPPERCASE1!";
    await runAll();
    const errs = res.json.mock.calls[0][0].errors;
    expect(res.status).toHaveBeenCalledWith(400);
    expect(errs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "New password must contain at least one lowercase letter.",
          path: "newPass",
        }),
      ])
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 when newPass missing digit", async () => {
    req.body.newPass = "NoDigits!";
    await runAll();
    const errs = res.json.mock.calls[0][0].errors;
    expect(res.status).toHaveBeenCalledWith(400);
    expect(errs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "New password must contain at least one digit.",
          path: "newPass",
        }),
      ])
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 when newPass missing special character", async () => {
    req.body.newPass = "NoSpecial1";
    await runAll();
    const errs = res.json.mock.calls[0][0].errors;
    expect(res.status).toHaveBeenCalledWith(400);
    expect(errs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "New password must contain at least one special character.",
          path: "newPass",
        }),
      ])
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 when confirmPass does not match newPass", async () => {
    req.body.newPass = "NewPass1!";
    req.body.confirmPass = "Different1!A";
    await runAll();
    const errs = res.json.mock.calls[0][0].errors;
    expect(res.status).toHaveBeenCalledWith(400);
    expect(errs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "Passwords do not match.",
          path: "confirmPass",
        }),
      ])
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 when avatar is out of range", async () => {
    req.body.avatar = 5;
    await runAll();
    const errs = res.json.mock.calls[0][0].errors;
    expect(res.status).toHaveBeenCalledWith(400);
    expect(errs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "Avatar must be a number between 1 and 4.",
          path: "avatar",
        }),
      ])
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("passes and normalizes/trims valid fields", async () => {
    req.body = {
      username: " validUser_1 ",
      email: "USER@Example.Com",
      oldPass: " ValidOld1! ",
      newPass: " NewPass1! ",
      confirmPass: " NewPass1! ",
      avatar: 3,
    };
    await runAll();
    expect(req.body.username).toBe("validUser_1");
    expect(req.body.email).toBe("user@example.com");
    expect(req.body.oldPass).toBe("ValidOld1!");
    expect(req.body.newPass).toBe("NewPass1!");
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
