"use client";

import React from "react";
import { useGetProductsQuery } from "@/services/api";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { PlusCircle, Edit, Trash2, AlertCircle } from "lucide-react";
import Link from "next/link";

// --- Reusable Header Component ---
// This component provides a consistent header for your pages.
const Header = ({
  title,
  buttonText,
  buttonLink,
}: {
  title: string;
  buttonText: string;
  buttonLink: string;
}) => (
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
      {title}
    </h1>
    <Link href={buttonLink}>
      <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
        <PlusCircle size={18} />
        {buttonText}
      </button>
    </Link>
  </div>
);

// --- Main Inventory Page Component ---
const InventoryPage = () => {
  // Fetch data using the hook from your RTK Query API slice
  const { data: products, isLoading, isError } = useGetProductsQuery();

  // Define the columns for the DataGrid, matching the NEW database schema
  const columns: GridColDef[] = [
    {
      field: "sku",
      headerName: "SKU",
      flex: 0.7,
      renderCell: (params) => params.value || "N/A",
    },
    {
      field: "name",
      headerName: "Product Name",
      flex: 1.5,
    },
    {
      field: "quantity",
      headerName: "Stock",
      flex: 0.5,
      align: "center",
      headerAlign: "center",
      // Add custom styling for low stock
      cellClassName: (params) => {
        if (params.value != null && params.value <= 10) {
          // Assuming 10 is the low stock threshold
          return "font-bold text-orange-500";
        }
        return "";
      },
    },
    {
      field: "purchasePrice",
      headerName: "Cost Price",
      type: "number",
      flex: 0.7,
      valueFormatter: (value) =>
        value ? `$${Number(value).toFixed(2)}` : "$0.00",
    },
    {
      field: "salePrice",
      headerName: "Sale Price",
      type: "number",
      flex: 0.7,
      valueFormatter: (value) =>
        value ? `$${Number(value).toFixed(2)}` : "$0.00",
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.7,
      sortable: false,
      renderCell: (params) => (
        <div className="flex gap-2">
          <button
            className="p-1 text-blue-600 hover:text-blue-800"
            aria-label="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            className="p-1 text-red-600 hover:text-red-800"
            aria-label="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  // --- Render Logic ---

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Loading inventory...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500">
        <AlertCircle size={48} className="mb-4" />
        <h2 className="text-xl font-semibold">Failed to Fetch Products</h2>
        <p>
          There was an error communicating with the server. Please try again
          later.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Header
        title="Inventory"
        buttonText="Add New Product"
        buttonLink="/products/new"
      />
      <div
        style={{ height: "75vh", width: "100%" }}
        className="dark:text-white"
      >
        <DataGrid
          rows={products || []}
          columns={columns}
          getRowId={(row) => row.id} // Use the correct ID field from the new schema
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          // Styling for MUI DataGrid to work with Tailwind Dark Mode
          sx={{
            "& .MuiDataGrid-root": {
              border: "none",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #e0e0e0",
              color: "inherit",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f5f5f5",
              borderBottom: "1px solid #e0e0e0",
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "1px solid #e0e0e0",
            },
            // Dark mode styles
            "&.MuiDataGrid-root .MuiDataGrid-cell, &.MuiDataGrid-root .MuiDataGrid-columnHeaderTitle":
              {
                color: "var(--mui-text-color, #333)", // Fallback color
              },
            ".dark & .MuiDataGrid-cell, .dark & .MuiDataGrid-columnHeaderTitle":
              {
                color: "var(--mui-text-color, #fff)",
              },
            ".dark & .MuiDataGrid-columnHeaders": {
              backgroundColor: "#1f2937", // gray-800
              borderBottom: "1px solid #4b5563", // gray-600
            },
            ".dark & .MuiDataGrid-cell": {
              borderBottom: "1px solid #4b5563",
            },
            ".dark & .MuiDataGrid-footerContainer": {
              borderTop: "1px solid #4b5563",
            },
            ".dark & .MuiTablePagination-root": {
              color: "#d1d5db", // gray-300
            },
          }}
        />
      </div>
    </div>
  );
};

export default InventoryPage;
