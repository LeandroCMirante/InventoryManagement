"use client";

import { FormEvent, useState, useEffect } from "react";
import { X } from "lucide-react";
import { useAddVariantToProductMutation } from "@/services/api";

type AddVariantModalProps = {
  isOpen: boolean;
  onClose: () => void;
  productId: string | null;
  productName: string | null;
};

const AddVariantModal = ({
  isOpen,
  onClose,
  productId,
  productName,
}: AddVariantModalProps) => {
  const [name, setName] = useState("");
  // 1. O estado do preço de venda agora é uma string para permitir um campo vazio.
  const [salePrice, setSalePrice] = useState("");

  const [addVariant, { isLoading, isSuccess, error }] =
    useAddVariantToProductMutation();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!productId) return;

    try {
      // 2. Convertemos a string de volta para número ANTES de a enviar para a API.
      // Se a string estiver vazia, `parseFloat` retorna NaN, e `|| 0` define o valor como 0.
      const priceAsNumber = parseFloat(salePrice) || 0;
      await addVariant({ productId, name, salePrice: priceAsNumber }).unwrap();
    } catch (err) {
      console.error("Falha ao adicionar a variação:", err);
    }
  };

  // Fecha o modal e limpa o formulário após o sucesso
  useEffect(() => {
    if (isSuccess) {
      setName("");
      setSalePrice(""); // Limpa para uma string vazia
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

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Adicionar Variação a{" "}
          <span className="text-blue-500">{productName}</span>
        </h3>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="variantName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nome da Variação (ex: Sabor, Tamanho)
            </label>
            <input
              id="variantName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label
              htmlFor="salePrice"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Preço de Venda
            </label>
            <input
              id="salePrice"
              type="number"
              step="0.01"
              // 3. O 'value' está agora ligado ao estado de string.
              value={salePrice}
              // 4. O 'onChange' simplesmente atualiza o estado de string, sem conversões.
              onChange={(e) => setSalePrice(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          {error && "data" in error && (
            <div className="text-red-500 text-sm">
              Erro: {JSON.stringify((error.data as any).error)}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "A adicionar..." : "Adicionar Variação"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVariantModal;
