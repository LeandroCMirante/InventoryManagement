import { Plus, X, Trash2 } from "lucide-react";
import { Product, ProductVariant } from "@/services/api";

// --- Tipos de Dados para o Formulário ---

// Representa uma única linha de variação dentro de um card de produto
interface PurchaseLineItem {
  id: number; // ID temporário para o React
  variantId: string | null;
  quantity: string;
  costAtPurchase: string;
}

// Estendemos o tipo Product para incluir a lista de itens de compra
interface SelectedProduct extends Product {
  purchaseItems: PurchaseLineItem[];
}

interface PurchaseForm {
  supplier: string;
  shippingCost: string;
  selectedProducts: SelectedProduct[];
}

interface PurchaseItemCardProps {
  product: SelectedProduct;
  onRemove: (productId: string) => void;
  onUpdateItem: (
    productId: string,
    index: number,
    field: keyof PurchaseLineItem,
    value: string
  ) => void;
  onAddVariantLine: (productId: string) => void;
  onRemoveVariantLine: (productId: string, index: number) => void;
}

const PurchaseItemCard: React.FC<PurchaseItemCardProps> = ({
  product,
  onRemove,
  onUpdateItem,
  onAddVariantLine,
  onRemoveVariantLine,
}) => {
  return (
    <div className="relative flex flex-col gap-4 rounded-lg border p-4 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <label className="block text-xs font-medium text-gray-500">
            Produto
          </label>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {product.name}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => onRemove(product.id)}
          className="p-1 text-red-500 transition-colors hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"
          aria-label="Remover Produto"
        >
          <X size={18} />
        </button>
      </div>

      {/* Lista de Linhas de Variação */}
      <div className="space-y-3">
        {product.purchaseItems.map((item, index) => (
          <div
            key={item.id}
            className="grid grid-cols-1 items-end gap-4 md:grid-cols-10"
          >
            {/* Seletor de Variação */}
            <div className="md:col-span-5">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Variação
              </label>
              <select
                value={item.variantId || ""}
                onChange={(e) =>
                  onUpdateItem(product.id, index, "variantId", e.target.value)
                }
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="" disabled>
                  Selecione
                </option>
                {product.variants.map((variant: ProductVariant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Quantidade */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium">Quantidade</label>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  onUpdateItem(product.id, index, "quantity", e.target.value)
                }
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            {/* Custo Unitário */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium">
                Custo Unitário
              </label>
              <input
                type="number"
                step="0.01"
                value={item.costAtPurchase}
                onChange={(e) =>
                  onUpdateItem(
                    product.id,
                    index,
                    "costAtPurchase",
                    e.target.value
                  )
                }
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            {/* Botão de Remover Linha */}
            <div className="md:col-span-1">
              {product.purchaseItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveVariantLine(product.id, index)}
                  className="flex h-10 w-10 items-center justify-center rounded-md text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Botão para adicionar mais variações */}
      <button
        type="button"
        onClick={() => onAddVariantLine(product.id)}
        className="flex items-center gap-2 self-start text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        <Plus size={16} />
        Adicionar outra variação
      </button>
    </div>
  );
};

export default PurchaseItemCard;
