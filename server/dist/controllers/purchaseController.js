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
exports.getPurchases = exports.createPurchase = void 0;
const prisma_1 = require("../lib/prisma");
// --- Criar uma nova compra e atualizar o estoque ---
const createPurchase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: "Utilizador não autenticado." });
        }
        const { supplier, shippingCost, items } = req.body;
        if (!items || items.length === 0) {
            return res
                .status(400)
                .json({ error: "A compra deve ter pelo menos um item." });
        }
        // Calcula o custo total dos itens
        const itemsTotalCost = items.reduce((acc, item) => acc + item.quantity * item.costAtPurchase, 0);
        const totalCost = itemsTotalCost + shippingCost;
        // O Prisma $transaction garante que todas as operações abaixo são executadas com sucesso, ou nenhuma é.
        const purchase = yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // 1. Cria o registo principal da Compra
            const newPurchase = yield tx.purchase.create({
                data: {
                    supplier,
                    shippingCost,
                    totalCost,
                    userId,
                    // 2. Cria todos os Itens da Compra associados
                    items: {
                        create: items.map((item) => ({
                            variantId: item.variantId,
                            quantity: item.quantity,
                            costAtPurchase: item.costAtPurchase,
                        })),
                    },
                },
            });
            // 3. Atualiza a quantidade de estoque para cada variação comprada
            for (const item of items) {
                yield tx.productVariant.update({
                    where: { id: item.variantId },
                    data: {
                        quantity: {
                            increment: item.quantity, // Adiciona a nova quantidade ao estoque existente
                        },
                    },
                });
            }
            return newPurchase;
        }));
        res.status(201).json(purchase);
    }
    catch (error) {
        console.error("Erro ao criar a compra:", error);
        res.status(500).json({ error: "Falha ao registar a compra." });
    }
});
exports.createPurchase = createPurchase;
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
