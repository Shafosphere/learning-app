// Obsługa raportów
import { getReportById, getReports } from "../models/userModel";

export const getDetailReport = async (req, res) => {
  try {
    const { id } = req.body;
    const report = await getReportById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.status(200).json(report);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export const getDataReports = async (req, res) => {
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

    // Używamy mapowania, aby utworzyć tablicę obietnic
    const updatePromises = translations.map((translation) =>
      updateReport(translation)
    );

    // Czekamy na wykonanie wszystkich aktualizacji równocześnie
    await Promise.all(updatePromises);

    res.status(200).send("Translations updated successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};