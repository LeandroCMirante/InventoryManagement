import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

interface PurchaseItemPayload {
  variantId: string;
  quantity: number;
  costAtPurchase: number;
}

// --- Criar uma nova compra e atualizar o estoque ---
export const createPurchase = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Utilizador não autenticado." });
    }

    const { supplier, shippingCost, items } = req.body as {
      supplier: string;
      shippingCost: number;
      items: PurchaseItemPayload[];
    };

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ error: "A compra deve ter pelo menos um item." });
    }

    // Calcula o custo total dos itens
    const itemsTotalCost = items.reduce(
      (acc, item) => acc + item.quantity * item.costAtPurchase,
      0
    );
    const totalCost = itemsTotalCost + shippingCost;

    // O Prisma $transaction garante que todas as operações abaixo são executadas com sucesso, ou nenhuma é.
    const purchase = await prisma.$transaction(async (tx) => {
      // 1. Cria o registo principal da Compra
      const newPurchase = await tx.purchase.create({
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
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            quantity: {
              increment: item.quantity, // Adiciona a nova quantidade ao estoque existente
            },
          },
        });
      }

      return newPurchase;
    });

    res.status(201).json(purchase);
  } catch (error) {
    console.error("Erro ao criar a compra:", error);
    res.status(500).json({ error: "Falha ao registar a compra." });
  }
};

// Obter todas as compras do utilizador
export const getPurchases = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Utilizador não autenticado." });
    }

    const purchases = await prisma.purchase.findMany({
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
  } catch (error) {
    res.status(500).json({ error: "Falha ao obter as compras." });
  }
};

// Adicione aqui as funções createPurchase, updatePurchase, deletePurchase
