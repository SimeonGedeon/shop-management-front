// components/layout/Sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HomeIcon,
  CubeIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ShoppingBagIcon, // ← Ajouté pour Articles
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: HomeIcon },
  { name: "Stocks & Ventes", href: "/stocks", icon: CubeIcon },
  { name: "Articles", href: "/articles", icon: ShoppingBagIcon }, // ← Ajouté
  { name: "Mobile Money", href: "/mm", icon: BanknotesIcon },
  { name: "Caisse", href: "/caisse", icon: ClipboardDocumentListIcon },
  { name: "Archives", href: "/archives", icon: ChartBarIcon },
];

const adminNavigation = [
  { name: "Paramètres", href: "/settings", icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  let user = null;
  if (typeof window !== "undefined") {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        user = JSON.parse(userData);
      } catch (e) {
        console.error(e);
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-white shadow-lg">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-600">Shop Manager</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 ${
                  isActive
                    ? "text-blue-700"
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
              />
              {item.name}
            </Link>
          );
        })}

        {/* Séparateur admin */}
        {user?.role === "admin" && (
          <>
            <div className="my-2 border-t border-gray-200" />
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive
                        ? "text-blue-700"
                        : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Profil utilisateur */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">
              {user?.name || "Utilisateur"}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role || "Rôle"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Déconnexion"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-colors"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
