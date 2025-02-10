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
import { deleteReportValidator } from "../middleware/validators/report/delete-deletereport-vali.js";
import { updateReportValidator } from "../middleware/validators/report/patch-updatereporttrans-vali.js";
import { getDetailReportValidator } from "../middleware/validators/report/post-getdetail-vali.js";

const router = express.Router();

router.post(
  "/details",
  authenticateToken,
  authorizeAdmin,
  getDetailReportValidator,
  getDetailReport
);

router.get("/data", authenticateToken, authorizeAdmin, getDataReports);

router.patch(
  "/update",
  authenticateToken,
  authorizeAdmin,
  updateReportValidator,
  updateReportTranslations
);

router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeAdmin,
  deleteReportValidator,
  deleteReportData
);

router.post("/add", authenticateToken, authorizeAddReport, createReport);

export default router;
