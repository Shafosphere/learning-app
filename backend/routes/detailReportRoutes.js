import express from "express";
import { getDetailReport } from "../controllers/detailReportController";

const router = express.Router();

router.post('/report', getDetailReport);

export default router;