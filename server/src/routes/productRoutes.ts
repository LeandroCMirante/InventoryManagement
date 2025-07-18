// Ficheiro: src/routes/productRoutes.ts
import { Router } from "express";
import {
  getProducts,
  createProduct,
  addVariantToProduct,
  updateVariant,
  updateProduct,
  deleteProduct,
  deleteVariant,
} from "../controllers/productController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// Rotas para Produtos "Pai"
router.get("/", authMiddleware, getProducts);
router.post("/", authMiddleware, createProduct);
router.put("/:productId", authMiddleware, updateProduct);
router.delete("/:productId", authMiddleware, deleteProduct);

// Rotas para Variações
router.post("/:productId/variants", authMiddleware, addVariantToProduct);
router.put("/variants/:variantId", authMiddleware, updateVariant);
router.delete("/variants/:variantId", authMiddleware, deleteVariant);

export default router;
