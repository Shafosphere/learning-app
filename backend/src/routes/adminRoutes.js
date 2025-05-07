import express from "express";
import authenticateToken from "../middleware/validators/admin_token/authenticateToken.js";
import authorizeAdmin from "../middleware/validators/admin_token/authorizeAdmin.js";
import verifyPin from "../middleware/verifyPin.js";
import {
  getGlobalData,
  generatePatches,
  getVisitsData,
  getUserActivityData,
} from "../controllers/adminController.js";
const router = express.Router();

// Endpoint do pobierania globalnych danych (tylko dla administratorów)
router.get("/global-data", authenticateToken, authorizeAdmin, getGlobalData);

router.get("/visits-data", authenticateToken, authorizeAdmin, getVisitsData);

router.get(
  "/user-activity-data",
  authenticateToken,
  authorizeAdmin,
  getUserActivityData
);

router.post(
  "/generatepatch",
  authenticateToken,
  authorizeAdmin,
  verifyPin,
  generatePatches
);

export default router;
