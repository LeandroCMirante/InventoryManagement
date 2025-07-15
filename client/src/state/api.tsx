import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// --- INTERFACES BASED ON THE NEW SCHEMA ---

// Note: These interfaces should ideally match your Prisma models.
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  salePrice: number;
}

// Type for the data sent when creating a product
export type NewProductData = Omit<Product, "id">;

// Type for the data received after a successful login
export interface AuthResponse {
  token: string;
  user: User;
}

// --- API DEFINITION ---

export const api = createApi({
  // Use your environment variable for the base URL
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    // This function adds the auth token to every request if it exists
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token; // Adjust to your RootState type
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: ["User", "Product", "Sale", "Purchase", "Expense"], // Updated tags

  endpoints: (build) => ({
    // --- AUTH ENDPOINTS ---
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

    // --- PRODUCT ENDPOINTS (Example) ---
    getProducts: build.query<Product[], void>({
      query: () => "/products",
      providesTags: ["Product"],
    }),
    createProduct: build.mutation<Product, NewProductData>({
      query: (newProduct) => ({
        url: "/products",
        method: "POST",
        body: newProduct,
      }),
      invalidatesTags: ["Product"],
    }),

    // --- DASHBOARD ENDPOINT (Refactored) ---
    // The dashboard now fetches data from multiple, real endpoints.
    // This can be handled by calling multiple hooks on the dashboard page
    // or by creating a dedicated endpoint on your backend that gathers all the data.
    // For now, we assume the page will call the hooks it needs.
    // getDashboardMetrics has been removed as it's based on the old schema.
  }),
});

// Export the auto-generated hooks
export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProductsQuery,
  useCreateProductMutation,
} = api;
