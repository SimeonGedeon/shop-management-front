// components/home/PriceCards.tsx

"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Reseau {
  id: number;
  nom: string;
  prix_vente_unitaire: number;
}

export default function PriceCards() {
  const [reseaux, setReseaux] = useState<Reseau[]>([
    { id: 1, nom: "Orange", prix_vente_unitaire: 28 },
    { id: 2, nom: "Vodacom", prix_vente_unitaire: 28 },
    { id: 3, nom: "Airtel", prix_vente_unitaire: 28 },
    { id: 4, nom: "Africell", prix_vente_unitaire: 28 },
  ]);

  useEffect(() => {
    const fetchReseaux = async () => {
      try {
        const response = await api.get("/settings");
        const settings = response.data.settings;
        if (settings?.reseaux_config) {
          setReseaux(
            settings.reseaux_config.map((r: any) => ({
              id: r.id,
              nom: r.nom,
              prix_vente_unitaire: r.prix_vente || 28,
            })),
          );
        }
      } catch (error) {
        console.log("Utilisation des valeurs par défaut");
      }
    };

    fetchReseaux();
  }, []);

  const colors: Record<string, string> = {
    Orange: "border-orange-500",
    Vodacom: "border-red-500",
    Airtel: "border-yellow-500",
    Africell: "border-green-500",
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {reseaux.map((reseau) => (
        <div
          key={reseau.id}
          className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${
            colors[reseau.nom] || "border-blue-500"
          } border border-t-0 border-r-0 border-b-0`}
        >
          <p className="text-sm text-gray-500">{reseau.nom}</p>
          <p className="text-2xl font-bold text-gray-900">
            {reseau.prix_vente_unitaire} FC
          </p>
          <p className="text-xs text-gray-400">par unité</p>
        </div>
      ))}
    </div>
  );
}
