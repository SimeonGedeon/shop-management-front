// app/(protected)/stocks/page.tsx

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import StockForm from "@/components/stocks/StockForm";
import StockTable from "@/components/stocks/StockTable";
import SimulateurForm from "@/components/stocks/SimulateurForm";
import AchatForm from "@/components/stocks/AchatForm";

export default function StocksPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "matin" | "soir" | "simulateur" | "achat"
  >("matin");

  const { data: caisseData, refetch: refetchCaisse } = useQuery({
    queryKey: ["caisse-etat"],
    queryFn: async () => {
      const r = await api.get("/caisse/etat");
      return r.data;
    },
  });

  const isCloture = caisseData?.caisse?.statut === "cloture";

  const rouvrirMutation = useMutation({
    mutationFn: () => api.post("/caisse/rouvrir"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caisse-etat"] });
      queryClient.invalidateQueries({ queryKey: ["caisse-resume"] });
      refetchCaisse();
    },
  });

  const tabs = [
    { id: "matin" as const, label: "Matin", icon: "🌅" },
    { id: "soir" as const, label: "Soir", icon: "🌆" },
    { id: "simulateur" as const, label: "Simulateur", icon: "💳" },
    { id: "achat" as const, label: "Achat", icon: "📦" },
  ];

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            📦 Stocks
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            {isCloture ? "🔒 Journée clôturée" : "🟢 Suivi des unités"}
          </p>
        </div>
        {isCloture && (
          <button
            onClick={() => rouvrirMutation.mutate()}
            disabled={rouvrirMutation.isPending}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-amber-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-amber-700 disabled:opacity-40"
          >
            {rouvrirMutation.isPending ? "..." : "🔓 Rouvrir"}
          </button>
        )}
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            disabled={isCloture}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500"
            } ${isCloture ? "opacity-50 cursor-not-allowed" : "hover:text-gray-700"}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {isCloture ? (
        <div className="bg-amber-50 rounded-xl p-6 text-center border border-amber-200">
          <p className="text-amber-700 text-sm">
            🔒 Journée clôturée. Cliquez sur &quot;Rouvrir&quot; pour modifier.
          </p>
        </div>
      ) : (
        <>
          {activeTab === "matin" && <StockForm type="matin" />}
          {activeTab === "soir" && <StockForm type="soir" />}
          {activeTab === "simulateur" && <SimulateurForm />}
          {activeTab === "achat" && <AchatForm />}
        </>
      )}

      <StockTable />
    </div>
  );
}
