import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getDashboardMetrics = async (
  req: Request,
  res: Response
): Promise<void> => {
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
  } catch (error) {
    res.status(500).json({ error: "Error retrieving dashboard metrics" });
  }
};
