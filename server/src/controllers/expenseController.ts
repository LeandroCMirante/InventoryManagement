import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getExpensesByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("Endpoint /products acessado, lógica a ser refatorada.");
    res.json([]); // Simplesmente retorne um array vazio por enquanto
    // const expenseByCategorySummaryRaw = await prisma.expenseByCategory.findMany(
    //   {
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

    // res.json(expenseByCategorySummary);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving expenses by category" });
  }
};
