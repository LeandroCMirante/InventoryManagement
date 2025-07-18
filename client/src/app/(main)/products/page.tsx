"use client";

import { useState } from "react";
import {
  // Hooks para buscar e modificar dados
  useGetProductsQuery,
  useCreateProductMutation,
  useDeleteProductMutation,
  useDeleteVariantMutation,
  // Tipos de dados da nossa API
  NewProductPayload,
  ProductVariant,
  Product,
} from "@/services/api";
import { PlusCircle, ChevronDown, Edit, Plus, Trash2 } from "lucide-react";
import ProductListItem from "./ProductListItem";

// Importação de todos os nossos modais
import ProductModal from "./ProductModal";
import AddVariantModal from "./AddVariantModal";
import EditProductModal from "./EditProductModal";
import EditVariantModal from "./EditVariantModal";
import ConfirmDeleteModal from "@/components/modals/ConfirmDeleteModal";

// --- Componente para exibir um único item da lista de produtos ---

const initialModalState = {
  createProduct: false,
  editProduct: false,
  addVariant: false,
  editVariant: false,
  deleteConfirmation: false,
};

// --- Componente Principal da Página ---
export default function ProductsPage() {
  // Estados para controlar a visibilidade de cada modal
  const [modalState, setModalState] = useState({
    createProduct: false,
    editProduct: false,
    addVariant: false,
    editVariant: false,
    deleteConfirmation: false,
  });

  // Estados para guardar o item selecionado a ser passado para os modais
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "product" | "variant";
    id: string;
    name: string;
  } | null>(null);

  // Hooks do RTK Query para interagir com a API
  const { data: products, isLoading, isError } = useGetProductsQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [deleteProduct, { isLoading: isDeletingProduct }] =
    useDeleteProductMutation();
  const [deleteVariant, { isLoading: isDeletingVariant }] =
    useDeleteVariantMutation();

  // Função genérica para abrir qualquer modal
  const openModal = (modalName: keyof typeof modalState, data?: any) => {
    if (data?.product) setSelectedProduct(data.product);
    if (data?.variant) setSelectedVariant(data.variant);
    if (data?.target) setDeleteTarget(data.target);
    // Esta abordagem é mais simples e segura para o TypeScript
    setModalState({ ...initialModalState, [modalName]: true });
  };

  // Função para fechar todos os modais e limpar os estados de seleção
  const closeModal = () => {
    setModalState(initialModalState);
    setSelectedProduct(null);
    setSelectedVariant(null);
    setDeleteTarget(null);
  };

  // Funções de manipulação de dados
  const handleCreateProduct = async (productData: NewProductPayload) => {
    try {
      await createProduct(productData).unwrap();
      closeModal();
    } catch (err) {
      console.error("Falha ao criar o produto:", err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "product") {
        await deleteProduct(deleteTarget.id).unwrap();
      } else {
        await deleteVariant(deleteTarget.id).unwrap();
      }
      closeModal();
    } catch (err) {
      console.error(`Falha ao apagar ${deleteTarget.type}:`, err);
    }
  };

  if (isLoading) return <div className="text-center py-10">A carregar...</div>;
  if (isError)
    return (
      <div className="text-center text-red-500 py-10">
        Erro ao carregar produtos.
      </div>
    );

  return (
    <div className="mx-auto w-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Produtos
        </h1>
        <button
          onClick={() => openModal("createProduct")}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          <PlusCircle size={18} /> Adicionar Produto
        </button>
      </div>

      <div className="space-y-4">
        {products && products.length > 0 ? (
          products.map((product) => (
            <ProductListItem
              key={product.id}
              product={product}
              onAddVariant={(p) => openModal("addVariant", { product: p })}
              onEditVariant={(product, variant) =>
                openModal("editVariant", { variant: variant, product: product })
              }
              onDeleteVariant={(v) =>
                openModal("deleteConfirmation", {
                  target: { type: "variant", id: v.id, name: v.name },
                })
              }
              onEditProduct={(p) => openModal("editProduct", { product: p })}
              onDeleteProduct={(p) =>
                openModal("deleteConfirmation", {
                  target: { type: "product", id: p.id, name: p.name },
                })
              }
            />
          ))
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-lg dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Nenhum produto encontrado
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Clique em "Adicionar Produto" para começar.
            </p>
          </div>
        )}
      </div>

      {/* Renderização de todos os Modais */}
      <ProductModal
        isOpen={modalState.createProduct}
        onClose={closeModal}
        onCreate={handleCreateProduct}
        isLoading={isCreating}
      />
      <AddVariantModal
        isOpen={modalState.addVariant}
        onClose={closeModal}
        productId={selectedProduct?.id || null}
        productName={selectedProduct?.name || null}
      />
      <EditVariantModal
        isOpen={modalState.editVariant}
        onClose={closeModal}
        variant={selectedVariant}
        productName={selectedProduct?.name || null}
      />
      <EditProductModal
        isOpen={modalState.editProduct}
        onClose={closeModal}
        product={selectedProduct}
      />
      <ConfirmDeleteModal
        isOpen={modalState.deleteConfirmation}
        onClose={closeModal}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeletingProduct || isDeletingVariant}
        title={`Apagar ${
          deleteTarget?.type === "product" ? "Produto" : "Variação"
        }`}
        message={`Tem a certeza que quer apagar "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
