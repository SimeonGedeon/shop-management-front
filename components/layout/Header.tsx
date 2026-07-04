// components/layout/Header.tsx

'use client';

import { BellIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div>
        <p className="text-sm text-gray-500">Bonjour 👋</p>
        <p className="text-sm font-medium text-gray-900 capitalize">{today}</p>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
          <BellIcon className="h-6 w-6" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
      </div>
    </header>
  );
}
