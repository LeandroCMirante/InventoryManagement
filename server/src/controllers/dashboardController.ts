// Em um novo arquivo, ex: src/controllers/dashboardController.ts

import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/authMiddleware";
import { z } from "zod";

// Schema de validação para as query params
const reportQuerySchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const getDashboardReport = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Utilizador não autenticado." });
    }

    // Validar e extrair as datas da query string
    const validation = reportQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        error:
          "Datas de início e fim são obrigatórias e devem estar no formato ISO.",
      });
    }
    const { startDate, endDate } = validation.data;

    // Calcular o total de vendas no período
    const salesData = await prisma.sale.aggregate({
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
    const purchasesData = await prisma.purchase.aggregate({
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
  } catch (error) {
    console.error("Falha ao gerar o relatório do dashboard:", error);
    res.status(500).json({ error: "Falha ao gerar o relatório do dashboard." });
  }
};
