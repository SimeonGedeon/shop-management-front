// components/caisse/ResumeCaisse.tsx

"use client";

import DepensesList from "./DepensesList";

interface ResumeCaisseProps {
  data: any;
  isLoading: boolean;
}

export default function ResumeCaisse({ data, isLoading }: ResumeCaisseProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
        <p className="text-gray-500">Aucune donnée de caisse pour aujourd'hui</p>
      </div>
    );
  }

  const ouverture = data.ouverture || {};
  const entrees = data.entrees || {};
  const sorties = data.sorties || {};
  const declaration = data.declaration || {};

  return (
    <div className="space-y-6">
      {/* Ouverture */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-500 mb-3">🔓 SOLDE OUVERTURE</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-600">Liquide</p>
            <p className="text-xl font-bold text-blue-900">{ouverture.liquide?.toLocaleString() || 0} FC</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-green-600">Mobile Money</p>
            <p className="text-xl font-bold text-green-900">{ouverture.mm?.toLocaleString() || 0} FC</p>
          </div>
          <div className="bg-gray-100 rounded-lg p-3">
            <p className="text-xs text-gray-600">Total</p>
            <p className="text-xl font-bold text-gray-900">{ouverture.total?.toLocaleString() || 0} FC</p>
          </div>
        </div>
      </div>

      {/* Entrées */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-green-200">
        <h3 className="text-sm font-medium text-green-700 mb-3">📥 ENTRÉES DU JOUR</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Ventes crédits</span>
            <span className="font-medium text-green-600">+{entrees.ventes_credits?.toLocaleString() || 0} FC</span>
          </div>
          <div className="flex justify-between">
            <span>Ventes articles</span>
            <span className="font-medium text-green-600">+{entrees.ventes_articles?.toLocaleString() || 0} FC</span>
          </div>
          <div className="flex justify-between">
            <span>Dépôts Mobile Money</span>
            <span className="font-medium text-green-600">+{entrees.depots_mm?.toLocaleString() || 0} FC</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span>Total entrées</span>
            <span className="text-green-600">+{entrees.total?.toLocaleString() || 0} FC</span>
          </div>
        </div>
      </div>

      {/* Sorties */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-red-200">
        <h3 className="text-sm font-medium text-red-700 mb-3">📤 SORTIES DU JOUR</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Achats stock crédit</span>
            <span className="font-medium text-red-600">-{sorties.achats_stock?.toLocaleString() || 0} FC</span>
          </div>
          <div className="flex justify-between">
            <span>Achats articles</span>
            <span className="font-medium text-red-600">-{sorties.achats_articles?.toLocaleString() || 0} FC</span>
          </div>
          <div className="flex justify-between">
            <span>Retraits Mobile Money</span>
            <span className="font-medium text-red-600">-{sorties.retraits_mm?.toLocaleString() || 0} FC</span>
          </div>
          <div className="flex justify-between">
            <span>Dépenses justifiées</span>
            <span className="font-medium text-red-600">-{sorties.total_depenses?.toLocaleString() || 0} FC</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span>Total sorties</span>
            <span className="text-red-600">-{sorties.total?.toLocaleString() || 0} FC</span>
          </div>
        </div>

        {/* Liste des dépenses */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <DepensesList depenses={sorties.depenses || []} />
        </div>
      </div>

      {/* Solde théorique */}
      <div className={`rounded-xl p-6 text-white ${data.solde_theorique >= 0 ? "bg-blue-600" : "bg-red-600"}`}>
        <p className="text-sm opacity-80">💰 SOLDE THÉORIQUE</p>
        <p className="text-3xl font-bold">{data.solde_theorique?.toLocaleString() || 0} FC</p>
        <p className="text-sm mt-1 opacity-80">
          Ouverture + Entrées - Sorties
        </p>
      </div>

      {/* Déclaration (si déjà faite) */}
      {declaration.total_declare !== null && (
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-3">🌆 DÉCLARATION SOIR</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total déclaré</span>
              <p className="text-xl font-bold">{declaration.total_declare?.toLocaleString()} FC</p>
            </div>
            <div>
              <span className="text-gray-500">Écart</span>
              <p className={`text-xl font-bold ${declaration.ecart !== 0 ? "text-red-600" : "text-green-600"}`}>
                {declaration.ecart > 0 ? "+" : ""}{declaration.ecart?.toLocaleString()} FC
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}