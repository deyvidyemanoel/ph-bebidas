import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

const PAGE_TITLES = [
  { match: (p) => p === '/' || p.startsWith('/pdv'), label: 'PDV' },
  { match: (p) => p.startsWith('/comandas'), label: 'Comanda' },
  { match: (p) => p.startsWith('/estoque'), label: 'Estoque' },
  { match: (p) => p.startsWith('/clientes'), label: 'Clientes' },
  { match: (p) => p.startsWith('/relatorios'), label: 'Relatórios' },
  { match: (p) => p.startsWith('/configuracoes'), label: 'Configurações' },
];

export default function Layout({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const pageLabel = PAGE_TITLES.find(t => t.match(location.pathname))?.label ?? '';

  return (
    <div className="flex h-screen bg-dark-800 overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(o => !o)}
        onLogout={onLogout}
      />

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 h-14 bg-dark-700 border-b border-dark-400 flex items-center px-4 gap-3">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="lg:hidden text-gray-500 hover:text-white transition-colors p-1"
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm hidden sm:inline">/</span>
            <span className="text-white text-sm font-medium">{pageLabel}</span>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-white text-sm font-semibold leading-tight">PH Bebidas</p>
              <p className="text-gray-600 text-xs">São Miguel do Tapuio</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-black font-black text-sm">
              PH
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
