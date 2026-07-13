// components/stocks/SimulateurForm.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { stockService } from "@/lib/api";

export default function SimulateurForm() {
  const [montant, setMontant] = useState("");

  const { data } = useQuery({
    queryKey: ["stocks"],
    queryFn: () => stockService.getAll().then((r) => r.data),
  });

  const prixVente = data?.stocks?.[0]?.prix_vente_unitaire || 28;
  const unites = montant ? Math.floor(parseInt(montant) / prixVente) : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        💳 Simulateur de vente
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Calculez combien d&apos;unités pour un montant donné
      </p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Montant (FC)
        </label>
        <input
          type="number"
          value={montant}
          onChange={(e) => setMontant(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          min="100"
          placeholder="Ex: 1000 FC"
        />
      </div>

      {unites > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            📊 <strong>{unites.toLocaleString()} unités</strong> (à {prixVente}{" "}
            FC/unité)
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Pour {parseInt(montant).toLocaleString()} FC, le client reçoit{" "}
            <strong>{unites.toLocaleString()} unités</strong>
          </p>
        </div>
      )}

      <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
        <p className="text-xs text-amber-700">
          💡 Les ventes réelles se font par code USSD. Le stock sera ajusté lors
          de la déclaration du soir.
        </p>
      </div>
    </div>
  );
}
