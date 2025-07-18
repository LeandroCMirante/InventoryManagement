"use client";

import { FormEvent, useState, useEffect } from "react";
import { X } from "lucide-react";
import { useUpdateProductMutation, Product } from "@/services/api";

type EditProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
};

const EditProductModal = ({
  isOpen,
  onClose,
  product,
}: EditProductModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [updateProduct, { isLoading, isSuccess }] = useUpdateProductMutation();

  // Preenche o formulário quando um produto é selecionado
  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || "");
    }
  }, [product]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product) return;

    try {
      await updateProduct({
        productId: product.id,
        name,
        description,
      }).unwrap();
    } catch (err) {
      console.error("Falha ao atualizar o produto:", err);
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
        <h3 className="text-xl font-semibold">Editar Produto</h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="productName" className="block text-sm font-medium">
              Nome do Produto
            </label>
            <input
              id="productName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium">
              Descrição
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {isLoading ? "A guardar..." : "Guardar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
