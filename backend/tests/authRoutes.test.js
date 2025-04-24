// tests/authRoutes.test.js
import express from "express";
import request from "supertest";

// 1) Mockujemy wszystkie kontrolery tak, by zwracały 200 OK
jest.mock("../controllers/authController.js", () => ({
  registerUser: jest.fn((req, res) => res.sendStatus(200)),
  adminWelcome: jest.fn((req, res) => res.sendStatus(200)),
  userWelcome: jest.fn((req, res) => res.sendStatus(200)),
  loginUser: jest.fn((req, res) => res.sendStatus(200)),
  logoutUser: jest.fn((req, res) => res.sendStatus(200)),
  userInformation: jest.fn((req, res) => res.sendStatus(200)),
  updateUserAccount: jest.fn((req, res) => res.sendStatus(200)),
  deleteUserAccount: jest.fn((req, res) => res.sendStatus(200)),
  sendUserResetLink: jest.fn((req, res) => res.sendStatus(200)),
  resetPassword: jest.fn((req, res) => res.sendStatus(200)),
  getRequirements: jest.fn((req, res) => res.sendStatus(200)),
}));

// 2) Mockujemy middleware na proste next()
jest.mock("../middleware/validators/auth/post-registeruser-vali.js", () => ({
  registerValidator: jest.fn((req, res, next) => next()),
}));
jest.mock("../middleware/rateLimiter.js", () => ({
  loginRateLimiter: jest.fn((req, res, next) => next()),
}));
jest.mock("../middleware/validators/auth/post-loginUser-vali.js", () => ({
  loginValidator: jest.fn((req, res, next) => next()),
}));
jest.mock("../middleware/validators/admin_and_token/authenticateToken.js", () =>
  jest.fn((req, res, next) => next())
);
jest.mock("../middleware/validators/admin_and_token/authorizeAdmin.js", () =>
  jest.fn((req, res, next) => next())
);
jest.mock("../middleware/validators/auth/patch-userUpdate-vali.js", () => ({
  accountUpdateValidationRules: jest.fn((req, res, next) => next()),
}));
jest.mock("../middleware/validators/auth/delete-deleteuser-vali.js", () => ({
  deleteUserValidator: jest.fn((req, res, next) => next()),
}));
jest.mock("../middleware/validators/auth/post-information-vali.js", () => ({
  getUserInformationValidator: jest.fn((req, res, next) => next()),
}));
jest.mock("../middleware/validators/auth/post-resetLink-vali.js", () => ({
  resetPasswordLinkValidationRules: jest.fn((req, res, next) => next()),
}));
jest.mock("../middleware/validators/auth/post-resetPass-vali.js", () => ({
  resetPasswordValidationRules: jest.fn((req, res, next) => next()),
}));

// 3) Importujemy router po mockowaniu wszystkiego
import authRoutes from "../routes/authRoutes.js";
import * as controllers from "../controllers/authController.js";

describe("authRoutes", () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/auth", authRoutes);
  });

  beforeEach(() => {
    // Czyścimy wywołania wszystkich mocków
    jest.clearAllMocks();
  });

  it("POST /auth/register → registerUser", async () => {
    await request(app).post("/auth/register").send({}).expect(200);
    expect(controllers.registerUser).toHaveBeenCalled();
  });

  it("GET /auth/admin → adminWelcome", async () => {
    await request(app).get("/auth/admin").expect(200);
    expect(controllers.adminWelcome).toHaveBeenCalled();
  });

  it("GET /auth/user → userWelcome", async () => {
    await request(app).get("/auth/user").expect(200);
    expect(controllers.userWelcome).toHaveBeenCalled();
  });

  it("POST /auth/login → loginUser", async () => {
    await request(app).post("/auth/login").send({}).expect(200);
    expect(controllers.loginUser).toHaveBeenCalled();
  });

  it("POST /auth/logout → logoutUser", async () => {
    await request(app).post("/auth/logout").expect(200);
    expect(controllers.logoutUser).toHaveBeenCalled();
  });

  it("POST /auth/information → userInformation", async () => {
    await request(app).post("/auth/information").send({}).expect(200);
    expect(controllers.userInformation).toHaveBeenCalled();
  });

  it("GET /auth/requirements → getRequirements", async () => {
    await request(app).get("/auth/requirements").expect(200);
    expect(controllers.getRequirements).toHaveBeenCalled();
  });

  it("PATCH /auth/update → updateUserAccount", async () => {
    await request(app).patch("/auth/update").send({}).expect(200);
    expect(controllers.updateUserAccount).toHaveBeenCalled();
  });

  it("DELETE /auth/delete → deleteUserAccount", async () => {
    await request(app).delete("/auth/delete").expect(200);
    expect(controllers.deleteUserAccount).toHaveBeenCalled();
  });

  it("POST /auth/send-reset-link → sendUserResetLink", async () => {
    await request(app).post("/auth/send-reset-link").send({}).expect(200);
    expect(controllers.sendUserResetLink).toHaveBeenCalled();
  });

  it("POST /auth/reset-password → resetPassword", async () => {
    await request(app).post("/auth/reset-password").send({}).expect(200);
    expect(controllers.resetPassword).toHaveBeenCalled();
  });
});
