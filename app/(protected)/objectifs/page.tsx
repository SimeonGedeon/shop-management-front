// app/(protected)/objectifs/page.tsx - Version responsive

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function ObjectifsPage() {
  const [editCredits, setEditCredits] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const queryClient = useQueryClient();
  const [expandedJour, setExpandedJour] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<string | null>(null);
  const [libelle, setLibelle] = useState("");
  const [montant, setMontant] = useState("");
  const [message, setMessage] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["objectifs-semaine"],
    queryFn: async () => {
      const r = await api.get("/objectif");
      return r.data;
    },
  });

  const addRevenuMutation = useMutation({
    mutationFn: (date: string) =>
      api.post("/objectif/autres-revenus", {
        date,
        libelle,
        montant: parseInt(montant),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objectifs-semaine"] });
      setShowForm(null);
      setLibelle("");
      setMontant("");
      setMessage("✅ Revenu ajouté");
      setTimeout(() => setMessage(""), 3000);
    },
    onError: () => {
      setMessage("❌ Erreur");
      setTimeout(() => setMessage(""), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/objectif/autres-revenus/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objectifs-semaine"] });
      setMessage("✅ Supprimé");
      setTimeout(() => setMessage(""), 3000);
    },
  });

  const updateCreditMutation = useMutation({
    mutationFn: (id: number) =>
      api.put(`/objectif/jour/${id}`, {
        benefice_credits: parseInt(editValue),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objectifs-semaine"] });
      refetch();
      setEditCredits(null);
      setMessage("✅ Bénéfice modifié");
      setTimeout(() => setMessage(""), 3000);
    },
    onError: () => {
      setMessage("❌ Erreur");
      setTimeout(() => setMessage(""), 3000);
    },
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
      </div>
    );

  const obj = data?.data;
  if (!obj) return null;

  const jours = obj.jours || [];
  const objectif = obj.objectif_hebdomadaire;
  const progression = Math.min(obj.progression, 100);
  const depasse = obj.total_general > objectif;

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            🎯 Objectifs
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Semaine {obj.semaine}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
        >
          🔄
        </button>
      </div>

      {message && (
        <div className="p-2 sm:p-3 rounded-lg text-xs sm:text-sm font-medium bg-green-50 text-green-700 border border-green-200">
          {message}
        </div>
      )}

      {/* Résumé */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <Card
          label="Objectif"
          value={`${objectif.toLocaleString()} FC`}
          color="blue"
        />
        <Card
          label="Réalisé"
          value={`${obj.total_general.toLocaleString()} FC`}
          color={depasse ? "green" : "green"}
        />
        <Card
          label="Reste"
          value={`${obj.reste.toLocaleString()} FC`}
          color="amber"
        />
        <Card label="Progression" value={`${progression}%`} color="purple" />
      </div>

      {/* Barre */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-200">
        <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 mb-1">
          <span>0</span>
          <span>{objectif.toLocaleString()} FC</span>
        </div>
        <div className="w-full h-3 sm:h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${depasse ? "bg-green-500" : "bg-blue-500"}`}
            style={{ width: `${progression}%` }}
          />
        </div>
      </div>

      {/* Détail par jour */}
      <div className="space-y-2 sm:space-y-3">
        {jours.map((jour: any) => {
          const isExpanded = expandedJour === jour.date;
          const autresRevenus = jour.autres_revenus || [];

          return (
            <div
              key={jour.date}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setExpandedJour(isExpanded ? null : jour.date)}
                className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span
                    className={`text-sm sm:text-lg transition-transform ${isExpanded ? "rotate-90" : ""}`}
                  >
                    ▶
                  </span>
                  <div className="text-left">
                    <p className="text-sm sm:text-base font-semibold text-gray-900 capitalize">
                      {jour.jour}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-400">
                      {new Date(jour.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm sm:text-base font-bold text-gray-900">
                    {jour.total_jour > 0
                      ? `${jour.total_jour.toLocaleString()} FC`
                      : "—"}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-400">
                    Crédits: {jour.benefice_credits.toLocaleString()}
                    {autresRevenus.length > 0 &&
                      ` +${autresRevenus.reduce((s: number, r: any) => s + r.montant, 0).toLocaleString()}`}
                  </p>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 p-3 sm:p-4 bg-gray-50">
                  {/* Bénéfice crédits */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs sm:text-sm text-gray-600">
                      Bénéfice crédits
                    </span>
                    {editCredits === jour.id ? (
                      <div className="flex items-center gap-1 sm:gap-2">
                        <input
                          type="number"
                          value={editValue}
                          title="Modifier les crédits"
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-24 sm:w-32 border border-blue-300 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-gray-900 outline-none"
                          min="0"
                          autoFocus
                        />
                        <button
                          onClick={() => updateCreditMutation.mutate(jour.id)}
                          className="text-green-600 text-sm"
                        >
                          ✅
                        </button>
                        <button
                          onClick={() => setEditCredits(null)}
                          className="text-gray-400 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-bold text-blue-700">
                          {jour.benefice_credits.toLocaleString()} FC
                        </span>
                        <button
                          onClick={() => {
                            setEditCredits(jour.id);
                            setEditValue(String(jour.benefice_credits));
                          }}
                          className="text-gray-400 hover:text-blue-600 text-xs"
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Autres revenus */}
                  <div className="mb-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">
                      Autres revenus
                    </p>
                    {autresRevenus.length > 0 ? (
                      <div className="space-y-1 mb-2">
                        {autresRevenus.map((r: any) => (
                          <div
                            key={r.id}
                            className="flex items-center justify-between bg-white rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm"
                          >
                            <span className="text-gray-700">{r.libelle}</span>
                            <div className="flex items-center gap-2 sm:gap-3">
                              <span className="font-medium text-green-600">
                                +{r.montant.toLocaleString()} FC
                              </span>
                              <button
                                onClick={() => deleteMutation.mutate(r.id)}
                                className="text-red-400 hover:text-red-600 text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 mb-2">
                        Aucun autre revenu
                      </p>
                    )}

                    {showForm === jour.date ? (
                      <div className="flex gap-1 sm:gap-2">
                        <input
                          type="text"
                          value={libelle}
                          onChange={(e) => setLibelle(e.target.value)}
                          title="Libellé du revenu"
                          placeholder="Libellé"
                          className="flex-1 border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 outline-none"
                        />
                        <input
                          type="number"
                          value={montant}
                          onChange={(e) => setMontant(e.target.value)}
                          title="Montant du revenu"
                          placeholder="FC"
                          className="w-20 sm:w-24 border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 outline-none"
                        />
                        <button
                          onClick={() => addRevenuMutation.mutate(jour.date)}
                          disabled={!libelle || !montant}
                          className="px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium disabled:opacity-40"
                        >
                          OK
                        </button>
                        <button
                          onClick={() => setShowForm(null)}
                          className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowForm(jour.date)}
                        className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        + Ajouter un revenu
                      </button>
                    )}
                  </div>

                  <div className="flex justify-between border-t pt-2">
                    <span className="text-xs sm:text-sm font-semibold text-gray-800">
                      Total du jour
                    </span>
                    <span className="text-sm sm:text-base font-bold text-gray-900">
                      {jour.total_jour.toLocaleString()} FC
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Totaux */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-5 border border-gray-200">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div>
            <p className="text-[10px] sm:text-sm text-gray-500">Crédits</p>
            <p className="text-sm sm:text-xl font-bold text-blue-600">
              {obj.total_credits.toLocaleString()} FC
            </p>
          </div>
          <div>
            <p className="text-[10px] sm:text-sm text-gray-500">Autres</p>
            <p className="text-sm sm:text-xl font-bold text-green-600">
              {obj.total_autres.toLocaleString()} FC
            </p>
          </div>
          <div>
            <p className="text-[10px] sm:text-sm text-gray-500">Total</p>
            <p className="text-sm sm:text-xl font-bold text-gray-900">
              {obj.total_general.toLocaleString()} FC
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  const bg =
    {
      blue: "bg-blue-50",
      green: "bg-green-50",
      amber: "bg-amber-50",
      purple: "bg-purple-50",
    }[color] || "bg-gray-50";
  const text =
    {
      blue: "text-blue-600",
      green: "text-green-600",
      amber: "text-amber-600",
      purple: "text-purple-600",
    }[color] || "text-gray-600";
  const val =
    {
      blue: "text-blue-900",
      green: "text-green-900",
      amber: "text-amber-900",
      purple: "text-purple-900",
    }[color] || "text-gray-900";
  return (
    <div className={`${bg} rounded-xl p-3 sm:p-4 text-center`}>
      <p className={`text-[10px] sm:text-xs ${text} font-medium`}>{label}</p>
      <p className={`text-sm sm:text-xl font-bold ${val}`}>{value}</p>
    </div>
  );
}
