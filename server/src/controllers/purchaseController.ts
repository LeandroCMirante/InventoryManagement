import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

interface PurchaseItemPayload {
  variantId: string;
  quantity: number;
  costAtPurchase: number;
}

interface NewPurchasePayload {
  supplier: string;
  shippingCost: number;
  items: PurchaseItemPayload[];
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
  } catch (error) {
    console.error("Erro ao buscar compras:", error); // Adicionado para melhor debug
    res.status(500).json({ error: "Falha ao obter as compras." });
  }
};

// Edita uma compra existente
export const updatePurchase = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { supplier, shippingCost, items }: NewPurchasePayload = req.body;
  const userId = req.user?.userId;

  if (!items || items.length === 0) {
    return res
      .status(400)
      .json({ error: "A compra deve ter pelo menos um item." });
  }

  try {
    const updatedPurchase = await prisma.$transaction(async (tx) => {
      // 1. Buscar os itens antigos para ajustar o estoque
      const oldItems = await tx.purchaseItem.findMany({
        where: { purchaseId: id },
      });

      // 2. Reverter o estoque dos itens antigos
      for (const oldItem of oldItems) {
        await tx.productVariant.update({
          where: { id: oldItem.variantId },
          data: {
            quantity: {
              decrement: oldItem.quantity,
            },
          },
        });
      }

      // 3. Deletar os itens de compra antigos
      await tx.purchaseItem.deleteMany({
        where: { purchaseId: id },
      });

      // 4. Criar os novos itens de compra
      const newItemsData = items.map((item) => ({
        ...item,
        purchaseId: id,
      }));

      await tx.purchaseItem.createMany({
        data: newItemsData,
      });

      // 5. Atualizar o estoque com os novos itens
      for (const item of items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            quantity: {
              increment: item.quantity,
            },
          },
        });
      }

      // 6. Calcular o novo custo total dos itens
      const newItemsTotalCost = newItemsData.reduce(
        (acc, item) => acc + item.costAtPurchase * item.quantity,
        0
      );

      const newTotalCost = newItemsTotalCost + shippingCost;

      // 7. Atualizar os dados da compra principal
      const purchase = await tx.purchase.update({
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
    });

    res.status(200).json(updatedPurchase);
  } catch (error) {
    console.error("Falha ao atualizar a compra:", error);
    res.status(500).json({ error: "Falha ao atualizar a compra." });
  }
};

// Exclui (logicamente) uma compra
export const deletePurchase = async (req: AuthRequest, res: Response) => {
  const { id } = req.params; // Usando 'id' que corrigimos anteriormente
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Utilizador não autenticado." });
  }

  try {
    // Usamos uma transação para garantir a consistência dos dados
    await prisma.$transaction(async (tx) => {
      // 1. Encontrar a compra e seus itens para saber o que reverter
      const purchaseToDelete = await tx.purchase.findUnique({
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
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            quantity: {
              decrement: item.quantity, // Diminui o estoque
            },
          },
        });
      }

      // 3. Marcar a compra como deletada (soft delete)
      await tx.purchase.update({
        where: { id: id },
        data: {
          deletedAt: new Date(),
        },
      });
    });

    res
      .status(200)
      .json({ message: "Compra excluída e estoque ajustado com sucesso." });
  } catch (error: any) {
    console.error("Falha ao excluir a compra:", error);
    // Se o erro for o que lançamos, retorna 404, senão 500
    if (error.message.includes("Compra não encontrada")) {
      return res.status(404).json({ error: error.message });
    }
    res
      .status(500)
      .json({ error: "Falha ao excluir a compra.", message: error.message });
  }
};

// Obter uma única compra pelo ID
export const getPurchaseById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params; // A ID da compra virá da URL

    if (!userId) {
      return res.status(401).json({ error: "Utilizador não autenticado." });
    }

    const purchase = await prisma.purchase.findUnique({
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
  } catch (error) {
    console.error("Falha ao obter a compra:", error);
    res.status(500).json({ error: "Falha ao obter a compra." });
  }
};
