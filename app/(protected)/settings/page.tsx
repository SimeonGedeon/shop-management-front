// app/(protected)/settings/page.tsx - Version responsive

"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage, settingsService, api } from "@/lib/api";

type FormKey =
  | "objectif_hebdomadaire"
  | "prix_vente_unitaire"
  | "seuil_alerte_stock"
  | "seuil_alerte_ecart"
  | "taux_achat_fc"
  | "taux_echange_fc"
  | "unites_par_10usd"
  | "seuil_max_dette";

type SettingsPayload = {
  prix_vente_unitaire: number;
  seuil_alerte_stock: number;
  seuil_alerte_ecart: number;
  objectif_hebdomadaire: number;
  seuil_max_dette: number;
};

type TauxPayload = {
  taux_achat_fc: number;
  taux_echange_fc: number;
  unites_par_10usd: number;
};

const emptyFormData: Record<FormKey, string> = {
  objectif_hebdomadaire: "",
  prix_vente_unitaire: "",
  seuil_alerte_stock: "",
  seuil_alerte_ecart: "",
  taux_achat_fc: "",
  taux_echange_fc: "",
  unites_par_10usd: "",
  seuil_max_dette: "",
};

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [formOverrides, setFormOverrides] = useState<Partial<Record<FormKey, string>>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const r = await settingsService.get();
      return r.data;
    },
  });

  const { data: tauxData } = useQuery({
    queryKey: ["taux-actif"],
    queryFn: async () => {
      const r = await api.get("/taux/actif");
      return r.data;
    },
  });

  const defaults = useMemo(() => {
    const values = { ...emptyFormData };

    if (data?.settings) {
      const s = data.settings;
      values.objectif_hebdomadaire = s.objectif_hebdomadaire?.toString() || "";
      values.prix_vente_unitaire = s.prix_vente_unitaire?.toString() || "";
      values.seuil_alerte_stock = s.seuil_alerte_stock?.toString() || "";
      values.seuil_alerte_ecart = s.seuil_alerte_ecart?.toString() || "";
      values.seuil_max_dette = s.seuil_max_dette?.toString() || "";
    }

    if (tauxData?.taux) {
      const t = tauxData.taux;
      values.taux_achat_fc = t.taux_achat_fc?.toString() || "";
      values.taux_echange_fc = t.taux_echange_fc?.toString() || "";
      values.unites_par_10usd = t.unites_par_10usd?.toString() || "";
    }

    return values;
  }, [data, tauxData]);

  const formData = { ...defaults, ...formOverrides };
  const setField = (field: FormKey, value: string) => {
    setFormOverrides((prev) => ({ ...prev, [field]: value }));
  };

  const settingsMutation = useMutation({
    mutationFn: (payload: SettingsPayload) => settingsService.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setMessage("Paramètres enregistrés");
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (err) => {
      setMessage(getErrorMessage(err));
    },
  });

  const tauxMutation = useMutation({
    mutationFn: (payload: TauxPayload) => api.post("/taux", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taux-actif"] });
      setMessage("Taux mis à jour");
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (err) => {
      setMessage(getErrorMessage(err));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    settingsMutation.mutate({
      prix_vente_unitaire: parseInt(formData.prix_vente_unitaire) || 0,
      seuil_alerte_stock: parseInt(formData.seuil_alerte_stock) || 0,
      seuil_alerte_ecart: parseInt(formData.seuil_alerte_ecart) || 0,
      objectif_hebdomadaire: parseInt(formData.objectif_hebdomadaire) || 0,
      seuil_max_dette: parseInt(formData.seuil_max_dette) || 0,
    });
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

  const pv = parseInt(formData.prix_vente_unitaire) || 0;
  const pa =
    formData.taux_achat_fc && formData.unites_par_10usd
      ? parseInt(formData.taux_achat_fc) / parseInt(formData.unites_par_10usd)
      : 0;

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
      </div>
    );

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Paramètres
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Configuration globale
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm font-medium ${message.includes("Erreur") ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Paramètres généraux */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-5 pb-2 sm:pb-3 border-b">
            Paramètres généraux
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
            <Input
              label="Objectif hebdo (FC)"
              value={formData.objectif_hebdomadaire}
              onChange={(v) =>
                setField("objectif_hebdomadaire", v)
              }
              placeholder="150000"
            />
            <Input
              label="Prix vente unitaire (FC)"
              value={formData.prix_vente_unitaire}
              onChange={(v) =>
                setField("prix_vente_unitaire", v)
              }
              placeholder="28"
            />
            <Input
              label="Seuil alerte stock"
              value={formData.seuil_alerte_stock}
              onChange={(v) =>
                setField("seuil_alerte_stock", v)
              }
              placeholder="100"
            />
            <Input
              label="Seuil alerte écart (FC)"
              value={formData.seuil_alerte_ecart}
              onChange={(v) =>
                setField("seuil_alerte_ecart", v)
              }
              placeholder="5000"
            />
            <Input
              label="Seuil max dettes/jour (FC)"
              value={formData.seuil_max_dette}
              onChange={(v) => setField("seuil_max_dette", v)}
              placeholder="50000"
              hint="Montant max de dettes autorisé par jour"
            />
          </div>
        </div>

        {/* Taux */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-5 pb-2 sm:pb-3 border-b">
            Taux de change
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
            <Input
              label="Taux d'achat (FC/10$)"
              value={formData.taux_achat_fc}
              onChange={(v) => setField("taux_achat_fc", v)}
              placeholder="23500"
              hint="Prix payé pour 10$"
            />
            <Input
              label="Taux d'échange (FC/10$)"
              value={formData.taux_echange_fc}
              onChange={(v) => setField("taux_echange_fc", v)}
              placeholder="22500"
              hint="Remis au client pour 10$"
            />
            <Input
              label="Unités pour 10$"
              value={formData.unites_par_10usd}
              onChange={(v) =>
                setField("unites_par_10usd", v)
              }
              placeholder="1050"
              hint="Unités reçues pour 10$"
            />
          </div>
          {formData.taux_achat_fc && formData.unites_par_10usd && (
            <div className="mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
                <div>
                  <p className="text-blue-600">Achat unit.</p>
                  <p className="text-sm sm:text-lg font-bold text-blue-900">
                    {pa.toFixed(2)} FC
                  </p>
                </div>
                <div>
                  <p className="text-blue-600">Vente</p>
                  <p className="text-sm sm:text-lg font-bold text-blue-900">
                    {pv} FC
                  </p>
                </div>
                <div>
                  <p className="text-blue-600">Marge</p>
                  <p className="text-sm sm:text-lg font-bold text-green-600">
                    +{(pv - pa).toFixed(2)} FC
                  </p>
                </div>
                <div>
                  <p className="text-blue-600">Bénéf./10$</p>
                  <p className="text-sm sm:text-lg font-bold text-green-600">
                    +
                    {(
                      parseInt(formData.unites_par_10usd) * pv -
                      parseInt(formData.taux_achat_fc)
                    ).toLocaleString()}{" "}
                    FC
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={settingsMutation.isPending || tauxMutation.isPending}
          className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-40 transition text-sm"
        >
          {settingsMutation.isPending || tauxMutation.isPending
            ? "Sauvegarde..."
            : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        min="0"
        placeholder={placeholder}
      />
      {hint && (
        <p className="mt-0.5 text-[10px] sm:text-xs text-gray-400">{hint}</p>
      )}
    </div>
  );
}
