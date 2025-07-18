"use client";

import { FormEvent, useState, useEffect, ChangeEvent } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { NewProductPayload } from "@/services/api";

type ProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: NewProductPayload) => void;
  isLoading: boolean;
};

// Tipo para o estado local do formulário de variantes
type VariantFormState = {
  name: string;
  salePrice: string; // Usamos string para permitir um campo vazio
};

const ProductModal = ({
  isOpen,
  onClose,
  onCreate,
  isLoading,
}: ProductModalProps) => {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  // O estado das variantes agora usa strings para os campos numéricos
  const [variants, setVariants] = useState<VariantFormState[]>([
    { name: "", salePrice: "" },
  ]);

  const handleVariantChange = (
    index: number,
    field: keyof VariantFormState,
    value: string
  ) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const addVariantField = () => {
    setVariants([...variants, { name: "", salePrice: "" }]);
  };

  const removeVariantField = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Antes de submeter, convertemos os dados para o formato numérico correto
    const variantsToSubmit = variants.map((v) => ({
      name: v.name,
      salePrice: parseFloat(v.salePrice) || 0, // Se a string estiver vazia, o valor será 0
    }));

    onCreate({ name: productName, description, variants: variantsToSubmit });
  };

  // Limpa o formulário quando o modal é fechado
  useEffect(() => {
    if (!isOpen) {
      setProductName("");
      setDescription("");
      setVariants([{ name: "", salePrice: "" }]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X size={20} />
        </button>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Adicionar Novo Produto
        </h3>

        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2"
        >
          <div>
            <label htmlFor="productName" className="block text-sm font-medium">
              Nome do Produto
            </label>
            <input
              id="productName"
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
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
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <hr className="my-4" />
          <h4 className="text-md font-semibold">Variações do Produto</h4>
          {variants.map((variant, index) => (
            <div
              key={index}
              className="flex items-end gap-2 p-2 border rounded-md"
            >
              <div className="flex-1">
                <label className="block text-xs font-medium">
                  Nome da Variação (ex: Sabor, Tamanho)
                </label>
                <input
                  type="text"
                  placeholder="Sabor Laranja"
                  value={variant.name}
                  onChange={(e) =>
                    handleVariantChange(index, "name", e.target.value)
                  }
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div className="w-32">
                <label className="block text-xs font-medium">
                  Preço de Venda
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="19.99"
                  // O valor é agora uma string, permitindo que o campo fique vazio
                  value={variant.salePrice}
                  onChange={(e) =>
                    handleVariantChange(index, "salePrice", e.target.value)
                  }
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariantField(index)}
                  className="p-2 text-red-500 hover:bg-red-100 rounded-md"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addVariantField}
            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            <Plus size={16} /> Adicionar outra variação
          </button>

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
              {isLoading ? "A criar..." : "Criar Produto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
