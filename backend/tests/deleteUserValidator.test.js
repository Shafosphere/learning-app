// tests/deleteUserValidator.test.js

jest.mock("../src/repositories/user.repo.js", () => ({
  getUserById: jest.fn(),
}));
import { getUserById } from "../src/repositories/user.repo.js";
import { deleteUserValidator } from "../src/middleware/validators/users/delete-deleteuser-vali.js";

describe("deleteUserValidator", () => {
  let req, res, next;
  const [idValidator, customValidator, errorHandler] = deleteUserValidator;

  beforeEach(() => {
    req = { params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  async function runValidation() {
    await idValidator.run(req);
    await customValidator.run(req);
    errorHandler(req, res, next);
  }

  it("returns 400 when id is missing", async () => {
    await runValidation();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: "User ID is required." }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 when id is not an integer", async () => {
    req.params.id = "abc";
    await runValidation();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            msg: "User ID must be a positive integer less than 1,000,000.",
          }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 when id ≤ 0 or ≥ 1,000,000", async () => {
    req.params.id = "0";
    await runValidation();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();

    jest.clearAllMocks();
    req.params.id = "1000000";
    await runValidation();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 when user not found", async () => {
    req.params.id = "123";
    getUserById.mockResolvedValue(null);

    await runValidation();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: "User not found." }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() when id is valid and user exists", async () => {
    req.params.id = "456";
    getUserById.mockResolvedValue({ id: 456, name: "Alice" });

    await runValidation();
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
