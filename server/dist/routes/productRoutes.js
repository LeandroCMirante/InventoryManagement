"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Ficheiro: src/routes/productRoutes.ts
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Rotas para Produtos "Pai"
router.get("/", authMiddleware_1.authMiddleware, productController_1.getProducts);
router.post("/", authMiddleware_1.authMiddleware, productController_1.createProduct);
router.put("/:productId", authMiddleware_1.authMiddleware, productController_1.updateProduct);
router.delete("/:productId", authMiddleware_1.authMiddleware, productController_1.deleteProduct);
// Rotas para Variações
router.post("/:productId/variants", authMiddleware_1.authMiddleware, productController_1.addVariantToProduct);
router.put("/variants/:variantId", authMiddleware_1.authMiddleware, productController_1.updateVariant);
router.delete("/variants/:variantId", authMiddleware_1.authMiddleware, productController_1.deleteVariant);
exports.default = router;
