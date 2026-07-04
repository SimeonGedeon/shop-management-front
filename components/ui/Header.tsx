// components/ui/Header.tsx

"use client";

import Link from "next/link";
import Button from "./Button";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-600">Shop Manager</h1>
              <p className="text-xs text-gray-500 -mt-0.5">Kinshasa, RDC</p>
            </div>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-blue-600 transition"
            >
              Services
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-blue-600 transition"
            >
              Contact
            </a>
            <Link href="/login">
              <Button variant="primary" size="sm">
                🔑 Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
