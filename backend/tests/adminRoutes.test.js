// tests/adminRoutes.test.js
import express from "express";
import request from "supertest";

// 1) Mockujemy wszystkie kontrolery
jest.mock(
  "../controllers/adminController.js",
  () => ({
    getGlobalData: jest.fn((req, res) => res.sendStatus(200)),
    getVisitsData: jest.fn((req, res) => res.sendStatus(200)),
    getUserActivityData: jest.fn((req, res) => res.sendStatus(200)),
    generatePatches: jest.fn((req, res) => res.sendStatus(200)),
  })
);

// 2) Mockujemy middleware na proste next()
jest.mock(
  "../middleware/validators/admin_and_token/authenticateToken.js",
  () => jest.fn((req, res, next) => next())
);
jest.mock(
  "../middleware/validators/admin_and_token/authorizeAdmin.js",
  () => jest.fn((req, res, next) => next())
);
jest.mock(
  "../middleware/verifyPin.js",
  () => jest.fn((req, res, next) => next())
);

// 3) Importujemy router po mockowaniu wszystkiego
import adminRoutes from "../routes/adminRoutes.js";
import * as controllers from "../controllers/adminController.js";

describe("adminRoutes", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    // montujemy router pod /admin
    app.use("/admin", adminRoutes);
  });

  beforeEach(() => {
    // czyścimy historię wywołań mocków
    jest.clearAllMocks();
  });

  it("GET   /admin/global-data       → getGlobalData", async () => {
    await request(app).get("/admin/global-data").expect(200);
    expect(controllers.getGlobalData).toHaveBeenCalled();
  });

  it("GET   /admin/visits-data       → getVisitsData", async () => {
    await request(app).get("/admin/visits-data").expect(200);
    expect(controllers.getVisitsData).toHaveBeenCalled();
  });

  it("GET   /admin/user-activiti-data → getUserActivityData", async () => {
    await request(app).get("/admin/user-activiti-data").expect(200);
    expect(controllers.getUserActivityData).toHaveBeenCalled();
  });

  it("POST  /admin/generatepatch     → generatePatches", async () => {
    // wysyłamy przykładowe body, np. pin: 1234
    await request(app)
      .post("/admin/generatepatch")
      .send({ pin: "1234" })
      .expect(200);
    expect(controllers.generatePatches).toHaveBeenCalled();
  });
});
