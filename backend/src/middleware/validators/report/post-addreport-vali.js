import { sanitizeInput } from "../../sanitize-html.js";

const authorizeAddReport = (req, res, next) => {
  const { reportType, word, description } = req.body;

  // **1. Walidacja reportType**
  if (reportType !== "other" && reportType !== "word_issue") {
    return res.status(400).json({
      success: false,
      message:
        "Invalid reportType. Allowed values are 'other' and 'word_issue'.",
    });
  }

  if (reportType === "other") {
    if (
      !description ||
      typeof description !== "string" ||
      description.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Description is required for reportType 'other'.",
      });
    }
  }

  // **4. Walidacja word dla reportType "word_issue"**
  if (reportType === "word_issue") {
    if (!word || typeof word !== "string" || word.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Word is required for reportType 'word_issue'.",
      });
    }
  }

  // **5. Sanitizacja description (jeśli istnieje)**
  if (description) {
    const sanitizedDescription = sanitizeInput(description);

    if (!sanitizedDescription) {
      return res.status(400).json({
        success: false,
        message: "Description cannot be empty after sanitization.",
      });
    }

    req.body.description = sanitizedDescription; // Nadpisujemy oczyszczony opis
  }

  next();
};

export default authorizeAddReport;
