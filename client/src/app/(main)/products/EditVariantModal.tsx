"use client";

import { FormEvent, useState, useEffect } from "react";
import { X } from "lucide-react";
import { useUpdateVariantMutation, ProductVariant } from "@/services/api"; // Ajuste o caminho se necessário

type EditVariantModalProps = {
  isOpen: boolean;
  onClose: () => void;
  variant: ProductVariant | null;
  productName: string | null; // Adicionámos o nome do produto para o título
};

const EditVariantModal = ({
  isOpen,
  onClose,
  variant,
  productName,
}: EditVariantModalProps) => {
  // Estado para guardar os dados do formulário
  const [name, setName] = useState("");
  const [salePrice, setSalePrice] = useState(""); // Usar string para uma melhor UX

  // Hook do RTK Query para atualizar a variação
  const [updateVariant, { isLoading, isSuccess, error }] =
    useUpdateVariantMutation();

  // Este 'effect' é a chave da correção. Ele corre sempre que a prop 'variant' muda.
  // Ele preenche o formulário com os dados da variação que está a ser editada.
  useEffect(() => {
    if (variant) {
      // Se uma variação for passada, atualiza o estado do formulário
      setName(variant.name);
      setSalePrice(String(variant.salePrice)); // Converte o número para string para o input
    } else {
      // Se nenhuma variação for passada (ex: quando o modal fecha), limpa o formulário
      setName("");
      setSalePrice("");
    }
  }, [variant]); // A dependência é a 'variant'

  // Lida com a submissão do formulário
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!variant) return;

    try {
      // Converte o salePrice de volta para número antes de enviar para a API
      await updateVariant({
        variantId: variant.id,
        name,
        salePrice: parseFloat(salePrice) || 0,
      }).unwrap();
    } catch (err) {
      console.error("Falha ao atualizar a variação:", err);
    }
  };

  // Este 'effect' fecha o modal automaticamente após uma atualização bem-sucedida
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

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Editar Variação de{" "}
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
              value={salePrice}
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
              {isLoading ? "A guardar..." : "Guardar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVariantModal;
