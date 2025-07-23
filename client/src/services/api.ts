import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "@/redux/store";

// --- INTERFACES to match the NEW schema with Variants ---

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
}

// Represents a single variation of a product (e.g., "Flavor: Orange", "Size: 500ml")
export interface ProductVariant {
  id: string;
  name: string;
  salePrice: number;
  quantity: number;
  product: Product;
}

// Represents the parent product (e.g., "Fruit Juice")
export interface Product {
  id: string;
  name: string;
  description?: string | null;
  variants: ProductVariant[]; // A product now contains a list of its variants
}

// Type for the data sent when creating a new product with its initial variants
export interface NewProductPayload {
  name: string;
  description?: string;
  variants?: {
    name: string;
    salePrice: number;
  }[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Purchase {
  id: string;
  purchaseDate: string;
  supplier: string | null;
  shippingCost: number;
  totalCost: number;
  items: {
    id: string;
    quantity: number;
    costAtPurchase: number;
    variant: ProductVariant;
  }[];
}

export interface NewPurchasePayload {
  supplier?: string;
  shippingCost: number;
  items: {
    variantId: string;
    quantity: number;
    costAtPurchase: number;
  }[];
}

export interface Sale {
  id: string;
  saleDate: string; // O tipo Date do Prisma é serializado como string em JSON
  clientName: string | null; // Opcional, pode ser nulo
  totalAmount: number;
  items: {
    id: string;
    quantity: number;
    priceAtSale: number;
    variant: {
      id: string;
      name: string;
      product: {
        id: string;
        name: string;
      };
    };
  }[];
}
export interface NewSalePayload {
  clientName?: string;
  items: {
    variantId: string;
    quantity: number;
    priceAtSale: number;
  }[];
}

export interface DashboardReport {
  totalSales: number;
  totalPurchases: number;
}

// --- API SLICE DEFINITION ---

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  reducerPath: "api",
  tagTypes: ["Product", "Purchase", "Sale", "Report"],

  endpoints: (build) => ({
    // --- Auth Endpoints ---
    login: build.mutation<AuthResponse, any>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: build.mutation<User, any>({
      query: (userInfo) => ({
        url: "/auth/register",
        method: "POST",
        body: userInfo,
      }),
    }),

    // --- Product & Variant Endpoints ---
    getProducts: build.query<Product[], void>({
      query: () => "/products",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Product" as const, id })),
              { type: "Product", id: "LIST" },
            ]
          : [{ type: "Product", id: "LIST" }],
    }),
    createProduct: build.mutation<Product, NewProductPayload>({
      query: (newProduct) => ({
        url: "/products",
        method: "POST",
        body: newProduct,
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),
    addVariantToProduct: build.mutation<
      ProductVariant,
      { productId: string; name: string; salePrice: number }
    >({
      query: ({ productId, ...body }) => ({
        url: `/products/${productId}/variants`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Product", id: productId },
      ],
    }),
    updateVariant: build.mutation<
      ProductVariant,
      { variantId: string; name?: string; salePrice?: number }
    >({
      query: ({ variantId, ...body }) => ({
        url: `/products/variants/${variantId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { variantId }) => [
        { type: "Product", id: "LIST" },
      ], // A bit broad, but effective
    }),
    updateProduct: build.mutation<
      Product,
      { productId: string; name?: string; description?: string }
    >({
      query: ({ productId, ...body }) => ({
        url: `/products/${productId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Product", id: productId },
      ],
    }),

    deleteProduct: build.mutation<void, string>({
      query: (productId) => ({
        url: `/products/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    deleteVariant: build.mutation<void, string>({
      query: (variantId) => ({
        url: `/products/variants/${variantId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    getPurchases: build.query<Purchase[], void>({
      query: () => "/purchases",
      providesTags: (result) =>
        result
          ? [
              // Fornece uma tag para cada compra individual na lista
              ...result.map(({ id }) => ({ type: "Purchase" as const, id })),
              // Fornece uma tag geral para a LISTA de compras
              { type: "Purchase", id: "LIST" },
            ]
          : [{ type: "Purchase", id: "LIST" }],
    }),

    createPurchase: build.mutation<Purchase, NewPurchasePayload>({
      query: (newPurchaseData) => ({
        url: "/purchases",
        method: "POST",
        body: newPurchaseData,
      }),
      // Após uma nova compra, invalida as tags de Compras e Produtos
      // para que o histórico de compras e a lista de produtos (com novo estoque) sejam atualizados.
      invalidatesTags: ["Purchase", "Product", "Report"],
    }),

    updatePurchase: build.mutation<
      Purchase,
      { purchaseId: string; supplier?: string; shippingCost?: number }
    >({
      query: ({ purchaseId, ...body }) => ({
        url: `/purchases/${purchaseId}`,
        method: "PUT",
        body,
      }),
      // Invalida a compra específica e a lista geral para forçar a atualização
      invalidatesTags: (result, error, { purchaseId }) => [
        { type: "Purchase", id: purchaseId },
        { type: "Purchase", id: "LIST" },
        { type: "Product", id: "LIST" },
      ],
    }),

    deletePurchase: build.mutation<void, string>({
      query: (purchaseId) => ({
        url: `/purchases/${purchaseId}`,
        method: "DELETE",
      }),
      // Invalida a lista de compras para remover o item da UI
      invalidatesTags: [
        { type: "Purchase", id: "LIST" },
        { type: "Product", id: "LIST" },
      ],
    }),

    getPurchaseById: build.query<Purchase, string>({
      query: (id) => `/purchases/${id}`,
      providesTags: (result, error, id) => [{ type: "Purchase", id }],
    }),

    // --- Endpoints de Vendas ---
    getSales: build.query<Sale[], void>({
      query: () => "/sales",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Sale" as const, id })),
              { type: "Sale", id: "LIST" },
            ]
          : [{ type: "Sale", id: "LIST" }],
    }),

    createSale: build.mutation<Sale, NewSalePayload>({
      query: (newSale) => ({
        url: "/sales",
        method: "POST",
        body: newSale,
      }),
      // Invalida a lista de vendas e de produtos (por causa do estoque)
      invalidatesTags: ["Sale", "Product", "Report"],
    }),

    deleteSale: build.mutation<void, string>({
      query: (id) => ({
        url: `/sales/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Sale", id: "LIST" },
        { type: "Product", id: "LIST" },
      ],
    }),

    getDashboardReport: build.query<
      DashboardReport,
      { startDate: string; endDate: string }
    >({
      query: ({ startDate, endDate }) =>
        `/dashboard/report?startDate=${startDate}&endDate=${endDate}`,
      providesTags: ["Report"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProductsQuery,
  useCreateProductMutation,
  useAddVariantToProductMutation,
  useUpdateVariantMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useDeleteVariantMutation,
  useGetPurchasesQuery,
  useCreatePurchaseMutation,
  useUpdatePurchaseMutation,
  useDeletePurchaseMutation,
  useGetPurchaseByIdQuery,
  useGetSalesQuery,
  useCreateSaleMutation,
  useDeleteSaleMutation,
  useGetDashboardReportQuery,
} = api;
