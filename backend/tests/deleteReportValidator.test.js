// tests/deleteReportValidator.test.js
jest.mock("../models/userModel.js", () => ({
  getReportById: jest.fn(),
}));
import { getReportById } from "../src/repositories/userModel.js";
import { deleteReportValidator } from "../src/middleware/validators/report/delete-deletereport-vali.js";
describe("deleteReportValidator", () => {
  let req, res, next;
  const [idValidator, customValidator, errorHandler] = deleteReportValidator;

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
          expect.objectContaining({ msg: "Report ID is required." }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 when id is not a positive integer", async () => {
    req.params.id = "foo";
    await runValidation();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            msg: "Report ID must be a positive integer.",
          }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 when id ≤ 0", async () => {
    req.params.id = "0";
    await runValidation();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 when report not found", async () => {
    req.params.id = "123";
    getReportById.mockResolvedValue(null);
    await runValidation();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: "Report not found." }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() when id is valid and report exists", async () => {
    req.params.id = "456";
    getReportById.mockResolvedValue({ id: 456, title: "Annual Report" });
    await runValidation();
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
