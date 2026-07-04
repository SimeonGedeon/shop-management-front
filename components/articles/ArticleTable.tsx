// components/articles/ArticleTable.tsx

"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { articleService } from "@/lib/api";

interface Article {
  id: number;
  designation: string;
  prix_achat: number;
  prix_unitaire: number;
  nombre_pieces: number;
  restant_soir: number | null;
  pieces_vendues: number;
  ventes_totales: number;
  cout_ventes: number;
  cout_par_piece: number;
  benefice: number;
  created_at: string;
}

interface ArticleTableProps {
  articles: Article[];
  isLoading: boolean;
  onUpdate: () => void;
}

export default function ArticleTable({
  articles,
  isLoading,
  onUpdate,
}: ArticleTableProps) {
  const [editId, setEditId] = useState<number | null>(null);
  const [restantSoir, setRestantSoir] = useState("");

  const updateMutation = useMutation({
    mutationFn: () => articleService.updateSoir(editId!, parseInt(restantSoir)),
    onSuccess: () => {
      setEditId(null);
      setRestantSoir("");
      onUpdate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => articleService.delete(id),
    onSuccess: () => onUpdate(),
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
        <p className="text-gray-400 text-lg mb-1">🛍️</p>
        <p className="text-gray-500 font-medium">Aucun article aujourd'hui</p>
        <p className="text-gray-400 text-sm mt-1">
          Ajoutez un article pour commencer
        </p>
      </div>
    );
  }

  const totaux = articles.reduce(
    (acc, a) => ({
      achats: acc.achats + a.prix_achat,
      pieces: acc.pieces + a.nombre_pieces,
      restant: acc.restant + (a.restant_soir ?? 0),
      vendues: acc.vendues + a.pieces_vendues,
      ventes: acc.ventes + a.ventes_totales,
      cout: acc.cout + a.cout_ventes,
      benefice: acc.benefice + a.benefice,
    }),
    {
      achats: 0,
      pieces: 0,
      restant: 0,
      vendues: 0,
      ventes: 0,
      cout: 0,
      benefice: 0,
    },
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">📋 Articles du jour</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Désignation
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Achat
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                P.U.
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Matin
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Soir
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Vendues
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Ventes
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Coût
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Bénéfice
              </th>
              <th className="text-center px-2 py-3 font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {article.designation}
                </td>
                <td className="px-4 py-3 text-right text-gray-700">
                  {article.prix_achat.toLocaleString()} FC
                </td>
                <td className="px-4 py-3 text-right text-gray-700">
                  {article.prix_unitaire} FC
                </td>
                <td className="px-4 py-3 text-right text-gray-700">
                  {article.nombre_pieces}
                </td>
                <td className="px-4 py-3 text-right">
                  {editId === article.id ? (
                    <div className="flex items-center gap-1 justify-end">
                      <input
                        type="number"
                        value={restantSoir}
                        onChange={(e) => setRestantSoir(e.target.value)}
                        className="w-16 border border-blue-300 rounded px-2 py-1 text-sm text-center"
                        min="0"
                        max={article.nombre_pieces}
                        autoFocus
                        aria-label="Chiffre"
                      />
                      <button
                        onClick={() => updateMutation.mutate()}
                        className="text-green-600 hover:text-green-800 text-xs font-medium"
                      >
                        ✅
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="text-gray-400 hover:text-gray-600 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <span
                      className={
                        article.restant_soir !== null
                          ? "text-gray-700"
                          : "text-gray-400"
                      }
                    >
                      {article.restant_soir !== null
                        ? article.restant_soir
                        : "—"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={
                      article.pieces_vendues > 0
                        ? "text-orange-600 font-medium"
                        : "text-gray-400"
                    }
                  >
                    {article.pieces_vendues > 0
                      ? `-${article.pieces_vendues}`
                      : "0"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-700">
                  {article.ventes_totales > 0
                    ? `${article.ventes_totales.toLocaleString()} FC`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right text-red-500">
                  {article.cout_ventes > 0
                    ? `-${article.cout_ventes.toLocaleString()} FC`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`font-bold ${article.benefice > 0 ? "text-green-600" : article.benefice < 0 ? "text-red-600" : "text-gray-400"}`}
                  >
                    {article.benefice !== 0
                      ? `${article.benefice > 0 ? "+" : ""}${article.benefice.toLocaleString()} FC`
                      : "—"}
                  </span>
                </td>
                <td className="px-2 py-3">
                  <div className="flex justify-center gap-1">
                    {article.restant_soir === null && (
                      <button
                        onClick={() => {
                          setEditId(article.id);
                          setRestantSoir("");
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition text-xs"
                        title="Déclarer le soir"
                      >
                        🌆
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`Supprimer "${article.designation}" ?`)) {
                          deleteMutation.mutate(article.id);
                        }
                      }}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition text-xs"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t-2 border-gray-200 font-semibold text-sm">
              <td className="px-4 py-3">Total</td>
              <td className="px-4 py-3 text-right">
                {totaux.achats.toLocaleString()} FC
              </td>
              <td className="px-4 py-3"></td>
              <td className="px-4 py-3 text-right">{totaux.pieces}</td>
              <td className="px-4 py-3 text-right">{totaux.restant}</td>
              <td className="px-4 py-3 text-right text-orange-600">
                -{totaux.vendues}
              </td>
              <td className="px-4 py-3 text-right">
                {totaux.ventes.toLocaleString()} FC
              </td>
              <td className="px-4 py-3 text-right text-red-500">
                -{totaux.cout.toLocaleString()} FC
              </td>
              <td className="px-4 py-3 text-right text-green-600">
                +{totaux.benefice.toLocaleString()} FC
              </td>
              <td className="px-2 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
