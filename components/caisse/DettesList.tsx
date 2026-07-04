// components/caisse/DettesList.tsx

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { detteService } from "@/lib/api";

export default function DettesList() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [clientNom, setClientNom] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [montant, setMontant] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [message, setMessage] = useState("");
  const [remboursementId, setRemboursementId] = useState<number | null>(null);
  const [montantRemb, setMontantRemb] = useState("");

  // Résumé des dettes
  const { data: resumeData } = useQuery({
    queryKey: ["dettes-resume"],
    queryFn: async () => {
      const response = await detteService.getResume();
      return response.data;
    },
    refetchInterval: 30000,
  });

  // Liste des dettes
  const { data: dettesData } = useQuery({
    queryKey: ["dettes"],
    queryFn: async () => {
      const response = await detteService.getAll();
      return response.data;
    },
    refetchInterval: 30000,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      detteService.create({
        client_nom: clientNom,
        client_phone: clientPhone || undefined,
        montant: parseInt(montant),
        commentaire: commentaire || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dettes"] });
      queryClient.invalidateQueries({ queryKey: ["dettes-resume"] });
      setShowForm(false);
      setClientNom("");
      setClientPhone("");
      setMontant("");
      setCommentaire("");
      setMessage("✅ Dette enregistrée");
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (err: any) => {
      setMessage(`❌ ${err.response?.data?.message || "Erreur"}`);
      setTimeout(() => setMessage(""), 5000);
    },
  });

  const rembourserMutation = useMutation({
    mutationFn: () =>
      detteService.rembourser(remboursementId!, parseInt(montantRemb)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dettes"] });
      queryClient.invalidateQueries({ queryKey: ["dettes-resume"] });
      setRemboursementId(null);
      setMontantRemb("");
      setMessage("✅ Remboursement enregistré");
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (err: any) => {
      setMessage(`❌ ${err.response?.data?.message || "Erreur"}`);
      setTimeout(() => setMessage(""), 5000);
    },
  });

  const annulerMutation = useMutation({
    mutationFn: (id: number) => detteService.annuler(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dettes"] });
      queryClient.invalidateQueries({ queryKey: ["dettes-resume"] });
      setMessage("✅ Dette annulée");
      setTimeout(() => setMessage(""), 3000);
    },
  });

  const dettes = dettesData?.dettes || [];
  const resume = resumeData?.data || {};
  const seuilMax = resume?.seuil_max || 50000;
  const totalDettes = resume?.total_dettes || 0;
  const depassement = resume?.depassement || false;

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">📋 Dettes clients</h3>
          <div className="flex items-center gap-3 mt-1">
            <span
              className={`text-sm font-medium ${depassement ? "text-red-600" : "text-gray-500"}`}
            >
              Total : {totalDettes.toLocaleString()} FC
            </span>
            <span className="text-xs text-gray-400">
              Seuil max : {seuilMax.toLocaleString()} FC
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          + Nouvelle dette
        </button>
      </div>

      {/* Barre de progression */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all ${depassement ? "bg-red-500" : "bg-blue-500"}`}
          style={{ width: `${Math.min((totalDettes / seuilMax) * 100, 100)}%` }}
        ></div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm font-medium ${
            message.includes("✅")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      {/* Formulaire nouvelle dette */}
      {showForm && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              value={clientNom}
              onChange={(e) => setClientNom(e.target.value)}
              placeholder="Nom du client *"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <input
              type="text"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="Téléphone"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <input
              type="number"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              placeholder="Montant (FC) *"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              min="1"
            />
            <input
              type="text"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Commentaire"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => createMutation.mutate()}
              disabled={!clientNom || !montant || createMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40"
            >
              Enregistrer
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste des dettes */}
      {dettes.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2 font-medium text-gray-600">
                  Client
                </th>
                <th className="text-right px-3 py-2 font-medium text-gray-600">
                  Dette
                </th>
                <th className="text-right px-3 py-2 font-medium text-gray-600">
                  Remboursé
                </th>
                <th className="text-right px-3 py-2 font-medium text-gray-600">
                  Reste
                </th>
                <th className="text-center px-3 py-2 font-medium text-gray-600">
                  Statut
                </th>
                <th className="text-center px-2 py-2 font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dettes.map((dette: any) => (
                <tr key={dette.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3">
                    <p className="font-medium text-gray-900">
                      {dette.client_nom}
                    </p>
                    {dette.client_phone && (
                      <p className="text-xs text-gray-400">
                        {dette.client_phone}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right text-gray-700">
                    {dette.montant.toLocaleString()} FC
                  </td>
                  <td className="px-3 py-3 text-right text-green-600">
                    {(dette.montant_rembourse || 0).toLocaleString()} FC
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span
                      className={`font-bold ${dette.montant - (dette.montant_rembourse || 0) > 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      {(
                        dette.montant - (dette.montant_rembourse || 0)
                      ).toLocaleString()}{" "}
                      FC
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        dette.statut === "rembourse"
                          ? "bg-green-100 text-green-700"
                          : dette.statut === "annule"
                            ? "bg-gray-100 text-gray-500"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {dette.statut === "en_cours"
                        ? "En cours"
                        : dette.statut === "rembourse"
                          ? "Remboursé"
                          : "Annulé"}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    {dette.statut === "en_cours" && (
                      <div className="flex justify-center gap-1">
                        {/* Rembourser */}
                        {remboursementId === dette.id ? (
                          <div className="flex items-center gap-1">
                            <label
                              htmlFor={`montantRemb-${dette.id}`}
                              className="sr-only"
                            >
                              Montant à rembourser
                            </label>
                            <input
                              type="number"
                              value={montantRemb}
                              onChange={(e) => setMontantRemb(e.target.value)}
                              className="w-20 border border-blue-300 rounded px-1 py-0.5 text-xs"
                              min="1"
                              max={
                                dette.montant - (dette.montant_rembourse || 0)
                              }
                              id={`montantRemb-${dette.id}`}
                              autoFocus
                            />
                            <button
                              onClick={() => rembourserMutation.mutate()}
                              className="text-green-600 text-xs"
                            >
                              ✅
                            </button>
                            <button
                              onClick={() => setRemboursementId(null)}
                              className="text-gray-400 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setRemboursementId(dette.id);
                              setMontantRemb("");
                            }}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            title="Rembourser"
                          >
                            💰
                          </button>
                        )}
                        {/* Annuler */}
                        <button
                          onClick={() => {
                            if (confirm("Annuler cette dette ?")) {
                              annulerMutation.mutate(dette.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 text-xs"
                          title="Annuler"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
