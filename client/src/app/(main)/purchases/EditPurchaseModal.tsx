"use client";

import { FormEvent, useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useUpdatePurchaseMutation, Purchase } from "@/services/api"; // Ajuste o caminho se necessário

type EditPurchaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  purchase: Purchase | null;
};

const EditPurchaseModal = ({
  isOpen,
  onClose,
  purchase,
}: EditPurchaseModalProps) => {
  const [supplier, setSupplier] = useState("");
  const [shippingCost, setShippingCost] = useState("0");

  const [updatePurchase, { isLoading, isSuccess }] =
    useUpdatePurchaseMutation();

  // Preenche o formulário quando uma compra é selecionada
  useEffect(() => {
    if (purchase) {
      setSupplier(purchase.supplier || "");
      setShippingCost(String(purchase.shippingCost || 0));
    }
  }, [purchase]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!purchase) return;

    try {
      await updatePurchase({
        purchaseId: purchase.id,
        supplier,
        shippingCost: parseFloat(shippingCost),
      }).unwrap();
    } catch (err) {
      console.error("Falha ao atualizar a compra:", err);
      alert("Ocorreu um erro ao atualizar a compra.");
    }
  };

  // Fecha o modal após o sucesso da atualização
  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X size={20} />
        </button>
        <h3 className="text-xl font-semibold">Editar Compra</h3>
        <p className="text-sm text-gray-500">ID: {purchase?.id}</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="supplierName" className="block text-sm font-medium">
              Fornecedor
            </label>
            <input
              id="supplierName"
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label htmlFor="shippingCost" className="block text-sm font-medium">
              Custo do Frete
            </label>
            <input
              id="shippingCost"
              type="number"
              value={shippingCost}
              onChange={(e) => setShippingCost(e.target.value)}
              step="0.01"
              min="0"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? "A guardar..." : "Guardar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPurchaseModal;
