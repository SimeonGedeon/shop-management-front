// components/home/Footer.tsx

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Shop Manager - Kinshasa, RDC
            </p>
            <p className="text-xs text-gray-400">
              Gestion de crédits téléphoniques et Mobile Money
            </p>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-blue-600">
              À propos
            </a>
            <a href="#" className="hover:text-blue-600">
              Services
            </a>
            <a href="#" className="hover:text-blue-600">
              Contact
            </a>
            <a
              href="/login"
              className="hover:text-blue-600 font-medium text-blue-600"
            >
              🔑 Connexion
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
