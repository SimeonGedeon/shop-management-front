// components/caisse/DeclarationSoir.tsx

"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { caisseService } from "@/lib/api";

interface DeclarationSoirProps {
  data: any;
  onSuccess: () => void;
}

export default function DeclarationSoir({
  data,
  onSuccess,
}: DeclarationSoirProps) {
  const soldesMM = data?.soldes_mm_actuels || {};
  const declaration = data?.declaration || {};

  const [liquide, setLiquide] = useState("");
  const [mpesa, setMpesa] = useState("");
  const [orange, setOrange] = useState("");
  const [airtel, setAirtel] = useState("");
  const [message, setMessage] = useState("");

  const dejaDeclare = declaration.total_declare !== null;

  const mutation = useMutation({
    mutationFn: () =>
      caisseService.setSoir({
        liquide_soir: parseInt(liquide) || 0,
        mm_mpesa_soir: parseInt(mpesa) || 0,
        mm_orange_soir: parseInt(orange) || 0,
        mm_airtel_soir: parseInt(airtel) || 0,
      }),
    onSuccess: (response) => {
      const d = response.data;
      setMessage(`✅ Déclaré. Écart: ${d.ecart?.toLocaleString()} FC`);
      setTimeout(() => onSuccess(), 1000);
    },
    onError: (err: any) => {
      setMessage(`❌ ${err.response?.data?.message || "Erreur"}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liquide && !mpesa && !orange && !airtel) return;
    mutation.mutate();
  };

  if (dejaDeclare) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-center">
        <p className="text-lg mb-2">✅ Déclaration déjà effectuée</p>
        <p className="text-gray-500">
          Total déclaré :{" "}
          <strong>{declaration.total_declare?.toLocaleString()} FC</strong>
        </p>
        <p
          className={`text-sm mt-1 ${declaration.ecart !== 0 ? "text-red-600" : "text-green-600"}`}
        >
          Écart : {declaration.ecart?.toLocaleString()} FC
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        🌆 Déclaration du soir
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Saisissez ce que vous avez en main
      </p>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm font-medium mb-4 ${message.includes("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              💵 Liquide en main (FC)
            </label>
            <input
              type="number"
              value={liquide}
              onChange={(e) => setLiquide(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 outline-none"
              min="0"
              placeholder="Ex: 50000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📱 M-PESA (FC)
            </label>
            <input
              type="number"
              value={mpesa}
              onChange={(e) => setMpesa(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 outline-none"
              min="0"
              placeholder={`Actuel: ${soldesMM["M-PESA"]?.toLocaleString() || 0} FC`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📱 Orange Money (FC)
            </label>
            <input
              type="number"
              value={orange}
              onChange={(e) => setOrange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 outline-none"
              min="0"
              placeholder={`Actuel: ${soldesMM["Orange Money"]?.toLocaleString() || 0} FC`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📱 Airtel Money (FC)
            </label>
            <input
              type="number"
              value={airtel}
              onChange={(e) => setAirtel(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 outline-none"
              min="0"
              placeholder={`Actuel: ${soldesMM["Airtel Money"]?.toLocaleString() || 0} FC`}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full md:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-40 transition"
        >
          {mutation.isPending ? "Enregistrement..." : "💾 Déclarer le soir"}
        </button>
      </form>
    </div>
  );
}
