// tests/authorizeList.test.js
import authorizeList from "../src/middleware/validators/word/get-list-vali";

describe("authorizeList middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it("calls next() when no query params are provided (defaults apply)", () => {
    authorizeList(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("calls next() when valid page and limit are provided", () => {
    req.query = { page: "3", limit: "20" };
    authorizeList(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 400 when page is not a number", () => {
    req.query = { page: "foo", limit: "10" };
    authorizeList(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid page parameter. It must be a positive integer.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 when page is less than 1", () => {
    req.query = { page: "0", limit: "10" };
    authorizeList(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid page parameter. It must be a positive integer.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 when limit is not a number", () => {
    req.query = { page: "1", limit: "bar" };
    authorizeList(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid limit parameter. It must be a positive integer.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 when limit is less than 1", () => {
    req.query = { page: "1", limit: "0" };
    authorizeList(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid limit parameter. It must be a positive integer.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("parses numeric strings correctly and calls next()", () => {
    req.query = { page: "  7 ", limit: "  15  " };
    authorizeList(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
