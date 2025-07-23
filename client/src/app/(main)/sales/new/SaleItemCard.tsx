import { Product, ProductVariant } from "@/services/api";
import { Plus, Trash2 } from "lucide-react";

interface SaleLineItem {
  id: number;
  variantId: string | null;
  quantity: string;
  priceAtSale: string;
}

interface SelectedProduct extends Product {
  saleItems: SaleLineItem[];
}

type SaleItemCardProps = {
  product: SelectedProduct;
  onRemove: (productId: string) => void;
  onUpdateItem: (
    productId: string,
    itemIndex: number,
    field: keyof SaleLineItem,
    value: string | null
  ) => void;
  onAddVariantLine: (productId: string) => void;
  onRemoveVariantLine: (productId: string, itemIndex: number) => void;
};

export default function SaleItemCard({
  product,
  onRemove,
  onUpdateItem,
  onAddVariantLine,
  onRemoveVariantLine,
}: SaleItemCardProps) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between border-b pb-2 dark:border-gray-600">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <button
          type="button"
          onClick={() => onRemove(product.id)}
          className="p-1 text-gray-400 hover:text-red-500"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="space-y-3">
        {product.saleItems.map((item, index) => (
          <div key={item.id} className="grid grid-cols-12 items-center gap-4">
            {/* Seletor de Variação */}
            <div className="col-span-5">
              <select
                value={item.variantId || ""}
                onChange={(e) =>
                  onUpdateItem(product.id, index, "variantId", e.target.value)
                }
                required
                className="w-full rounded-md border-gray-300 text-sm dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="" disabled>
                  Selecione a variação
                </option>
                {product.variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.name} (Estoque: {variant.quantity})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantidade */}
            <div className="col-span-2">
              <input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  onUpdateItem(product.id, index, "quantity", e.target.value)
                }
                min="1"
                required
                className="w-full rounded-md border-gray-300 text-sm dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            {/* Preço de Venda */}
            <div className="col-span-3">
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  R$
                </span>
                <input
                  type="number"
                  value={item.priceAtSale}
                  onChange={(e) =>
                    onUpdateItem(
                      product.id,
                      index,
                      "priceAtSale",
                      e.target.value
                    )
                  }
                  step="0.01"
                  min="0"
                  required
                  className="w-full rounded-md border-gray-300 pl-8 text-sm dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>

            {/* Botão de Remover Linha */}
            <div className="col-span-2 flex justify-end">
              <button
                type="button"
                onClick={() => onRemoveVariantLine(product.id, index)}
                className="p-1 text-gray-400 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t pt-3 dark:border-gray-600">
        <button
          type="button"
          onClick={() => onAddVariantLine(product.id)}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <Plus size={16} />
          Adicionar outra variação
        </button>
      </div>
    </div>
  );
}
