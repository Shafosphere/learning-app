import express from "express";
import authenticateToken from "../middleware/authenticateToken.js";
import authorizeAdmin from "../middleware/authorizeAdmin.js";
import { getGlobalData, generatePatches } from "../controllers/adminController.js";

const router = express.Router();

// Endpoint do pobierania globalnych danych (tylko dla administratorów)
router.get("/global-data", authenticateToken, authorizeAdmin, getGlobalData);

router.post("/generatepatch", authenticateToken, authorizeAdmin, generatePatches);

export default router;
