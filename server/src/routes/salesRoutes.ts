import { Router } from "express";
import {
  createSale,
  getSales,
  deleteSale,
} from "../controllers/salesController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, getSales);
router.post("/", authMiddleware, createSale);
router.delete("/:id", authMiddleware, deleteSale);

export default router;
