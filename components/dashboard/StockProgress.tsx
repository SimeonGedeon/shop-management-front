// components/dashboard/StockProgress.tsx

"use client";

import { useQuery } from "@tanstack/react-query";
import { stockService } from "@/lib/api";

interface StockItem {
  id: number;
  stock_soir?: number;
  reseau?: {
    nom?: string;
    unites_reference?: number;
  };
}

interface StockProgressProps {
  data?: {
    stocks?: StockItem[];
  };
}

const colors: Record<string, string> = {
  Orange: "bg-orange-500",
  Vodacom: "bg-red-500",
  Airtel: "bg-yellow-500",
  Africell: "bg-green-500",
};

export default function StockProgress({ data }: StockProgressProps) {
  const { data: stocksData, isLoading } = useQuery({
    queryKey: ["stocks-progress"],
    queryFn: () => stockService.getAll(),
    refetchInterval: 30000,
    enabled: !data?.stocks,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-center h-48">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  const stocks: StockItem[] = data?.stocks || stocksData?.data?.stocks || [];

  if (stocks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Stocks disponibles
        </h3>
        <p className="text-gray-500 text-center py-8">
          Aucun stock enregistré
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Stocks disponibles
      </h3>
      <div className="space-y-4">
        {stocks.map((stock) => {
          const total = stock.reseau?.unites_reference || 1324;
          const current = stock.stock_soir || 0;
          const percentage = Math.min((current / total) * 100, 100);
          const isLow = current < 500;
          const color = colors[stock.reseau?.nom || ""] || "bg-blue-500";

          return (
            <div key={stock.id}>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">
                  {stock.reseau?.nom || "Inconnu"}
                </span>
                <span
                  className={`font-medium ${isLow ? "text-red-600" : "text-gray-600"}`}
                >
                  {current.toLocaleString()} / {total.toLocaleString()}
                </span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${color} ${
                    isLow ? 'bg-red-500' : ''
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              {isLow && (
                <p className="text-xs text-red-500 mt-1">⚠️ Stock bas - Recharger</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
