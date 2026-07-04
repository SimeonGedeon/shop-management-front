// app/(protected)/archives/page.tsx

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function ArchivesPage() {
  const [view, setView] = useState<"liste" | "semaine" | "mois">("liste");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Liste des archives
  const { data: archivesData, isLoading } = useQuery({
    queryKey: ["archives"],
    queryFn: async () => {
      const response = await api.get("/archives");
      return response.data;
    },
  });

  // Stats semaine
  const { data: semaineData } = useQuery({
    queryKey: ["archives-semaine"],
    queryFn: async () => {
      const response = await api.get("/archives/semaine");
      return response.data;
    },
    enabled: view === "semaine",
  });

  // Stats mois (toutes les archives du mois)
  const { data: moisData } = useQuery({
    queryKey: ["archives-mois"],
    queryFn: async () => {
      const response = await api.get("/archives");
      return response.data;
    },
    enabled: view === "mois",
  });

  // Détail
  const { data: detailData } = useQuery({
    queryKey: ["archive-detail", selectedDate],
    queryFn: async () => {
      const response = await api.get(`/archives/${selectedDate}`);
      return response.data;
    },
    enabled: !!selectedDate,
  });

  const archives = archivesData?.data || [];
  const semaine = semaineData || {};
  const moisArchives = moisData?.data || [];

  // Calculs pour le mois
  const moisBenefice = moisArchives.reduce(
    (s: number, a: any) => s + (a.benefice_total || 0),
    0,
  );
  const moisVentes = moisArchives.reduce(
    (s: number, a: any) => s + (a.total_ventes_credits_fc || 0),
    0,
  );
  const moisDepots = moisArchives.reduce(
    (s: number, a: any) => s + (a.total_depots_mm || 0),
    0,
  );
  const moisRetraits = moisArchives.reduce(
    (s: number, a: any) => s + (a.total_retraits_mm || 0),
    0,
  );
  const maxMois = Math.max(
    moisBenefice,
    moisVentes,
    moisDepots,
    moisRetraits,
    1,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📦 Archives</h2>
          <p className="text-sm text-gray-500">
            Historique des journées clôturées
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {[
            { id: "liste" as const, label: "Liste", icon: "📋" },
            { id: "semaine" as const, label: "Semaine", icon: "📊" },
            { id: "mois" as const, label: "Mois", icon: "📈" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                view === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vue Liste */}
      {view === "liste" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {archives.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Aucune archive</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Date
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">
                      Ventes
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">
                      Unités
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">
                      Bénéfice
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">
                      Dépôts
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">
                      Retraits
                    </th>
                    <th className="text-center px-2 py-3 font-medium text-gray-600">
                      Détail
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {archives.map((archive: any) => (
                    <tr key={archive.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {new Date(archive.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {(
                          archive.total_ventes_credits_fc || 0
                        ).toLocaleString()}{" "}
                        FC
                      </td>
                      <td className="px-4 py-3 text-right">
                        {(archive.total_unites_vendues || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600">
                        {(archive.benefice_total || 0).toLocaleString()} FC
                      </td>
                      <td className="px-4 py-3 text-right text-green-600">
                        +{(archive.total_depots_mm || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-red-600">
                        -{(archive.total_retraits_mm || 0).toLocaleString()}
                      </td>
                      <td className="px-2 py-3 text-center">
                        <button
                          onClick={() =>
                            setSelectedDate(
                              selectedDate === archive.date
                                ? null
                                : archive.date,
                            )
                          }
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          {selectedDate === archive.date ? "✕" : "👁️"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Vue Semaine - Graphique */}
      {view === "semaine" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 text-center">
              <p className="text-xs text-gray-500">Bénéfice</p>
              <p className="text-xl font-bold text-green-600">
                {(semaine.total_benefice || 0).toLocaleString()} FC
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 text-center">
              <p className="text-xs text-gray-500">Ventes</p>
              <p className="text-xl font-bold text-blue-600">
                {(semaine.total_ventes || 0).toLocaleString()} FC
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 text-center">
              <p className="text-xs text-gray-500">Dépôts MM</p>
              <p className="text-xl font-bold text-green-600">
                +{(semaine.total_depots_mm || 0).toLocaleString()} FC
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 text-center">
              <p className="text-xs text-gray-500">Objectif</p>
              <p className="text-xl font-bold text-purple-600">
                {(semaine.objectif || 0).toLocaleString()} FC
              </p>
            </div>
          </div>

          {/* Graphique semaine */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">
              📊 Bénéfices - {semaine.debut_semaine} → {semaine.fin_semaine}
            </h3>
            {semaine.journees?.length > 0 ? (
              <div className="space-y-3">
                {semaine.journees.map((jour: any) => {
                  const max = Math.max(
                    ...semaine.journees.map((j: any) => j.benefice_total || 0),
                    1,
                  );
                  const pct = ((jour.benefice_total || 0) / max) * 100;
                  return (
                    <div key={jour.date} className="flex items-center gap-3">
                      <span className="w-24 text-xs text-gray-600 capitalize">
                        {new Date(jour.date).toLocaleDateString("fr-FR", {
                          weekday: "short",
                          day: "numeric",
                        })}
                      </span>
                      <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                        <div
                          className="absolute left-0 top-0 h-full bg-blue-500 rounded-lg transition-all flex items-center justify-end pr-2"
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        >
                          {pct > 15 && (
                            <span className="text-xs text-white font-medium">
                              {(jour.benefice_total || 0).toLocaleString()} FC
                            </span>
                          )}
                        </div>
                      </div>
                      {pct <= 15 && (
                        <span className="text-xs text-gray-500 w-20 text-right">
                          {(jour.benefice_total || 0).toLocaleString()} FC
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                Aucune donnée cette semaine
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vue Mois - Graphique */}
      {view === "mois" && (
        <div className="space-y-6">
          {/* Stats mois */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 text-center">
              <p className="text-xs text-gray-500">Bénéfice total</p>
              <p className="text-xl font-bold text-green-600">
                {moisBenefice.toLocaleString()} FC
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 text-center">
              <p className="text-xs text-gray-500">Ventes crédits</p>
              <p className="text-xl font-bold text-blue-600">
                {moisVentes.toLocaleString()} FC
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 text-center">
              <p className="text-xs text-gray-500">Dépôts MM</p>
              <p className="text-xl font-bold text-green-600">
                +{moisDepots.toLocaleString()} FC
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 text-center">
              <p className="text-xs text-gray-500">Retraits MM</p>
              <p className="text-xl font-bold text-red-600">
                -{moisRetraits.toLocaleString()} FC
              </p>
            </div>
          </div>

          {/* Graphique mois - barres groupées */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">
              📈 Résumé du mois
            </h3>
            {moisArchives.length > 0 ? (
              <div className="space-y-2">
                {moisArchives.map((archive: any) => {
                  const beneficePct =
                    maxMois > 0
                      ? ((archive.benefice_total || 0) / maxMois) * 100
                      : 0;
                  const ventesPct =
                    maxMois > 0
                      ? ((archive.total_ventes_credits_fc || 0) / maxMois) * 100
                      : 0;
                  return (
                    <div key={archive.id} className="flex items-center gap-3">
                      <span className="w-20 text-xs text-gray-600">
                        {new Date(archive.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <div className="flex-1 space-y-1">
                        {/* Barre bénéfice */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-16">
                            Bénéfice
                          </span>
                          <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded"
                              style={{ width: `${Math.max(beneficePct, 1)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-700 w-24 text-right">
                            {(archive.benefice_total || 0).toLocaleString()} FC
                          </span>
                        </div>
                        {/* Barre ventes */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-16">
                            Ventes
                          </span>
                          <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded"
                              style={{ width: `${Math.max(ventesPct, 1)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-700 w-24 text-right">
                            {(
                              archive.total_ventes_credits_fc || 0
                            ).toLocaleString()}{" "}
                            FC
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                Aucune donnée ce mois
              </div>
            )}
          </div>

          {/* Légende */}
          <div className="flex gap-4 text-xs text-gray-500 justify-center">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div> Bénéfice
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div> Ventes
            </div>
          </div>
        </div>
      )}

      {/* Modal détail */}
      {selectedDate && detailData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedDate(null)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                📋{" "}
                {new Date(selectedDate).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-600">Ventes crédits</p>
                <p className="text-lg font-bold">
                  {(detailData.total_ventes_credits_fc || 0).toLocaleString()}{" "}
                  FC
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-600">Bénéfice</p>
                <p className="text-lg font-bold">
                  {(detailData.benefice_total || 0).toLocaleString()} FC
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-purple-600">Unités vendues</p>
                <p className="text-lg font-bold">
                  {(detailData.total_unites_vendues || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3">
                <p className="text-xs text-amber-600">Dépôts / Retraits MM</p>
                <p className="text-lg font-bold">
                  +{(detailData.total_depots_mm || 0).toLocaleString()} / -
                  {(detailData.total_retraits_mm || 0).toLocaleString()} FC
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedDate(null)}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
