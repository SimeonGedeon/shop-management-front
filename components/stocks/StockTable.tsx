// components/stocks/StockTable.tsx

"use client";

import { useQuery } from "@tanstack/react-query";
import { stockService } from "@/lib/api";

export default function StockTable() {
  const { data, isLoading } = useQuery({
    queryKey: ["stocks"],
    queryFn: () => stockService.getAll(),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const stocks = data?.data?.stocks || [];

  if (stocks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
        <p className="text-gray-500 font-medium">
          Aucun stock enregistré aujourd&apos;hui
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Déclarez le stock du matin pour commencer
        </p>
      </div>
    );
  }

  // Récupérer les prix depuis le premier stock
  const prixVente = stocks[0]?.prix_vente_unitaire || 28;
  const prixAchat = stocks[0]?.prix_achat_unitaire || 22.66;

  // Calculer les totaux avec la bonne formule
  const totaux = stocks.reduce(
    (acc: any, stock: any) => {
      const unitesVendues =
        stock.unites_vendues ||
        Math.max(
          0,
          stock.stock_matin - (stock.stock_soir ?? stock.stock_matin),
        );
      const ventesTotales = unitesVendues * prixVente;
      const coutAchat = unitesVendues * prixAchat;
      const benefice = ventesTotales - coutAchat;

      acc.matin += stock.stock_matin || 0;
      acc.achats += stock.achats_jour || 0;
      acc.soir += stock.stock_soir || 0;
      acc.vendues += unitesVendues;
      acc.ventes += ventesTotales;
      acc.cout += coutAchat;
      acc.benefice += benefice;
      return acc;
    },
    {
      matin: 0,
      achats: 0,
      soir: 0,
      vendues: 0,
      ventes: 0,
      cout: 0,
      benefice: 0,
    },
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">
          📋 État des stocks du jour
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Réseau
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Matin
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Achats
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
              {/* <th className="text-right px-4 py-3 font-medium text-gray-600">
                Coût
              </th> */}
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Bénéfice
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stocks.map((stock: any) => {
              // Recalculer systématiquement (ne pas se fier à la BDD)
              const unitesVendues =
                stock.unites_vendues ||
                Math.max(
                  0,
                  stock.stock_matin - (stock.stock_soir ?? stock.stock_matin),
                );
              const ventesTotales = unitesVendues * prixVente;
              const coutAchat = unitesVendues * prixAchat;
              const benefice = ventesTotales - coutAchat;

              return (
                <tr key={stock.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {stock.reseau_nom ||
                      stock.reseau?.nom ||
                      `Réseau ${stock.reseau_id}`}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {(stock.stock_matin || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {stock.achats_jour > 0 ? (
                      <span className="text-blue-600 font-medium">
                        +{stock.achats_jour.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {stock.stock_soir != null
                      ? stock.stock_soir.toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-medium ${unitesVendues > 0 ? "text-orange-600" : "text-gray-400"}`}
                    >
                      {unitesVendues > 0
                        ? `-${unitesVendues.toLocaleString()}`
                        : "0"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {ventesTotales.toLocaleString()} FC
                  </td>
                  {/* <td className="px-4 py-3 text-right text-red-500">
                    -{coutAchat.toLocaleString()} FC
                  </td> */}
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-bold ${benefice > 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      +{benefice.toLocaleString()} FC
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t-2 border-gray-200 font-semibold text-sm">
              <td className="px-4 py-3 text-gray-900">Total</td>
              <td className="px-4 py-3 text-right">
                {totaux.matin.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right text-blue-600">
                +{totaux.achats.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right">
                {totaux.soir.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right text-orange-600">
                -{totaux.vendues.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right">
                {totaux.ventes.toLocaleString()} FC
              </td>
              {/* <td className="px-4 py-3 text-right text-red-500">
                -{totaux.cout.toLocaleString()} FC
              </td> */}
              <td className="px-4 py-3 text-right text-green-600">
                +{totaux.benefice.toLocaleString()} FC
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
