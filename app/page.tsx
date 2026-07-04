// app/page.tsx

import Header from "@/components/ui/Header";
import HeroSection from "@/components/home/HeroSection";
import MarketInfo from "@/components/home/MarketInfo";
import PriceCards from "@/components/home/PriceCards";
import Footer from "@/components/home/Footer";
import Card from "@/components/ui/Card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* HERO */}
        <HeroSection />

        {/* PRIX DES RÉSEAUX */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            📱 Prix des crédits par réseau
          </h2>
          <PriceCards />
          <p className="text-center text-sm text-gray-500 mt-4">
            * Mise à jour automatique depuis les paramètres
          </p>
        </section>

        {/* INFORMATIONS MARCHÉ */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            📊 Informations du marché
          </h2>
          <MarketInfo />
        </section>

        {/* APPEL À L'ACTION */}
        <section className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Prêt à gérer votre shop ?
            </h3>
            <p className="text-gray-600 mb-4">
              Connectez-vous pour accéder à votre dashboard.
            </p>
            <a
              href="/login"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              🔑 Se connecter
            </a>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
