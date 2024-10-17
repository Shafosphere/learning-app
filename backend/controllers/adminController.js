import {
  fetchGlobalData,
  deleteOldPatches,
  generatePatchesBatch,
} from "../models/adminModel.js";

export const getGlobalData = async (req, res) => {
  try {
    const globalData = await fetchGlobalData();
    res.status(200).json(globalData);
  } catch (error) {
    console.error("Error fetching global data:", error);
    res.status(500).send("Server Error");
  }
};

export const generatePatches = async (req, res) => {
  try {
    console.log("Start generating patches");

    // Usuń stare patche przed generowaniem nowych
    await deleteOldPatches();

    // Generuj nowe patche
    await generatePatchesBatch(30); // Rozmiar patcha można modyfikować

    res.status(200).send("Patches have been generated successfully.");
  } catch (error) {
    console.error("Error while generating patches:", error);
    res.status(500).send("An error occurred while generating patches.");
  }
};