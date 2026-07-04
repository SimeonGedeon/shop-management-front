// components/articles/ArticleForm.tsx

"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { articleService } from "@/lib/api";

interface ArticleFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ArticleForm({ onSuccess, onCancel }: ArticleFormProps) {
  const [designation, setDesignation] = useState("");
  const [prixAchat, setPrixAchat] = useState("");
  const [prixUnitaire, setPrixUnitaire] = useState("");
  const [nombrePieces, setNombrePieces] = useState("");
  const [message, setMessage] = useState("");

  const coutParPiece =
    prixAchat && nombrePieces
      ? (parseInt(prixAchat) / parseInt(nombrePieces)).toFixed(2)
      : "0";

  const marge =
    prixUnitaire && coutParPiece
      ? (parseInt(prixUnitaire) - parseFloat(coutParPiece)).toFixed(2)
      : "0";

  const mutation = useMutation({
    mutationFn: () =>
      articleService.create({
        designation,
        prix_achat: parseInt(prixAchat),
        prix_unitaire: parseInt(prixUnitaire),
        nombre_pieces: parseInt(nombrePieces),
      }),
    onSuccess: (response) => {
      setMessage(`✅ ${response.data.article.designation} ajouté`);
      setTimeout(() => {
        onSuccess();
      }, 500);
    },
    onError: (err: any) => {
      setMessage(`❌ ${err.response?.data?.message || "Erreur"}`);
      setTimeout(() => setMessage(""), 5000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!designation || !prixAchat || !prixUnitaire || !nombrePieces) {
      setMessage("❌ Tous les champs sont obligatoires");
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📦 Nouvel article
      </h3>

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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Désignation
          </label>
          <input
            type="text"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="Ex: Mouchoirs, Arachides..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix d'achat total (FC)
            </label>
            <input
              type="number"
              value={prixAchat}
              onChange={(e) => setPrixAchat(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              min="1"
              placeholder="Ex: 8000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix unitaire vente (FC)
            </label>
            <input
              type="number"
              value={prixUnitaire}
              onChange={(e) => setPrixUnitaire(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              min="1"
              placeholder="Ex: 500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de pièces
            </label>
            <input
              type="number"
              value={nombrePieces}
              onChange={(e) => setNombrePieces(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              min="1"
              placeholder="Ex: 30"
            />
          </div>
        </div>

        {/* Résumé calculé */}
        {prixAchat && nombrePieces && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-blue-600 font-medium">Coût/pièce</p>
                <p className="font-bold text-blue-900">{coutParPiece} FC</p>
              </div>
              <div>
                <p className="text-blue-600 font-medium">Prix vente</p>
                <p className="font-bold text-blue-900">
                  {prixUnitaire || "0"} FC
                </p>
              </div>
              <div>
                <p className="text-blue-600 font-medium">Marge/pièce</p>
                <p className="font-bold text-green-600">+{marge} FC</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-40 transition"
          >
            {mutation.isPending ? "Ajout..." : "💾 Ajouter l'article"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
