// app/(auth)/login/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    login: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData);
      const data = response.data;

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/dashboard');
      } else {
        setError(data.message || 'Erreur de connexion');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-blue-600">Shop Manager</h1>
            <p className="text-sm text-gray-500">Kinshasa, RDC</p>
          </Link>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email ou Téléphone
            </label>
            <input
              type="text"
              value={formData.login}
              onChange={(e) => setFormData({ ...formData, login: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="admin@shop.com ou +243..."
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Identifiants par défaut */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Admin: admin@shop.com / password</p>
          <p>Vendeur: vendeur@shop.com / password</p>
        </div>

        {/* Retour à l'accueil */}
        <div className="mt-4 text-center text-sm">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
