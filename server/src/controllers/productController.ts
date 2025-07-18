import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

// --- Obter todos os produtos e as suas variações ---
export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Utilizador não autenticado." });
    }

    // Procura todos os produtos do utilizador que não foram apagados.
    // O 'include: { variants: true }' diz ao Prisma para também trazer
    // todas as variações associadas a cada produto.
    const products = await prisma.product.findMany({
      where: {
        userId: userId,
        deletedAt: null,
      },
      include: {
        variants: {
          where: {
            deletedAt: null, // Também só traz variações que não foram apagadas
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Erro ao obter produtos:", error);
    res.status(500).json({ error: "Falha ao obter a lista de produtos." });
  }
};

// --- Criar um novo produto, opcionalmente com as suas variações iniciais ---
export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Utilizador não autenticado." });
    }

    // O corpo da requisição agora espera os dados do produto e um array de 'variants'
    const { name, description, variants } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ error: "O nome do produto é obrigatório." });
    }

    // O Prisma cria o produto e as suas variações numa única transação,
    // o que garante a consistência dos dados.
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        userId: userId,
        // Se um array de 'variants' for fornecido, cria-as juntamente com o produto.
        variants: {
          create:
            variants?.map((variant: { name: string; salePrice: number }) => ({
              name: variant.name,
              salePrice: variant.salePrice,
            })) || [],
        },
      },
      include: {
        variants: true, // Retorna o produto recém-criado com as suas variações
      },
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    res.status(500).json({ error: "Falha ao criar o produto." });
  }
};

// --- Adicionar uma nova variação a um produto existente ---
export const addVariantToProduct = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { productId } = req.params; // Obtém o ID do produto a partir da URL
    const { name, salePrice } = req.body; // Obtém os dados da nova variação

    if (!userId) {
      return res.status(401).json({ error: "Utilizador não autenticado." });
    }
    if (!name || salePrice === undefined) {
      return res.status(400).json({
        error: "O nome e o preço de venda da variação são obrigatórios.",
      });
    }

    // Verifica se o produto pertence ao utilizador antes de adicionar uma variação
    const productOwner = await prisma.product.findFirst({
      where: { id: productId, userId: userId },
    });

    if (!productOwner) {
      return res.status(404).json({
        error: "Produto não encontrado ou não pertence a este utilizador.",
      });
    }

    const newVariant = await prisma.productVariant.create({
      data: {
        name,
        salePrice,
        productId: productId,
      },
    });

    res.status(201).json(newVariant);
  } catch (error) {
    console.error("Erro ao adicionar variação:", error);
    res.status(500).json({ error: "Falha ao adicionar a variação." });
  }
};

// --- Atualizar uma variação existente ---
export const updateVariant = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { variantId } = req.params; // Obtém o ID da variação a partir da URL
    const { name, salePrice } = req.body; // Obtém os dados a serem atualizados

    if (!userId) {
      return res.status(401).json({ error: "Utilizador não autenticado." });
    }

    // Esta query complexa garante que o utilizador só pode atualizar uma variação
    // que pertence a um produto que ele próprio criou.
    const updatedVariant = await prisma.productVariant.updateMany({
      where: {
        id: variantId,
        product: {
          userId: userId,
        },
      },
      data: {
        name,
        salePrice,
      },
    });

    if (updatedVariant.count === 0) {
      return res
        .status(404)
        .json({ error: "Variação não encontrada ou acesso negado." });
    }

    res.status(200).json({ message: "Variação atualizada com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar variação:", error);
    res.status(500).json({ error: "Falha ao atualizar a variação." });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { productId } = req.params;
    const { name, description } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Utilizador não autenticado." });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, userId: userId },
    });

    if (!product) {
      return res
        .status(404)
        .json({ error: "Produto não encontrado ou acesso negado." });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { name, description },
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    res.status(500).json({ error: "Falha ao atualizar o produto." });
  }
};

// --- Apagar (soft delete) um produto "pai" e todas as suas variações ---
export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Utilizador não autenticado." });
    }

    // Usamos uma transação para garantir que ambas as operações (apagar produto e variações)
    // aconteçam com sucesso, ou nenhuma delas acontece.
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: productId, userId: userId },
      });

      if (!product) {
        throw new Error("Produto não encontrado ou acesso negado.");
      }

      const deleteTime = new Date();

      // Apaga (soft delete) todas as variações primeiro
      await tx.productVariant.updateMany({
        where: { productId: productId },
        data: { deletedAt: deleteTime },
      });

      // Apaga (soft delete) o produto pai
      await tx.product.update({
        where: { id: productId },
        data: { deletedAt: deleteTime },
      });
    });

    res.status(204).send(); // 204 No Content é a resposta padrão para um delete bem-sucedido
  } catch (error) {
    console.error("Erro ao apagar produto:", error);
    res.status(500).json({ error: "Falha ao apagar o produto." });
  }
};

// --- Apagar (soft delete) uma variação específica ---
export const deleteVariant = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { variantId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Utilizador não autenticado." });
    }

    const variant = await prisma.productVariant.findFirst({
      where: { id: variantId, product: { userId: userId } },
    });

    if (!variant) {
      return res
        .status(404)
        .json({ error: "Variação não encontrada ou acesso negado." });
    }

    await prisma.productVariant.update({
      where: { id: variantId },
      data: { deletedAt: new Date() },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Erro ao apagar variação:", error);
    res.status(500).json({ error: "Falha ao apagar a variação." });
  }
};
