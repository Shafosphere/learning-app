// backend/tests/reportRoutes.test.js
import express from "express";
import request from "supertest";

// 1) Stubujemy wszystkie middleware, żeby zawsze wołały next()
jest.mock(
  "../middleware/validators/admin_and_token/authenticateToken.js",
  () => ({
    __esModule: true,
    default: (req, res, next) => next(),
  })
);
jest.mock("../middleware/validators/admin_and_token/authorizeAdmin.js", () => ({
  __esModule: true,
  default: (req, res, next) => next(),
}));
jest.mock("../middleware/validators/report/post-addreport-vali.js", () => ({
  __esModule: true,
  default: (req, res, next) => next(),
}));
jest.mock(
  "../middleware/validators/report/delete-deletereport-vali.js",
  () => ({
    __esModule: true,
    deleteReportValidator: (req, res, next) => next(),
  })
);
jest.mock(
  "../middleware/validators/report/patch-updatereporttrans-vali.js",
  () => ({
    __esModule: true,
    updateReportValidator: (req, res, next) => next(),
  })
);
jest.mock("../middleware/validators/report/post-getdetail-vali.js", () => ({
  __esModule: true,
  getDetailReportValidator: (req, res, next) => next(),
}));

// 2) Mockujemy kontrolery, żeby nie wymagały bazy ani logiki biznesowej
jest.mock("../controllers/reportController.js", () => ({
  __esModule: true,
  getDetailReport: (req, res) => {
    return res.json({ ok: true, id: req.body.id });
  },
  getDataReports: (req, res) => {
    return res.json([{ id: 1, type: "X" }]);
  },
  updateReportTranslations: (req, res) => {
    return res.json({ updated: true, payload: req.body });
  },
  deleteReportData: (req, res) => {
    return res.status(204).end();
  },
  createReport: (req, res) => {
    return res.status(201).json({ created: true, body: req.body });
  },
}));

// Importujemy router
import reportRoutes from "../routes/reportRoutes.js";

describe("reportRoutes", () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/report", reportRoutes);
  });

  it("POST /report/details → getDetailReport", async () => {
    const res = await request(app).post("/report/details").send({ id: 42 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true, id: 42 });
  });

  it("GET /report/data → getDataReports", async () => {
    const res = await request(app).get("/report/data");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ id: 1, type: "X" }]);
  });

  it("PATCH /report/update → updateReportTranslations", async () => {
    const payload = { foo: "bar" };
    const res = await request(app).patch("/report/update").send(payload);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ updated: true, payload });
  });

  it("DELETE /report/delete/:id → deleteReportData", async () => {
    const res = await request(app).delete("/report/delete/77");
    expect(res.statusCode).toBe(204);
    expect(res.text).toBe("");
  });

  it("POST /report/add → createReport", async () => {
    const body = { why: "test" };
    const res = await request(app).post("/report/add").send(body);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ created: true, body });
  });
});
