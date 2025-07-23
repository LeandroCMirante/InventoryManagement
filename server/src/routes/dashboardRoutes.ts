import { Router } from "express";
import { getDashboardReport } from "../controllers/dashboardController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/report", authMiddleware, getDashboardReport);

export default router;
