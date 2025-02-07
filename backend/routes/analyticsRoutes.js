import express from "express";
import { countingEntries } from "../controllers/analyticsController.js"; 
import { pageNameValidator } from "../middleware/validators/analytics/post-visit-vali.js";
const router = express.Router();

router.post("/visit", pageNameValidator, countingEntries);

export default router;