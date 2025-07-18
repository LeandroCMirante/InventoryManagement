"use client";

import { Truck } from "lucide-react";

// Define the props that this component will receive
interface PurchaseFormActionsProps {
  subtotal: number;
  shippingCost: string; // Keep as string to match the form state
  totalCost: number;
  isSubmitting: boolean; // To disable the button while saving
}

const PurchaseFormActions = ({
  subtotal,
  shippingCost,
  totalCost,
  isSubmitting,
}: PurchaseFormActionsProps) => {
  return (
    <div className="flex flex-col items-end gap-6 border-t pt-6 dark:border-gray-700 md:flex-row md:justify-between">
      {/* Summary Box */}
      <div className="w-full md:w-1/3">
        <div className="space-y-2 rounded-lg border p-4 dark:border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
            <span className="font-medium dark:text-white">
              R$ {subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Frete:</span>
            <span className="font-medium dark:text-white">
              R$ {(parseFloat(shippingCost) || 0).toFixed(2)}
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

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Truck size={18} />
        {isSubmitting ? "Salvando..." : "Salvar Compra"}
      </button>
    </div>
  );
};

export default PurchaseFormActions;
