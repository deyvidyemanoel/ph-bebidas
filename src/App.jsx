import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import Layout from './components/Layout';
import Stock from './components/Stock';
import PDV from './components/PDV';
import Reports from './components/Reports';
import Clients from './components/Clients';
import Comanda from './components/Comanda';
import Caixa from './components/Caixa';
import Settings from './components/Settings';
import Employees from './components/Employees';
import Login from './components/Login';
import { useAuth } from './contexts/AuthContext';
import { useProducts } from './hooks/useProducts';
import { useClients } from './hooks/useClients';
import { useMovements } from './hooks/useMovements';
import { useSales } from './hooks/useSales';
import { useComandas } from './hooks/useComandas';
import { useCaixa } from './hooks/useCaixa';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-dark-800 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <RefreshCw size={28} className="animate-spin text-gold-400" />
        <p className="text-sm">Carregando dados...</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message, onRetry }) {
  return (
    <div className="min-h-screen bg-dark-800 flex items-center justify-center p-4">
      <div className="bg-dark-700 border border-red-500/30 rounded-2xl p-6 max-w-sm w-full text-center">
        <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
        <p className="text-white font-semibold mb-1">Não foi possível carregar os dados</p>
        <p className="text-gray-500 text-sm mb-5">{message}</p>
        <button
          onClick={onRetry}
          className="w-full py-2.5 bg-gold-500 text-black font-bold rounded-xl hover:bg-gold-400 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const { session, employee, loading: authLoading } = useAuth();

  if (authLoading) return <LoadingScreen />;
  if (!session || !employee) return <Login />;

  // Só monta a partir daqui (com os hooks de dado, que já dependem de RLS
  // autenticado) depois que a sessão e o perfil do funcionário existem.
  return <AuthenticatedApp employee={employee} />;
}

function AuthenticatedApp({ employee }) {
  const { logout } = useAuth();
  const productsApi = useProducts();
  const clientsApi = useClients();
  const movementsApi = useMovements();
  const salesApi = useSales();
  const comandasApi = useComandas();
  const caixaApi = useCaixa();

  const loading = productsApi.loading || clientsApi.loading || movementsApi.loading || salesApi.loading || comandasApi.loading || caixaApi.loading;
  const firstError = productsApi.error || clientsApi.error || movementsApi.error || salesApi.error || comandasApi.error || caixaApi.error;

  if (loading) return <LoadingScreen />;
  if (firstError) {
    return (
      <ErrorScreen
        message={firstError}
        onRetry={() => {
          productsApi.refetch();
          clientsApi.refetch();
          movementsApi.refetch();
          salesApi.refetch();
          comandasApi.refetch();
          caixaApi.refetch();
        }}
      />
    );
  }

  const products = productsApi.products;
  const sales = salesApi.sales;
  const clients = clientsApi.clients;
  const movements = movementsApi.movements;

  const handleReset = async (scope) => {
    if (scope === 'all') {
      await Promise.all([
        salesApi.clearAll(),
        clientsApi.clearAll(),
        movementsApi.clearAll(),
        productsApi.resetToInitial(),
      ]);
    } else if (scope === 'sales') {
      await salesApi.clearAll();
    } else if (scope === 'stock') {
      await Promise.all([productsApi.resetToInitial(), movementsApi.clearAll()]);
    } else if (scope === 'clients') {
      await clientsApi.clearAll();
    }
  };

  // Elementos reutilizados entre rotas equivalentes (ex: "/" e "/pdv"),
  // já que apenas uma rota fica montada por vez.
  const caixaAbertoId = caixaApi.caixaAberto?.id ?? null;

  const pdvElement = (
    <PDV
      products={products} clients={clients} sales={sales}
      addSale={salesApi.addSale}
      decrementForSale={productsApi.decrementForSale}
      addMovements={movementsApi.addMovements}
      caixaAbertoId={caixaAbertoId}
    />
  );

  const comandaElement = (
    <Comanda
      products={products}
      comandas={comandasApi.comandas}
      createComanda={comandasApi.createComanda}
      addItem={comandasApi.addItem}
      addAvulsoItem={comandasApi.addAvulsoItem}
      setItemQty={comandasApi.setItemQty}
      clearItems={comandasApi.clearItems}
      deleteComanda={comandasApi.deleteComanda}
      addSale={salesApi.addSale}
      decrementForSale={productsApi.decrementForSale}
      addMovements={movementsApi.addMovements}
      caixaAbertoId={caixaAbertoId}
    />
  );

  const stockElement = (
    <Stock
      products={products}
      movements={movements}
      addProduct={productsApi.addProduct}
      updateProduct={productsApi.updateProduct}
      deleteProduct={productsApi.deleteProduct}
      adjustStock={productsApi.adjustStock}
      addMovement={movementsApi.addMovement}
      deleteMovement={movementsApi.deleteMovement}
    />
  );

  const clientsElement = (
    <Clients
      clients={clients} sales={sales}
      addClient={clientsApi.addClient}
      updateClient={clientsApi.updateClient}
      deleteClient={clientsApi.deleteClient}
      markPaid={salesApi.markPaid}
    />
  );

  return (
    <Routes>
      <Route element={<Layout onLogout={logout} isAdmin={employee.isAdmin} />}>
        <Route path="/" element={pdvElement} />
        <Route path="/pdv" element={pdvElement} />

        <Route path="/comandas" element={comandaElement} />
        <Route path="/comandas/:id" element={comandaElement} />

        <Route
          path="/caixa"
          element={
            <Caixa
              caixaAberto={caixaApi.caixaAberto}
              historico={caixaApi.historico}
              abrirCaixa={caixaApi.abrirCaixa}
              fecharCaixa={caixaApi.fecharCaixa}
              deleteCaixa={caixaApi.deleteCaixa}
              employee={employee}
              sales={sales}
            />
          }
        />

        <Route path="/estoque" element={stockElement} />
        <Route path="/estoque/novo" element={stockElement} />

        <Route path="/clientes" element={clientsElement} />
        <Route path="/clientes/:id" element={clientsElement} />

        <Route path="/relatorios" element={<Reports products={products} sales={sales} deleteSale={salesApi.deleteSale} markPaid={salesApi.markPaid} />} />

        <Route
          path="/configuracoes"
          element={
            <Settings
              products={products} sales={sales} clients={clients} movements={movements}
              bulkReplaceProducts={productsApi.bulkReplace}
              bulkReplaceClients={clientsApi.bulkReplace}
              bulkReplaceSales={salesApi.bulkReplace}
              bulkReplaceMovements={movementsApi.bulkReplace}
              onReset={handleReset}
            />
          }
        />

        <Route
          path="/funcionarios"
          element={employee.isAdmin ? <Employees /> : <Navigate to="/" replace />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
