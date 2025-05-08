// tests/wordRoutes.test.js
import express from "express";
import request from "supertest";

// 1) Mockujemy kontrolery, żeby zwracały 200 OK
jest.mock("../src/controllers/wordController.js", () => ({
  __esModule: true,
  getWordData: jest.fn((req, res) => res.sendStatus(200)),
  getWordsByPatchAndLevel: jest.fn((req, res) => res.sendStatus(200)),
  getPatchesInfo: jest.fn((req, res) => res.sendStatus(200)),
  getRankingWord: jest.fn((req, res) => res.sendStatus(200)),
  getRandomWords: jest.fn((req, res) => res.sendStatus(200)),
  getRankingHistory: jest.fn((req, res) => res.sendStatus(200)),
  submitAnswer: jest.fn((req, res) => res.sendStatus(200)),
  getWordsList: jest.fn((req, res) => res.sendStatus(200)),
  getWordDetail: jest.fn((req, res) => res.sendStatus(200)),
  updateWordTranslations: jest.fn((req, res) => res.sendStatus(200)),
  searchWords: jest.fn((req, res) => res.sendStatus(200)),
  addWord: jest.fn((req, res) => res.sendStatus(200)),
  deleteWord: jest.fn((req, res) => res.sendStatus(200)),
}));

// 2) Mockujemy middleware, żeby od razu przechodziły dalej
jest.mock("../src/middleware/validators/admin_token/authenticateToken.js", () =>
  jest.fn((req, res, next) => next())
);
jest.mock("../src/middleware/validators/admin_token/authorizeAdmin.js", () =>
  jest.fn((req, res, next) => next())
);
jest.mock("../src/middleware/validators/word/post-data-vali.js", () =>
  jest.fn((req, res, next) => next())
);
jest.mock("../src/middleware/validators/word/post-patchdata-vali.js", () =>
  jest.fn((req, res, next) => next())
);
jest.mock("../src/middleware/validators/word/get-list-vali.js", () =>
  jest.fn((req, res, next) => next())
);
jest.mock("../src/middleware/validators/word/post-addword-vali.js", () => ({
  addWordValidator: jest.fn((req, res, next) => next()),
}));
jest.mock(
  "../src/middleware/validators/word/delete-deleteword-vali.js",
  () => ({ deleteWordValidator: jest.fn((req, res, next) => next()) })
);
jest.mock(
  "../src/middleware/validators/word/patch-updatetranslation-vali.js",
  () => ({ updateTranslationsValidator: jest.fn((req, res, next) => next()) })
);
jest.mock(
  "../src/middleware/validators/word/post-getworddetail-vali.js",
  () => ({ getWordDetailValidator: jest.fn((req, res, next) => next()) })
);

// 3) Import router i kontrolery
import wordRoutes from "../src/routes/wordRoutes.js";
import * as controllers from "../src/controllers/wordController.js";

describe("wordRoutes", () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/word", wordRoutes);
  });

  it("POST /word/data → getWordData", async () => {
    await request(app).post("/word/data").send({}).expect(200);
    expect(controllers.getWordData).toHaveBeenCalled();
  });

  it("POST /word/patch-data → getWordsByPatchAndLevel", async () => {
    await request(app).post("/word/patch-data").send({}).expect(200);
    expect(controllers.getWordsByPatchAndLevel).toHaveBeenCalled();
  });

  it("GET /word/patch-info → getPatchesInfo", async () => {
    await request(app).get("/word/patch-info").expect(200);
    expect(controllers.getPatchesInfo).toHaveBeenCalled();
  });

  it("GET /word/ranking-word → getRankingWord", async () => {
    await request(app).get("/word/ranking-word").expect(200);
    expect(controllers.getRankingWord).toHaveBeenCalled();
  });

  it("GET /word/random-words → getRandomWords", async () => {
    await request(app).get("/word/random-words").expect(200);
    expect(controllers.getRandomWords).toHaveBeenCalled();
  });

  it("GET /word/history → getRankingHistory", async () => {
    await request(app).get("/word/history").expect(200);
    expect(controllers.getRankingHistory).toHaveBeenCalled();
  });

  it("POST /word/submit-answer → submitAnswer", async () => {
    await request(app).post("/word/submit-answer").send({}).expect(200);
    expect(controllers.submitAnswer).toHaveBeenCalled();
  });

  it("GET /word/list → getWordsList", async () => {
    await request(app).get("/word/list").expect(200);
    expect(controllers.getWordsList).toHaveBeenCalled();
  });

  it("POST /word/detail → getWordDetail", async () => {
    await request(app).post("/word/detail").send({}).expect(200);
    expect(controllers.getWordDetail).toHaveBeenCalled();
  });

  it("PATCH /word/update-translations → updateWordTranslations", async () => {
    await request(app).patch("/word/update-translations").send({}).expect(200);
    expect(controllers.updateWordTranslations).toHaveBeenCalled();
  });

  it("GET /word/search → searchWords", async () => {
    await request(app).get("/word/search").expect(200);
    expect(controllers.searchWords).toHaveBeenCalled();
  });

  it("POST /word/add → addWord", async () => {
    await request(app).post("/word/add").send({}).expect(200);
    expect(controllers.addWord).toHaveBeenCalled();
  });

  it("DELETE /word/delete/:id → deleteWord", async () => {
    await request(app).delete("/word/delete/123").expect(200);
    expect(controllers.deleteWord).toHaveBeenCalled();
  });
});
