"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const purchaseController_1 = require("../controllers/purchaseController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get("/", authMiddleware_1.authMiddleware, purchaseController_1.getPurchases);
router.post("/", authMiddleware_1.authMiddleware, purchaseController_1.createPurchase);
// Adicione aqui as rotas POST, PUT, DELETE
exports.default = router;
