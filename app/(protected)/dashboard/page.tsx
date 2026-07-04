// app/(protected)/dashboard/page.tsx

"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/lib/api";
import StatsCards from "@/components/dashboard/StatsCards";
import StockProgress from "@/components/dashboard/StockProgress";
import SalesChart from "@/components/dashboard/SalesChart";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await dashboardService.get();
      console.log("🔍 Réponse brute dashboard:", response);
      console.log("🔍 response.data:", response.data);
      return response.data;
    },
    refetchInterval: 30000,
    retry: 1, // Réessayer une fois en cas d'erreur
  });

  // Debug pour comprendre la structure
  useEffect(() => {
    if (data) {
      console.log("✅ Données dashboard reçues:", data);
      console.log("✅ Structure:", {
        success: data?.success,
        hasData: !!data?.data,
        hasDirectAccess: !!data?.ventes_jour,
        keys: Object.keys(data || {}),
      });
    }
    if (error) {
      console.error("❌ Erreur dashboard:", error);
      // Afficher les détails de l'erreur
      if ((error as any).response) {
        console.error("Status:", (error as any).response.status);
        console.error("Data:", (error as any).response.data);
      }
    }
  }, [data, error]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Erreur complète:", error);
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">
            Erreur de chargement des données
          </p>
          <div className="text-left mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-700 font-medium">
              Détails techniques :
            </p>
            <p className="text-xs text-red-600 mt-1 font-mono">
              {(error as any)?.message || "Erreur inconnue"}
            </p>
            {(error as any)?.response?.data?.message && (
              <p className="text-xs text-red-600 mt-1">
                Backend: {(error as any).response.data.message}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              console.log("🔄 Nouvelle tentative...");
              refetch();
            }}
            className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Extraire les données selon la structure de réponse
  // Structure possible: { success: true, data: {...} } ou { success: true, settings: {...} }
  const dashboardData = data?.data || data;

  console.log("📊 Données parsées:", dashboardData);

  if (!dashboardData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">
            Aucune donnée disponible pour le moment
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Rafraîchir
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tableau de bord</h2>
          <p className="text-gray-500 text-sm mt-1">
            Vue d'ensemble de votre activité
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {dashboardData?.date &&
              `Date: ${new Date(dashboardData.date).toLocaleDateString(
                "fr-FR",
                {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                },
              )}`}
          </p>
        </div>
        <div className="text-xs text-gray-400">
          Mis à jour automatiquement toutes les 30s
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards data={dashboardData} />

      {/* Section Objectif + Alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Objectif hebdomadaire */}
        <div className="lg:col-span-2 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-100 text-sm font-medium">
                Objectif hebdomadaire
              </p>
              <p className="text-3xl font-bold mt-1">
                {dashboardData?.objectif?.objectif_hebdomadaire?.toLocaleString() ||
                  0}{" "}
                FC
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {dashboardData?.objectif?.progression || 0}%
              </p>
              <p className="text-blue-100 text-sm">Atteint</p>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mt-4 w-full h-3 rounded-full bg-blue-400/30 overflow-hidden">
            <div
              className="h-3 rounded-full bg-white transition-all duration-500 ease-out"
              style={{
                width: `${Math.min(dashboardData?.objectif?.progression || 0, 100)}%`,
              }}
            ></div>
          </div>

          <div className="mt-3 flex justify-between text-sm text-blue-100">
            <p>
              Réalisé: {dashboardData?.objectif?.realise?.toLocaleString() || 0}{" "}
              FC
            </p>
            <p className="font-medium">
              Reste: {dashboardData?.objectif?.restant?.toLocaleString() || 0}{" "}
              FC
            </p>
          </div>
        </div>

        {/* Alertes rapides */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Alertes
            {dashboardData?.nombre_alertes > 0 && (
              <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                {dashboardData.nombre_alertes}
              </span>
            )}
          </h3>

          {dashboardData?.alertes?.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {dashboardData.alertes.map((alerte: any, index: number) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg text-sm ${
                    alerte.type === "danger"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : alerte.type === "warning"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : alerte.type === "success"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  <p className="font-medium">{alerte.message}</p>
                  {alerte.detail && (
                    <p className="text-xs mt-1 opacity-75">{alerte.detail}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-gray-500 text-sm">Tout est normal</p>
              <p className="text-gray-400 text-xs mt-1">
                Aucune alerte pour le moment
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Graphique + Stocks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ventes des 7 derniers jours
          </h3>
          <SalesChart />
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            État des stocks
          </h3>
          <StockProgress data={{ stocks: dashboardData?.stocks }} />
        </div>
      </div>

      {/* Stats mensuelles */}
      {dashboardData?.stats_mois && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Ventes du mois</p>
            <p className="text-2xl font-bold text-gray-900">
              {dashboardData.stats_mois.ventes_mois?.toLocaleString() || 0} FC
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Unités vendues (mois)</p>
            <p className="text-2xl font-bold text-gray-900">
              {dashboardData.stats_mois.unites_mois?.toLocaleString() || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Bénéfice du mois</p>
            <p className="text-2xl font-bold text-green-600">
              {dashboardData.stats_mois.benefice_mois?.toLocaleString() || 0} FC
            </p>
          </div>
        </div>
      )}

      {/* Transactions récentes */}
      {dashboardData?.transactions_recentes?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Dernières transactions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Heure
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Réseau/Opérateur
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">
                    Montant
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.transactions_recentes.map(
                  (transaction: any, index: number) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-gray-700 text-xs">
                        {transaction.heure ||
                          new Date(transaction.created_at).toLocaleTimeString(
                            "fr-FR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.type === "vente"
                              ? "bg-green-100 text-green-700"
                              : transaction.type === "depot"
                                ? "bg-blue-100 text-blue-700"
                                : transaction.type === "retrait"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {transaction.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700 text-sm">
                        {transaction.reseau || transaction.operateur || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900 text-sm">
                        {transaction.montant?.toLocaleString() || 0} FC
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`text-xs font-medium ${
                            transaction.statut === "succès"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.statut}
                        </span>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Debug en développement - à retirer en production */}
      {process.env.NODE_ENV === "development" && (
        <details className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <summary className="text-xs text-gray-500 cursor-pointer font-medium">
            🔍 Debug: Données brutes
          </summary>
          <pre className="text-xs text-gray-600 mt-2 overflow-auto max-h-96">
            {JSON.stringify(dashboardData, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
