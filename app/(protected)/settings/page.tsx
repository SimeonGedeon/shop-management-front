// app/(protected)/settings/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "@/lib/api";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    objectif_hebdomadaire: "",
    prix_vente_unitaire: "",
    seuil_alerte_stock: "",
    seuil_alerte_ecart: "",
    taux_achat_fc: "",
    taux_echange_fc: "",
    unites_par_10usd: "",
    seuil_max_dette: "",
  });

  // Charger les settings
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await settingsService.get();
      return response.data;
    },
  });

  // Charger le taux actif
  const { data: tauxData } = useQuery({
    queryKey: ["taux-actif"],
    queryFn: async () => {
      const response = await api.get("/taux/actif");
      return response.data;
    },
  });

  // Initialiser le formulaire
  useEffect(() => {
    if (data?.settings) {
      const s = data.settings;
      setFormData((prev) => ({
        ...prev,
        objectif_hebdomadaire: s.objectif_hebdomadaire?.toString() || "",
        prix_vente_unitaire: s.prix_vente_unitaire?.toString() || "",
        seuil_alerte_stock: s.seuil_alerte_stock?.toString() || "",
        seuil_alerte_ecart: s.seuil_alerte_ecart?.toString() || "",
      }));
    }
  }, [data]);

  useEffect(() => {
    if (tauxData?.taux) {
      const t = tauxData.taux;
      setFormData((prev) => ({
        ...prev,
        taux_achat_fc: t.taux_achat_fc?.toString() || "",
        taux_echange_fc: t.taux_echange_fc?.toString() || "",
        unites_par_10usd: t.unites_par_10usd?.toString() || "",
      }));
    }
  }, [tauxData]);

  // Mutation pour les paramètres généraux
  const settingsMutation = useMutation({
    mutationFn: (payload: any) => settingsService.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setMessage("✅ Paramètres enregistrés avec succès");
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (err: any) => {
      setMessage("❌ " + (err.response?.data?.message || "Erreur"));
      setTimeout(() => setMessage(""), 5000);
    },
  });

  // Mutation pour les taux (route différente)
  const tauxMutation = useMutation({
    mutationFn: (payload: any) => api.post("/taux", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taux-actif"] });
      setMessage("✅ Taux mis à jour avec succès");
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (err: any) => {
      setMessage("❌ " + (err.response?.data?.message || "Erreur taux"));
      setTimeout(() => setMessage(""), 5000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    // Sauvegarder les paramètres généraux
    settingsMutation.mutate({
      prix_vente_unitaire: parseInt(formData.prix_vente_unitaire) || 0,
      seuil_alerte_stock: parseInt(formData.seuil_alerte_stock) || 0,
      seuil_alerte_ecart: parseInt(formData.seuil_alerte_ecart) || 0,
      objectif_hebdomadaire: parseInt(formData.objectif_hebdomadaire) || 0,
    });

    // Sauvegarder les taux (seulement si modifiés)
    if (
      formData.taux_achat_fc &&
      formData.taux_echange_fc &&
      formData.unites_par_10usd
    ) {
      tauxMutation.mutate({
        taux_achat_fc: parseInt(formData.taux_achat_fc),
        taux_echange_fc: parseInt(formData.taux_echange_fc),
        unites_par_10usd: parseInt(formData.unites_par_10usd),
      });
    }
  };

  const getInputClasses = (fieldName: string) => {
    return errors[fieldName]
      ? "w-full border-red-300 border rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
      : "w-full border-gray-300 border rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  const prixAchatUnitaire =
    formData.taux_achat_fc && formData.unites_par_10usd
      ? (
          parseInt(formData.taux_achat_fc) / parseInt(formData.unites_par_10usd)
        ).toFixed(2)
      : "0";

  const margeUnitaire =
    formData.prix_vente_unitaire &&
    formData.taux_achat_fc &&
    formData.unites_par_10usd
      ? (
          (parseInt(formData.prix_vente_unitaire) || 0) -
          parseInt(formData.taux_achat_fc) / parseInt(formData.unites_par_10usd)
        ).toFixed(2)
      : "0";

  const benefice10usd =
    formData.unites_par_10usd &&
    formData.prix_vente_unitaire &&
    formData.taux_achat_fc
      ? (
          parseInt(formData.unites_par_10usd) *
            (parseInt(formData.prix_vente_unitaire) || 0) -
          parseInt(formData.taux_achat_fc)
        ).toLocaleString()
      : "0";

  return (
    <div className="space-y-6 p-4">
      {/* En-tête */}
      <div className="flex items-center space-x-3">
        <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>
          <p className="text-sm text-gray-500">
            Configuration globale du système
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg text-sm font-medium ${
            message.includes("✅")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Paramètres généraux */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center space-x-2 mb-5 border-b border-gray-100 pb-3">
            <span>⚙️</span>
            <h3 className="text-lg font-semibold text-gray-900">
              Paramètres généraux
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Objectif hebdomadaire (FC)
              </label>
              <input
                type="number"
                value={formData.objectif_hebdomadaire}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    objectif_hebdomadaire: e.target.value,
                  })
                }
                className={getInputClasses("objectif_hebdomadaire")}
                min="1"
                placeholder="Ex: 150000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Prix de vente unitaire (FC)
              </label>
              <input
                type="number"
                value={formData.prix_vente_unitaire}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    prix_vente_unitaire: e.target.value,
                  })
                }
                className={getInputClasses("prix_vente_unitaire")}
                min="1"
                placeholder="Ex: 28"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Seuil alerte stock (unités)
              </label>
              <input
                type="number"
                value={formData.seuil_alerte_stock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seuil_alerte_stock: e.target.value,
                  })
                }
                className={getInputClasses("seuil_alerte_stock")}
                min="0"
                placeholder="Ex: 100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Seuil max dettes/jour (FC)
              </label>
              <input
                type="number"
                value={formData.seuil_max_dette}
                onChange={(e) =>
                  setFormData({ ...formData, seuil_max_dette: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 outline-none"
                min="0"
                placeholder="Ex: 50000"
              />
              <p className="mt-1 text-xs text-gray-400">
                Montant max de dettes autorisé par jour
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Seuil alerte écart (FC)
              </label>
              <input
                type="number"
                value={formData.seuil_alerte_ecart}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seuil_alerte_ecart: e.target.value,
                  })
                }
                className={getInputClasses("seuil_alerte_ecart")}
                min="0"
                placeholder="Ex: 5000"
              />
            </div>
          </div>
        </div>

        {/* Taux de change */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center space-x-2 mb-5 border-b border-gray-100 pb-3">
            <span>💱</span>
            <h3 className="text-lg font-semibold text-gray-900">
              Taux de change
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Taux d'achat (FC pour 10$)
              </label>
              <input
                type="number"
                value={formData.taux_achat_fc}
                onChange={(e) =>
                  setFormData({ ...formData, taux_achat_fc: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                min="1"
                placeholder="Ex: 23500"
              />
              <p className="mt-1 text-xs text-gray-400">
                Prix payé pour 10$ de crédit
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Taux d'échange (FC pour 10$)
              </label>
              <input
                type="number"
                value={formData.taux_echange_fc}
                onChange={(e) =>
                  setFormData({ ...formData, taux_echange_fc: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                min="1"
                placeholder="Ex: 22500"
              />
              <p className="mt-1 text-xs text-gray-400">
                Remis au client pour 10$
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Unités pour 10$
              </label>
              <input
                type="number"
                value={formData.unites_par_10usd}
                onChange={(e) =>
                  setFormData({ ...formData, unites_par_10usd: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                min="1"
                placeholder="Ex: 1050"
              />
              <p className="mt-1 text-xs text-gray-400">
                Unités reçues pour 10$
              </p>
            </div>
          </div>

          {/* Résumé calculé */}
          {formData.taux_achat_fc && formData.unites_par_10usd && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-blue-600 font-medium">
                    Prix d'achat unitaire
                  </p>
                  <p className="text-lg font-bold text-blue-900">
                    {prixAchatUnitaire} FC
                  </p>
                </div>
                <div>
                  <p className="text-blue-600 font-medium">Prix de vente</p>
                  <p className="text-lg font-bold text-blue-900">
                    {parseInt(formData.prix_vente_unitaire) || 0} FC
                  </p>
                </div>
                <div>
                  <p className="text-blue-600 font-medium">Marge unitaire</p>
                  <p className="text-lg font-bold text-green-600">
                    +{margeUnitaire} FC
                  </p>
                </div>
                <div>
                  <p className="text-blue-600 font-medium">Bénéfice pour 10$</p>
                  <p className="text-lg font-bold text-green-600">
                    +{benefice10usd} FC
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bouton de sauvegarde */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={settingsMutation.isPending || tauxMutation.isPending}
            className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold shadow-sm hover:bg-blue-700 active:scale-[0.99] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {settingsMutation.isPending || tauxMutation.isPending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Sauvegarde...</span>
              </>
            ) : (
              <span>💾 Enregistrer tous les paramètres</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
