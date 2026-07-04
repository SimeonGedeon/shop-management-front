// components/caisse/HistoriqueCaisse.tsx

"use client";

import { useQuery } from "@tanstack/react-query";
import { caisseService } from "@/lib/api";

export default function HistoriqueCaisse() {
  const { data, isLoading } = useQuery({
    queryKey: ["caisse-historique"],
    queryFn: async () => {
      const response = await caisseService.getHistorique({ limit: 7 });
      return response.data;
    },
  });

  const historique = data?.caisses || data?.data?.caisses || [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="animate-pulse h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (historique.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">📋 Historique récent</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-2 font-medium text-gray-600">
                Date
              </th>
              <th className="text-right px-4 py-2 font-medium text-gray-600">
                Liquide Matin
              </th>
              <th className="text-right px-4 py-2 font-medium text-gray-600">
                Liquide Soir
              </th>
              <th className="text-right px-4 py-2 font-medium text-gray-600">
                Écart
              </th>
              <th className="text-center px-4 py-2 font-medium text-gray-600">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {historique.map((jour: any, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900">
                  {new Date(jour.date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })}
                </td>
                <td className="px-4 py-3 text-right">
                  {(jour.liquide_matin || 0).toLocaleString()} FC
                </td>
                <td className="px-4 py-3 text-right">
                  {jour.liquide_soir != null
                    ? `${jour.liquide_soir.toLocaleString()} FC`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  {jour.ecart_liquide != null ? (
                    <span
                      className={
                        jour.ecart_liquide !== 0
                          ? "text-red-600 font-medium"
                          : "text-green-600"
                      }
                    >
                      {jour.ecart_liquide > 0 ? "+" : ""}
                      {jour.ecart_liquide.toLocaleString()} FC
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      jour.statut === "cloture"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {jour.statut}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
