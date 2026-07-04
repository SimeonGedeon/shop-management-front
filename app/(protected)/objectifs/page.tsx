// app/(protected)/objectifs/page.tsx

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
      const response = await api.get("/objectif");
      return response.data;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const obj = data?.data;
  if (!obj) return null;

  const jours = obj.jours || [];
  const objectif = obj.objectif_hebdomadaire;
  const progression = Math.min(obj.progression, 100);
  const depasse = obj.total_general > objectif;

  return (
    <div className="space-y-6 p-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🎯 Objectifs</h2>
          <p className="text-sm text-gray-500">Semaine {obj.semaine}</p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
        >
          🔄 Actualiser
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-lg text-sm font-medium bg-green-50 text-green-700 border border-green-200">
          {message}
        </div>
      )}

      {/* Résumé */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-xs text-blue-600 font-medium">Objectif</p>
          <p className="text-2xl font-bold text-blue-900">
            {objectif.toLocaleString()} FC
          </p>
        </div>
        <div
          className={`rounded-xl p-4 text-center ${depasse ? "bg-green-100" : "bg-green-50"}`}
        >
          <p className="text-xs text-green-600 font-medium">Réalisé</p>
          <p className="text-2xl font-bold text-green-900">
            {obj.total_general.toLocaleString()} FC
          </p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <p className="text-xs text-amber-600 font-medium">Reste</p>
          <p className="text-2xl font-bold text-amber-900">
            {obj.reste.toLocaleString()} FC
          </p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <p className="text-xs text-purple-600 font-medium">Progression</p>
          <p className="text-2xl font-bold text-purple-900">{progression}%</p>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>0 FC</span>
          <span>{objectif.toLocaleString()} FC</span>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all ${depasse ? "bg-green-500" : "bg-blue-500"}`}
            style={{ width: `${progression}%` }}
          ></div>
        </div>
      </div>

      {/* Détail par jour */}
      <div className="space-y-3">
        {jours.map((jour: any) => {
          const isExpanded = expandedJour === jour.date;
          const autresRevenus = jour.autres_revenus || [];

          return (
            <div
              key={jour.date}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* En-tête du jour */}
              <button
                onClick={() => setExpandedJour(isExpanded ? null : jour.date)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-lg ${isExpanded ? "rotate-90" : ""} transition-transform`}
                  >
                    ▶
                  </span>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 capitalize">
                      {jour.jour}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(jour.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {jour.total_jour > 0
                      ? `${jour.total_jour.toLocaleString()} FC`
                      : "—"}
                  </p>
                  <p className="text-xs text-gray-400">
                    Crédits : {jour.benefice_credits.toLocaleString()} FC
                    {autresRevenus.length > 0 &&
                      ` + ${autresRevenus.reduce((s: number, r: any) => s + r.montant, 0).toLocaleString()} FC autres`}
                  </p>
                </div>
              </button>

              {/* Détail expandé */}
              {isExpanded && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  {/* Bénéfice crédits */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">
                      Bénéfice crédits
                    </span>
                    {editCredits === jour.id ? (
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor={`edit-credits-${jour.id}`}
                          className="sr-only"
                        >
                          Modifier les crédits pour {jour.jour}
                        </label>
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-32 border border-blue-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 outline-none"
                          id={`edit-credits-${jour.id}`}
                          min="0"
                          autoFocus
                        />
                        <button
                          onClick={() => updateCreditMutation.mutate(jour.id)}
                          className="text-green-600 text-sm font-medium"
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
                        <span className="font-bold text-blue-700">
                          {jour.benefice_credits.toLocaleString()} FC
                        </span>
                        <button
                          onClick={() => {
                            setEditCredits(jour.id);
                            setEditValue(String(jour.benefice_credits));
                          }}
                          className="text-gray-400 hover:text-blue-600 text-xs"
                          title="Modifier"
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Autres revenus */}
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Autres revenus
                    </p>
                    {autresRevenus.length > 0 ? (
                      <div className="space-y-1 mb-2">
                        {autresRevenus.map((r: any) => (
                          <div
                            key={r.id}
                            className="flex items-center justify-between bg-white rounded-lg px-3 py-2 text-sm"
                          >
                            <span className="text-gray-700">{r.libelle}</span>
                            <div className="flex items-center gap-3">
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
                      <div className="flex gap-2">
                        <label
                          htmlFor={`libelle-${jour.date}`}
                          className="sr-only"
                        >
                          Libellé du revenu
                        </label>
                        <input
                          type="text"
                          value={libelle}
                          onChange={(e) => setLibelle(e.target.value)}
                          placeholder="Libellé"
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none"
                          id={`libelle-${jour.date}`}
                        />
                        <label
                          htmlFor={`montant-${jour.date}`}
                          className="sr-only"
                        >
                          Montant du revenu
                        </label>
                        <input
                          type="number"
                          value={montant}
                          onChange={(e) => setMontant(e.target.value)}
                          placeholder="FC"
                          className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none"
                          id={`montant-${jour.date}`}
                        />
                        <button
                          onClick={() => addRevenuMutation.mutate(jour.date)}
                          disabled={!libelle || !montant}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-40"
                        >
                          OK
                        </button>
                        <button
                          onClick={() => setShowForm(null)}
                          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowForm(jour.date)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        + Ajouter un revenu
                      </button>
                    )}
                  </div>

                  {/* Total jour */}
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-gray-800">
                      Total du jour
                    </span>
                    <span className="font-bold text-gray-900">
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
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">Total crédits</p>
            <p className="text-xl font-bold text-blue-600">
              {obj.total_credits.toLocaleString()} FC
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total autres</p>
            <p className="text-xl font-bold text-green-600">
              {obj.total_autres.toLocaleString()} FC
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total général</p>
            <p className="text-xl font-bold text-gray-900">
              {obj.total_general.toLocaleString()} FC
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
