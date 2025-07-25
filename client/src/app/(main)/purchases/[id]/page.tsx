// "use client";

// import { useState, useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import {
//   useGetPurchaseByIdQuery,
//   useUpdatePurchaseMutation,
//   useGetProductsQuery,
//   Product,
//   NewPurchasePayload,
// } from "@/services/api";
// import { Loader2, Truck, Search } from "lucide-react";
// import { Combobox } from "@headlessui/react";
// import PurchaseItemCard from "../new/PurchaseItemCard"; // Reutilizando o card de item

// // (Reutilize as interfaces do seu formulário de criação aqui)
// interface PurchaseLineItem {
//   id: number;
//   variantId: string | null;
//   quantity: string;
//   costAtPurchase: string;
// }
// interface SelectedProduct extends Product {
//   purchaseItems: PurchaseLineItem[];
// }
// interface PurchaseForm {
//   supplier: string;
//   shippingCost: string;
//   selectedProducts: SelectedProduct[];
// }

// export default function EditPurchasePage() {
//   const router = useRouter();
//   const params = useParams();
//   const purchaseId = params.id as string;

//   // Hooks da API para buscar e atualizar
//   const { data: existingPurchase, isLoading: isLoadingPurchase } =
//     useGetPurchaseByIdQuery(purchaseId, {
//       skip: !purchaseId,
//     });
//   const [updatePurchase, { isLoading: isUpdatingPurchase }] =
//     useUpdatePurchaseMutation();
//   const { data: allProducts, isLoading: isLoadingProducts } =
//     useGetProductsQuery();

//   const [purchaseData, setPurchaseData] = useState<PurchaseForm>({
//     supplier: "",
//     shippingCost: "",
//     selectedProducts: [],
//   });

//   // Efeito para preencher o formulário com os dados existentes
//   useEffect(() => {
//     if (existingPurchase && allProducts) {
//       const selectedProductsMap = new Map<string, SelectedProduct>();

//       existingPurchase.items.forEach((item) => {
//         const product = item.variant.product;
//         if (!selectedProductsMap.has(product.id)) {
//           selectedProductsMap.set(product.id, {
//             ...product,
//             variants:
//               allProducts.find((p) => p.id === product.id)?.variants || [],
//             purchaseItems: [],
//           });
//         }

//         const selectedProduct = selectedProductsMap.get(product.id)!;
//         selectedProduct.purchaseItems.push({
//           id: Date.now() + Math.random(),
//           variantId: item.variant.id,
//           quantity: String(item.quantity),
//           costAtPurchase: String(item.costAtPurchase),
//         });
//       });

//       setPurchaseData({
//         supplier: existingPurchase.supplier || "",
//         shippingCost: String(existingPurchase.shippingCost),
//         selectedProducts: Array.from(selectedProductsMap.values()),
//       });
//     }
//   }, [existingPurchase, allProducts]);

//   // (Copie todas as funções de manipulação do formulário da sua página de criação aqui)
//   // handleSelectProduct, removeProductCard, updatePurchaseItem, etc.

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const itemsToSubmit = purchaseData.selectedProducts
//       .flatMap((p) => p.purchaseItems)
//       .filter(
//         (item) =>
//           item.variantId &&
//           parseFloat(item.quantity) > 0 &&
//           parseFloat(item.costAtPurchase) >= 0
//       )
//       .map((item) => ({
//         variantId: item.variantId!,
//         quantity: parseInt(item.quantity, 10),
//         costAtPurchase: parseFloat(item.costAtPurchase),
//       }));

//     if (itemsToSubmit.length === 0) {
//       alert("A compra deve ter pelo menos um item válido.");
//       return;
//     }

//     const payload: NewPurchasePayload = {
//       supplier: purchaseData.supplier || undefined,
//       shippingCost: parseFloat(purchaseData.shippingCost) || 0,
//       items: itemsToSubmit,
//     };

//     try {
//       await updatePurchase({ purchaseId: purchaseId, data: payload }).unwrap();
//       alert("Compra atualizada com sucesso!");
//       router.push("/purchases");
//     } catch (error) {
//       console.error("Falha ao atualizar a compra:", error);
//       alert("Ocorreu um erro ao salvar as alterações.");
//     }
//   };

//   if (isLoadingPurchase || isLoadingProducts) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <Loader2 className="h-10 w-10 animate-spin" />
//       </div>
//     );
//   }

//   // O JSX do retorno será praticamente idêntico ao da sua página de criação
//   // A única diferença é o título da página e o texto do botão de salvar.
//   return (
//     <div className="mx-auto w-full">
//       <h1 className="text-3xl font-bold mb-6">Editar Compra</h1>
//       <form
//         onSubmit={handleSubmit}
//         className="space-y-8 rounded-lg bg-white p-6 shadow-sm"
//       >
//         {/* ... Cole aqui todo o JSX do <form> da sua página de criação ... */}
//         {/* Lembre-se de mudar o texto do botão de "Salvar Compra" para "Salvar Alterações" */}
//         <button type="submit" disabled={isUpdatingPurchase} className="...">
//           {isUpdatingPurchase ? "A Salvar..." : "Salvar Alterações"}
//         </button>
//       </form>
//     </div>
//   );
// }
