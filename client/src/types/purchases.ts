import { Product } from "@/services/api";

// Representa uma única linha de variação dentro de um card de produto no formulário
export interface PurchaseLineItem {
  id: number; // ID temporário para o React
  variantId: string | null;
  quantity: string;
  costAtPurchase: string;
}

// Estende o tipo Product para incluir a lista de itens de compra do formulário
export interface SelectedProduct extends Product {
  purchaseItems: PurchaseLineItem[];
}

// A forma completa do estado do nosso formulário de compra
export interface PurchaseForm {
  supplier: string;
  shippingCost: string;
  selectedProducts: SelectedProduct[];
}
