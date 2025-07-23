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
exports.getPurchaseById = exports.deletePurchase = exports.updatePurchase = exports.getPurchases = exports.createPurchase = void 0;
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
                        variant: {
                            include: {
                                product: true,
                            },
                        },
                    },
                },
            },
            orderBy: { purchaseDate: "desc" },
        });
        res.status(200).json(purchases);
    }
    catch (error) {
        console.error("Erro ao buscar compras:", error); // Adicionado para melhor debug
        res.status(500).json({ error: "Falha ao obter as compras." });
    }
});
exports.getPurchases = getPurchases;
// Edita uma compra existente
const updatePurchase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { supplier, shippingCost, items } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!items || items.length === 0) {
        return res
            .status(400)
            .json({ error: "A compra deve ter pelo menos um item." });
    }
    try {
        const updatedPurchase = yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // 1. Buscar os itens antigos para ajustar o estoque
            const oldItems = yield tx.purchaseItem.findMany({
                where: { purchaseId: id },
            });
            // 2. Reverter o estoque dos itens antigos
            for (const oldItem of oldItems) {
                yield tx.productVariant.update({
                    where: { id: oldItem.variantId },
                    data: {
                        quantity: {
                            decrement: oldItem.quantity,
                        },
                    },
                });
            }
            // 3. Deletar os itens de compra antigos
            yield tx.purchaseItem.deleteMany({
                where: { purchaseId: id },
            });
            // 4. Criar os novos itens de compra
            const newItemsData = items.map((item) => (Object.assign(Object.assign({}, item), { purchaseId: id })));
            yield tx.purchaseItem.createMany({
                data: newItemsData,
            });
            // 5. Atualizar o estoque com os novos itens
            for (const item of items) {
                yield tx.productVariant.update({
                    where: { id: item.variantId },
                    data: {
                        quantity: {
                            increment: item.quantity,
                        },
                    },
                });
            }
            // 6. Calcular o novo custo total dos itens
            const newItemsTotalCost = newItemsData.reduce((acc, item) => acc + item.costAtPurchase * item.quantity, 0);
            const newTotalCost = newItemsTotalCost + shippingCost;
            // 7. Atualizar os dados da compra principal
            const purchase = yield tx.purchase.update({
                where: { id },
                data: {
                    supplier,
                    shippingCost,
                    totalCost: newTotalCost,
                    updatedAt: new Date(),
                },
                include: {
                    // Incluir os novos itens na resposta
                    items: true,
                },
            });
            return purchase;
        }));
        res.status(200).json(updatedPurchase);
    }
    catch (error) {
        console.error("Falha ao atualizar a compra:", error);
        res.status(500).json({ error: "Falha ao atualizar a compra." });
    }
});
exports.updatePurchase = updatePurchase;
// Exclui (logicamente) uma compra
const deletePurchase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params; // Usando 'id' que corrigimos anteriormente
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json({ error: "Utilizador não autenticado." });
    }
    try {
        // Usamos uma transação para garantir a consistência dos dados
        yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // 1. Encontrar a compra e seus itens para saber o que reverter
            const purchaseToDelete = yield tx.purchase.findUnique({
                where: { id: id, userId: userId },
                include: {
                    items: true, // Inclui os itens para sabermos as quantidades
                },
            });
            if (!purchaseToDelete) {
                // Lança um erro para abortar a transação se a compra não for encontrada
                throw new Error("Compra não encontrada ou não pertence ao utilizador.");
            }
            // 2. Reverter (diminuir) o estoque para cada item da compra
            for (const item of purchaseToDelete.items) {
                yield tx.productVariant.update({
                    where: { id: item.variantId },
                    data: {
                        quantity: {
                            decrement: item.quantity, // Diminui o estoque
                        },
                    },
                });
            }
            // 3. Marcar a compra como deletada (soft delete)
            yield tx.purchase.update({
                where: { id: id },
                data: {
                    deletedAt: new Date(),
                },
            });
        }));
        res
            .status(200)
            .json({ message: "Compra excluída e estoque ajustado com sucesso." });
    }
    catch (error) {
        console.error("Falha ao excluir a compra:", error);
        // Se o erro for o que lançamos, retorna 404, senão 500
        if (error.message.includes("Compra não encontrada")) {
            return res.status(404).json({ error: error.message });
        }
        res
            .status(500)
            .json({ error: "Falha ao excluir a compra.", message: error.message });
    }
});
exports.deletePurchase = deletePurchase;
// Obter uma única compra pelo ID
const getPurchaseById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { id } = req.params; // A ID da compra virá da URL
        if (!userId) {
            return res.status(401).json({ error: "Utilizador não autenticado." });
        }
        const purchase = yield prisma_1.prisma.purchase.findUnique({
            where: { id: id, userId: userId },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: true, // Inclui o produto pai da variação
                            },
                        },
                    },
                },
            },
        });
        if (!purchase) {
            return res.status(404).json({ error: "Compra não encontrada." });
        }
        res.status(200).json(purchase);
    }
    catch (error) {
        console.error("Falha ao obter a compra:", error);
        res.status(500).json({ error: "Falha ao obter a compra." });
    }
});
exports.getPurchaseById = getPurchaseById;
