import ApiError from "../../../errors/ApiError.js";
import { sanitizeInput } from "../../sanitize-html.js";
import { throwErr } from "../../../errors/throwErr.js";

const authorizeAddReport = (req, res, next) => {
  const { reportType, word, description } = req.body;

  // 1. Walidacja reportType
  if (reportType !== "other" && reportType !== "word_issue") {
    return next(throwErr("INVALID_REPORT_TYPE"));
  }

  // 2. Dla reportType === 'other' wymagany description
  if (reportType === "other") {
    if (
      !description ||
      typeof description !== "string" ||
      description.trim().length === 0
    ) {
      return next(throwErr("MISSING_DESCRIPTION"));
    }
  }

  // 3. Dla reportType === 'word_issue' wymagane word
  if (reportType === "word_issue") {
    if (!word || typeof word !== "string" || word.trim().length === 0) {
      return next(throwErr("MISSING_WORD"));
    }
  }

  // 4. Sanitizacja description, jeśli istnieje
  if (description) {
    const sanitizedDescription = sanitizeInput(description);
    if (!sanitizedDescription) {
      return next(throwErr("INVALID_DESCRIPTION"));
    }
    req.body.description = sanitizedDescription;
  }

  next();
};

export default authorizeAddReport;
