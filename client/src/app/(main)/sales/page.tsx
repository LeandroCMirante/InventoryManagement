"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGetSalesQuery, useDeleteSaleMutation, Sale } from "@/services/api";
import {
  Plus,
  ShoppingCart,
  DollarSign,
  ChevronDown,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react";

// --- Componente do Item da Lista ---
const SaleListItem = ({
  sale,
  onDelete,
}: {
  sale: Sale;
  onDelete: (id: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
      <div
        className="grid cursor-pointer grid-cols-12 items-center gap-4 p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="col-span-3 font-semibold">
          {new Date(sale.saleDate).toLocaleDateString()}
        </div>
        <div className="col-span-4">
          {sale.clientName || "Cliente não identificado"}
        </div>
        <div className="col-span-3 text-lg font-bold text-green-600">
          R$ {Number(sale.totalAmount).toFixed(2)}
        </div>
        <div className="col-span-2 flex items-center justify-end gap-2">
          <Link
            href={`/sales/${sale.id}`}
            passHref
            onClick={(e) => e.stopPropagation()}
            className="p-2 hover:text-blue-600"
          >
            <Edit size={18} />
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(sale.id);
            }}
            className="p-2 hover:text-red-600"
          >
            <Trash2 size={18} />
          </button>
          <ChevronDown
            size={20}
            className={`transform transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>
      {isExpanded && (
        <div className="border-t p-4">
          <h4 className="mb-2 font-semibold">Itens da venda:</h4>
          <ul className="space-y-2 text-sm">
            {sale.items.map((item) => (
              <li
                key={item.id}
                className="grid grid-cols-3 gap-4 rounded-md bg-gray-50 p-2"
              >
                <span className="font-semibold">
                  {item.variant.product.name} ({item.variant.name})
                </span>
                <span>
                  {item.quantity} un. x R$ {Number(item.priceAtSale).toFixed(2)}
                </span>
                <span className="text-right font-medium">
                  Subtotal: R${" "}
                  {(item.quantity * Number(item.priceAtSale)).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// --- Componente da Página Principal ---
export default function SalesListPage() {
  const router = useRouter();
  const { data: sales, isLoading, isError } = useGetSalesQuery();
  const [deleteSale, { isLoading: isDeleting }] = useDeleteSaleMutation();

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Tem certeza que deseja excluir esta venda? O estoque dos itens será restaurado."
      )
    ) {
      try {
        await deleteSale(id).unwrap();
      } catch (err) {
        alert("Falha ao excluir a venda.");
        console.error(err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin h-10 w-10" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-10 text-center text-red-600">
        <AlertCircle className="mx-auto h-10 w-10" />
        <p>Ocorreu um erro ao carregar as vendas.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full">
      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
          <Loader2 className="h-10 w-10 animate-spin text-white" />
        </div>
      )}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Histórico de Vendas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Visualize todas as vendas realizadas.
          </p>
        </div>
        <button
          onClick={() => router.push("/sales/new")}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
        >
          <Plus size={18} />
          Registrar Nova Venda
        </button>
      </div>
      <div className="space-y-4">
        {sales && sales.length > 0 ? (
          sales.map((sale) => (
            <SaleListItem key={sale.id} sale={sale} onDelete={handleDelete} />
          ))
        ) : (
          <div className="text-center rounded-lg border-2 border-dashed p-12">
            <ShoppingCart size={48} className="mx-auto text-gray-400" />
            <h3 className="mt-4 text-xl font-semibold">
              Nenhuma venda registrada
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Clique em "Registrar Nova Venda" para começar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
