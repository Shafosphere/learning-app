// tests/getUserInformationValidator.test.js

// Mock the userModel before importing the validator
jest.mock("../models/userModel.js", () => ({
  getUserByUserName: jest.fn(),
}));

import { getUserByUserName } from "../src/repositories/userModel.js";
import { getUserInformationValidator } from "../src/middleware/validators/auth/post-information-vali.js";
describe("getUserInformationValidator middleware", () => {
  let req, res, next;
  const [validator] = getUserInformationValidator;

  beforeEach(() => {
    req = { user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("returns 400 if username is missing", async () => {
    // req.user.username undefined
    await validator(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Username is required.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 404 if user not found", async () => {
    req.user.username = "nonexistent";
    getUserByUserName.mockResolvedValue(null);

    await validator(req, res, next);

    expect(getUserByUserName).toHaveBeenCalledWith("nonexistent");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches userData and calls next() when user exists", async () => {
    req.user.username = "existingUser";
    const mockUser = { id: 1, username: "existingUser", email: "e@e.com" };
    getUserByUserName.mockResolvedValue(mockUser);

    await validator(req, res, next);

    expect(getUserByUserName).toHaveBeenCalledWith("existingUser");
    expect(req.userData).toBe(mockUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 500 if getUserByUserName throws an error", async () => {
    req.user.username = "errorUser";
    const error = new Error("DB failure");
    getUserByUserName.mockRejectedValue(error);
    // Spy on console.error to suppress logs
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await validator(req, res, next);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error validating user:",
      error.message
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal Server Error.",
    });
    expect(next).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
