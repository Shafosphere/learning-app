// tests/userRoutes.test.js
import express from "express";
import request from "supertest";

// 1) Mockujemy kontrolery tak, by zwracały 200 OK
jest.mock("../controllers/userControllers.js", () => ({
  getUsersList: jest.fn((req, res) => res.sendStatus(200)),
  updateUsers: jest.fn((req, res) => res.sendStatus(200)),
  searchUsers: jest.fn((req, res) => res.sendStatus(200)),
  learnWord: jest.fn((req, res) => res.sendStatus(200)),
  deleteUser: jest.fn((req, res) => res.sendStatus(200)),
  autoSave: jest.fn((req, res) => res.sendStatus(200)),
  autoLoad: jest.fn((req, res) => res.sendStatus(200)),
  autoDelete: jest.fn((req, res) => res.sendStatus(200)),
  getRankingFlashcard: jest.fn((req, res) => res.sendStatus(200)),
  getArena: jest.fn((req, res) => res.sendStatus(200)),
}));

// 2) Mockujemy middleware, żeby od razu przechodziły dalej
jest.mock("../middleware/validators/admin_and_token/authenticateToken.js", () =>
  jest.fn((req, res, next) => next())
);
jest.mock("../middleware/validators/admin_and_token/authorizeAdmin.js", () =>
  jest.fn((req, res, next) => next())
);
jest.mock("../middleware/validators/users/patch-updateuser-vali.js", () => ({
  updateUsersValidator: jest.fn((req, res, next) => next()),
}));
jest.mock("../middleware/validators/users/post-learnword-vali.js", () => ({
  learnWordValidator: jest.fn((req, res, next) => next()),
}));
jest.mock("../middleware/validators/users/delete-deleteuser-vali.js", () => ({
  deleteUserValidator: jest.fn((req, res, next) => next()),
}));
jest.mock("../middleware/validators/users/post-autosave-vali.js", () => ({
  autoSaveValidator: jest.fn((req, res, next) => next()),
}));

// 3) Importujemy router
import userRoutes from "../routes/userRoutes.js";
import * as controllers from "../controllers/userControllers.js";

describe("userRoutes", () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/user", userRoutes);
  });

  it("GET /user/list → getUsersList", async () => {
    await request(app).get("/user/list").expect(200);
    expect(controllers.getUsersList).toHaveBeenCalled();
  });

  it("PATCH /user/update → updateUsers", async () => {
    await request(app).patch("/user/update").send({}).expect(200);
    expect(controllers.updateUsers).toHaveBeenCalled();
  });

  it("GET /user/search → searchUsers", async () => {
    await request(app).get("/user/search").expect(200);
    expect(controllers.searchUsers).toHaveBeenCalled();
  });

  it("POST /user/learn-word → learnWord", async () => {
    await request(app).post("/user/learn-word").send({}).expect(200);
    expect(controllers.learnWord).toHaveBeenCalled();
  });

  it("DELETE /user/delete/:id → deleteUser", async () => {
    await request(app).delete("/user/delete/123").expect(200);
    expect(controllers.deleteUser).toHaveBeenCalled();
  });

  it("POST /user/auto-save → autoSave", async () => {
    await request(app).post("/user/auto-save").send({}).expect(200);
    expect(controllers.autoSave).toHaveBeenCalled();
  });

  it("POST /user/auto-load → autoLoad", async () => {
    await request(app).post("/user/auto-load").send({}).expect(200);
    expect(controllers.autoLoad).toHaveBeenCalled();
  });

  it("POST /user/auto-delete → autoDelete", async () => {
    await request(app).post("/user/auto-delete").send({}).expect(200);
    expect(controllers.autoDelete).toHaveBeenCalled();
  });

  it("GET /user/ranking-flashcard → getRankingFlashcard", async () => {
    await request(app).get("/user/ranking-flashcard").expect(200);
    expect(controllers.getRankingFlashcard).toHaveBeenCalled();
  });

  it("GET /user/ranking-arena → getArena", async () => {
    await request(app).get("/user/ranking-arena").expect(200);
    expect(controllers.getArena).toHaveBeenCalled();
  });
});
