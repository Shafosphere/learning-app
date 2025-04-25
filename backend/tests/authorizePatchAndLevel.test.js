// tests/middleware/authorizePatchAndLevel.test.js
import authorizePatchAndLevel from "../middleware/validators/word/post-patchdata-vali";
describe("authorizePatchAndLevel middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  it("403, gdy brakuje level lub patchNumber", () => {
    // oba undefined
    authorizePatchAndLevel(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Access denied. Both patchNumber and level must be provided."
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("400, gdy patchNumber nie jest liczbą całkowitą >0", () => {
    req.body = { level: "B2", patchNumber: -5 };
    authorizePatchAndLevel(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid patchNumber. It must be a positive integer."
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("400, gdy level spoza B2/C1", () => {
    req.body = { level: "A1", patchNumber: 3 };
    authorizePatchAndLevel(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid level. Allowed values: B2 or C1."
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("przepuszcza dalej, gdy dane są OK", () => {
    req.body = { level: "C1", patchNumber: 42 };
    authorizePatchAndLevel(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
