// app/(protected)/mm/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function MMPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "transactions" | "matin" | "soir" | "cloture"
  >("transactions");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    operateur: "M-PESA",
    type: "depot",
    client_nom: "",
    numero: "",
    montant: "",
  });
  const [message, setMessage] = useState("");

  // Matin
  const [matinForm, setMatinForm] = useState({
    liquide_matin: "",
    mm_mpesa_matin: "",
    mm_orange_matin: "",
    mm_airtel_matin: "",
  });

  // Soir
  const [soirForm, setSoirForm] = useState({
    mm_mpesa_soir: "",
    mm_orange_soir: "",
    mm_airtel_soir: "",
  });

  // Clôture confirmation
  const [showClotureConfirm, setShowClotureConfirm] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["mm-transactions"],
    queryFn: async () => {
      const r = await api.get("/mm/transactions");
      return r.data;
    },
    refetchInterval: 30000,
  });

  const { data: caisseData } = useQuery({
    queryKey: ["caisse-etat"],
    queryFn: async () => {
      const r = await api.get("/caisse/etat");
      return r.data;
    },
  });

  useEffect(() => {
    const c = caisseData?.caisse;
    if (c) {
      setMatinForm({
        liquide_matin: c.liquide_matin ? String(c.liquide_matin) : "",
        mm_mpesa_matin: c.mm_mpesa_matin ? String(c.mm_mpesa_matin) : "",
        mm_orange_matin: c.mm_orange_matin ? String(c.mm_orange_matin) : "",
        mm_airtel_matin: c.mm_airtel_matin ? String(c.mm_airtel_matin) : "",
      });
      setSoirForm({
        mm_mpesa_soir: c.mm_mpesa_soir ? String(c.mm_mpesa_soir) : "",
        mm_orange_soir: c.mm_orange_soir ? String(c.mm_orange_soir) : "",
        mm_airtel_soir: c.mm_airtel_soir ? String(c.mm_airtel_soir) : "",
      });
    }
  }, [caisseData]);

  // Mutations transactions
  const createMutation = useMutation({
    mutationFn: () => api.post("/mm/transactions", form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mm-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["caisse-resume"] });
      setShowForm(false);
      resetForm();
      setMessage("✅ Transaction enregistrée");
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (err: any) => {
      setMessage("❌ " + (err.response?.data?.message || "Erreur"));
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
      setMessage("✅ Transaction modifiée");
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (err: any) => {
      setMessage("❌ " + (err.response?.data?.message || "Erreur"));
      setTimeout(() => setMessage(""), 5000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/mm/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mm-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["caisse-resume"] });
      setMessage("✅ Transaction supprimée");
      setTimeout(() => setMessage(""), 3000);
    },
  });

  // Matin
  const matinMutation = useMutation({
    mutationFn: () => api.post("/caisse/matin", matinForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caisse-etat"] });
      queryClient.invalidateQueries({ queryKey: ["caisse-resume"] });
      setMessage("✅ Solde matin enregistré");
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (err: any) => {
      setMessage("❌ " + (err.response?.data?.message || "Erreur"));
      setTimeout(() => setMessage(""), 5000);
    },
  });

  // Soir
  const soirMutation = useMutation({
    mutationFn: () => api.post("/caisse/soir", soirForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caisse-etat"] });
      queryClient.invalidateQueries({ queryKey: ["caisse-resume"] });
      setMessage("✅ Solde soir enregistré");
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (err: any) => {
      setMessage("❌ " + (err.response?.data?.message || "Erreur"));
      setTimeout(() => setMessage(""), 5000);
    },
  });

  // Clôture
  const clotureMutation = useMutation({
    mutationFn: () => api.post("/caisse/cloturer"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caisse-etat"] });
      queryClient.invalidateQueries({ queryKey: ["caisse-resume"] });
      setShowClotureConfirm(false);
      setMessage("✅ Journée clôturée");
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (err: any) => {
      setMessage("❌ " + (err.response?.data?.message || "Erreur"));
      setTimeout(() => setMessage(""), 5000);
    },
  });

  const rouvrirMutation = useMutation({
    mutationFn: () => api.post("/caisse/rouvrir"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caisse-etat"] });
      queryClient.invalidateQueries({ queryKey: ["caisse-resume"] });
      queryClient.invalidateQueries({ queryKey: ["mm-transactions"] });
      setMessage("✅ Journée rouverte");
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (err: any) => {
      setMessage("❌ " + (err.response?.data?.message || "Erreur"));
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

  const handleEdit = (tx: any) => {
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
    editId ? updateMutation.mutate() : createMutation.mutate();
  };

  const transactions = data?.transactions || [];
  const soldes = data?.soldes || {};
  const totaux = data?.totaux || {};
  const caisse = caisseData?.caisse || {};
  const isCloture = caisse?.statut === "cloture";
  const operateurs = ["M-PESA", "Orange Money", "Airtel Money"];
  const tabs = [
    { id: "transactions" as const, label: "Transactions", icon: "📋" },
    { id: "matin" as const, label: "Matin", icon: "🌅" },
    { id: "soir" as const, label: "Soir", icon: "🌆" },
    { id: "cloture" as const, label: "Clôture", icon: "🔒" },
  ];

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
      </div>
    );

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📱 Mobile Money</h2>
          <p className="text-sm text-gray-500">
            {isCloture ? "🔒 Journée clôturée" : "🟢 Journée ouverte"}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
        >
          🔄 Actualiser
        </button>
      </div>
      {message && (
        <div
          className={`p-3 rounded-lg text-sm font-medium ${message.includes("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
        >
          {message}
        </div>
      )}
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
      {/* Soldes actuels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {operateurs.map((op) => (
          <div
            key={op}
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 text-center"
          >
            <p className="text-sm text-gray-500 mb-1">{op}</p>
            <p className="text-2xl font-bold text-blue-900">
              {(soldes[op] || 0).toLocaleString()} FC
            </p>
          </div>
        ))}
      </div>
      {/* Onglet Matin */}
      {activeTab === "matin" && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            🌅 Déclaration du matin
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {isCloture
              ? "Journée clôturée"
              : "Saisissez les soldes d'ouverture"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                💵 Liquide (FC)
              </label>
              <input
                type="number"
                value={matinForm.liquide_matin}
                onChange={(e) =>
                  setMatinForm({ ...matinForm, liquide_matin: e.target.value })
                }
                title="Liquide"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none"
                min="0"
                disabled={isCloture}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📱 M-PESA (FC)
              </label>
              <input
                type="number"
                value={matinForm.mm_mpesa_matin}
                onChange={(e) =>
                  setMatinForm({ ...matinForm, mm_mpesa_matin: e.target.value })
                }
                title="M-PESA (FC)"
                placeholder="Solde M-PESA matin"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none"
                min="0"
                disabled={isCloture}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📱 Orange Money (FC)
              </label>
              <input
                type="number"
                value={matinForm.mm_orange_matin}
                onChange={(e) =>
                  setMatinForm({
                    ...matinForm,
                    mm_orange_matin: e.target.value,
                  })
                }
                title="Orange Money (FC)"
                placeholder="Solde Orange Money matin"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none"
                min="0"
                disabled={isCloture}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📱 Airtel Money (FC)
              </label>
              <input
                type="number"
                value={matinForm.mm_airtel_matin}
                onChange={(e) =>
                  setMatinForm({
                    ...matinForm,
                    mm_airtel_matin: e.target.value,
                  })
                }
                title="Airtel Money (FC)"
                placeholder="Solde Airtel Money matin"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none"
                min="0"
                disabled={isCloture}
              />
            </div>
          </div>
          {!isCloture && (
            <button
              onClick={() => matinMutation.mutate()}
              disabled={matinMutation.isPending}
              className="w-full md:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-40"
            >
              {matinMutation.isPending ? "..." : "💾 Enregistrer le matin"}
            </button>
          )}
        </div>
      )}
      {/* Onglet Soir */}
      {activeTab === "soir" && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            🌆 Déclaration du soir
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {isCloture
              ? "Journée clôturée"
              : "Saisissez les soldes MM restants"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📱 M-PESA soir (FC)
              </label>
              <input
                type="number"
                value={soirForm.mm_mpesa_soir}
                onChange={(e) =>
                  setSoirForm({ ...soirForm, mm_mpesa_soir: e.target.value })
                }
                title="M-PESA soir"
                placeholder="Solde M-PESA soir"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none"
                min="0"
                disabled={isCloture}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📱 Orange Money soir (FC)
              </label>
              <input
                type="number"
                value={soirForm.mm_orange_soir}
                onChange={(e) =>
                  setSoirForm({ ...soirForm, mm_orange_soir: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none"
                min="0"
                title="Orange Money soir"
                placeholder="Solde Orange Money soir"
                disabled={isCloture}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📱 Airtel Money soir (FC)
              </label>
              <input
                type="number"
                value={soirForm.mm_airtel_soir}
                onChange={(e) =>
                  setSoirForm({ ...soirForm, mm_airtel_soir: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none"
                min="0"
                title="Airtel Money soir"
                placeholder="Solde Airtel Money soir"
                disabled={isCloture}
              />
            </div>
          </div>
          {!isCloture && (
            <button
              onClick={() => soirMutation.mutate()}
              disabled={soirMutation.isPending}
              className="w-full md:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-40"
            >
              {soirMutation.isPending ? "..." : "💾 Enregistrer le soir"}
            </button>
          )}
        </div>
      )}
      {/* Onglet Clôture */}
      {activeTab === "cloture" && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            🔒 Clôture Mobile Money
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {isCloture
              ? "✅ Journée déjà clôturée"
              : "Archivez les soldes MM de la journée"}
          </p>
          {!isCloture &&
            (!showClotureConfirm ? (
              <button
                onClick={() => setShowClotureConfirm(true)}
                className="w-full md:w-auto bg-red-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-red-700"
              >
                🔒 Clôturer la journée MM
              </button>
            ) : (
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <p className="text-red-800 font-medium mb-3">
                  ⚠️ Confirmer la clôture ?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => clotureMutation.mutate()}
                    disabled={clotureMutation.isPending}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-40"
                  >
                    ✅ Oui, clôturer
                  </button>
                  <button
                    onClick={() => setShowClotureConfirm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ))}

          {isCloture && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-amber-600 mb-2">
                ⚠️ Admin : vous pouvez rouvrir la journée pour modification
              </p>
              <button
                onClick={() => rouvrirMutation.mutate()}
                disabled={rouvrirMutation.isPending}
                className="w-full md:w-auto bg-amber-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-amber-700 disabled:opacity-40"
              >
                {rouvrirMutation.isPending ? "..." : "🔓 Rouvrir la journée"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Onglet Transactions */}
      {activeTab === "transactions" && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-xs text-green-600">Total dépôts</p>
              <p className="text-xl font-bold text-green-900">
                +{(totaux.total_depots || 0).toLocaleString()} FC
              </p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-xs text-red-600">Total retraits</p>
              <p className="text-xl font-bold text-red-900">
                -{(totaux.total_retraits || 0).toLocaleString()} FC
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-xs text-blue-600">Transactions</p>
              <p className="text-xl font-bold text-blue-900">
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
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition ${showForm && !editId ? "bg-gray-200 text-gray-700" : "bg-blue-600 text-white hover:bg-blue-700"}`}
            >
              {showForm && !editId ? "✕ Fermer" : "+ Nouvelle transaction"}
            </button>
          )}

          {showForm && !isCloture && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editId ? "✏️ Modifier" : "📝 Nouvelle transaction"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opérateur
                    </label>
                    <select
                      value={form.operateur}
                      onChange={(e) =>
                        setForm({ ...form, operateur: e.target.value })
                      }
                      title="Sélectionner l'opérateur"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none"
                    >
                      {operateurs.map((op) => (
                        <option key={op} value={op}>
                          {op}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, type: "depot" })}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${form.type === "depot" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"}`}
                      >
                        📥 Dépôt
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, type: "retrait" })}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${form.type === "retrait" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700"}`}
                      >
                        📤 Retrait
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du client
                    </label>
                    <input
                      type="text"
                      value={form.client_nom}
                      onChange={(e) =>
                        setForm({ ...form, client_nom: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none"
                      placeholder="Ex: Jean Kazadi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro
                    </label>
                    <input
                      type="text"
                      value={form.numero}
                      onChange={(e) =>
                        setForm({ ...form, numero: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none"
                      placeholder="Ex: 0812345678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Montant (FC)
                    </label>
                    <input
                      type="number"
                      value={form.montant}
                      onChange={(e) =>
                        setForm({ ...form, montant: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none"
                      min="100"
                      placeholder="Ex: 10000"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-40"
                  >
                    {editId ? "💾 Modifier" : "💾 Enregistrer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditId(null);
                    }}
                    className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                📋 Transactions du jour
              </h3>
            </div>
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Aucune transaction aujourd'hui
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-2 font-medium text-gray-600">
                        Heure
                      </th>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">
                        Opérateur
                      </th>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">
                        Client
                      </th>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">
                        Type
                      </th>
                      <th className="text-right px-4 py-2 font-medium text-gray-600">
                        Montant
                      </th>
                      <th className="text-right px-4 py-2 font-medium text-gray-600">
                        Solde après
                      </th>
                      {!isCloture && (
                        <th className="text-center px-2 py-2 font-medium text-gray-600">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {new Date(tx.created_at).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {tx.operateur}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {tx.client_nom || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${tx.type === "depot" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                          >
                            {tx.type === "depot" ? "📥 Dépôt" : "📤 Retrait"}
                          </span>
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-semibold ${tx.type === "depot" ? "text-green-600" : "text-red-600"}`}
                        >
                          {tx.type === "depot" ? "+" : "-"}
                          {tx.montant.toLocaleString()} FC
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {(tx.solde_apres || 0).toLocaleString()} FC
                        </td>
                        {!isCloture && (
                          <td className="px-2 py-3">
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() => handleEdit(tx)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="Modifier"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm("Supprimer ?"))
                                    deleteMutation.mutate(tx.id);
                                }}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                                title="Supprimer"
                              >
                                🗑️
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
