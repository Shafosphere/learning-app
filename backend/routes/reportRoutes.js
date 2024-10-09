import express from "express";
import authenticateToken from "../middleware/authenticateToken";
import authorizeAdmin from "../middleware/authorizeAdmin";
import {
  getDetailReport,
  getDataReports,
  updateReportTranslations,
  deleteReportData,
  createReport,
} from "../controllers/reportController";

const router = express.Router();

router.post("/details", authenticateToken, authorizeAdmin, getDetailReport);

router.get("/data", authenticateToken, authorizeAdmin, getDataReports);

router.patch("/update", authenticateToken, authorizeAdmin, updateReportTranslations);

router.delete("/delete/:id", authenticateToken, authorizeAdmin, deleteReportData);

router.post("/add", authenticateToken, createReport);


export default router;