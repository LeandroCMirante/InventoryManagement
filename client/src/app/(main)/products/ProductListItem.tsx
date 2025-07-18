import { useState } from "react";
import { ChevronDown, Edit, Plus, Trash2 } from "lucide-react";
import { ProductVariant, Product } from "@/services/api";

// --- Type Definitions ---
interface ProductListItemProps {
  product: Product;
  onAddVariant: (product: Product) => void;
  onEditVariant: (product: Product, variant: ProductVariant) => void;
  onDeleteVariant: (product: Product, variant: ProductVariant) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
}

const ProductListItem = ({
  product,
  onAddVariant,
  onEditVariant,
  onDeleteVariant,
  onEditProduct,
  onDeleteProduct,
}: ProductListItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-lg bg-white shadow-sm transition-shadow duration-300 hover:shadow-md dark:bg-gray-800">
      {/* Cabeçalho do Produto (Clicável para expandir) */}
      <div className="flex items-center justify-between p-4">
        <div
          className="flex-1 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {product.variants.length}{" "}
            {product.variants.length === 1 ? "variação" : "variações"}
          </p>
        </div>
        {/* Botões de Ação para o Produto Pai */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditProduct(product)}
            className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
            aria-label="Editar Produto"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => onDeleteProduct(product)}
            className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
            aria-label="Apagar Produto"
          >
            <Trash2 size={18} />
          </button>
          <ChevronDown
            size={20}
            className={`transform transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            } cursor-pointer`}
            onClick={() => setIsExpanded(!isExpanded)}
          />
        </div>
      </div>

      {/* Lista de Variações (visível apenas quando expandido) */}
      {isExpanded && (
        <div className="border-t px-4 py-2 dark:border-gray-700">
          <ul className="space-y-2">
            {product.variants.map((variant: ProductVariant) => (
              <li
                key={variant.id}
                className="flex items-center justify-between text-sm py-1"
              >
                <span className="text-gray-700 dark:text-gray-300">
                  {variant.name}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500 dark:text-gray-400">
                    Estoque:{" "}
                    <span className="font-bold text-gray-800 dark:text-white">
                      {variant.quantity}
                    </span>
                  </span>
                  <span className="font-bold text-gray-800 dark:text-white">
                    R$ {Number(variant.salePrice).toFixed(2)}
                  </span>
                  {/* Botões de Ação para cada Variação */}
                  <button
                    onClick={() => onEditVariant(product, variant)}
                    className="p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                    aria-label="Editar Variação"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDeleteVariant(product, variant)}
                    className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                    aria-label="Apagar Variação"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button
            onClick={() => onAddVariant(product)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline mt-2 p-1"
          >
            <Plus size={14} /> Adicionar Variação
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductListItem;
