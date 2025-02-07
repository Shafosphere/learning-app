import sanitizeInput from "../sanitize-html.js";

const authorizeAddReport = (req, res, next) => {
  const { reportType, word, description, language } = req.body;

  // Walidacja reportType - musi być "other" lub "word_issue"
  if (reportType !== "other" && reportType !== "word_issue") {
    return res.status(400).json({
      success: false,
      message:
        "Invalid reportType. Allowed values are 'other' and 'word_issue'.",
    });
  }

  // Walidacja language - tylko "pl" lub "en"
  if (language !== "pl" && language !== "en") {
    return res.status(400).json({
      success: false,
      message: "Invalid language. Allowed values are 'pl' and 'en'.",
    });
  }

  // Dla reportType "other": description musi być podana i niepusta
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

  // Dla reportType "word_issue": word musi być podane i niepuste
  if (reportType === "word_issue") {
    if (!word || typeof word !== "string" || word.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Word is required for reportType 'word_issue'.",
      });
    }
  }

  // **Sanitizacja description**
  const sanitizedDescription = description ? sanitizeInput(description) : "";

  // Sprawdzamy, czy po sanitizacji coś zostało
  if (sanitizedDescription.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Description cannot be empty after sanitization.",
    });
  }

  next();
};

export default authorizeAddReport;