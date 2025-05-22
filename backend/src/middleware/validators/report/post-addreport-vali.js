import ApiError from "../../../errors/ApiError.js";
import { sanitizeInput } from "../../sanitize-html.js";

const authorizeAddReport = (req, res, next) => {
  const { reportType, word, description } = req.body;

  // 1. Walidacja reportType
  if (reportType !== "other" && reportType !== "word_issue") {
    return next(
      new ApiError(
        400,
        "ERR_INVALID_REPORT_TYPE",
        "Invalid reportType. Allowed values are 'other' and 'word_issue'."
      )
    );
  }

  // 2. Dla reportType === 'other' wymagany description
  if (reportType === "other") {
    if (
      !description ||
      typeof description !== "string" ||
      description.trim().length === 0
    ) {
      return next(
        new ApiError(
          400,
          "ERR_MISSING_DESCRIPTION",
          "Description is required for reportType 'other'."
        )
      );
    }
  }

  // 3. Dla reportType === 'word_issue' wymagane word
  if (reportType === "word_issue") {
    if (!word || typeof word !== "string" || word.trim().length === 0) {
      return next(
        new ApiError(
          400,
          "ERR_MISSING_WORD",
          "Word is required for reportType 'word_issue'."
        )
      );
    }
  }

  // 4. Sanitizacja description, jeśli istnieje
  if (description) {
    const sanitizedDescription = sanitizeInput(description);
    if (!sanitizedDescription) {
      return next(
        new ApiError(
          400,
          "ERR_INVALID_DESCRIPTION",
          "Description cannot be empty after sanitization."
        )
      );
    }
    req.body.description = sanitizedDescription;
  }

  next();
};

export default authorizeAddReport;
