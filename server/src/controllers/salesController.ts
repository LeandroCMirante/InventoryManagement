import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

interface NewSalePayload {
  clientName?: string;
  items: {
    variantId: string;
    quantity: number;
    priceAtSale: number;
  }[];
}

// Criar uma nova venda
export const createSale = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { clientName, items }: NewSalePayload = req.body;

  if (!items || items.length === 0) {
    return res
      .status(400)
      .json({ error: "A venda deve ter pelo menos um item." });
  }

  try {
    const sale = await prisma.$transaction(async (tx) => {
      // 1. Verificar se há estoque para todos os itens
      for (const item of items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
        });
        if (!variant || variant.quantity < item.quantity) {
          throw new Error(
            `Estoque insuficiente para a variação ${
              variant?.name || item.variantId
            }.`
          );
        }
      }

      // 2. Calcular o valor total da venda
      const totalAmount = items.reduce(
        (acc, item) => acc + item.priceAtSale * item.quantity,
        0
      );

      // 3. Criar o registro da venda
      const newSale = await tx.sale.create({
        data: {
          clientName,
          totalAmount,
          userId: userId!,
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
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newSale;
    });

    res.status(201).json(sale);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Falha ao registrar a venda.", message: error.message });
  }
};

// Obter todas as vendas
export const getSales = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const sales = await prisma.sale.findMany({
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
};

// Excluir uma venda (Soft Delete)
export const deleteSale = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.$transaction(async (tx) => {
      const saleToDelete = await tx.sale.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!saleToDelete) {
        throw new Error("Venda não encontrada.");
      }

      // 1. Devolver os itens ao estoque
      for (const item of saleToDelete.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { quantity: { increment: item.quantity } },
        });
      }

      // 2. Marcar a venda como deletada
      await tx.sale.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    });
    res.status(200).json({ message: "Venda excluída e estoque restaurado." });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Falha ao excluir a venda.", message: error.message });
  }
};
