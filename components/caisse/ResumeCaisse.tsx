// components/caisse/ResumeCaisse.tsx

"use client";

import DepensesList from "./DepensesList";

interface ResumeCaisseProps {
  data: any;
  isLoading: boolean;
}

function LigneEntree({
  label,
  valeur,
  total,
}: {
  label: string;
  valeur: number;
  total?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className={total ? "font-semibold text-gray-800" : "text-gray-700"}>
        {label}
      </span>
      <span
        className={`${total ? "font-bold" : "font-semibold"} ${valeur > 0 ? "text-green-600" : "text-gray-500"}`}
      >
        +{valeur.toLocaleString()} FC
      </span>
    </div>
  );
}

function LigneSortie({
  label,
  valeur,
  total,
}: {
  label: string;
  valeur: number;
  total?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className={total ? "font-semibold text-gray-800" : "text-gray-700"}>
        {label}
      </span>
      <span
        className={`${total ? "font-bold" : "font-semibold"} ${valeur > 0 ? "text-red-600" : "text-gray-500"}`}
      >
        -{valeur.toLocaleString()} FC
      </span>
    </div>
  );
}

export default function ResumeCaisse({ data, isLoading }: ResumeCaisseProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 animate-pulse"
          >
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
        <p className="text-gray-500">
          Aucune donnée de caisse pour aujourd'hui
        </p>
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
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          🔓 SOLDE OUVERTURE
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs font-medium text-blue-600">Liquide</p>
            <p className="text-xl font-bold text-blue-900">
              {ouverture.liquide?.toLocaleString() || 0} FC
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs font-medium text-green-600">Mobile Money</p>
            <p className="text-xl font-bold text-green-900">
              {ouverture.mm?.toLocaleString() || 0} FC
            </p>
          </div>
          <div className="bg-gray-100 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-600">Total</p>
            <p className="text-xl font-bold text-gray-900">
              {ouverture.total?.toLocaleString() || 0} FC
            </p>
          </div>
        </div>
      </div>

      {/* Entrées */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-green-200">
        <h3 className="text-sm font-semibold text-green-700 mb-3">
          📥 ENTRÉES DU JOUR
        </h3>
        <div className="space-y-2 text-sm">
          <LigneEntree
            label="Ventes crédits"
            valeur={entrees.ventes_credits || 0}
          />
          <LigneEntree
            label="Ventes articles"
            valeur={entrees.ventes_articles || 0}
          />
          <LigneEntree
            label="Dépôts Mobile Money"
            valeur={entrees.depots_mm || 0}
          />
          <div className="flex justify-between border-t pt-2">
            <span className="font-semibold text-gray-800">Total entrées</span>
            <span
              className={`font-bold ${(entrees.total || 0) > 0 ? "text-green-600" : "text-gray-500"}`}
            >
              +{(entrees.total || 0).toLocaleString()} FC
            </span>
          </div>
        </div>
      </div>

      {/* Sorties */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-red-200">
        <h3 className="text-sm font-semibold text-red-700 mb-3">
          📤 SORTIES DU JOUR
        </h3>
        <div className="space-y-2 text-sm">
          <LigneSortie
            label="Achats stock crédit"
            valeur={sorties.achats_stock || 0}
          />
          <LigneSortie
            label="Achats articles"
            valeur={sorties.achats_articles || 0}
          />
          <LigneSortie
            label="Retraits Mobile Money"
            valeur={sorties.retraits_mm || 0}
          />
          <LigneSortie
            label="Dépenses justifiées"
            valeur={sorties.total_depenses || 0}
          />
          <div className="flex justify-between border-t pt-2">
            <span className="font-semibold text-gray-800">Total sorties</span>
            <span
              className={`font-bold ${(sorties.total || 0) > 0 ? "text-red-600" : "text-gray-500"}`}
            >
              -{(sorties.total || 0).toLocaleString()} FC
            </span>
          </div>
        </div>

        {/* Dépenses */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <DepensesList depenses={sorties.depenses || []} />
        </div>
      </div>

      {/* Solde théorique */}
      <div
        className={`rounded-xl p-6 text-white ${(data.solde_theorique || 0) >= 0 ? "bg-blue-600" : "bg-red-600"}`}
      >
        <p className="text-sm font-medium opacity-80">💰 SOLDE THÉORIQUE</p>
        <p className="text-3xl font-bold">
          {(data.solde_theorique || 0).toLocaleString()} FC
        </p>
        <p className="text-sm mt-1 opacity-80">Ouverture + Entrées - Sorties</p>
      </div>

      {/* Déclaration soir */}
      {declaration.total_declare !== null && (
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            🌆 DÉCLARATION SOIR
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total déclaré</span>
              <p className="text-xl font-bold text-gray-900">
                {declaration.total_declare?.toLocaleString()} FC
              </p>
            </div>
            <div>
              <span className="text-gray-500">Écart</span>
              <p
                className={`text-xl font-bold ${declaration.ecart !== 0 ? "text-red-600" : "text-green-600"}`}
              >
                {declaration.ecart > 0 ? "+" : ""}
                {declaration.ecart?.toLocaleString()} FC
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
