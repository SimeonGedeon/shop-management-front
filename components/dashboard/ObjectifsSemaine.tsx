// components/dashboard/ObjectifsSemaine.tsx

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function ObjectifsSemaine() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [libelle, setLibelle] = useState("");
  const [montant, setMontant] = useState("");
  const [message, setMessage] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["objectifs-semaine"],
    queryFn: async () => {
      const response = await api.get("/objectif");
      return response.data;
    },
    refetchInterval: 60000,
  });

  const addRevenuMutation = useMutation({
    mutationFn: () =>
      api.post("/objectif/autres-revenus", {
        date: selectedDate,
        libelle,
        montant: parseInt(montant),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objectifs-semaine"] });
      setShowForm(false);
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

  if (isLoading || !data?.data) return null;

  const obj = data.data;
  const jours = obj.jours || [];
  const objectif = obj.objectif_hebdomadaire;
  const totalGeneral = obj.total_general;
  const progression = Math.min(obj.progression, 100);
  const depasse = obj.total_general > objectif;

  // La barre max = l'objectif (pour voir la progression)
  const barMax = objectif;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          🎯 Objectifs de la semaine
        </h3>
        <span className="text-xs text-gray-400">Semaine {obj.semaine}</span>
      </div>

      {message && (
        <div className="p-3 rounded-lg text-sm font-medium mb-4 bg-green-50 text-green-700 border border-green-200">
          {message}
        </div>
      )}

      {/* Cartes résumé */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs text-blue-600 font-medium">Objectif</p>
          <p className="text-lg font-bold text-blue-900">
            {objectif.toLocaleString()} FC
          </p>
        </div>
        <div
          className={`rounded-lg p-3 text-center ${depasse ? "bg-green-100" : "bg-green-50"}`}
        >
          <p className="text-xs text-green-600 font-medium">Réalisé</p>
          <p className="text-lg font-bold text-green-900">
            {totalGeneral.toLocaleString()} FC
          </p>
          {depasse && (
            <p className="text-xs text-green-600 mt-0.5">🎉 Dépassé !</p>
          )}
        </div>
        <div
          className={`rounded-lg p-3 text-center ${obj.reste > 0 ? "bg-amber-50" : "bg-green-50"}`}
        >
          <p className="text-xs text-amber-600 font-medium">Reste</p>
          <p className="text-lg font-bold text-amber-900">
            {obj.reste.toLocaleString()} FC
          </p>
        </div>
        <div
          className={`rounded-lg p-3 text-center ${depasse ? "bg-green-100" : "bg-purple-50"}`}
        >
          <p className="text-xs text-purple-600 font-medium">Progression</p>
          <p className="text-lg font-bold text-purple-900">{progression}%</p>
        </div>
      </div>

      {/* Barre de progression globale */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>0 FC</span>
          <span>{objectif.toLocaleString()} FC</span>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${
              depasse ? "bg-green-500" : "bg-blue-500"
            }`}
            style={{
              width: `${Math.min((totalGeneral / barMax) * 100, 100)}%`,
            }}
          ></div>
        </div>
      </div>
      {depasse && (
        <p className="text-xs text-green-600 mb-4">
          Objectif dépassé de +{(totalGeneral - objectif).toLocaleString()} FC (
          {(obj.progression - 100).toFixed(1)}% au-dessus)
        </p>
      )}

      {/* Détail par jour */}
      <div className="space-y-2 mb-6">
        <p className="text-sm font-medium text-gray-600 mb-2">
          📊 Détail par jour
        </p>
        {jours.map((jour: any) => {
          // Pourcentage par rapport à l'objectif
          const pct = barMax > 0 ? (jour.total_jour / barMax) * 100 : 0;
          const pctCredits =
            barMax > 0 ? (jour.benefice_credits / barMax) * 100 : 0;

          return (
            <div key={jour.date} className="flex items-center gap-3">
              <span className="w-20 text-xs text-gray-600 capitalize">
                {jour.jour}
              </span>
              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                {/* Barre crédits */}
                {pctCredits > 0 && (
                  <div
                    className="absolute left-0 top-0 h-full bg-blue-400 rounded-full"
                    style={{ width: `${Math.min(pctCredits, 100)}%` }}
                  ></div>
                )}
              </div>
              <span className="w-24 text-right text-xs font-medium text-gray-700">
                {jour.total_jour > 0
                  ? `${jour.total_jour.toLocaleString()} FC`
                  : "—"}
              </span>
              <button
                onClick={() => {
                  setSelectedDate(jour.date);
                  setShowForm(true);
                }}
                className="text-gray-400 hover:text-blue-600 text-xs font-medium"
                title="Ajouter autre revenu"
              >
                +
              </button>
            </div>
          );
        })}
      </div>

      {/* Légende */}
      <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-400 rounded-full"></div> Bénéfices
          crédits
        </div>
        <span>
          Total :{" "}
          <strong className="text-gray-600">
            {obj.total_credits.toLocaleString()} FC
          </strong>{" "}
          +{" "}
          <strong className="text-gray-600">
            {obj.total_autres.toLocaleString()} FC
          </strong>{" "}
          autres ={" "}
          <strong className="text-gray-800">
            {totalGeneral.toLocaleString()} FC
          </strong>
        </span>
      </div>

      {/* Formulaire ajout autre revenu */}
      {showForm && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">
            + Revenu du{" "}
            {new Date(selectedDate).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
            })}
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={libelle}
              onChange={(e) => setLibelle(e.target.value)}
              placeholder="Libellé"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none"
            />
            <input
              type="number"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              placeholder="Montant FC"
              className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none"
              min="1"
            />
            <button
              onClick={() => addRevenuMutation.mutate()}
              disabled={!libelle || !montant}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40"
            >
              Ajouter
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
