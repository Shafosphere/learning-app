import express from "express";
import authenticateToken from "../middleware/validators/admin_token/authenticateToken.js";
import authorizeAdmin from "../middleware/validators/admin_token/authorizeAdmin.js";
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

import catchAsync from "../errors/catchAsync.js";

const router = express.Router();

router.post(
  "/details",
  authenticateToken,
  authorizeAdmin,
  getDetailReportValidator,
  catchAsync(getDetailReport) 
);

router.get(
  "/data",
  authenticateToken,
  authorizeAdmin,
  catchAsync(getDataReports)
); 

router.patch(
  "/update",
  authenticateToken,
  authorizeAdmin,
  updateReportValidator,
  catchAsync(updateReportTranslations) 
);

router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeAdmin,
  deleteReportValidator,
  catchAsync(deleteReportData)
);

router.post(
  "/add",
  authenticateToken,
  authorizeAddReport,
  catchAsync(createReport) 
);

export default router;
