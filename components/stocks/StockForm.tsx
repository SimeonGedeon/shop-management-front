// components/stocks/StockForm.tsx

"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stockService, reseauService } from "@/lib/api";

interface Reseau {
  id: number;
  nom: string;
}

interface StockFormProps {
  type: "matin" | "soir";
}

export default function StockForm({ type }: StockFormProps) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Record<number, string>>({});
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

  const reseaux: Reseau[] = reseauxData || [];

  // Pré-remplir avec les stocks existants
  const { data: stocksData } = useQuery({
    queryKey: ["stocks"],
    queryFn: () => stockService.getAll(),
  });

  useEffect(() => {
    if (stocksData?.data?.stocks && reseaux.length > 0) {
      const initial: Record<number, string> = {};
      reseaux.forEach((reseau) => {
        const stock = stocksData.data.stocks.find(
          (s: any) => s.reseau_id === reseau.id,
        );
        if (stock) {
          initial[reseau.id] = String(
            type === "matin" ? stock.stock_matin || "" : stock.stock_soir || "",
          );
        }
      });
      setValues(initial);
    }
  }, [stocksData, reseaux, type]);

  const mutation = useMutation({
    mutationFn: () => {
      const stocks = reseaux.map((reseau) => ({
        reseau_id: reseau.id,
        ...(type === "matin"
          ? { stock_matin: parseInt(values[reseau.id]) || 0 }
          : { stock_soir: parseInt(values[reseau.id]) || 0 }),
      }));

      // Type assertion to match the expected types for setMatin and setSoir
      return type === "matin"
        ? stockService.setMatin(
            stocks as { reseau_id: number; stock_matin: number }[],
          )
        : stockService.setSoir(
            stocks as { reseau_id: number; stock_soir: number }[],
          );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      setMessage(
        `✅ Stock ${type === "matin" ? "du matin" : "du soir"} enregistré`,
      );
      setTimeout(() => setMessage(""), 3000);
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

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {type === "matin" ? "🌅 Stock du matin" : "🌆 Stock du soir"}
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        {type === "matin"
          ? "Déclarez le nombre d'unités disponibles en début de journée"
          : "Déclarez le nombre d'unités restantes en fin de journée"}
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

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {reseaux.map((reseau) => (
            <div key={reseau.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {reseau.nom}
              </label>
              <input
                type="number"
                value={values[reseau.id] || ""}
                onChange={(e) =>
                  setValues({ ...values, [reseau.id]: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                min="0"
                placeholder={type === "matin" ? "5000" : "3500"}
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full md:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 transition"
        >
          {mutation.isPending ? "Enregistrement..." : "💾 Enregistrer"}
        </button>
      </form>
    </div>
  );
}
