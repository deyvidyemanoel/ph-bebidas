import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, BarChart2, Users, Settings, X } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
  { id: 'estoque', label: 'Estoque', icon: Package },
  { id: 'pdv', label: 'PDV', icon: ShoppingCart },
  { id: 'relatorios', label: 'Relatórios', icon: BarChart2 },
  { id: 'clientes', label: 'Clientes', icon: Users },
];

export default function Sidebar({ activeTab, onTabChange, isOpen, onToggle }) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      <div className={`
        fixed left-0 top-0 h-full w-64 bg-dark-700 border-r border-dark-400 z-30
        transform transition-transform duration-300 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-6 border-b border-dark-400">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-gold-600/30">
              PH
            </div>
            <div>
              <h1 className="text-gold-400 font-bold text-lg leading-tight tracking-wide">PH Bebidas</h1>
              <p className="text-gray-600 text-xs">São Miguel do Tapuio</p>
            </div>
          </div>
          <button onClick={onToggle} className="lg:hidden text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { onTabChange(id); if (window.innerWidth < 1024) onToggle(); }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                ${activeTab === id
                  ? 'bg-gold-500/15 text-gold-400 border border-gold-500/25 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-dark-500 border border-transparent'}
              `}
            >
              <Icon size={19} />
              <span className="font-medium">{label}</span>
              {activeTab === id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-400" />
              )}
            </button>
          ))}
        </nav>

        <div className="px-4 pb-4 border-t border-dark-400 pt-3">
          <button
            onClick={() => { onTabChange('configuracoes'); if (window.innerWidth < 1024) onToggle(); }}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200
              ${activeTab === 'configuracoes'
                ? 'bg-gold-500/15 text-gold-400 border border-gold-500/25 shadow-sm'
                : 'text-gray-500 hover:text-white hover:bg-dark-500 border border-transparent'}
            `}
          >
            <Settings size={19} />
            <span className="font-medium">Configurações</span>
            {activeTab === 'configuracoes' && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-400" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
