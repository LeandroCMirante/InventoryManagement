import { Router } from "express";
import {
  getPurchases,
  createPurchase,
  updatePurchase,
  deletePurchase,
  getPurchaseById,
} from "../controllers/purchaseController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, getPurchases);
router.post("/", authMiddleware, createPurchase);
router.put("/:id", authMiddleware, updatePurchase);
router.delete("/:id", authMiddleware, deletePurchase);
router.get("/purchases/:id", authMiddleware, getPurchaseById);

export default router;
