// components/stocks/AchatForm.tsx

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reseauService, api } from "@/lib/api";

// Composant Modal de confirmation
function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  achat,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  achat: any;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in">
        {/* Icône */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
        </div>

        {/* Titre */}
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
          Supprimer cet achat ?
        </h3>

        {/* Détails de l'achat */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Réseau</p>
              <p className="font-semibold text-gray-900">
                {achat?.reseau?.nom || "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Montant</p>
              <p className="font-semibold text-gray-900">
                {achat?.montant_fc?.toLocaleString()} FC
              </p>
            </div>
            <div>
              <p className="text-gray-500">Unités</p>
              <p className="font-semibold text-green-600">
                +{achat?.unites?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Heure</p>
              <p className="font-semibold text-gray-900">
                {achat?.created_at
                  ? new Date(achat.created_at).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Avertissement */}
        <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200 mb-4">
          <span className="text-amber-500 text-lg">⚠️</span>
          <div>
            <p className="text-sm font-medium text-amber-800">
              Action irréversible
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Les <strong>{achat?.unites?.toLocaleString()} unités</strong>{" "}
              seront retirées du stock actuel. Cette action ne peut pas être
              annulée.
            </p>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AchatForm() {
  const queryClient = useQueryClient();
  const [reseauId, setReseauId] = useState<number | null>(null);
  const [montant, setMontant] = useState("");
  const [message, setMessage] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null); // ← Pour la modal

  // Récupérer les réseaux
  const { data: reseauxData } = useQuery({
    queryKey: ["reseaux"],
    queryFn: async () => {
      const response = await reseauService.getAll();
      return Array.isArray(response.data)
        ? response.data
        : response.data?.reseaux || [];
    },
  });

  // Récupérer le taux actif
  const { data: tauxData } = useQuery({
    queryKey: ["taux-actif"],
    queryFn: async () => {
      const response = await api.get("/taux/actif");
      return response.data;
    },
  });

  // Récupérer les achats du jour
  const { data: achatsData } = useQuery({
    queryKey: ["achats-stock"],
    queryFn: async () => {
      const response = await api.get("/achats-stock");
      return response.data;
    },
  });

  const reseaux = reseauxData || [];
  const taux = tauxData?.taux;
  const achats = achatsData?.achats || [];

  const unitesEstimees =
    taux && montant
      ? Math.floor(
          (parseInt(montant) / taux.taux_achat_fc) * taux.unites_par_10usd,
        )
      : 0;

  const createMutation = useMutation({
    mutationFn: () =>
      api.post("/achats-stock", {
        reseau_id: reseauId,
        montant_fc: parseInt(montant),
      }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["achats-stock"] });
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setMessage(
        `✅ +${response.data.unites_ajoutees.toLocaleString()} unités`,
      );
      setMontant("");
      setReseauId(null);
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (err: any) => {
      setMessage(`❌ ${err.response?.data?.message || "Erreur"}`);
      setTimeout(() => setMessage(""), 5000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      api.put(`/achats-stock/${editId}`, { montant_fc: parseInt(montant) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achats-stock"] });
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      setMessage("✅ Achat modifié");
      setMontant("");
      setReseauId(null);
      setEditId(null);
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (err: any) => {
      setMessage(`❌ ${err.response?.data?.message || "Erreur"}`);
      setTimeout(() => setMessage(""), 5000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/achats-stock/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achats-stock"] });
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      setMessage("✅ Achat supprimé");
      setDeleteTarget(null);
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (err: any) => {
      setMessage(`❌ ${err.response?.data?.message || "Erreur"}`);
      setDeleteTarget(null);
      setTimeout(() => setMessage(""), 5000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reseauId || !montant) return;
    if (editId) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const handleEdit = (achat: any) => {
    setEditId(achat.id);
    setReseauId(achat.reseau_id);
    setMontant(String(achat.montant_fc));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id);
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setReseauId(null);
    setMontant("");
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Modal de confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        achat={deleteTarget}
      />

      {/* Formulaire d'achat */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {editId ? "✏️ Modifier l'achat" : "📦 Achat d'unités"}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {editId
            ? "Corrigez le montant de l'achat"
            : "Réapprovisionner le stock en cours de journée"}
        </p>

        {taux && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
            <span className="text-blue-700">
              Taux : <strong>{taux.taux_achat_fc.toLocaleString()} FC</strong> ={" "}
              {taux.unites_par_10usd} unités
            </span>
          </div>
        )}

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
          {!editId && (
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
                        ? "bg-orange-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {reseau.nom}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant (FC)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {[23500, 47000, 70500, 94000, 117500].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMontant(String(m))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    montant === String(m)
                      ? "bg-orange-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {m.toLocaleString()} FC
                </button>
              ))}
            </div>
            <input
              type="number"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
              min="1000"
              placeholder="Ex: 23500"
            />
          </div>

          {unitesEstimees > 0 && (
            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              📊 Unités estimées :{" "}
              <strong>{unitesEstimees.toLocaleString()}</strong>
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending || !reseauId || !montant}
              className={`flex-1 py-3 rounded-lg font-semibold transition disabled:opacity-40 text-white ${
                editId
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {isPending
                ? "En cours..."
                : editId
                  ? "💾 Enregistrer"
                  : "📦 Acheter"}
            </button>
            {editId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tableau des achats du jour */}
      {achats.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">📋 Achats du jour</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-2 font-medium text-gray-600">
                    Réseau
                  </th>
                  <th className="text-right px-4 py-2 font-medium text-gray-600">
                    Montant
                  </th>
                  <th className="text-right px-4 py-2 font-medium text-gray-600">
                    Unités
                  </th>
                  <th className="text-right px-4 py-2 font-medium text-gray-600">
                    Heure
                  </th>
                  <th className="text-center px-4 py-2 font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {achats.map((achat: any) => (
                  <tr key={achat.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {achat.reseau?.nom || `Réseau ${achat.reseau_id}`}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {achat.montant_fc.toLocaleString()} FC
                    </td>
                    <td className="px-4 py-3 text-right text-green-600 font-medium">
                      +{achat.unites.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 text-xs">
                      {new Date(achat.created_at).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => handleEdit(achat)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Modifier"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(achat)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Supprimer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
