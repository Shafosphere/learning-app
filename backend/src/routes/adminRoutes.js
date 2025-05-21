import express from "express";
import catchAsync from "../errors/catchAsync.js";
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
router.get(
  "/global-data",
  authenticateToken,
  authorizeAdmin,
  catchAsync(getGlobalData)
);

router.get(
  "/visits-data",
  authenticateToken,
  authorizeAdmin,
  catchAsync(getVisitsData)
);

router.get(
  "/user-activity-data",
  authenticateToken,
  authorizeAdmin,
  catchAsync(getUserActivityData)
);

router.post(
  "/generatepatch",
  authenticateToken,
  authorizeAdmin,
  verifyPin,
  catchAsync(generatePatches)
);

export default router;
