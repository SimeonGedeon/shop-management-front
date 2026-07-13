// app/(protected)/mm/page.tsx - Version responsive

"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getErrorMessage } from "@/lib/api";

type MatinForm = {
  liquide_matin: string;
  mm_mpesa_matin: string;
  mm_orange_matin: string;
  mm_airtel_matin: string;
};

type SoirForm = {
  mm_mpesa_soir: string;
  mm_orange_soir: string;
  mm_airtel_soir: string;
};

type TransactionForm = {
  operateur: string;
  type: "depot" | "retrait";
  client_nom: string;
  numero: string;
  montant: string;
};

type MmTransaction = {
  id: number;
  operateur: string;
  type: "depot" | "retrait";
  client_nom?: string;
  numero?: string;
  montant: number;
  solde_apres?: number;
  created_at: string;
};

const emptyMatinForm: MatinForm = {
  liquide_matin: "",
  mm_mpesa_matin: "",
  mm_orange_matin: "",
  mm_airtel_matin: "",
};

const emptySoirForm: SoirForm = {
  mm_mpesa_soir: "",
  mm_orange_soir: "",
  mm_airtel_soir: "",
};

export default function MMPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "transactions" | "matin" | "soir" | "cloture"
  >("transactions");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<TransactionForm>({
    operateur: "M-PESA",
    type: "depot",
    client_nom: "",
    numero: "",
    montant: "",
  });
  const [message, setMessage] = useState("");
  const [matinOverrides, setMatinOverrides] = useState<Partial<MatinForm>>({});
  const [soirOverrides, setSoirOverrides] = useState<Partial<SoirForm>>({});
  const [showClotureConfirm, setShowClotureConfirm] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["mm-transactions"],
    queryFn: async () => {
      const r = await api.get("/mm/transactions");
      return r.data;
    },
    refetchInterval: 30000,
  });

  const { data: caisseData, refetch: refetchCaisse } = useQuery({
    queryKey: ["caisse-etat"],
    queryFn: async () => {
      const r = await api.get("/caisse/etat");
      return r.data;
    },
  });

  const matinDefaults = useMemo(() => {
    const values = { ...emptyMatinForm };
    const c = caisseData?.caisse;
    if (c) {
      values.liquide_matin = c.liquide_matin ? String(c.liquide_matin) : "";
      values.mm_mpesa_matin = c.mm_mpesa_matin
        ? String(c.mm_mpesa_matin)
        : "";
      values.mm_orange_matin = c.mm_orange_matin
        ? String(c.mm_orange_matin)
        : "";
      values.mm_airtel_matin = c.mm_airtel_matin
        ? String(c.mm_airtel_matin)
        : "";
    }

    return values;
  }, [caisseData]);

  const soirDefaults = useMemo(() => {
    const values = { ...emptySoirForm };
    const c = caisseData?.caisse;
    if (c) {
      values.mm_mpesa_soir = c.mm_mpesa_soir ? String(c.mm_mpesa_soir) : "";
      values.mm_orange_soir = c.mm_orange_soir ? String(c.mm_orange_soir) : "";
      values.mm_airtel_soir = c.mm_airtel_soir ? String(c.mm_airtel_soir) : "";
    }

    return values;
  }, [caisseData]);

  const matinForm = { ...matinDefaults, ...matinOverrides };
  const soirForm = { ...soirDefaults, ...soirOverrides };

  const createMutation = useMutation({
    mutationFn: () => api.post("/mm/transactions", form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mm-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["caisse-resume"] });
      setShowForm(false);
      resetForm();
      setMessage("Transaction enregistrée");
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (err) => {
      setMessage(getErrorMessage(err));
      setTimeout(() => setMessage(""), 5000);
    },
  });
  const updateMutation = useMutation({
    mutationFn: () => api.put(`/mm/transactions/${editId}`, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mm-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["caisse-resume"] });
      setEditId(null);
      resetForm();
      setMessage("Transaction modifiée");
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (err) => {
      setMessage(getErrorMessage(err));
      setTimeout(() => setMessage(""), 5000);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/mm/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mm-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["caisse-resume"] });
      setMessage("Transaction supprimée");
      setTimeout(() => setMessage(""), 3000);
    },
  });
  const matinMutation = useMutation({
    mutationFn: () => api.post("/caisse/matin", matinForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caisse-etat"] });
      queryClient.invalidateQueries({ queryKey: ["caisse-resume"] });
      setMessage("Solde matin enregistré");
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (err) => {
      setMessage(getErrorMessage(err));
    },
  });
  const soirMutation = useMutation({
    mutationFn: () => api.post("/caisse/soir", soirForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caisse-etat"] });
      queryClient.invalidateQueries({ queryKey: ["caisse-resume"] });
      setMessage("Solde soir enregistré");
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (err) => {
      setMessage(getErrorMessage(err));
    },
  });
  const clotureMutation = useMutation({
    mutationFn: () => api.post("/caisse/cloturer"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caisse-etat"] });
      queryClient.invalidateQueries({ queryKey: ["caisse-resume"] });
      setShowClotureConfirm(false);
      setMessage("Journée clôturée");
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (err) => {
      setMessage(getErrorMessage(err));
    },
  });
  const rouvrirMutation = useMutation({
    mutationFn: () => api.post("/caisse/rouvrir"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caisse-etat"] });
      queryClient.invalidateQueries({ queryKey: ["caisse-resume"] });
      queryClient.invalidateQueries({ queryKey: ["mm-transactions"] });
      refetchCaisse();
      setMessage("Journée rouverte");
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (err) => {
      setMessage(getErrorMessage(err));
    },
  });

  const resetForm = () =>
    setForm({
      operateur: "M-PESA",
      type: "depot",
      client_nom: "",
      numero: "",
      montant: "",
    });
  const handleEdit = (tx: MmTransaction) => {
    setEditId(tx.id);
    setForm({
      operateur: tx.operateur,
      type: tx.type,
      client_nom: tx.client_nom || "",
      numero: tx.numero || "",
      montant: String(tx.montant),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const transactions: MmTransaction[] = data?.transactions || [];
  const soldes = data?.soldes || {};
  const totaux = data?.totaux || {};
  const caisse = caisseData?.caisse || {};
  const isCloture = caisse?.statut === "cloture";
  const operateurs = ["M-PESA", "Orange Money", "Airtel Money"];
  const tabs = [
    { id: "transactions" as const, label: "Transactions", icon: "" },
    { id: "matin" as const, label: "Matin", icon: "" },
    { id: "soir" as const, label: "Soir", icon: "" },
    { id: "cloture" as const, label: "Clôture", icon: "" },
  ];

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
      </div>
    );

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Mobile Money
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            {isCloture ? "Journée clôturée" : "Journée ouverte"}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
        >
          Actualiser
        </button>
      </div>

      {message && (
        <div
          className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm font-medium ${message.includes("Erreur") ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}
        >
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition ${activeTab === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
          >
            <span className="sm:hidden">{tab.label}</span>
            <span className="hidden sm:inline">
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Soldes actuels - Cards responsives */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {operateurs.map((op) => (
          <div
            key={op}
            className="bg-white rounded-xl shadow-sm p-3 sm:p-5 border border-gray-200 text-center"
          >
            <p className="text-[10px] sm:text-sm text-gray-500 mb-0.5 sm:mb-1">
              {op}
            </p>
            <p className="text-sm sm:text-2xl font-bold text-blue-900">
              {(soldes[op] || 0).toLocaleString()} FC
            </p>
          </div>
        ))}
      </div>

      {/* Onglet Matin */}
      {activeTab === "matin" && (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
            Déclaration du matin
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-3">
            {isCloture
              ? "Journée clôturée"
              : "Saisissez les soldes d'ouverture"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <Input
              label="Liquide (FC)"
              value={matinForm.liquide_matin}
              onChange={(v) =>
                setMatinOverrides((prev) => ({ ...prev, liquide_matin: v }))
              }
              disabled={isCloture}
            />
            <Input
              label="M-PESA (FC)"
              value={matinForm.mm_mpesa_matin}
              onChange={(v) =>
                setMatinOverrides((prev) => ({ ...prev, mm_mpesa_matin: v }))
              }
              disabled={isCloture}
            />
            <Input
              label="Orange Money (FC)"
              value={matinForm.mm_orange_matin}
              onChange={(v) =>
                setMatinOverrides((prev) => ({ ...prev, mm_orange_matin: v }))
              }
              disabled={isCloture}
            />
            <Input
              label="Airtel Money (FC)"
              value={matinForm.mm_airtel_matin}
              onChange={(v) =>
                setMatinOverrides((prev) => ({ ...prev, mm_airtel_matin: v }))
              }
              disabled={isCloture}
            />
          </div>
          {!isCloture && (
            <Btn
              onClick={() => matinMutation.mutate()}
              loading={matinMutation.isPending}
              label="Enregistrer le matin"
            />
          )}
        </div>
      )}

      {/* Onglet Soir */}
      {activeTab === "soir" && (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
            Déclaration du soir
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-3">
            {isCloture
              ? "Journée clôturée"
              : "Saisissez les soldes MM restants"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <Input
              label="M-PESA soir (FC)"
              value={soirForm.mm_mpesa_soir}
              onChange={(v) =>
                setSoirOverrides((prev) => ({ ...prev, mm_mpesa_soir: v }))
              }
              disabled={isCloture}
            />
            <Input
              label="Orange Money soir (FC)"
              value={soirForm.mm_orange_soir}
              onChange={(v) =>
                setSoirOverrides((prev) => ({ ...prev, mm_orange_soir: v }))
              }
              disabled={isCloture}
            />
            <Input
              label="Airtel Money soir (FC)"
              value={soirForm.mm_airtel_soir}
              onChange={(v) =>
                setSoirOverrides((prev) => ({ ...prev, mm_airtel_soir: v }))
              }
              disabled={isCloture}
            />
          </div>
          {!isCloture && (
            <Btn
              onClick={() => soirMutation.mutate()}
              loading={soirMutation.isPending}
              label="Enregistrer le soir"
            />
          )}
        </div>
      )}

      {/* Onglet Clôture */}
      {activeTab === "cloture" && (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
            Clôture
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-3">
            {isCloture ? "Journée déjà clôturée" : "Archivez les soldes MM"}
          </p>
          {!isCloture &&
            (!showClotureConfirm ? (
              <button
                onClick={() => setShowClotureConfirm(true)}
                className="w-full sm:w-auto bg-red-600 text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg text-sm font-semibold"
              >
                Clôturer
              </button>
            ) : (
              <div className="bg-red-50 rounded-xl p-3 sm:p-4 border border-red-200">
                <p className="text-red-800 font-medium text-sm mb-3">
                  Confirmer la clôture ?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => clotureMutation.mutate()}
                    disabled={clotureMutation.isPending}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-semibold"
                  >
                    Oui
                  </button>
                  <button
                    onClick={() => setShowClotureConfirm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ))}
          {isCloture && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs sm:text-sm text-amber-600 mb-2">
                Admin : rouvrir pour modification
              </p>
              <button
                onClick={() => rouvrirMutation.mutate()}
                disabled={rouvrirMutation.isPending}
                className="w-full sm:w-auto bg-amber-600 text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg text-sm font-semibold"
              >
                Rouvrir
              </button>
            </div>
          )}
        </div>
      )}

      {/* Onglet Transactions */}
      {activeTab === "transactions" && (
        <>
          {/* Résumé */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-green-50 rounded-xl p-3 sm:p-4 text-center">
              <p className="text-[10px] sm:text-xs text-green-600">Dépôts</p>
              <p className="text-sm sm:text-xl font-bold text-green-900">
                +{(totaux.total_depots || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 sm:p-4 text-center">
              <p className="text-[10px] sm:text-xs text-red-600">Retraits</p>
              <p className="text-sm sm:text-xl font-bold text-red-900">
                -{(totaux.total_retraits || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 sm:p-4 text-center">
              <p className="text-[10px] sm:text-xs text-blue-600">Total</p>
              <p className="text-sm sm:text-xl font-bold text-blue-900">
                {totaux.total_transactions || 0}
              </p>
            </div>
          </div>

          {!isCloture && (
            <button
              onClick={() => {
                resetForm();
                setEditId(null);
                setShowForm(!showForm);
              }}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold ${showForm && !editId ? "bg-gray-200 text-gray-700" : "bg-blue-600 text-white"}`}
            >
              {showForm && !editId ? "Fermer" : "+ Transaction"}
            </button>
          )}

          {showForm && !isCloture && (
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                {editId ? "Modifier" : "Nouvelle transaction"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Opérateur
                    </label>
                    <select
                      value={form.operateur}
                      title="Opérateur"
                      onChange={(e) =>
                        setForm({ ...form, operateur: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:py-2.5 text-sm text-gray-900 outline-none"
                    >
                      {operateurs.map((op) => (
                        <option key={op} value={op}>
                          {op}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, type: "depot" })}
                        className={`flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium ${form.type === "depot" ? "bg-green-600 text-white" : "bg-gray-100"}`}
                      >
                        Dépôt
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, type: "retrait" })}
                        className={`flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium ${form.type === "retrait" ? "bg-red-600 text-white" : "bg-gray-100"}`}
                      >
                        Retrait
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Client
                    </label>
                    <input
                      type="text"
                      value={form.client_nom}
                      onChange={(e) =>
                        setForm({ ...form, client_nom: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:py-2.5 text-sm text-gray-900 outline-none"
                      placeholder="Nom"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Numéro
                    </label>
                    <input
                      type="text"
                      value={form.numero}
                      onChange={(e) =>
                        setForm({ ...form, numero: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:py-2.5 text-sm text-gray-900 outline-none"
                      placeholder="0812345678"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Montant (FC)
                    </label>
                    <input
                      type="number"
                      value={form.montant}
                      onChange={(e) =>
                        setForm({ ...form, montant: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:py-2.5 text-sm text-gray-900 outline-none"
                      min="100"
                      placeholder="10000"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                    className="px-4 py-2 sm:px-6 sm:py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold"
                  >
                    {editId ? "Modifier" : "Enregistrer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditId(null);
                    }}
                    className="px-4 py-2 sm:px-6 sm:py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tableau */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-gray-200">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                Transactions du jour
              </h3>
            </div>
            {transactions.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                Aucune transaction
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-2 sm:px-4 py-2 font-medium text-gray-600">
                        Heure
                      </th>
                      <th className="text-left px-2 sm:px-4 py-2 font-medium text-gray-600">
                        Opérateur
                      </th>
                      <th className="hidden sm:table-cell text-left px-2 sm:px-4 py-2 font-medium text-gray-600">
                        Client
                      </th>
                      <th className="text-left px-2 sm:px-4 py-2 font-medium text-gray-600">
                        Type
                      </th>
                      <th className="text-right px-2 sm:px-4 py-2 font-medium text-gray-600">
                        Montant
                      </th>
                      <th className="hidden sm:table-cell text-right px-2 sm:px-4 py-2 font-medium text-gray-600">
                        Solde
                      </th>
                      {!isCloture && (
                        <th className="text-center px-2 py-2 font-medium text-gray-600"></th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-500">
                          {new Date(tx.created_at).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium">
                          {tx.operateur}
                        </td>
                        <td className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-gray-700">
                          {tx.client_nom || "—"}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${tx.type === "depot" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                          >
                            {tx.type === "depot" ? "Dépôt" : "Retrait"}
                          </span>
                        </td>
                        <td
                          className={`px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold ${tx.type === "depot" ? "text-green-600" : "text-red-600"}`}
                        >
                          {tx.type === "depot" ? "+" : "-"}
                          {tx.montant.toLocaleString()}
                        </td>
                        <td className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-right">
                          {(tx.solde_apres || 0).toLocaleString()}
                        </td>
                        {!isCloture && (
                          <td className="px-2 py-2 sm:py-3">
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() => handleEdit(tx)}
                                className="p-1 text-blue-600 text-xs"
                              >
                                Modifier
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm("Supprimer ?"))
                                    deleteMutation.mutate(tx.id);
                                }}
                                className="p-1 text-red-500 text-xs"
                              >
                                Supprimer
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Petits composants internes
function Input({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="number"
        value={value}
        placeholder={label}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:py-2.5 text-sm text-gray-900 outline-none"
        min="0"
        disabled={disabled}
      />
    </div>
  );
}

function Btn({
  onClick,
  loading,
  label,
}: {
  onClick: () => void;
  loading: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-40"
    >
      {loading ? "..." : label}
    </button>
  );
}
