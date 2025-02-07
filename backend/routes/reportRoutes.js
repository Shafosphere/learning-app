import express from "express";
import authenticateToken from "../middleware/validators/admin_and_token/authenticateToken.js";
import authorizeAdmin from "../middleware/validators/admin_and_token/authorizeAdmin.js";
import {
  getDetailReport,
  getDataReports,
  updateReportTranslations,
  deleteReportData,
  createReport,
} from "../controllers/reportController.js";
import authorizeAddReport from "../middleware/validators/report/post-addreport-vali.js";

const router = express.Router();

router.post("/details", authenticateToken, authorizeAdmin, getDetailReport);

router.post("/data", authenticateToken, authorizeAdmin, getDataReports);

router.patch(
  "/update",
  authenticateToken,
  authorizeAdmin,
  updateReportTranslations
);

router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeAdmin,
  deleteReportData
);

router.post("/add", authenticateToken, authorizeAddReport, createReport);

export default router;
