// app/(protected)/archives/page.tsx

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ArchivesPage() {
  const [view, setView] = useState<"liste" | "semaine">("liste");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Liste des archives
  const { data: archivesData, isLoading } = useQuery({
    queryKey: ["archives"],
    queryFn: async () => {
      const response = await api.get("/archives");
      return response.data;
    },
  });

  // Stats de la semaine
  const { data: semaineData } = useQuery({
    queryKey: ["archives-semaine"],
    queryFn: async () => {
      const response = await api.get("/archives/semaine");
      return response.data;
    },
    enabled: view === "semaine",
  });

  // Détail d'une archive
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📦 Archives</h2>
          <p className="text-sm text-gray-500">
            Historique des journées clôturées
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setView("liste")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              view === "liste"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500"
            }`}
          >
            📋 Liste
          </button>
          <button
            onClick={() => setView("semaine")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              view === "semaine"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500"
            }`}
          >
            📊 Semaine
          </button>
        </div>
      </div>

      {/* Vue Liste */}
      {view === "liste" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {archives.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucune archive trouvée
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Date
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">
                      Ventes crédits
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">
                      Unités
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">
                      Bénéfice
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">
                      Dépôts MM
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">
                      Retraits MM
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">
                      Cumul semaine
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
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {(
                          archive.total_ventes_credits_fc || 0
                        ).toLocaleString()}{" "}
                        FC
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {(archive.total_unites_vendues || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`font-semibold ${(archive.benefice_total || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {(archive.benefice_total || 0).toLocaleString()} FC
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-green-600">
                        +{(archive.total_depots_mm || 0).toLocaleString()} FC
                      </td>
                      <td className="px-4 py-3 text-right text-red-600">
                        -{(archive.total_retraits_mm || 0).toLocaleString()} FC
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-2 bg-blue-500 rounded-full"
                              style={{
                                width: `${Math.min(((archive.cumul_hebdo || 0) / (archive.objectif_hebdo || 150000)) * 100, 100)}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {(archive.cumul_hebdo || 0).toLocaleString()} FC
                          </span>
                        </div>
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

      {/* Vue Semaine */}
      {view === "semaine" && (
        <div className="space-y-4">
          {/* Stats semaine */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 text-center">
              <p className="text-xs text-gray-500">Bénéfice total</p>
              <p className="text-xl font-bold text-green-600">
                {(semaine.total_benefice || 0).toLocaleString()} FC
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 text-center">
              <p className="text-xs text-gray-500">Ventes crédits</p>
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

          {/* Jours de la semaine */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                📅 {semaine.debut_semaine} → {semaine.fin_semaine}
              </h3>
            </div>
            {semaine.journees?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-2 font-medium text-gray-600">
                        Date
                      </th>
                      <th className="text-right px-4 py-2 font-medium text-gray-600">
                        Bénéfice
                      </th>
                      <th className="text-right px-4 py-2 font-medium text-gray-600">
                        Cumul
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {semaine.journees.map((jour: any) => (
                      <tr key={jour.date} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">
                          {new Date(jour.date).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3 text-right text-green-600 font-semibold">
                          {(jour.benefice_total || 0).toLocaleString()} FC
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {(jour.cumul_hebdo || 0).toLocaleString()} FC
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                Aucune donnée cette semaine
              </div>
            )}
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
