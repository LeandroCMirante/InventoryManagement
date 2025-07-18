"use client";

import { useState, useMemo } from "react";
import { Truck, Search, Plus, X } from "lucide-react";
import {
  useGetProductsQuery,
  useCreatePurchaseMutation,
  Product,
  ProductVariant,
} from "@/services/api";
import { Combobox } from "@headlessui/react";
import PurchaseItemCard from "./PurchaseItemCard";

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

// --- Componente do Card de Item da Compra ---
// Refatorado para lidar com múltiplas variações

// --- Componente Principal da Página ---
export default function CreatePurchasePage() {
  const [purchaseData, setPurchaseData] = useState<PurchaseForm>({
    supplier: "",
    shippingCost: "",
    selectedProducts: [],
  });

  const { data: allProducts, isLoading: isLoadingProducts } =
    useGetProductsQuery();
  const [productSearchQuery, setProductSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    const selectedIds = new Set(purchaseData.selectedProducts.map((p) => p.id));
    return allProducts.filter(
      (product) =>
        !selectedIds.has(product.id) &&
        product.name.toLowerCase().includes(productSearchQuery.toLowerCase())
    );
  }, [allProducts, productSearchQuery, purchaseData.selectedProducts]);

  const handleSelectProduct = (product: Product) => {
    if (
      product &&
      !purchaseData.selectedProducts.find((p) => p.id === product.id)
    ) {
      setPurchaseData((prev) => ({
        ...prev,
        selectedProducts: [
          ...prev.selectedProducts,
          {
            ...product,
            // Começa com uma linha de item de variação
            purchaseItems: [
              {
                id: Date.now(),
                variantId: null,
                quantity: "1",
                costAtPurchase: "",
              },
            ],
          },
        ],
      }));
    }
    setProductSearchQuery("");
  };

  const removeProductCard = (productId: string) => {
    setPurchaseData((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.filter((p) => p.id !== productId),
    }));
  };

  const updatePurchaseItem = (
    productId: string,
    itemIndex: number,
    field: keyof PurchaseLineItem,
    value: string | null
  ) => {
    setPurchaseData((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.map((p) => {
        if (p.id === productId) {
          const newItems = [...p.purchaseItems];
          newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
          return { ...p, purchaseItems: newItems };
        }
        return p;
      }),
    }));
  };

  const addVariantLine = (productId: string) => {
    setPurchaseData((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.map((p) =>
        p.id === productId
          ? {
              ...p,
              purchaseItems: [
                ...p.purchaseItems,
                {
                  id: Date.now(),
                  variantId: null,
                  quantity: "1",
                  costAtPurchase: "",
                },
              ],
            }
          : p
      ),
    }));
  };

  const removeVariantLine = (productId: string, itemIndex: number) => {
    setPurchaseData((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            purchaseItems: p.purchaseItems.filter((_, i) => i !== itemIndex),
          };
        }
        return p;
      }),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Dados da Compra a serem enviados:", purchaseData);
  };

  const subtotal = purchaseData.selectedProducts
    .flatMap((p) => p.purchaseItems)
    .reduce((acc, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const cost = parseFloat(item.costAtPurchase) || 0;
      return acc + quantity * cost;
    }, 0);

  const totalCost = subtotal + (parseFloat(purchaseData.shippingCost) || 0);

  return (
    <div className="mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Registrar Nova Compra
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800"
      >
        {/* DETALHES DA COMPRA (FORNECEDOR E FRETE) */}
        <div className="grid grid-cols-1 gap-6 border-b pb-6 dark:border-gray-700 md:grid-cols-2">
          <div>
            <label
              htmlFor="supplier"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Fornecedor (Opcional)
            </label>
            <input
              type="text"
              name="supplier"
              id="supplier"
              value={purchaseData.supplier}
              onChange={(e) =>
                setPurchaseData((prev) => ({
                  ...prev,
                  supplier: e.target.value,
                }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label
              htmlFor="shippingCost"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Custo do Frete
            </label>
            <input
              type="number"
              step="0.01"
              name="shippingCost"
              id="shippingCost"
              value={purchaseData.shippingCost}
              onChange={(e) =>
                setPurchaseData((prev) => ({
                  ...prev,
                  shippingCost: e.target.value,
                }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* SELEÇÃO DE ITENS */}
        <div className="space-y-2">
          <label className="text-lg font-semibold text-gray-800 dark:text-white">
            Itens da Compra
          </label>
          <Combobox
            as="div"
            className="relative"
            onChange={handleSelectProduct}
          >
            <div className="relative">
              <Search className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-400" />
              <Combobox.Input
                className="w-full rounded-md border border-gray-300 bg-white py-3 pl-11 pr-4 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                onChange={(event) => setProductSearchQuery(event.target.value)}
                placeholder={
                  isLoadingProducts
                    ? "A carregar produtos..."
                    : "Pesquisar e adicionar produtos..."
                }
                disabled={isLoadingProducts}
              />
            </div>
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredProducts.map((product) => (
                <Combobox.Option
                  key={product.id}
                  value={product}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 px-4 ${
                      active ? "bg-blue-600 text-white" : "text-gray-900"
                    }`
                  }
                >
                  {product.name}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Combobox>
        </div>

        <div className="space-y-4">
          {purchaseData.selectedProducts.map((product) => (
            <PurchaseItemCard
              key={product.id}
              product={product}
              onRemove={removeProductCard}
              onUpdateItem={updatePurchaseItem}
              onAddVariantLine={addVariantLine}
              onRemoveVariantLine={removeVariantLine}
            />
          ))}
        </div>
        {/* RESUMO E BOTÃO DE SALVAR */}
        <div className="flex flex-col items-end gap-6 border-t pt-6 dark:border-gray-700 md:flex-row md:justify-between">
          <div className="w-full md:w-1/3">
            <div className="space-y-2 rounded-lg border p-4 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Subtotal:
                </span>
                <span className="font-medium dark:text-white">
                  R$ {subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Frete:</span>
                <span className="font-medium dark:text-white">
                  R$ {(parseFloat(purchaseData.shippingCost) || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-800 dark:text-white">Total:</span>
                <span className="text-blue-600 dark:text-blue-400">
                  R$ {totalCost.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Truck size={18} />
            Salvar Compra
          </button>
        </div>
      </form>
    </div>
  );
}
