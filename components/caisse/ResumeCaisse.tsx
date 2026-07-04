// components/caisse/ResumeCaisse.tsx - Version responsive

"use client";

import DepensesList from "./DepensesList";

export default function ResumeCaisse({
  data,
  isLoading,
}: {
  data: any;
  isLoading: boolean;
}) {
  if (isLoading)
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse"
          >
            <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-5 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  if (!data)
    return (
      <div className="bg-white rounded-xl p-6 text-center text-sm text-gray-500">
        Aucune donnée
      </div>
    );

  const o = data.ouverture || {};
  const e = data.entrees || {};
  const s = data.sorties || {};
  const decl = data.declaration || {};

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Ouverture */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-5 border border-gray-200">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
          🔓 Solde ouverture
        </h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-2 sm:p-3">
            <p className="text-[10px] sm:text-xs text-blue-600">Liquide</p>
            <p className="text-sm sm:text-xl font-bold text-blue-900">
              {(o.liquide || 0).toLocaleString()} FC
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-2 sm:p-3">
            <p className="text-[10px] sm:text-xs text-green-600">MM</p>
            <p className="text-sm sm:text-xl font-bold text-green-900">
              {(o.mm || 0).toLocaleString()} FC
            </p>
          </div>
          <div className="bg-gray-100 rounded-lg p-2 sm:p-3">
            <p className="text-[10px] sm:text-xs text-gray-600">Total</p>
            <p className="text-sm sm:text-xl font-bold text-gray-900">
              {(o.total || 0).toLocaleString()} FC
            </p>
          </div>
        </div>
      </div>

      {/* Entrées */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-5 border border-green-200">
        <h3 className="text-xs sm:text-sm font-semibold text-green-700 mb-2">
          📥 Entrées du jour
        </h3>
        <div className="space-y-1.5 text-xs sm:text-sm">
          <Ligne label="Ventes crédits" v={e.ventes_credits} c="green" />
          <Ligne label="Ventes articles" v={e.ventes_articles} c="green" />
          <Ligne label="Dépôts MM" v={e.depots_mm} c="green" />
          <div className="flex justify-between border-t pt-1.5 font-semibold text-gray-800">
            <span>Total</span>
            <span className={e.total > 0 ? "text-green-600" : "text-gray-500"}>
              +{(e.total || 0).toLocaleString()} FC
            </span>
          </div>
        </div>
      </div>

      {/* Sorties */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-5 border border-red-200">
        <h3 className="text-xs sm:text-sm font-semibold text-red-700 mb-2">
          📤 Sorties du jour
        </h3>
        <div className="space-y-1.5 text-xs sm:text-sm">
          <Ligne label="Achats stock" v={s.achats_stock} c="red" />
          <Ligne label="Achats articles" v={s.achats_articles} c="red" />
          <Ligne label="Retraits MM" v={s.retraits_mm} c="red" />
          <Ligne label="Dépenses" v={s.total_depenses} c="red" />
          <div className="flex justify-between border-t pt-1.5 font-semibold text-gray-800">
            <span>Total</span>
            <span className={s.total > 0 ? "text-red-600" : "text-gray-500"}>
              -{(s.total || 0).toLocaleString()} FC
            </span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <DepensesList depenses={s.depenses || []} />
        </div>
      </div>

      {/* Solde théorique */}
      <div
        className={`rounded-xl p-4 sm:p-6 text-white ${(data.solde_theorique || 0) >= 0 ? "bg-blue-600" : "bg-red-600"}`}
      >
        <p className="text-xs sm:text-sm font-medium opacity-80">
          💰 Solde théorique
        </p>
        <p className="text-xl sm:text-3xl font-bold">
          {(data.solde_theorique || 0).toLocaleString()} FC
        </p>
        <p className="text-[10px] sm:text-sm mt-1 opacity-80">
          Ouverture + Entrées - Sorties
        </p>
      </div>

      {/* Déclaration */}
      {decl.total_declare !== null && (
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-5 border border-gray-200">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
            🌆 Déclaration soir
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
            <div>
              <span className="text-gray-500">Déclaré</span>
              <p className="text-base sm:text-xl font-bold">
                {(decl.total_declare || 0).toLocaleString()} FC
              </p>
            </div>
            <div>
              <span className="text-gray-500">Écart</span>
              <p
                className={`text-base sm:text-xl font-bold ${decl.ecart !== 0 ? "text-red-600" : "text-green-600"}`}
              >
                {(decl.ecart || 0).toLocaleString()} FC
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Ligne({ label, v, c }: { label: string; v: number; c: string }) {
  const color = c === "green" ? "text-green-600" : "text-red-600";
  return (
    <div className="flex justify-between">
      <span className="text-gray-700">{label}</span>
      <span className={`font-medium ${v > 0 ? color : "text-gray-500"}`}>
        {c === "green" ? "+" : "-"}
        {(v || 0).toLocaleString()} FC
      </span>
    </div>
  );
}
