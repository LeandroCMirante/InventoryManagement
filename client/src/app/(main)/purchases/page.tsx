"use client";

import { useState } from "react";
import {
  useGetPurchasesQuery,
  useDeletePurchaseMutation, // 1. Importar o hook de exclusão
  Purchase,
} from "@/services/api";
import EditPurchaseModal from "./EditPurchaseModal"; // 2. Importar o modal
import {
  PlusCircle,
  AlertCircle,
  ChevronDown,
  Edit,
  Trash2,
  Truck,
  Loader2,
} from "lucide-react";
import Link from "next/link";

// --- Componente do Item da Lista (Atualizado) ---
// Adicionamos as props onEdit e onDelete para receber as funções da página principal
const PurchaseListItem = ({
  purchase,
  onEdit,
  onDelete,
}: {
  purchase: Purchase;
  onEdit: (purchase: Purchase) => void;
  onDelete: (purchaseId: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
      <div
        className="grid cursor-pointer grid-cols-12 items-center gap-4 p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Data */}
        <div className="col-span-3">
          <p className="font-semibold text-gray-800 dark:text-white">
            {new Date(purchase.purchaseDate).toLocaleDateString()}
          </p>
        </div>
        {/* Fornecedor */}
        <div className="col-span-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Fornecedor</p>
          <p className="dark:text-gray-200">
            {purchase.supplier || "Não especificado"}
          </p>
        </div>
        {/* Total */}
        <div className="col-span-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Valor Total
          </p>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
            R$ {Number(purchase.totalCost).toFixed(2)}
          </p>
        </div>
        {/* Ações e Expandir */}
        <div className="col-span-2 flex items-center justify-end gap-2">
          {/* Botao de edição*/}
          <Link
            href={`/purchases/${purchase.id}`}
            passHref
            onClick={(e) => e.stopPropagation()} // Impede que o clique expanda o card
            className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
            aria-label="Editar Compra"
          >
            <Edit size={18} />
          </Link>
          {/* 4. Botão de Excluir agora chama a função onDelete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(purchase.id);
            }}
            className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
            aria-label="Apagar Compra"
          >
            <Trash2 size={18} />
          </button>
          <ChevronDown
            size={20}
            className={`transform transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Detalhes dos Itens (quando expandido) */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          <h4 className="mb-2 font-semibold">Itens desta compra:</h4>
          <ul className="space-y-2 text-sm">
            {purchase.items.map((item) => (
              <li
                key={item.id}
                className="grid grid-cols-3 gap-4 rounded-md bg-gray-50 p-2 dark:bg-gray-700/50"
              >
                <span className="col-span-1 text-gray-800 dark:text-gray-200">
                  <p className="font-semibold">{item.variant.product.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.variant.name}
                  </p>
                </span>
                <span className="col-span-1 text-gray-600 dark:text-gray-300">
                  {item.quantity} un. x R${" "}
                  {Number(item.costAtPurchase).toFixed(2)}
                </span>
                <span className="col-span-1 text-right font-medium dark:text-white">
                  Subtotal: R${" "}
                  {(item.quantity * Number(item.costAtPurchase)).toFixed(2)}
                </span>
              </li>
            ))}
            <li className="mt-2 grid grid-cols-3 gap-4 border-t pt-2 dark:border-gray-600">
              <span className="col-span-2 text-right text-gray-500 dark:text-gray-400">
                Frete:
              </span>
              <span className="col-span-1 text-right font-medium dark:text-white">
                R$ {Number(purchase.shippingCost).toFixed(2)}
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

// --- Componente Principal da Página (Atualizado) ---
export default function PurchasesListPage() {
  const { data: purchases, isLoading, isError } = useGetPurchasesQuery();
  const [deletePurchase, { isLoading: isDeleting }] =
    useDeletePurchaseMutation(); // 5. Instanciar o hook de exclusão

  // 6. Estados para controlar o modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null
  );

  // 7. Funções para abrir e fechar o modal
  const handleOpenEditModal = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedPurchase(null);
    setIsModalOpen(false);
  };

  // 8. Função para lidar com a exclusão
  const handleDeletePurchase = async (purchaseId: string) => {
    // Diálogo de confirmação para segurança
    if (
      window.confirm(
        "Tem a certeza de que deseja excluir esta compra? Esta ação não pode ser desfeita."
      )
    ) {
      try {
        await deletePurchase(purchaseId).unwrap();
        // O refetch automático da lista já é feito pelo invalidatesTags na API
      } catch (err) {
        console.error("Falha ao excluir a compra:", err);
        alert("Ocorreu um erro ao excluir a compra.");
      }
    }
  };

  if (isLoading)
    return (
      <div className="text-center py-10">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
      </div>
    );

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center text-center text-red-500 py-10">
        <AlertCircle size={48} className="mb-4" />
        <h2 className="text-xl font-semibold">Falha ao Carregar as Compras</h2>
        <p>Não foi possível comunicar com o servidor.</p>
      </div>
    );

  return (
    <div className="mx-auto w-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Histórico de Compras
        </h1>
        <Link href="/purchases/new">
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
            <PlusCircle size={18} />
            Registrar Nova Compra
          </button>
        </Link>
      </div>

      <div className="space-y-4">
        {purchases && purchases.length > 0 ? (
          purchases.map((purchase) => (
            // 9. Passar as funções de edição e exclusão para o componente filho
            <PurchaseListItem
              key={purchase.id}
              purchase={purchase}
              onEdit={handleOpenEditModal}
              onDelete={handleDeletePurchase}
            />
          ))
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-lg dark:border-gray-600">
            <Truck size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Nenhuma compra registada
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Clique em "Registrar Nova Compra" para começar.
            </p>
          </div>
        )}
      </div>

      {/* 10. Renderizar o modal */}
      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
          <Loader2 className="h-10 w-10 animate-spin text-white" />
        </div>
      )}
      <EditPurchaseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        purchase={selectedPurchase}
      />
    </div>
  );
}
