// Obsługa raportów
import { getReportById, getReports, deleteReport, insertReport, getWordTranslations, getWordByTranslation, updateReport} from "../models/userModel.js";

export const getDetailReport = async (req, res) => {
  try {
    const { id } = req.body;
    const report = await getReportById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    let response_data = { ...report };

    if (report.report_type === "word_issue" && report.word_id) {
      try {
        const translation_data = await getWordTranslations(report.word_id)
        response_data.translations = translation_data;
      } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
      }
    }

    res.status(200).json(response_data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export const getDataReports = async (req, res) => {
  console.log('data reports')
  try {
    const data = await getReports();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export const updateReportTranslations = async (req, res) => {
  const { report } = req.body;
  try {
    const translations = report.translations;

    const updatePromises = translations.map((translation) =>
      updateReport(translation)
    );

    await Promise.all(updatePromises);

    res.status(200).send("Translations updated successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export const deleteReportData = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteReport(id);
    res.status(200).send("Report has been deleted.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export const createReport = async (req, res) => {
  const { reportType, word, description, language } = req.body;
  const userId = req.user.id;

  console.log(reportType, word, description, language, userId);

  try {
    let wordId = null;

    if (reportType === "word_issue") {
      // Szukanie słowa na podstawie tłumaczenia i języka
      const wordResult = await getWordByTranslation(language, word);
      
      if (!wordResult) {
        return res.status(404).json({
          success: false,
          message: "Word not found in the specified language.",
        });
      }

      wordId = wordResult.word_id;
    }

    // Dodanie raportu do bazy danych
    const reportId = await insertReport(userId, reportType, wordId, description);

    res.status(201).json({
      success: true,
      message: "Report received",
      reportId: reportId,
    });
  } catch (error) {
    console.error("Error while reporting:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your report.",
    });
  }
};
