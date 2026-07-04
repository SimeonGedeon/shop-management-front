// app/(protected)/articles/page.tsx

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { articleService } from "@/lib/api";
import ArticleTable from "@/components/articles/ArticleTable";
import ArticleForm from "@/components/articles/ArticleForm";

export default function ArticlesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["articles"],
    queryFn: async () => {
      const response = await articleService.getAll();
      return response.data;
    },
    refetchInterval: 30000,
  });

  return (
    <div className="space-y-6 p-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🛍️ Articles</h2>
          <p className="text-sm text-gray-500">
            Gestion des ventes d'articles divers
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
            showForm
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {showForm ? "✕ Fermer" : "+ Ajouter un article"}
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <ArticleForm
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["articles"] });
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Tableau des articles */}
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
