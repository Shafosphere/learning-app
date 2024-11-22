import express from "express";
import { validatePageName } from "../middleware/validatePageName.js";
import { countingEntries } from "../controllers/analyticsController.js"; // Poprawna ścieżka

const router = express.Router();

router.post("/visit", validatePageName, countingEntries);

export default router;