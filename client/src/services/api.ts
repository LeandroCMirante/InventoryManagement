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
  tagTypes: ["Product", "Purchase"],

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
      providesTags: ["Purchase"],
    }),

    createPurchase: build.mutation<Purchase, NewPurchasePayload>({
      query: (newPurchaseData) => ({
        url: "/purchases",
        method: "POST",
        body: newPurchaseData,
      }),
      // Após uma nova compra, invalida as tags de Compras e Produtos
      // para que o histórico de compras e a lista de produtos (com novo estoque) sejam atualizados.
      invalidatesTags: ["Purchase", "Product"],
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
} = api;
