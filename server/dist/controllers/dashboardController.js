"use strict";
// Em um novo arquivo, ex: src/controllers/dashboardController.ts
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
exports.getDashboardReport = void 0;
const prisma_1 = require("../lib/prisma");
const zod_1 = require("zod");
// Schema de validação para as query params
const reportQuerySchema = zod_1.z.object({
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime(),
});
const getDashboardReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: "Utilizador não autenticado." });
        }
        // Validar e extrair as datas da query string
        const validation = reportQuerySchema.safeParse(req.query);
        if (!validation.success) {
            return res.status(400).json({
                error: "Datas de início e fim são obrigatórias e devem estar no formato ISO.",
            });
        }
        const { startDate, endDate } = validation.data;
        // Calcular o total de vendas no período
        const salesData = yield prisma_1.prisma.sale.aggregate({
            _sum: {
                totalAmount: true,
            },
            where: {
                userId: userId,
                deletedAt: null,
                saleDate: {
                    gte: new Date(startDate), // gte: Greater than or equal to
                    lte: new Date(endDate), // lte: Less than or equal to
                },
            },
        });
        // Calcular o total de compras no período
        const purchasesData = yield prisma_1.prisma.purchase.aggregate({
            _sum: {
                totalCost: true,
            },
            where: {
                userId: userId,
                deletedAt: null,
                purchaseDate: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            },
        });
        const report = {
            totalSales: salesData._sum.totalAmount || 0,
            totalPurchases: purchasesData._sum.totalCost || 0,
        };
        res.status(200).json(report);
    }
    catch (error) {
        console.error("Falha ao gerar o relatório do dashboard:", error);
        res.status(500).json({ error: "Falha ao gerar o relatório do dashboard." });
    }
});
exports.getDashboardReport = getDashboardReport;
