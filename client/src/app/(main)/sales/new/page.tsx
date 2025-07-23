"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useGetProductsQuery,
  useCreateSaleMutation,
  Product,
  NewSalePayload,
  ProductVariant,
} from "@/services/api";
import { Combobox } from "@headlessui/react";
import { Loader2, Search, ShoppingCart } from "lucide-react";
import SaleItemCard from "./SaleItemCard"; // Criaremos este componente a seguir

// --- Tipos de Dados para o Formulário ---

interface SaleLineItem {
  id: number; // ID único para o item no estado do formulário
  variantId: string | null;
  quantity: string;
  priceAtSale: string; // O preço de venda da variação
}

interface SelectedProduct extends Product {
  saleItems: SaleLineItem[];
}

interface SaleForm {
  clientName: string;
  selectedProducts: SelectedProduct[];
}

// --- Componente Principal da Página ---
export default function CreateSalePage() {
  const router = useRouter();
  const [saleData, setSaleData] = useState<SaleForm>({
    clientName: "",
    selectedProducts: [],
  });

  // --- Hooks da API ---
  const { data: allProducts, isLoading: isLoadingProducts } =
    useGetProductsQuery();
  const [createSale, { isLoading: isCreatingSale }] = useCreateSaleMutation();

  const [productSearchQuery, setProductSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    const selectedIds = new Set(saleData.selectedProducts.map((p) => p.id));
    return allProducts.filter(
      (product) =>
        !selectedIds.has(product.id) &&
        product.name.toLowerCase().includes(productSearchQuery.toLowerCase())
    );
  }, [allProducts, productSearchQuery, saleData.selectedProducts]);

  const handleSelectProduct = (product: Product) => {
    if (
      product &&
      !saleData.selectedProducts.find((p) => p.id === product.id)
    ) {
      setSaleData((prev) => ({
        ...prev,
        selectedProducts: [
          ...prev.selectedProducts,
          {
            ...product,
            saleItems: [
              {
                id: Date.now(),
                variantId: null,
                quantity: "1",
                priceAtSale: "0", // Será preenchido quando a variação for selecionada
              },
            ],
          },
        ],
      }));
    }
    setProductSearchQuery("");
  };

  const removeProductCard = (productId: string) => {
    setSaleData((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.filter((p) => p.id !== productId),
    }));
  };

  const updateSaleItem = (
    productId: string,
    itemIndex: number,
    field: keyof SaleLineItem,
    value: string | null
  ) => {
    setSaleData((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.map((p) => {
        if (p.id === productId) {
          const newItems = [...p.saleItems];
          const currentItem = { ...newItems[itemIndex], [field]: value };

          // Lógica especial: ao mudar a variação, atualiza o preço de venda
          if (field === "variantId" && value) {
            const selectedVariant = p.variants.find((v) => v.id === value);
            if (selectedVariant) {
              currentItem.priceAtSale = String(selectedVariant.salePrice);
            }
          }

          newItems[itemIndex] = currentItem;
          return { ...p, saleItems: newItems };
        }
        return p;
      }),
    }));
  };

  const addVariantLine = (productId: string) => {
    setSaleData((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.map((p) =>
        p.id === productId
          ? {
              ...p,
              saleItems: [
                ...p.saleItems,
                {
                  id: Date.now(),
                  variantId: null,
                  quantity: "1",
                  priceAtSale: "0",
                },
              ],
            }
          : p
      ),
    }));
  };

  const removeVariantLine = (productId: string, itemIndex: number) => {
    setSaleData((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts
        .map((p) => {
          if (p.id === productId) {
            const newSaleItems = p.saleItems.filter((_, i) => i !== itemIndex);
            if (newSaleItems.length === 0) return null;
            return { ...p, saleItems: newSaleItems };
          }
          return p;
        })
        .filter((p): p is SelectedProduct => p !== null),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const itemsToSubmit = saleData.selectedProducts
      .flatMap((p) => p.saleItems)
      .filter(
        (item) =>
          item.variantId &&
          parseInt(item.quantity) > 0 &&
          parseFloat(item.priceAtSale) >= 0
      )
      .map((item) => ({
        variantId: item.variantId!,
        quantity: parseInt(item.quantity, 10),
        priceAtSale: parseFloat(item.priceAtSale),
      }));

    if (itemsToSubmit.length === 0) {
      alert("Adicione pelo menos um item válido à venda.");
      return;
    }

    const payload: NewSalePayload = {
      clientName: saleData.clientName || undefined,
      items: itemsToSubmit,
    };

    try {
      await createSale(payload).unwrap();
      alert("Venda registrada com sucesso!");
      router.push("/sales");
    } catch (error: any) {
      console.error("Falha ao registrar a venda:", error);
      const errorMessage =
        error.data?.message || "Verifique os dados e o estoque disponível.";
      alert(`Ocorreu um erro ao salvar a venda. ${errorMessage}`);
    }
  };

  const totalAmount = saleData.selectedProducts
    .flatMap((p) => p.saleItems)
    .reduce((acc, item) => {
      const quantity = parseInt(item.quantity) || 0;
      const price = parseFloat(item.priceAtSale) || 0;
      return acc + quantity * price;
    }, 0);

  return (
    <div className="mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Registrar Nova Venda
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800"
      >
        {/* DETALHES DA VENDA */}
        <div className="border-b pb-6 dark:border-gray-700">
          <label
            htmlFor="clientName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Nome do Cliente (Opcional)
          </label>
          <input
            type="text"
            name="clientName"
            id="clientName"
            value={saleData.clientName}
            onChange={(e) =>
              setSaleData((prev) => ({ ...prev, clientName: e.target.value }))
            }
            className="mt-1 block w-full max-w-lg rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        {/* SELEÇÃO DE ITENS */}
        <div className="space-y-2">
          <label className="text-lg font-semibold text-gray-800 dark:text-white">
            Itens da Venda
          </label>
          <Combobox
            as="div"
            className="relative"
            onChange={handleSelectProduct}
          >
            <div className="relative">
              <Search className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-400" />
              <Combobox.Input
                className="w-full rounded-md border border-gray-300 bg-white py-3 pl-11 pr-4 shadow-sm sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                onChange={(event) => setProductSearchQuery(event.target.value)}
                placeholder={
                  isLoadingProducts
                    ? "A carregar..."
                    : "Pesquisar e adicionar produtos"
                }
                disabled={isLoadingProducts}
              />
            </div>
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg">
              {filteredProducts.map((product) => (
                <Combobox.Option
                  key={product.id}
                  value={product}
                  className={({ active }) =>
                    `cursor-pointer select-none p-2 ${
                      active ? "bg-blue-600 text-white" : ""
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
          {saleData.selectedProducts.map((product) => (
            <SaleItemCard
              key={product.id}
              product={product}
              onRemove={removeProductCard}
              onUpdateItem={updateSaleItem}
              onAddVariantLine={addVariantLine}
              onRemoveVariantLine={removeVariantLine}
            />
          ))}
        </div>

        {/* RESUMO E BOTÃO DE SALVAR */}
        <div className="flex flex-col items-end gap-6 border-t pt-6 dark:border-gray-700 md:flex-row md:justify-between">
          <div className="w-full md:w-1/3">
            <div className="space-y-2 rounded-lg border p-4 dark:border-gray-700">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-800 dark:text-white">Total:</span>
                <span className="text-green-600 dark:text-green-400">
                  R$ {totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={isCreatingSale}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400 md:w-auto"
          >
            {isCreatingSale ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ShoppingCart size={18} />
            )}
            {isCreatingSale ? "A registar..." : "Registar Venda"}
          </button>
        </div>
      </form>
    </div>
  );
}
