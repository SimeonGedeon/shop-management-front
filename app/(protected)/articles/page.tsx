// app/(protected)/articles/page.tsx

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { articleService, api } from "@/lib/api";
import ArticleTable from "@/components/articles/ArticleTable";
import ArticleForm from "@/components/articles/ArticleForm";

export default function ArticlesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  // État caisse
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

  const { data, isLoading } = useQuery({
    queryKey: ["articles"],
    queryFn: async () => {
      const r = await articleService.getAll();
      return r.data;
    },
    refetchInterval: 30000,
  });

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            🛍️ Articles
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            {isCloture ? "🔒 Journée clôturée" : "Gestion des ventes"}
          </p>
        </div>
        <div className="flex gap-2">
          {isCloture && (
            <button
              onClick={() => rouvrirMutation.mutate()}
              disabled={rouvrirMutation.isPending}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-amber-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-amber-700 disabled:opacity-40"
            >
              {rouvrirMutation.isPending ? "..." : "🔓 Rouvrir"}
            </button>
          )}
          {!isCloture && (
            <button
              onClick={() => setShowForm(!showForm)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                showForm
                  ? "bg-gray-200 text-gray-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {showForm ? "✕ Fermer" : "+ Ajouter"}
            </button>
          )}
        </div>
      </div>

      {isCloture && (
        <div className="bg-amber-50 rounded-xl p-6 text-center border border-amber-200">
          <p className="text-amber-700 text-sm">
            🔒 Journée clôturée. Cliquez sur &quot;Rouvrir&quot; pour modifier.
          </p>
        </div>
      )}

      {!isCloture && showForm && (
        <ArticleForm
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["articles"] });
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <ArticleTable
        articles={data?.articles || []}
        isLoading={isLoading}
        onUpdate={() =>
          queryClient.invalidateQueries({ queryKey: ["articles"] })
        }
      />
    </div>
  );
}
