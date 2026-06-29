import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Stock from './components/Stock';
import PDV from './components/PDV';
import Reports from './components/Reports';
import Clients from './components/Clients';
import Settings from './components/Settings';
import Login from './components/Login';
import { useLocalStorage } from './hooks/useLocalStorage';
import { INITIAL_PRODUCTS } from './utils/helpers';

export default function App() {
  // Todos os hooks devem ser chamados antes de qualquer return condicional
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('ph_auth', false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useLocalStorage('ph_products', INITIAL_PRODUCTS);
  const [sales, setSales] = useLocalStorage('ph_sales', []);
  const [clients, setClients] = useLocalStorage('ph_clients', []);
  const [movements, setMovements] = useLocalStorage('ph_movements', []);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  const tabLabels = {
    dashboard: 'Início',
    estoque: 'Estoque',
    pdv: 'PDV',
    relatorios: 'Relatórios',
    clientes: 'Clientes',
    configuracoes: 'Configurações',
  };

  const handleReset = (scope) => {
    if (scope === 'all') {
      setSales([]);
      setClients([]);
      setMovements([]);
      setProducts(INITIAL_PRODUCTS);
    } else if (scope === 'sales') {
      setSales([]);
    } else if (scope === 'stock') {
      setProducts(INITIAL_PRODUCTS);
      setMovements([]);
    } else if (scope === 'clients') {
      setClients([]);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard products={products} sales={sales} onNavigate={setActiveTab} />;
      case 'estoque':
        return <Stock products={products} setProducts={setProducts} movements={movements} setMovements={setMovements} />;
      case 'pdv':
        return (
          <PDV
            products={products} setProducts={setProducts}
            sales={sales} setSales={setSales}
            clients={clients}
            movements={movements} setMovements={setMovements}
          />
        );
      case 'relatorios':
        return <Reports products={products} sales={sales} setSales={setSales} />;
      case 'clientes':
        return <Clients clients={clients} setClients={setClients} sales={sales} setSales={setSales} />;
      case 'configuracoes':
        return (
          <Settings
            products={products}
            sales={sales}
            clients={clients}
            movements={movements}
            onReset={handleReset}
          />
        );
      default:
        return <Dashboard products={products} sales={sales} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-dark-800 overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(o => !o)}
        onLogout={() => setIsLoggedIn(false)}
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
            <span className="text-white text-sm font-medium">{tabLabels[activeTab]}</span>
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
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
