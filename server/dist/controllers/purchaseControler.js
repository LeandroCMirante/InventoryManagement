"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPurchases = void 0;
const prisma_1 = require("../lib/prisma");
// Obter todas as compras do utilizador
const getPurchases = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: "Utilizador não autenticado." });
        }
        const purchases = yield prisma_1.prisma.purchase.findMany({
            where: { userId: userId, deletedAt: null },
            include: {
                items: {
                    include: {
                        variant: true, // Inclui os detalhes da variação de cada item
                    },
                },
            },
            orderBy: { purchaseDate: "desc" },
        });
        res.status(200).json(purchases);
    }
    catch (error) {
        res.status(500).json({ error: "Falha ao obter as compras." });
    }
});
exports.getPurchases = getPurchases;
// Adicione aqui as funções createPurchase, updatePurchase, deletePurchase
