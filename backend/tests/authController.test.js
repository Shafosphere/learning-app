// tests/authController.test.js
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import VALIDATION_RULES from "../middleware/validators/validationConfig.js";
import * as model from "../models/userModel.js";
import * as emailService from "../emailService.js";
import { config } from "../config.js";
import {
  getRequirements,
  registerUser,
  adminWelcome,
  userWelcome,
  loginUser,
  logoutUser,
  userInformation,
  updateUserAccount,
  deleteUserAccount,
  sendUserResetLink,
  resetPassword,
} from "../controllers/authController.js";

jest.mock("express-validator", () => ({
  validationResult: jest.fn(),
}));
jest.mock("../models/userModel.js");
jest.mock("../emailService.js");
jest.mock("jsonwebtoken");
jest.mock("bcrypt");
jest.mock("../config.js", () => ({
  config: { tokenKey: "test-key" },
}));

describe("authController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
      user: {},
      cookies: {},
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe("getRequirements", () => {
    it("200 with validation rules", () => {
      getRequirements(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        validationRules: VALIDATION_RULES,
      });
    });
  });

  describe("registerUser", () => {
    it("400 on validation errors", async () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => ["err"],
      });
      await registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ errors: ["err"] });
    });

    it("201 on success", async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      req.body = { username: "u", email: "e", password: "p" };
      bcrypt.hash.mockResolvedValue("hashed");
      model.createUser.mockResolvedValue(123);
      model.userRankingUpdate.mockResolvedValue();
      model.incrementUserActivity.mockResolvedValue();

      await registerUser(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith("p", 10);
      expect(model.createUser).toHaveBeenCalledWith("u", "e", "hashed");
      expect(model.userRankingUpdate).toHaveBeenCalledWith(123, "u");
      expect(model.incrementUserActivity).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, userId: 123 });
    });

    it("409 on duplicate", async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      model.createUser.mockRejectedValue({ code: "23505" });
      await registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Username or email already exists.",
      });
    });

    it("500 on other error", async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      model.createUser.mockRejectedValue(new Error("oops"));
      await registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "An error occurred during registration.",
      });
    });
  });

  describe("adminWelcome / userWelcome", () => {
    it("adminWelcome always OK", () => {
      adminWelcome(req, res);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Welcome admin!",
      });
    });

    it("userWelcome calculates expiresIn", () => {
      const now = Date.now();
      req.user = { id: 1, username: "u", expiresAt: now + 5000 };
      userWelcome(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        loggedIn: true,
        user: req.user,
        expiresIn: expect.closeTo(5000, 50),
      });
    });
  });

  describe("loginUser", () => {
    beforeEach(() => {
      req.body = { username: "u", password: "p" };
    });

    it("401 if no user", async () => {
      model.getUserByUsername.mockResolvedValue(null);
      await loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "ERR_INVALID_CREDENTIALS",
        code: "ERR_INVALID_CREDENTIALS",
      });
    });

    it("401 on bad password", async () => {
      model.getUserByUsername.mockResolvedValue({ id: 1, password: "h" });
      bcrypt.compare.mockResolvedValue(false);
      await loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "ERR_INVALID_CREDENTIALS",
        code: "ERR_INVALID_CREDENTIALS",
      });
    });

    it("200 on success", async () => {
      const user = { id: 1, username: "u", password: "h", role: "user" };
      model.getUserByUsername.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      model.updateLastLogin.mockResolvedValue();
      model.incrementUserActivity.mockResolvedValue();
      jwt.sign.mockReturnValue("tok");

      await loginUser(req, res);

      expect(model.updateLastLogin).toHaveBeenCalledWith(1);
      expect(model.incrementUserActivity).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1, username: "u", role: "user" },
        process.env.REACT_APP_TOKEN_KEY,
        { expiresIn: "1h" }
      );
      expect(res.cookie).toHaveBeenCalledWith(
        "token",
        "tok",
        expect.any(Object)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Login successful",
      });
    });

    it("500 on exception", async () => {
      model.getUserByUsername.mockRejectedValue(new Error("err"));
      await loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "An error occurred during login.",
      });
    });
  });

  describe("logoutUser", () => {
    it("clears cookie and returns success", () => {
      logoutUser(req, res);
      expect(res.clearCookie).toHaveBeenCalledWith("token", expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Logged out successfully",
        token: null,
      });
    });
  });

  describe("userInformation", () => {
    it("404 if not found", async () => {
      req.user.username = "u";
      model.getUserByUserName.mockResolvedValue(null);
      await userInformation(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found.",
      });
    });

    it("200 returns data", async () => {
      req.user.username = "u";
      model.getUserByUserName.mockResolvedValue({ email: "e", avatar: "a" });
      await userInformation(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Data received",
        username: "u",
        email: "e",
        avatar: "a",
      });
    });

    it("500 on exception", async () => {
      req.user.username = "u";
      model.getUserByUserName.mockRejectedValue(new Error("err"));
      await userInformation(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "An error occurred on the server.",
      });
    });
  });

  describe("updateUserAccount", () => {
    beforeEach(() => {
      req.user.id = 5;
      validationResult.mockReturnValue({ isEmpty: () => true });
    });

    it("400 on validation errors", async () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => ["err"],
      });
      await updateUserAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ errors: ["err"] });
    });

    it("404 if user missing", async () => {
      model.getUserById.mockResolvedValue(null);
      await updateUserAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("400 on wrong oldPass", async () => {
      model.getUserById.mockResolvedValue({ password: "h" });
      req.body.oldPass = "x";
      bcrypt.compare.mockResolvedValue(false);
      await updateUserAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Old password is incorrect.",
      });
    });

    it("200 with no token when no email/pass change", async () => {
      const user = { password: "h", username: "u", email: "e" };
      model.getUserById.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      model.updateUserById.mockResolvedValue();
      req.body = {}; // no email/oldPass/newPass
      await updateUserAccount(req, res);
      expect(model.updateUserById).toHaveBeenCalled();
      expect(res.cookie).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Account updated successfully!",
        token: null,
      });
    });

    it("200 with new token on email change", async () => {
      const user = { password: "h", username: "u", email: "e" };
      model.getUserById.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      model.updateUserById.mockResolvedValue();
      jwt.sign.mockReturnValue("newtok");
      req.body = { email: "new@mail" };
      await updateUserAccount(req, res);
      expect(res.cookie).toHaveBeenCalledWith(
        "token",
        "newtok",
        expect.any(Object)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Account updated successfully!",
        token: "newtok",
      });
    });

    it("500 on exception", async () => {
      model.getUserById.mockRejectedValue(new Error("err"));
      await updateUserAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "An error occurred while updating your account.",
      });
    });
  });

  describe("deleteUserAccount", () => {
    it("200 on success", async () => {
      req.user.id = 8;
      model.deleteUserByID.mockResolvedValue();
      await deleteUserAccount(req, res);
      expect(model.deleteUserByID).toHaveBeenCalledWith(8);
      expect(res.clearCookie).toHaveBeenCalledWith("token", expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Account deleted and logged out successfully.",
      });
    });

    it("500 on error", async () => {
      model.deleteUserByID.mockRejectedValue(new Error("err"));
      req.user.id = 8;
      await deleteUserAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to delete account.",
      });
    });
  });

  describe("sendUserResetLink", () => {
    it("200 even if no user", async () => {
      req.body = { email: "e", language: "pl" };
      model.getUserByEmail.mockResolvedValue([]);
      await sendUserResetLink(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "INFO_RESET_EMAIL_SENT",
      });
    });

    it("200 and sends email if user exists", async () => {
      req.body = { email: "e", language: "en" };
      const user = { id: 9, username: "u", role: "r" };
      model.getUserByEmail.mockResolvedValue([user]);
      jwt.sign.mockReturnValue("tk");
      emailService.generateResetPasswordEmail.mockReturnValue("<html>");
      emailService.sendEmail.mockResolvedValue();
      await sendUserResetLink(req, res);
      expect(jwt.sign).toHaveBeenCalled();
      expect(emailService.sendEmail).toHaveBeenCalledWith({
        to: "e",
        subject: "Password Reset",
        html: "<html>",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "INFO_RESET_EMAIL_SENT",
      });
    });

    it("500 on error", async () => {
      req.body = { email: "e" };
      model.getUserByEmail.mockRejectedValue(new Error("oops"));
      await sendUserResetLink(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "ERR_RESET_SENDING_FAIL",
        code: "ERR_RESET_SENDING_FAIL",
      });
    });
  });

  describe("resetPassword", () => {
    it("200 on valid token", async () => {
      req.body = { token: "t", password: "new" };
      jwt.verify.mockReturnValue({ id: 5 });
      bcrypt.hash.mockResolvedValue("hp");
      model.updateUserById.mockResolvedValue();
      await resetPassword(req, res);
      expect(bcrypt.hash).toHaveBeenCalledWith("new", 10);
      expect(model.updateUserById).toHaveBeenCalledWith(5, { password: "hp" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Hasło zostało zmienione.",
      });
    });

    it("400 on invalid token", async () => {
      req.body = { token: "t", password: "new" };
      jwt.verify.mockImplementation(() => {
        throw new Error("bad");
      });
      await resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Token wygasł lub jest nieprawidłowy.",
      });
    });
  });
});
