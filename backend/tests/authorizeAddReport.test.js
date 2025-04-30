// tests/authorizeAddReport.test.js

// Mock sanitizeInput before importing the middleware
jest.mock("../middleware/validators/sanitize-html.js", () => ({
    sanitizeInput: jest.fn(),
  }));
  import authorizeAddReport from "../src/middleware/validators/report/post-addreport-vali.js";
  import { sanitizeInput } from "../src/middleware/sanitize-html.js";
  
  describe("authorizeAddReport middleware", () => {
    let req, res, next;
  
    beforeEach(() => {
      req = { body: {} };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      next = jest.fn();
      sanitizeInput.mockReset();
    });
  
    it("400 if reportType is invalid", () => {
      req.body = { reportType: "foo", word: "hello", description: "desc" };
      authorizeAddReport(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid reportType. Allowed values are 'other' and 'word_issue'.",
      });
      expect(next).not.toHaveBeenCalled();
    });
  
    it("400 if reportType 'other' and description missing or empty", () => {
      req.body = { reportType: "other" };
      authorizeAddReport(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Description is required for reportType 'other'.",
      });
      expect(next).not.toHaveBeenCalled();
  
      jest.clearAllMocks();
      req.body.description = "   ";
      authorizeAddReport(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Description is required for reportType 'other'.",
      });
      expect(next).not.toHaveBeenCalled();
    });
  
    it("400 if reportType 'other' and sanitization yields empty", () => {
      req.body = {
        reportType: "other",
        description: "<script></script>",
      };
      sanitizeInput.mockReturnValue("");
      authorizeAddReport(req, res, next);
  
      expect(sanitizeInput).toHaveBeenCalledWith("<script></script>");
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Description cannot be empty after sanitization.",
      });
      expect(next).not.toHaveBeenCalled();
    });
  
    it("calls next() and sanitizes description for reportType 'other'", () => {
      req.body = {
        reportType: "other",
        description: " <b>OK</b> ",
      };
      sanitizeInput.mockReturnValue("OK");
      authorizeAddReport(req, res, next);
  
      expect(sanitizeInput).toHaveBeenCalledWith(" <b>OK</b> ");
      expect(req.body.description).toBe("OK");
      expect(next).toHaveBeenCalled();
    });
  
    it("400 if reportType 'word_issue' and word missing or empty", () => {
      req.body = { reportType: "word_issue" };
      authorizeAddReport(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Word is required for reportType 'word_issue'.",
      });
      expect(next).not.toHaveBeenCalled();
  
      jest.clearAllMocks();
      req.body.word = "   ";
      authorizeAddReport(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Word is required for reportType 'word_issue'.",
      });
      expect(next).not.toHaveBeenCalled();
    });
  
    it("calls next() when reportType 'word_issue' and word provided", () => {
      req.body = { reportType: "word_issue", word: "testWord" };
      authorizeAddReport(req, res, next);
  
      expect(next).toHaveBeenCalled();
    });
  
    it("for 'word_issue', sanitizes description if present", () => {
      req.body = {
        reportType: "word_issue",
        word: "foo",
        description: " <i>desc</i> ",
      };
      sanitizeInput.mockReturnValue("desc");
      authorizeAddReport(req, res, next);
  
      expect(sanitizeInput).toHaveBeenCalledWith(" <i>desc</i> ");
      expect(req.body.description).toBe("desc");
      expect(next).toHaveBeenCalled();
    });
  
    it("400 for 'word_issue' if description sanitizes to empty", () => {
      req.body = {
        reportType: "word_issue",
        word: "foo",
        description: "<invalid>",
      };
      sanitizeInput.mockReturnValue("");
      authorizeAddReport(req, res, next);
  
      expect(sanitizeInput).toHaveBeenCalledWith("<invalid>");
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Description cannot be empty after sanitization.",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
  