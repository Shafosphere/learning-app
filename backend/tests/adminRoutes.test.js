// tests/adminRoutes.test.js

import express from "express";
import request from "supertest";

// 1) Mockujemy wszystkie kontrolery
jest.mock("../src/controllers/adminController.js", () => ({
  getGlobalData: jest.fn((req, res) => res.sendStatus(200)),
  getVisitsData: jest.fn((req, res) => res.sendStatus(200)),
  getUserActivityData: jest.fn((req, res) => res.sendStatus(200)),
  generatePatches: jest.fn((req, res) => res.sendStatus(200)),
}));

// 2) Mockujemy middleware na proste next()
jest.mock("../src/middleware/validators/admin_token/authenticateToken.js", () =>
  jest.fn((req, res, next) => next())
);
jest.mock("../src/middleware/validators/admin_token/authorizeAdmin.js", () =>
  jest.fn((req, res, next) => next())
);
jest.mock("../src/middleware/verifyPin.js", () =>
  jest.fn((req, res, next) => next())
);

// 3) Importujemy router po mockowaniu wszystkiego
import adminRoutes from "../src/routes/adminRoutes.js";
import * as controllers from "../src/controllers/adminController.js";

describe("adminRoutes", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/admin", adminRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET   /admin/global-data         → getGlobalData", async () => {
    await request(app).get("/admin/global-data").expect(200);
    expect(controllers.getGlobalData).toHaveBeenCalled();
  });

  it("GET   /admin/visits-data         → getVisitsData", async () => {
    await request(app).get("/admin/visits-data").expect(200);
    expect(controllers.getVisitsData).toHaveBeenCalled();
  });

  it("GET   /admin/user-activity-data  → getUserActivityData", async () => {
    await request(app).get("/admin/user-activity-data").expect(200);
    expect(controllers.getUserActivityData).toHaveBeenCalled();
  });

  it("POST  /admin/generatepatch       → generatePatches", async () => {
    await request(app)
      .post("/admin/generatepatch")
      .send({ pin: "1234" })
      .expect(200);
    expect(controllers.generatePatches).toHaveBeenCalled();
  });
});
