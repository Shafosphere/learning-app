import express from "express";
import { getInformation } from "../controllers/wordController";

const router = express.Router();

router.get("/information", getInformation);

router.post("/data", getWordData);

export default router;