// components/layout/Sidebar.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HomeIcon,
  CubeIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ShoppingBagIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: HomeIcon },
  { name: "Stocks & Ventes", href: "/stocks", icon: CubeIcon },
  { name: "Articles", href: "/articles", icon: ShoppingBagIcon },
  { name: "Mobile Money", href: "/mm", icon: BanknotesIcon },
  { name: "Caisse", href: "/caisse", icon: ClipboardDocumentListIcon },
  { name: "Archives", href: "/archives", icon: ChartBarIcon },
];

const adminNavigation = [
  { name: "Objectifs", href: "/objectifs", icon: ChartBarIcon }, // ← Ajouter
  { name: "Paramètres", href: "/settings", icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const NavLinks = () => (
    <>
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          onClick={() => setMobileOpen(false)}
          className={`group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors min-h-[44px] ${
            isActive(item.href)
              ? "bg-blue-50 text-blue-700"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <item.icon
            className={`mr-3 h-5 w-5 flex-shrink-0 ${
              isActive(item.href)
                ? "text-blue-700"
                : "text-gray-400 group-hover:text-gray-600"
            }`}
          />
          {item.name}
        </Link>
      ))}

      {user?.role === "admin" && (
        <>
          <div className="my-2 border-t border-gray-200" />
          {adminNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors min-h-[44px] ${
                isActive(item.href)
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive(item.href)
                    ? "text-blue-700"
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
              />
              {item.name}
            </Link>
          ))}
        </>
      )}
    </>
  );

  const UserProfile = () => (
    <div className="flex items-center">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm flex-shrink-0">
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
        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
      >
        <ArrowLeftOnRectangleIcon className="h-5 w-5" />
      </button>
    </div>
  );

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-16 items-center justify-center border-b border-gray-200 flex-shrink-0">
        <h1 className="text-xl font-bold text-blue-600">Shop Manager</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        <NavLinks />
      </nav>
      <div className="border-t border-gray-200 p-4 flex-shrink-0">
        <UserProfile />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar - fixe à gauche */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-30 shadow-lg">
        <SidebarContent />
      </div>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-30 flex items-center justify-between px-4 h-14">
        <button
          title="Ouvrir le menu"
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold text-blue-600">Shop Manager</h1>
        <div className="w-10" />
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 h-full shadow-xl animate-slide-in">
            <button
              title="Fermer le menu"
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 z-50 p-2 text-gray-500 hover:text-gray-700 bg-white rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
