// components/home/HeroSection.tsx

import Button from "@/components/ui/Button";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="py-12 text-center">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Gérez votre shop simplement
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Vente de crédits téléphoniques et services Mobile Money à Kinshasa.
          <br />
          Suivez vos stocks, vos ventes et votre caisse en temps réel.
        </p>
        <Link href="/login">
          <Button variant="primary" size="lg">
            🔑 Accéder au dashboard
          </Button>
        </Link>
      </div>
    </section>
  );
}
