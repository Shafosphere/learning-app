import { fetchGlobalData, deleteOldPatches, getAvailableWordIds, generatePatchesBatch } from "../models/adminModel.js";

export const getGlobalData = async (req, res) => {
  try {
    const globalData = await fetchGlobalData();
    res.status(200).json(globalData);
  } catch (error) {
    console.error("Error fetching global data:", error);
    res.status(500).send("Server Error");
  }
};
