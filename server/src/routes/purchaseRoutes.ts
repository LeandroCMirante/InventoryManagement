import { Router } from "express";
import { getPurchases, createPurchase} from "../controllers/purchaseController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, getPurchases);
router.post("/", authMiddleware, createPurchase);
// Adicione aqui as rotas POST, PUT, DELETE

export default router;
