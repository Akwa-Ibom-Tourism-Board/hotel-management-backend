import express from "express";
import authenticate from "../configurations/authenticate";
import summary from "./controllers/summary";
import exportEstablishments from "./controllers/export";

const router = express.Router();

router.get("/summary", authenticate, summary);
router.get("/export", authenticate, exportEstablishments);

export default router;
