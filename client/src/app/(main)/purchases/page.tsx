"use client";

import { useState } from "react";
import { useGetPurchasesQuery, Purchase } from "@/services/api";
import {
  PlusCircle,
  AlertCircle,
  ChevronDown,
  Edit,
  Trash2,
  Truck,
} from "lucide-react";
import Link from "next/link";

// --- Componente para um item da lista de compras ---
const PurchaseListItem = ({ purchase }: { purchase: Purchase }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
      <div
        className="grid grid-cols-12 items-center p-4 cursor-pointer gap-4"
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
          <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
            R$ {Number(purchase.totalCost).toFixed(2)}
          </p>
        </div>
        {/* Ações */}
        <div className="col-span-2 flex items-center justify-end gap-2">
          <button
            className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
            aria-label="Editar Compra"
          >
            <Edit size={18} />
          </button>
          <button
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
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <h4 className="font-semibold mb-2">Itens desta compra:</h4>
          <ul className="space-y-1 text-sm">
            {purchase.items.map((item) => (
              <li key={item.id} className="grid grid-cols-3 gap-4">
                <span className="col-span-1 text-gray-700 dark:text-gray-300">
                  {item.variant.name}
                </span>
                <span className="col-span-1 text-gray-500 dark:text-gray-400">
                  {item.quantity} un. x R${" "}
                  {Number(item.costAtPurchase).toFixed(2)}
                </span>
                <span className="col-span-1 text-right font-medium dark:text-white">
                  Subtotal: R${" "}
                  {(item.quantity * Number(item.costAtPurchase)).toFixed(2)}
                </span>
              </li>
            ))}
            <li className="grid grid-cols-3 gap-4 border-t pt-2 mt-2 dark:border-gray-600">
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

// --- Componente Principal da Página ---
export default function PurchasesListPage() {
  const { data: purchases, isLoading, isError } = useGetPurchasesQuery();

  if (isLoading)
    return (
      <div className="text-center py-10">
        A carregar histórico de compras...
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
            <PurchaseListItem key={purchase.id} purchase={purchase} />
          ))
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-lg dark:border-gray-600">
            <Truck size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Nenhuma compra registada
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Clique em "Registrar Nova Compra" para adicionar a sua primeira
              entrada de estoque.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
