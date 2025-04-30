// tests/authorizeData.test.js
import authorizeData from "../src/middleware/validators/word/post-data-vali";
describe("authorizeData middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it("403 if neither patchNumber nor wordList present", () => {
    authorizeData(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Access denied. Either patchNumber or wordList must be provided.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  describe("patchNumber validation", () => {
    it("400 if patchNumber is not an integer", () => {
      req.body.patchNumber = "foo";
      authorizeData(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid patchNumber. It must be a positive integer.",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("400 if patchNumber ≤ 0", () => {
      req.body.patchNumber = 0;
      authorizeData(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid patchNumber. It must be a positive integer.",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("400 if patchNumber ≥ 1 000 000", () => {
      req.body.patchNumber = 1_000_000;
      authorizeData(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid patchNumber. It must be a positive integer.",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("wordList validation", () => {
    it("400 if wordList is not an array", () => {
      req.body.wordList = "not-an-array";
      authorizeData(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid wordList. It must be a non-empty array.",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("400 if wordList is an empty array", () => {
      req.body.wordList = [];
      authorizeData(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid wordList. It must be a non-empty array.",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("allowed cases", () => {
    it("calls next() when only patchNumber is valid", () => {
      req.body.patchNumber = 42;
      authorizeData(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("calls next() when only wordList is valid", () => {
      req.body.wordList = [1, 2, 3];
      authorizeData(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("calls next() when both patchNumber and wordList are valid", () => {
      req.body = { patchNumber: 7, wordList: [4, 5] };
      authorizeData(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
