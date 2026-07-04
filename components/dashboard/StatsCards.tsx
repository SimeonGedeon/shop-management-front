// components/dashboard/StatsCards.tsx
"use client";

import { DollarSign, ShoppingCart, Wallet, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  data: any;
}

export default function StatsCards({ data }: StatsCardsProps) {
  const stats = [
    {
      title: "Ventes du jour",
      value: data?.ventes_jour || 0,
      unit: "FC",
      icon: ShoppingCart,
      color: "blue",
      variation: data?.variation_ventes || 0,
    },
    {
      title: "Solde Mobile Money",
      value: data?.solde_mm || 0,
      unit: "FC",
      icon: Wallet,
      color: "green",
      variation: null,
    },
    {
      title: "En caisse",
      value: data?.en_caisse || 0,
      unit: "FC",
      icon: DollarSign,
      color: "purple",
      variation: null,
    },
    {
      title: "Unités vendues",
      value: data?.unites_vendues || 0,
      unit: "unités",
      icon: TrendingUp,
      color: "orange",
      variation: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const colorClasses = {
          blue: "bg-blue-50 text-blue-600",
          green: "bg-green-50 text-green-600",
          purple: "bg-purple-50 text-purple-600",
          orange: "bg-orange-50 text-orange-600",
        }[stat.color];

        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${colorClasses}`}>
                <Icon className="h-5 w-5" />
              </div>
              {stat.variation !== null && stat.variation !== 0 && (
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    stat.variation > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {stat.variation > 0 ? "+" : ""}
                  {stat.variation}%
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {typeof stat.value === "number"
                ? stat.value.toLocaleString()
                : stat.value}
            </p>
            <p className="text-xs text-gray-400 mt-1">{stat.unit}</p>
          </div>
        );
      })}
    </div>
  );
}
