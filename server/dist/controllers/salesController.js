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
exports.deleteSale = exports.getSales = exports.createSale = void 0;
const prisma_1 = require("../lib/prisma");
// Criar uma nova venda
const createSale = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { clientName, items } = req.body;
    if (!items || items.length === 0) {
        return res
            .status(400)
            .json({ error: "A venda deve ter pelo menos um item." });
    }
    try {
        const sale = yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // 1. Verificar se há estoque para todos os itens
            for (const item of items) {
                const variant = yield tx.productVariant.findUnique({
                    where: { id: item.variantId },
                });
                if (!variant || variant.quantity < item.quantity) {
                    throw new Error(`Estoque insuficiente para a variação ${(variant === null || variant === void 0 ? void 0 : variant.name) || item.variantId}.`);
                }
            }
            // 2. Calcular o valor total da venda
            const totalAmount = items.reduce((acc, item) => acc + item.priceAtSale * item.quantity, 0);
            // 3. Criar o registro da venda
            const newSale = yield tx.sale.create({
                data: {
                    clientName,
                    totalAmount,
                    userId: userId,
                    items: {
                        create: items.map((item) => ({
                            quantity: item.quantity,
                            priceAtSale: item.priceAtSale,
                            variantId: item.variantId,
                        })),
                    },
                },
            });
            // 4. Atualizar (diminuir) o estoque de cada variação
            for (const item of items) {
                yield tx.productVariant.update({
                    where: { id: item.variantId },
                    data: {
                        quantity: {
                            decrement: item.quantity,
                        },
                    },
                });
            }
            return newSale;
        }));
        res.status(201).json(sale);
    }
    catch (error) {
        res
            .status(500)
            .json({ error: "Falha ao registrar a venda.", message: error.message });
    }
});
exports.createSale = createSale;
// Obter todas as vendas
const getSales = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const sales = yield prisma_1.prisma.sale.findMany({
        where: { userId, deletedAt: null },
        include: {
            items: {
                include: {
                    variant: { include: { product: true } },
                },
            },
        },
        orderBy: { saleDate: "desc" },
    });
    res.status(200).json(sales);
});
exports.getSales = getSales;
// Excluir uma venda (Soft Delete)
const deleteSale = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const saleToDelete = yield tx.sale.findUnique({
                where: { id },
                include: { items: true },
            });
            if (!saleToDelete) {
                throw new Error("Venda não encontrada.");
            }
            // 1. Devolver os itens ao estoque
            for (const item of saleToDelete.items) {
                yield tx.productVariant.update({
                    where: { id: item.variantId },
                    data: { quantity: { increment: item.quantity } },
                });
            }
            // 2. Marcar a venda como deletada
            yield tx.sale.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
        }));
        res.status(200).json({ message: "Venda excluída e estoque restaurado." });
    }
    catch (error) {
        res
            .status(500)
            .json({ error: "Falha ao excluir a venda.", message: error.message });
    }
});
exports.deleteSale = deleteSale;
