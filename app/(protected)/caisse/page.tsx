// app/(protected)/caisse/page.tsx

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { caisseService } from "@/lib/api";
import ResumeCaisse from "@/components/caisse/ResumeCaisse";
import DeclarationSoir from "@/components/caisse/DeclarationSoir";
import DepensesList from "@/components/caisse/DepensesList";
import ClotureJournee from "@/components/caisse/ClotureJournee";

export default function CaissePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "resume" | "declaration" | "cloture"
  >("resume");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["caisse-resume"],
    queryFn: async () => {
      const response = await caisseService.getResume();
      return response.data;
    },
    refetchInterval: 30000,
  });

  const tabs = [
    { id: "resume" as const, label: "Résumé", icon: "📊" },
    { id: "declaration" as const, label: "Déclaration soir", icon: "🌆" },
    { id: "cloture" as const, label: "Clôture", icon: "🔒" },
  ];

  const onUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ["caisse-resume"] });
    refetch();
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">💵 Caisse</h2>
          <p className="text-sm text-gray-500">
            Suivi des entrées, sorties et clôture journalière
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
        >
          🔄 Actualiser
        </button>
      </div>

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

      {activeTab === "resume" && (
        <ResumeCaisse data={data?.data} isLoading={isLoading} />
      )}

      {activeTab === "declaration" && (
        <DeclarationSoir data={data?.data} onSuccess={onUpdate} />
      )}

      {activeTab === "cloture" && (
        <ClotureJournee data={data?.data} onSuccess={onUpdate} />
      )}
    </div>
  );
}
