// components/stocks/VenteForm.tsx

"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { stockService, reseauService } from "@/lib/api";

export default function VenteForm() {
  const queryClient = useQueryClient();
  const [montant, setMontant] = useState("1000");
  const [reseauId, setReseauId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const { data: reseauxData } = useQuery({
    queryKey: ["reseaux"],
    queryFn: async () => {
      const response = await reseauService.getAll();
      return Array.isArray(response.data)
        ? response.data
        : response.data?.reseaux || [];
    },
  });

  const reseaux: any[] = reseauxData || [];

  const mutation = useMutation({
    mutationFn: () =>
      stockService.vendre({
        reseau_id: reseauId!,
        montant_encaisse: parseInt(montant),
      }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      const d = response.data;
      setMessage(
        `✅ Vendu: ${d.unites_vendues} unités ${d.reseau} • +${d.benefice} FC`,
      );
      setMontant("1000");
      setTimeout(() => setMessage(""), 5000);
    },
    onError: (err: any) => {
      setMessage(
        `❌ ${err.response?.data?.message || "Erreur lors de la vente"}`,
      );
      setTimeout(() => setMessage(""), 5000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reseauId) {
      setMessage("❌ Sélectionnez un réseau");
      return;
    }
    mutation.mutate();
  };

  const montantsRapides = [100, 200, 500, 1000, 2000, 5000, 10000];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        💳 Vente rapide
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Encaisser une vente de crédit
      </p>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm font-medium mb-4 ${
            message.includes("✅")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Choix du réseau */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Réseau
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {reseaux.map((reseau: any) => (
              <button
                key={reseau.id}
                type="button"
                onClick={() => setReseauId(reseau.id)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  reseauId === reseau.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {reseau.nom}
              </button>
            ))}
          </div>
        </div>

        {/* Montant */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Montant (FC)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {montantsRapides.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMontant(String(m))}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  montant === String(m)
                    ? "bg-green-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {m.toLocaleString()} FC
              </button>
            ))}
          </div>
          <input
            aria-label="$"
            type="number"
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            min="100"
            step="100"
          />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending || !reseauId}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-40 transition"
        >
          {mutation.isPending ? "Vente en cours..." : "💰 Vendre maintenant"}
        </button>
      </form>
    </div>
  );
}
