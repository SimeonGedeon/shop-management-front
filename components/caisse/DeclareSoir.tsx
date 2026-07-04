// components/caisse/DeclareSoir.tsx

"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { caisseService } from "@/lib/api";

interface DeclareSoirProps {
  data: any;
  onSuccess: () => void;
}

export default function DeclareSoir({ data, onSuccess }: DeclareSoirProps) {
  const caisse = data?.caisse || data?.data?.caisse || {};
  const soldesMM = data?.soldes_mm || {};

  const [liquideSoir, setLiquideSoir] = useState("");
  const [mpesaSoir, setMpesaSoir] = useState("");
  const [orangeSoir, setOrangeSoir] = useState("");
  const [airtelSoir, setAirtelSoir] = useState("");
  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      caisseService.setSoir({
        liquide_soir: parseInt(liquideSoir) || 0,
        mm_mpesa_soir: parseInt(mpesaSoir) || 0,
        mm_orange_soir: parseInt(orangeSoir) || 0,
        mm_airtel_soir: parseInt(airtelSoir) || 0,
      }),
    onSuccess: () => {
      setMessage("✅ Caisse du soir enregistrée");
      setTimeout(() => onSuccess(), 500);
    },
    onError: (err: any) => {
      setMessage(`❌ ${err.response?.data?.message || "Erreur"}`);
      setTimeout(() => setMessage(""), 5000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const liquideMatin = caisse?.liquide_matin || 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        🌆 Déclarer la caisse du soir
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Saisissez les montants restants en fin de journée
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              💵 Liquide soir (FC)
            </label>
            <input
              type="number"
              value={liquideSoir}
              onChange={(e) => setLiquideSoir(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              min="0"
              placeholder={`Matin: ${liquideMatin.toLocaleString()} FC`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📱 M-PESA soir (FC)
            </label>
            <input
              type="number"
              value={mpesaSoir}
              onChange={(e) => setMpesaSoir(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              min="0"
              placeholder={`Actuel: ${(soldesMM?.["M-PESA"] || 0).toLocaleString()} FC`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📱 Orange Money soir (FC)
            </label>
            <input
              type="number"
              value={orangeSoir}
              onChange={(e) => setOrangeSoir(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              min="0"
              placeholder={`Actuel: ${(soldesMM?.["Orange Money"] || 0).toLocaleString()} FC`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📱 Airtel Money soir (FC)
            </label>
            <input
              type="number"
              value={airtelSoir}
              onChange={(e) => setAirtelSoir(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              min="0"
              placeholder={`Actuel: ${(soldesMM?.["Airtel Money"] || 0).toLocaleString()} FC`}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full md:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-40 transition"
        >
          {mutation.isPending ? "Enregistrement..." : "💾 Enregistrer le soir"}
        </button>
      </form>
    </div>
  );
}
