"use client";

import { Truck, Search } from "lucide-react";
import { useGetProductsQuery } from "@/services/api";
import { Combobox } from "@headlessui/react";
import PurchaseItemCard from "./PurchaseItemCard"; // Importa o componente de card
import { usePurchaseForm } from "@/hooks/usePurchaseForm"; // 1. Importa o nosso novo hook personalizado
import PurchaseFormActions from "./PurchaseFormActions";

// --- Componente Principal da Página ---
export default function CreatePurchasePage() {
  // 2. Busca os dados necessários para o formulário
  const { data: allProducts, isLoading: isLoadingProducts } =
    useGetProductsQuery();

  // 3. O nosso hook personalizado gere TODA a lógica de estado e manipulação do formulário
  const {
    purchaseData,
    setPurchaseData,
    productSearchQuery,
    setProductSearchQuery,
    filteredProducts,
    handleSelectProduct,
    removeProductCard,
    updatePurchaseItem,
    addVariantLine,
    removeVariantLine,
    subtotal,
    totalCost,
  } = usePurchaseForm(allProducts);

  // A lógica de submissão permanece na página, pois é uma ação específica desta página
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui, você irá converter os dados para o formato numérico correto
    // e enviá-los para o backend usando uma mutation do RTK Query.
    console.log("Dados da Compra a serem enviados:", purchaseData);
    // Exemplo: createPurchaseMutation(formattedData);
  };

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
            <label htmlFor="supplier" className="block text-sm font-medium">
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="shippingCost" className="block text-sm font-medium">
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* SELEÇÃO DE ITENS */}
        <div className="space-y-2">
          <label className="text-lg font-semibold">Itens da Compra</label>
          <Combobox
            as="div"
            className="relative"
            onChange={handleSelectProduct}
          >
            <div className="relative">
              <Search className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-400" />
              <Combobox.Input
                className="w-full rounded-md border py-3 pl-11 pr-4 shadow-sm"
                onChange={(event) => setProductSearchQuery(event.target.value)}
                placeholder={
                  isLoadingProducts
                    ? "A carregar produtos..."
                    : "Pesquisar e adicionar produtos..."
                }
                disabled={isLoadingProducts}
              />
            </div>
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg">
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

        {/* CARDS DE PRODUTOS SELECIONADOS */}
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
        <PurchaseFormActions
          subtotal={subtotal}
          shippingCost={purchaseData.shippingCost}
          totalCost={totalCost}
          isSubmitting={false} // Substitua por 'isSubmitting' da sua mutation
        />
      </form>
    </div>
  );
}
