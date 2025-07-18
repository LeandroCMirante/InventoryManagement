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
exports.getDashboardMetrics = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getDashboardMetrics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Endpoint /products acessado, lógica a ser refatorada.");
        res.json([]); // Simplesmente retorne um array vazio por enquanto
        // const popularProducts = await prisma.products.findMany({
        //   take: 15,
        //   orderBy: {
        //     stockQuantity: "desc",
        //   },
        // });
        // const salesSummary = await prisma.salesSummary.findMany({
        //   take: 5,
        //   orderBy: {
        //     date: "desc",
        //   },
        // });
        // const purchaseSummary = await prisma.purchaseSummary.findMany({
        //   take: 5,
        //   orderBy: {
        //     date: "desc",
        //   },
        // });
        // const expenseSummary = await prisma.expenseSummary.findMany({
        //   take: 5,
        //   orderBy: {
        //     date: "desc",
        //   },
        // });
        // const expenseByCategorySummaryRaw = await prisma.expenseByCategory.findMany(
        //   {
        //     take: 5,
        //     orderBy: {
        //       date: "desc",
        //     },
        //   }
        // );
        // const expenseByCategorySummary = expenseByCategorySummaryRaw.map(
        //   (item) => ({
        //     ...item,
        //     amount: item.amount.toString(),
        //   })
        // );
        // res.json({
        //   popularProducts,
        //   salesSummary,
        //   purchaseSummary,
        //   expenseSummary,
        //   expenseByCategorySummary,
        // });
    }
    catch (error) {
        res.status(500).json({ error: "Error retrieving dashboard metrics" });
    }
});
exports.getDashboardMetrics = getDashboardMetrics;
