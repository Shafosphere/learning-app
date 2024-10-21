import express from "express";
import authenticateToken from "../middleware/authenticateToken.js";
import authorizeAdmin from "../middleware/authorizeAdmin.js";
import {
  getDetailReport,
  getDataReports,
  updateReportTranslations,
  deleteReportData,
  createReport,
} from "../controllers/reportController.js";

const router = express.Router();

router.post("/details", authenticateToken, authorizeAdmin, getDetailReport);

router.post("/data", authenticateToken, authorizeAdmin, (req, res, next) => {
  console.log("getDataReports function called");
  next();
}, getDataReports);

router.patch("/update", authenticateToken, authorizeAdmin, updateReportTranslations);

router.delete("/delete/:id", authenticateToken, authorizeAdmin, deleteReportData);

router.post("/add", authenticateToken, createReport);


export default router;