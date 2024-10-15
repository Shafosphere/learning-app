import express from "express";
import { getInformation, getWordData, getWordsList} from "../controllers/wordController";
import authenticateToken from "../middleware/authenticateToken";
import authorizeAdmin from "../middleware/authorizeAdmin";

const router = express.Router();

router.get("/information", getInformation);

router.post("/data", getWordData);

router.get("/list", authenticateToken, authorizeAdmin, getWordsList);

export default router;