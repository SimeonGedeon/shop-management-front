// app/(protected)/stocks/page.tsx

"use client";

import { useState } from "react";
import StockForm from "@/components/stocks/StockForm";
import StockTable from "@/components/stocks/StockTable";
import VenteForm from "@/components/stocks/VenteForm";
import AchatForm from "@/components/stocks/AchatForm";

export default function StocksPage() {
  const [activeTab, setActiveTab] = useState<
    "matin" | "soir" | "vente" | "achat"
  >("matin");

  const tabs = [
    { id: "matin" as const, label: "Matin", icon: "🌅" },
    { id: "soir" as const, label: "Soir", icon: "🌆" },
    { id: "vente" as const, label: "Vente", icon: "💳" },
    { id: "achat" as const, label: "Achat", icon: "📦" },
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          📦 Gestion des stocks
        </h2>
        <p className="text-gray-500 text-sm">Suivi des unités par réseau</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Formulaire selon l'onglet */}
      {activeTab === "matin" && <StockForm type="matin" />}
      {activeTab === "soir" && <StockForm type="soir" />}
      {activeTab === "vente" && <VenteForm />}
      {activeTab === "achat" && <AchatForm />}

      {/* Tableau */}
      <StockTable />
    </div>
  );
}
