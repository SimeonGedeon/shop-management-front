// app/(protected)/dashboard/page.tsx

"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/lib/api";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import SalesChart from "@/components/dashboard/SalesChart";
import StockProgress from "@/components/dashboard/StockProgress";

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await dashboardService.get();
      return response.data;
    },
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse"
            >
              <div className="h-3 bg-gray-200 rounded w-16 mb-2" />
              <div className="h-6 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 font-medium">Erreur de chargement</p>
          <button
            onClick={() => refetch()}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const d = data?.data || data;
  if (!d) return null;

  const objectif = d.objectif || {};
  const progression = Math.min(objectif.progression || 0, 100);
  const depasse = (objectif.progression || 0) > 100;
  const alertes = d.alertes || [];
  const transactions = d.transactions_recentes || [];
  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Tableau de bord
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {d.date &&
              new Date(d.date).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
          </p>
        </div>
        <span className="text-[10px] sm:text-xs text-gray-400">Auto 60s</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <Card
          label="Ventes jour"
          value={`${(d.ventes_jour || 0).toLocaleString()} FC`}
          color="blue"
          icon="💰"
        />
        <Card
          label="Solde MM"
          value={`${(d.solde_mm || 0).toLocaleString()} FC`}
          color="green"
          icon="📱"
        />
        <Card
          label="En caisse"
          value={`${(d.en_caisse || 0).toLocaleString()} FC`}
          color="purple"
          icon="💵"
        />
        <Card
          label="Dettes actives"
          value={`${(d.objectif_detail?.total_autres || 0).toLocaleString()} FC`}
          color="red"
          icon="📋"
        />
      </div>

      {/* Stocks rapides */}
      {d.stocks?.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {d.stocks.map((s: any) => {
            const pct =
              s.stock_matin > 0
                ? Math.round(
                    ((s.stock_soir ?? s.stock_matin) / s.stock_matin) * 100,
                  )
                : 0;
            return (
              <div
                key={s.id}
                className="bg-white rounded-xl shadow-sm p-3 border border-gray-200"
              >
                <p className="text-xs font-medium text-gray-700 truncate">
                  {s.reseau_nom}
                </p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  {s.stock_soir ?? s.stock_matin}
                </p>
                <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pct <= 20 ? "bg-red-500" : pct <= 50 ? "bg-amber-500" : "bg-green-500"}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  sur {s.stock_matin} unités
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Objectif + Alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Objectif */}
        <div className="lg:col-span-2 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-blue-100 text-xs sm:text-sm font-medium">
                Objectif hebdo
              </p>
              <p className="text-xl sm:text-3xl font-bold">
                {(objectif.objectif_hebdomadaire || 0).toLocaleString()} FC
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl sm:text-2xl font-bold">{progression}%</p>
              <p className="text-blue-100 text-xs">
                {depasse ? "🚀 Dépassé" : "Atteint"}
              </p>
            </div>
          </div>
          <div className="w-full h-2 sm:h-3 rounded-full bg-blue-400/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${progression}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs sm:text-sm text-blue-100">
            <span>Réalisé: {(objectif.realise || 0).toLocaleString()} FC</span>
            <span>Reste: {(objectif.restant || 0).toLocaleString()} FC</span>
          </div>
        </div>

        {/* Alertes */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
            Alertes
            {alertes.length > 0 && (
              <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {alertes.length}
              </span>
            )}
          </h3>
          {alertes.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {alertes.map((a: any, i: number) => (
                <div
                  key={i}
                  className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${
                    a.type === "danger"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : a.type === "warning"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : a.type === "success"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  <p className="font-medium">{a.message}</p>
                  {a.detail && (
                    <p className="text-[10px] sm:text-xs mt-0.5 opacity-75">
                      {a.detail}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-2xl mb-1">✅</div>
              <p className="text-gray-500 text-xs sm:text-sm">
                Tout est normal
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Graphique + Stocks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-4">
            📊 Bénéfices de la semaine
          </h3>
          <SalesChart
            data={d.objectif?.progression_journaliere?.map((j: any) => ({
              jour: j.jour?.substring(0, 3) || "",
              benefice: j.benefice || 0,
            }))}
          />
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-4">
            📦 État des stocks
          </h3>
          <StockProgress data={{ stocks: d.stocks }} />
        </div>
      </div>

      {/* Stats mois */}
      {d.stats_mois && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <MiniCard
            label="Ventes mois"
            value={`${(d.stats_mois.ventes_mois || 0).toLocaleString()} FC`}
          />
          <MiniCard
            label="Unités mois"
            value={(d.stats_mois.unites_mois || 0).toLocaleString()}
          />
          <MiniCard
            label="Bénéfice mois"
            value={`${(d.stats_mois.benefice_mois || 0).toLocaleString()} FC`}
          />
        </div>
      )}

      {/* Dernières transactions */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900">
              📋 Dernières transactions
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 py-2 font-medium text-gray-600">
                    Heure
                  </th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">
                    Type
                  </th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">
                    Détail
                  </th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">
                    Montant
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-500">
                      {tx.heure || "—"}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                          tx.type === "vente"
                            ? "bg-green-100 text-green-700"
                            : tx.type === "depot"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {tx.reseau || tx.operateur || "—"}
                    </td>
                    <td
                      className={`px-3 py-2 text-right font-medium ${tx.type === "retrait" ? "text-red-600" : "text-green-600"}`}
                    >
                      {tx.montant?.toLocaleString()} FC
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Liens rapides */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        <QuickLink href="/stocks" label="Stocks" icon="📦" />
        <QuickLink href="/articles" label="Articles" icon="🛍️" />
        <QuickLink href="/mm" label="MM" icon="📱" />
        <QuickLink href="/caisse" label="Caisse" icon="💵" />
        <QuickLink href="/objectifs" label="Objectifs" icon="🎯" />
        <QuickLink href="/archives" label="Archives" icon="📦" />
      </div>
    </div>
  );
}

function Card({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: string;
}) {
  const txt: Record<string, string> = {
    blue: "text-blue-700",
    green: "text-green-700",
    purple: "text-purple-700",
    orange: "text-orange-700",
    red: "text-red-700",
  };
  return (
    <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base sm:text-lg">{icon}</span>
        <p className="text-[10px] sm:text-xs text-gray-500">{label}</p>
      </div>
      <p
        className={`text-sm sm:text-xl font-bold ${txt[color] || "text-gray-900"} truncate`}
      >
        {value}
      </p>
    </div>
  );
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-200 text-center">
      <p className="text-[10px] sm:text-xs text-gray-500">{label}</p>
      <p className="text-sm sm:text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}

function QuickLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl shadow-sm p-3 border border-gray-200 text-center hover:bg-gray-50 transition"
    >
      <span className="text-lg sm:text-xl">{icon}</span>
      <p className="text-[10px] sm:text-xs text-gray-600 mt-1">{label}</p>
    </Link>
  );
}
