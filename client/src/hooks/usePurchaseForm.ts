import { useState, useMemo } from "react";
import { Product } from "@/services/api";
import {
  PurchaseForm,
  SelectedProduct,
  PurchaseLineItem,
} from "@/types/purchases";

export const usePurchaseForm = (allProducts: Product[] | undefined) => {
  const [purchaseData, setPurchaseData] = useState<PurchaseForm>({
    supplier: "",
    shippingCost: "",
    selectedProducts: [],
  });
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

  const subtotal = useMemo(
    () =>
      purchaseData.selectedProducts
        .flatMap((p) => p.purchaseItems)
        .reduce((acc, item) => {
          const quantity = parseFloat(item.quantity) || 0;
          const cost = parseFloat(item.costAtPurchase) || 0;
          return acc + quantity * cost;
        }, 0),
    [purchaseData.selectedProducts]
  );

  const totalCost = useMemo(
    () => subtotal + (parseFloat(purchaseData.shippingCost) || 0),
    [subtotal, purchaseData.shippingCost]
  );

  return {
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
  };
};
