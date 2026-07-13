// app/(protected)/caisse/page.tsx

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { caisseService, api } from "@/lib/api";
import ResumeCaisse from "@/components/caisse/ResumeCaisse";
import DeclarationSoir from "@/components/caisse/DeclarationSoir";
import ClotureJournee from "@/components/caisse/ClotureJournee";
import DettesList from "@/components/caisse/DettesList";

export default function CaissePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "resume" | "declaration" | "cloture"
  >("resume");

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

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["caisse-resume"],
    queryFn: async () => {
      const r = await caisseService.getResume();
      return r.data;
    },
    refetchInterval: 30000,
  });

  const tabs = [
    { id: "resume" as const, label: "Résumé", icon: "📊" },
    { id: "declaration" as const, label: "Soir", icon: "🌆" },
    { id: "cloture" as const, label: "Clôture", icon: "🔒" },
  ];

  const onUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ["caisse-resume"] });
    refetch();
  };

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            💵 Caisse
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            {isCloture ? "🔒 Journée clôturée" : "Suivi des entrées/sorties"}
          </p>
        </div>
        <div className="flex gap-2">
          {isCloture && (
            <button
              onClick={() => rouvrirMutation.mutate()}
              disabled={rouvrirMutation.isPending}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-amber-600 text-white rounded-lg text-xs sm:text-sm font-medium"
            >
              {rouvrirMutation.isPending ? "..." : "🔓 Rouvrir"}
            </button>
          )}
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition ${activeTab === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
          >
            <span className="sm:hidden">{tab.icon}</span>
            <span className="hidden sm:inline">
              {tab.icon} {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Blocage si clôturé */}
      {isCloture && activeTab !== "resume" && (
        <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-200">
          <p className="text-amber-700 text-sm">
            🔒 Journée clôturée. Rouvrez pour modifier.
          </p>
        </div>
      )}

      {/* Contenu */}
      {activeTab === "resume" && (
        <>
          <ResumeCaisse data={data?.data} isLoading={isLoading} />
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
            <DettesList />
          </div>
        </>
      )}

      {activeTab === "declaration" && !isCloture && (
        <DeclarationSoir data={data?.data} onSuccess={onUpdate} />
      )}

      {activeTab === "cloture" && !isCloture && (
        <ClotureJournee data={data?.data} onSuccess={onUpdate} />
      )}
    </div>
  );
}
