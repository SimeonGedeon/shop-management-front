// components/home/MarketInfo.tsx

"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";

export default function MarketInfo() {
  const [rates, setRates] = useState({
    usd: 2850,
    eur: 3050,
    gbp: 3600,
  });

  useEffect(() => {
    // Simuler un appel API pour les taux de change
    const fetchRates = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setRates({
          usd: 2850,
          eur: 3050,
          gbp: 3600,
        });
      } catch (error) {
        console.error("Erreur:", error);
      }
    };

    fetchRates();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card title="💰 Taux de change">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">🇺🇸 USD → FC</span>
            <span className="font-semibold text-gray-900">
              {rates.usd.toLocaleString()} FC
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">🇪🇺 EUR → FC</span>
            <span className="font-semibold text-gray-900">
              {rates.eur.toLocaleString()} FC
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">🇬🇧 GBP → FC</span>
            <span className="font-semibold text-gray-900">
              {rates.gbp.toLocaleString()} FC
            </span>
          </div>
        </div>
      </Card>

      <Card title="🕐 Informations pratiques">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Ouverture</span>
            <span className="font-medium text-gray-900">8h - 20h</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Localisation</span>
            <span className="font-medium text-gray-900">Kinshasa, RDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Services</span>
            <span className="font-medium text-gray-900">
              M-PESA, Orange, Airtel
            </span>
          </div>
        </div>
      </Card>

      <Card title="💡 Services Mobile Money">
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2 text-gray-700">
            <span className="text-green-600">✅</span> Dépôt M-PESA
          </li>
          <li className="flex items-center gap-2 text-gray-700">
            <span className="text-green-600">✅</span> Retrait Orange Money
          </li>
          <li className="flex items-center gap-2 text-gray-700">
            <span className="text-green-600">✅</span> Retrait Airtel Money
          </li>
          <li className="flex items-center gap-2 text-gray-700">
            <span className="text-green-600">✅</span> Vente de crédits
          </li>
        </ul>
      </Card>
    </div>
  );
}
