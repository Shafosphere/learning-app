import express from "express";
import catchAsync from "../errors/catchAsync.js";
import { countingEntries } from "../controllers/analyticsController.js";
import { pageNameValidator } from "../middleware/validators/analytics/post-visit-vali.js";
const router = express.Router();

router.post("/visit", pageNameValidator, catchAsync(countingEntries));

export default router;
