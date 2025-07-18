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
exports.deleteVariant = exports.deleteProduct = exports.updateProduct = exports.updateVariant = exports.addVariantToProduct = exports.createProduct = exports.getProducts = void 0;
const prisma_1 = require("../lib/prisma");
// --- Obter todos os produtos e as suas variações ---
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: "Utilizador não autenticado." });
        }
        // Procura todos os produtos do utilizador que não foram apagados.
        // O 'include: { variants: true }' diz ao Prisma para também trazer
        // todas as variações associadas a cada produto.
        const products = yield prisma_1.prisma.product.findMany({
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
    }
    catch (error) {
        console.error("Erro ao obter produtos:", error);
        res.status(500).json({ error: "Falha ao obter a lista de produtos." });
    }
});
exports.getProducts = getProducts;
// --- Criar um novo produto, opcionalmente com as suas variações iniciais ---
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
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
        const newProduct = yield prisma_1.prisma.product.create({
            data: {
                name,
                description,
                userId: userId,
                // Se um array de 'variants' for fornecido, cria-as juntamente com o produto.
                variants: {
                    create: (variants === null || variants === void 0 ? void 0 : variants.map((variant) => ({
                        name: variant.name,
                        salePrice: variant.salePrice,
                    }))) || [],
                },
            },
            include: {
                variants: true, // Retorna o produto recém-criado com as suas variações
            },
        });
        res.status(201).json(newProduct);
    }
    catch (error) {
        console.error("Erro ao criar produto:", error);
        res.status(500).json({ error: "Falha ao criar o produto." });
    }
});
exports.createProduct = createProduct;
// --- Adicionar uma nova variação a um produto existente ---
const addVariantToProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
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
        const productOwner = yield prisma_1.prisma.product.findFirst({
            where: { id: productId, userId: userId },
        });
        if (!productOwner) {
            return res.status(404).json({
                error: "Produto não encontrado ou não pertence a este utilizador.",
            });
        }
        const newVariant = yield prisma_1.prisma.productVariant.create({
            data: {
                name,
                salePrice,
                productId: productId,
            },
        });
        res.status(201).json(newVariant);
    }
    catch (error) {
        console.error("Erro ao adicionar variação:", error);
        res.status(500).json({ error: "Falha ao adicionar a variação." });
    }
});
exports.addVariantToProduct = addVariantToProduct;
// --- Atualizar uma variação existente ---
const updateVariant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { variantId } = req.params; // Obtém o ID da variação a partir da URL
        const { name, salePrice } = req.body; // Obtém os dados a serem atualizados
        if (!userId) {
            return res.status(401).json({ error: "Utilizador não autenticado." });
        }
        // Esta query complexa garante que o utilizador só pode atualizar uma variação
        // que pertence a um produto que ele próprio criou.
        const updatedVariant = yield prisma_1.prisma.productVariant.updateMany({
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
    }
    catch (error) {
        console.error("Erro ao atualizar variação:", error);
        res.status(500).json({ error: "Falha ao atualizar a variação." });
    }
});
exports.updateVariant = updateVariant;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { productId } = req.params;
        const { name, description } = req.body;
        if (!userId) {
            return res.status(401).json({ error: "Utilizador não autenticado." });
        }
        const product = yield prisma_1.prisma.product.findFirst({
            where: { id: productId, userId: userId },
        });
        if (!product) {
            return res
                .status(404)
                .json({ error: "Produto não encontrado ou acesso negado." });
        }
        const updatedProduct = yield prisma_1.prisma.product.update({
            where: { id: productId },
            data: { name, description },
        });
        res.status(200).json(updatedProduct);
    }
    catch (error) {
        console.error("Erro ao atualizar produto:", error);
        res.status(500).json({ error: "Falha ao atualizar o produto." });
    }
});
exports.updateProduct = updateProduct;
// --- Apagar (soft delete) um produto "pai" e todas as suas variações ---
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { productId } = req.params;
        if (!userId) {
            return res.status(401).json({ error: "Utilizador não autenticado." });
        }
        // Usamos uma transação para garantir que ambas as operações (apagar produto e variações)
        // aconteçam com sucesso, ou nenhuma delas acontece.
        yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const product = yield tx.product.findFirst({
                where: { id: productId, userId: userId },
            });
            if (!product) {
                throw new Error("Produto não encontrado ou acesso negado.");
            }
            const deleteTime = new Date();
            // Apaga (soft delete) todas as variações primeiro
            yield tx.productVariant.updateMany({
                where: { productId: productId },
                data: { deletedAt: deleteTime },
            });
            // Apaga (soft delete) o produto pai
            yield tx.product.update({
                where: { id: productId },
                data: { deletedAt: deleteTime },
            });
        }));
        res.status(204).send(); // 204 No Content é a resposta padrão para um delete bem-sucedido
    }
    catch (error) {
        console.error("Erro ao apagar produto:", error);
        res.status(500).json({ error: "Falha ao apagar o produto." });
    }
});
exports.deleteProduct = deleteProduct;
// --- Apagar (soft delete) uma variação específica ---
const deleteVariant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { variantId } = req.params;
        if (!userId) {
            return res.status(401).json({ error: "Utilizador não autenticado." });
        }
        const variant = yield prisma_1.prisma.productVariant.findFirst({
            where: { id: variantId, product: { userId: userId } },
        });
        if (!variant) {
            return res
                .status(404)
                .json({ error: "Variação não encontrada ou acesso negado." });
        }
        yield prisma_1.prisma.productVariant.update({
            where: { id: variantId },
            data: { deletedAt: new Date() },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error("Erro ao apagar variação:", error);
        res.status(500).json({ error: "Falha ao apagar a variação." });
    }
});
exports.deleteVariant = deleteVariant;
