// components/caisse/ClotureJournee.tsx

"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { caisseService } from "@/lib/api";

interface ClotureJourneeProps {
  data: any;
  onSuccess: () => void;
}

export default function ClotureJournee({
  data,
  onSuccess,
}: ClotureJourneeProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");

  const statut = data?.statut || "ouvert";
  const declaration = data?.declaration || {};
  const ecart = declaration?.ecart;
  const soldeTheorique = data?.solde_theorique || 0;

  const mutation = useMutation({
    mutationFn: () => caisseService.cloturer(),
    onSuccess: () => {
      setMessage("✅ Journée clôturée avec succès");
      setTimeout(() => onSuccess(), 1000);
    },
    onError: (err: any) => {
      setMessage(`❌ ${err.response?.data?.message || "Erreur"}`);
    },
  });

  if (statut === "cloture") {
    return (
      <div className="bg-gray-100 rounded-xl p-8 text-center border border-gray-200">
        <div className="text-4xl mb-3">🔒</div>
        <p className="text-gray-700 font-medium">Journée déjà clôturée</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        🔒 Clôture de journée
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Archive les données du jour et verrouille la caisse.
      </p>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm font-medium mb-4 ${message.includes("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
        >
          {message}
        </div>
      )}

      {/* Résumé avant clôture */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm space-y-2">
        <div className="flex justify-between">
          <span>Solde théorique</span>
          <span className="font-medium">
            {soldeTheorique.toLocaleString()} FC
          </span>
        </div>
        {declaration.total_declare !== null && (
          <>
            <div className="flex justify-between">
              <span>Total déclaré</span>
              <span className="font-medium">
                {declaration.total_declare?.toLocaleString()} FC
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Écart</span>
              <span
                className={`font-bold ${ecart !== 0 ? "text-red-600" : "text-green-600"}`}
              >
                {ecart?.toLocaleString()} FC {ecart !== 0 ? "⚠️" : "✅"}
              </span>
            </div>
          </>
        )}
      </div>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full md:w-auto bg-red-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition"
        >
          🔒 Clôturer la journée
        </button>
      ) : (
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <p className="text-red-800 font-medium mb-3">
            ⚠️ Confirmer la clôture ?
          </p>
          {ecart !== 0 && ecart !== null && (
            <p className="text-red-600 text-sm mb-3">
              Un écart de {ecart?.toLocaleString()} FC sera enregistré.
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-40"
            >
              {mutation.isPending ? "..." : "✅ Oui, clôturer"}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
