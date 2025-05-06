// import { increasingEntrances } from "../repositories/userModel.js";
import { increasingEntrances } from "../repositories/stats.repo.js";

export const countingEntries = async (req, res) => {
  try {
    const { page_name } = req.body;
    const today = new Date().toISOString().slice(0, 10); // Format YYYY-MM-DD

    await increasingEntrances({ page_name, today });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Błąd podczas aktualizacji statystyk wizyt:", error);
    res.status(500).send("Błąd podczas aktualizacji statystyk wizyt");
  }
};
