import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Stock from './components/Stock';
import PDV from './components/PDV';
import Reports from './components/Reports';
import Clients from './components/Clients';
import Comanda from './components/Comanda';
import Settings from './components/Settings';
import Login from './components/Login';
import { useLocalStorage } from './hooks/useLocalStorage';
import { INITIAL_PRODUCTS } from './utils/helpers';

export default function App() {
  // Todos os hooks devem ser chamados antes de qualquer return condicional
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('ph_auth', false);
  const [products, setProducts] = useLocalStorage('ph_products', INITIAL_PRODUCTS);
  const [sales, setSales] = useLocalStorage('ph_sales', []);
  const [clients, setClients] = useLocalStorage('ph_clients', []);
  const [movements, setMovements] = useLocalStorage('ph_movements', []);
  const [comandas, setComandas] = useLocalStorage('ph_comandas', []);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

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

  // Elementos reutilizados entre rotas equivalentes (ex: "/" e "/pdv"),
  // já que apenas uma rota fica montada por vez.
  const pdvElement = (
    <PDV
      products={products} setProducts={setProducts}
      sales={sales} setSales={setSales}
      clients={clients}
      movements={movements} setMovements={setMovements}
    />
  );

  const comandaElement = (
    <Comanda
      products={products} setProducts={setProducts}
      sales={sales} setSales={setSales}
      movements={movements} setMovements={setMovements}
      comandas={comandas} setComandas={setComandas}
    />
  );

  const stockElement = (
    <Stock
      products={products} setProducts={setProducts}
      movements={movements} setMovements={setMovements}
    />
  );

  const clientsElement = (
    <Clients clients={clients} setClients={setClients} sales={sales} setSales={setSales} />
  );

  return (
    <Routes>
      <Route element={<Layout onLogout={() => setIsLoggedIn(false)} />}>
        <Route path="/" element={pdvElement} />
        <Route path="/pdv" element={pdvElement} />

        <Route path="/comandas" element={comandaElement} />
        <Route path="/comandas/:id" element={comandaElement} />

        <Route path="/estoque" element={stockElement} />
        <Route path="/estoque/novo" element={stockElement} />

        <Route path="/clientes" element={clientsElement} />
        <Route path="/clientes/:id" element={clientsElement} />

        <Route path="/relatorios" element={<Reports products={products} sales={sales} setSales={setSales} />} />

        <Route
          path="/configuracoes"
          element={
            <Settings
              products={products} setProducts={setProducts}
              sales={sales} setSales={setSales}
              clients={clients} setClients={setClients}
              movements={movements} setMovements={setMovements}
              onReset={handleReset}
            />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
