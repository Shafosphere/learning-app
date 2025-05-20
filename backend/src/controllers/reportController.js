
// Raporty
import ApiError from "../errors/ApiError.js";

import {
  getReportById,
  getReports,
  insertReport,
  updateReport,
  deleteReport,
} from "../repositories/report.repo.js";

// Tłumaczenia słów
import {
  getWordTranslations,
  getWordByTranslation,
} from "../repositories/translation.repo.js";

export const getDetailReport = async (req, res) => {
  const { id } = req.body;
  const report = await getReportById(id);

  if (!report) {
    // jeśli nie ma reportu → 404
    throw new ApiError(404, "ERR_REPORT_NOT_FOUND", "Report not found");
  }

  const response_data = { ...report };

  if (report.report_type === "word_issue" && report.word_id) {
    try {
      response_data.translations = await getWordTranslations(report.word_id);
    } catch (err) {
      // specyficzny błąd podczas fetchowania tłumaczeń
      throw new ApiError(
        500,
        "ERR_FETCH_TRANSLATIONS",
        "Error fetching translations"
      );
    }
  }

  res.json(response_data);
};

export const getDataReports = async (req, res) => {
  const data = await getReports();
  res.json(data);
};

export const updateReportTranslations = async (req, res) => {
  const { report } = req.body;
  if (!Array.isArray(report.translations)) {
    throw new ApiError(
      400,
      "ERR_INVALID_INPUT",
      "translations must be an array"
    );
  }
  const promises = report.translations.map(t => updateReport(t));
  await Promise.all(promises);
  res.json({
    success: true,
    message: "Translations updated successfully.",
  });
};

export const deleteReportData = async (req, res) => {
  const { id } = req.params;
  await deleteReport(id);
  res.json({ success: true, message: "Report has been deleted." });
};

export const createReport = async (req, res) => {
  const { reportType, word, description } = req.body;
  const userId = req.user.id;

  let wordId = null;
  if (reportType === "word_issue") {
    const wordResult = await getWordByTranslation(word);
    if (!wordResult) {
      throw new ApiError(404, "ERR_WORD_NOT_FOUND", "Word not found");
    }
    wordId = wordResult.word_id;
  }

  const reportId = await insertReport(
    userId,
    reportType,
    wordId,
    description
  );

  res.status(201).json({
    success: true,
    message: "Report received",
    reportId,
  });
};

