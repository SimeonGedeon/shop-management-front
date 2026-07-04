// components/caisse/DepensesList.tsx

"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { caisseService } from "@/lib/api";

interface Depense {
  id: number;
  motif: string;
  montant: number;
}

interface DepensesListProps {
  depenses: Depense[];
}

export default function DepensesList({ depenses }: DepensesListProps) {
  const [showForm, setShowForm] = useState(false);
  const [motif, setMotif] = useState("");
  const [montant, setMontant] = useState("");

  const addMutation = useMutation({
    mutationFn: () =>
      caisseService.addDepense({ motif, montant: parseInt(montant) }),
    onSuccess: () => {
      setShowForm(false);
      setMotif("");
      setMontant("");
      window.location.reload();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => caisseService.deleteDepense(id),
    onSuccess: () => window.location.reload(),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">
          Dépenses justifiées
        </span>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          + Ajouter
        </button>
      </div>

      {showForm && (
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Motif"
            className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs"
          />
          <input
            type="number"
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            placeholder="Montant FC"
            className="w-24 border border-gray-300 rounded px-2 py-1 text-xs"
            min="1"
          />
          <button
            onClick={() => addMutation.mutate()}
            className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium"
          >
            OK
          </button>
        </div>
      )}

      {depenses.length > 0 && (
        <div className="space-y-1">
          {depenses.map((d) => (
            <div
              key={d.id}
              className="flex justify-between text-xs text-gray-600 bg-red-50 rounded px-2 py-1"
            >
              <span>{d.motif}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  -{d.montant.toLocaleString()} FC
                </span>
                <button
                  onClick={() => deleteMutation.mutate(d.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
