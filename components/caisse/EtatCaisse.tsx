// components/caisse/EtatCaisse.tsx

"use client";

interface EtatCaisseProps {
  data: any;
  isLoading: boolean;
}

export default function EtatCaisse({ data, isLoading }: EtatCaisseProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const caisse = data?.caisse || data?.data?.caisse || {};
  const soldesMM = data?.soldes_mm || {};
  const statut = caisse?.statut || "ouvert";

  const totalMM =
    (soldesMM?.["M-PESA"] || 0) +
    (soldesMM?.["Orange Money"] || 0) +
    (soldesMM?.["Airtel Money"] || 0);
  const totalCaisse =
    (caisse?.liquide_soir ?? caisse?.liquide_matin ?? 0) + totalMM;

  return (
    <div className="space-y-6">
      {/* Statut */}
      <div
        className={`p-4 rounded-xl text-white ${
          statut === "cloture" ? "bg-gray-600" : "bg-green-600"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Statut de la journée</p>
            <p className="text-2xl font-bold capitalize">{statut}</p>
          </div>
          <div className="text-4xl">{statut === "cloture" ? "🔒" : "🟢"}</div>
        </div>
      </div>

      {/* Cartes Liquidité + MM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Liquide */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            💵 Liquidité
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Matin</span>
              <span className="font-semibold">
                {(caisse?.liquide_matin || 0).toLocaleString()} FC
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Soir</span>
              <span className="font-semibold">
                {caisse?.liquide_soir != null
                  ? `${caisse.liquide_soir.toLocaleString()} FC`
                  : "—"}
              </span>
            </div>
            {caisse?.ecart_liquide != null && (
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600 text-sm">Écart</span>
                <span
                  className={`font-bold ${caisse.ecart_liquide !== 0 ? "text-red-600" : "text-green-600"}`}
                >
                  {caisse.ecart_liquide > 0 ? "+" : ""}
                  {caisse.ecart_liquide.toLocaleString()} FC
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Money */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            📱 Mobile Money
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">M-PESA</span>
              <span className="font-semibold">
                {(soldesMM?.["M-PESA"] || 0).toLocaleString()} FC
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Orange Money</span>
              <span className="font-semibold">
                {(soldesMM?.["Orange Money"] || 0).toLocaleString()} FC
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Airtel Money</span>
              <span className="font-semibold">
                {(soldesMM?.["Airtel Money"] || 0).toLocaleString()} FC
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-700 text-sm font-medium">
                Total MM
              </span>
              <span className="font-bold text-blue-600">
                {totalMM.toLocaleString()} FC
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Total Caisse */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <p className="text-blue-100 text-sm">Total en caisse</p>
        <p className="text-3xl font-bold">{totalCaisse.toLocaleString()} FC</p>
        <p className="text-blue-200 text-sm mt-1">Liquide + Mobile Money</p>
      </div>
    </div>
  );
}
