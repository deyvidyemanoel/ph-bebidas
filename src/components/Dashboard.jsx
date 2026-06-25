import React from 'react';
import {
  TrendingUp, ShoppingBag, Package, AlertTriangle,
  Clock, DollarSign, ArrowRight, Wallet
} from 'lucide-react';
import { formatCurrency, formatDateTime, isToday, getCategoryLabel } from '../utils/helpers';

function WeekChart({ sales }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const data = days.map((day, idx) => {
    const daySales = sales.filter(
      s => new Date(s.date).toDateString() === day.toDateString() && s.status !== 'pendente'
    );
    return {
      label: day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      date: day.getDate(),
      total: daySales.reduce((sum, s) => sum + s.total, 0),
      count: daySales.length,
      isToday: idx === 6,
    };
  });

  const maxVal = Math.max(...data.map(d => d.total), 1);
  const weekTotal = data.reduce((s, d) => s + d.total, 0);
  const weekCount = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="bg-dark-700 border border-dark-400 rounded-2xl p-5">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="text-white font-semibold text-sm">Vendas — Últimos 7 dias</h3>
          <p className="text-gray-500 text-xs mt-0.5">{weekCount} transação(ões) no período</p>
        </div>
        <div className="text-right">
          <p className="text-gold-400 font-black text-xl">{formatCurrency(weekTotal)}</p>
          <p className="text-gray-600 text-xs">total recebido</p>
        </div>
      </div>

      <div className="flex items-end gap-2" style={{ height: 110 }}>
        {data.map((d, i) => {
          const barPct = maxVal > 0 ? (d.total / maxVal) * 100 : 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 relative group">
              {d.total > 0 && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-dark-500 border border-dark-300 rounded-xl px-2.5 py-1.5 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none shadow-xl">
                  <p className="font-bold text-center">{formatCurrency(d.total)}</p>
                  <p className="text-gray-400 text-center">{d.count} venda(s)</p>
                </div>
              )}
              <div className="w-full flex items-end justify-center" style={{ height: 76 }}>
                <div
                  className={`w-full rounded-t-lg transition-all duration-700 ${
                    d.isToday
                      ? 'bg-gradient-to-t from-gold-600 to-gold-400 shadow-lg shadow-gold-500/20'
                      : d.total > 0
                      ? 'bg-gold-500/25 group-hover:bg-gold-500/45 transition-colors cursor-default'
                      : 'bg-dark-500'
                  }`}
                  style={{ height: d.total > 0 ? `${Math.max(barPct, 5)}%` : '3px' }}
                />
              </div>
              <p className={`text-xs leading-none capitalize ${d.isToday ? 'text-gold-400 font-bold' : 'text-gray-600'}`}>
                {d.label}
              </p>
              <p className={`text-xs leading-none font-bold ${d.isToday ? 'text-white' : 'text-gray-700'}`}>
                {d.date}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard({ products, sales, onNavigate }) {
  const todaySales = sales.filter(s => isToday(s.date));
  const todayPaid = todaySales.filter(s => s.status !== 'pendente');
  const todayRevenue = todayPaid.reduce((sum, s) => sum + s.total, 0);

  const todayProfit = todayPaid.reduce((sum, sale) =>
    sum + sale.items.reduce((p, item) => {
      const product = products.find(pr => pr.id === item.productId);
      return product ? p + (item.unitPrice - product.costPrice) * item.quantity : p;
    }, 0), 0);

  const allPending = sales.filter(s => s.status === 'pendente');
  const totalDebt = allPending.reduce((sum, s) => sum + s.total, 0);

  // Hard threshold: any product below 10 units
  const lowStock = products
    .filter(p => p.quantity < 10)
    .sort((a, b) => a.quantity - b.quantity);

  const recentSales = [...sales]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  const stats = [
    {
      label: 'Faturamento Hoje',
      value: formatCurrency(todayRevenue),
      sub: `${todayPaid.length} venda(s) paga(s)`,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/20',
    },
    {
      label: 'Lucro do Dia',
      value: formatCurrency(todayProfit),
      sub: todayRevenue > 0 ? `Margem: ${((todayProfit / todayRevenue) * 100).toFixed(0)}%` : 'Sem vendas pagas',
      icon: DollarSign,
      color: 'text-gold-400',
      bg: 'bg-gold-400/10',
      border: 'border-gold-400/20',
    },
    {
      label: 'Fiado a Receber',
      value: formatCurrency(totalDebt),
      sub: `${allPending.length} pendência(s)`,
      icon: Wallet,
      color: totalDebt > 0 ? 'text-orange-400' : 'text-gray-500',
      bg: totalDebt > 0 ? 'bg-orange-400/10' : 'bg-gray-400/10',
      border: totalDebt > 0 ? 'border-orange-400/20' : 'border-dark-400',
      onClick: totalDebt > 0 ? () => onNavigate('clientes') : undefined,
    },
    {
      label: 'Estoque Baixo',
      value: lowStock.length,
      sub: lowStock.length > 0 ? 'Abaixo de 10 un.' : 'Tudo em dia',
      icon: AlertTriangle,
      color: lowStock.length > 0 ? 'text-red-400' : 'text-gray-400',
      bg: lowStock.length > 0 ? 'bg-red-400/10' : 'bg-gray-400/10',
      border: lowStock.length > 0 ? 'border-red-400/20' : 'border-dark-400',
      onClick: lowStock.length > 0 ? () => onNavigate('estoque') : undefined,
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white">Painel Principal</h2>
        <p className="text-gray-500 text-sm mt-0.5">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div
            key={i}
            onClick={s.onClick}
            className={`bg-dark-700 border ${s.border} rounded-2xl p-4 ${s.onClick ? 'cursor-pointer hover:brightness-110 transition-all' : ''}`}
          >
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={20} className={s.color} />
            </div>
            <p className="text-gray-500 text-xs mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-gray-600 text-xs mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Bar chart — last 7 days */}
      <WeekChart sales={sales} />

      {/* Low Stock Alert card (< 10 unidades) */}
      {lowStock.length > 0 && (
        <div className="bg-red-500/8 border border-red-500/30 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-red-500/20">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-400" />
              <h3 className="text-red-400 font-semibold text-sm">Alerta — Estoque Abaixo de 10 Unidades</h3>
              <span className="bg-red-500 text-white text-xs font-black px-1.5 py-0.5 rounded-full">{lowStock.length}</span>
            </div>
            <button onClick={() => onNavigate('estoque')} className="text-gray-600 hover:text-red-400 transition-colors">
              <ArrowRight size={15} />
            </button>
          </div>
          <div className="divide-y divide-red-500/10">
            {lowStock.slice(0, 6).map(p => (
              <div key={p.id} className="flex items-center justify-between px-5 py-2.5">
                <div>
                  <p className="text-white text-sm font-medium">{p.name}</p>
                  <p className="text-gray-600 text-xs">{getCategoryLabel(p.category)} · {p.brand}</p>
                </div>
                <div className="text-right">
                  <p className={`font-black text-sm ${
                    p.quantity === 0 ? 'text-red-500' : p.quantity < 5 ? 'text-orange-400' : 'text-yellow-400'
                  }`}>
                    {p.quantity} {p.unit}(s)
                  </p>
                  {p.quantity === 0 && <p className="text-red-600 text-xs font-medium">Zerado!</p>}
                </div>
              </div>
            ))}
          </div>
          {lowStock.length > 6 && (
            <div className="px-5 py-3 border-t border-red-500/10">
              <button onClick={() => onNavigate('estoque')} className="text-red-400 text-sm hover:text-red-300 transition-colors">
                + {lowStock.length - 6} produto(s) com estoque baixo
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Fiado a receber */}
        {totalDebt > 0 && (
          <div className="bg-orange-500/8 border border-orange-500/30 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-orange-500/20">
              <div className="flex items-center gap-2">
                <Wallet size={15} className="text-orange-400" />
                <h3 className="text-orange-400 font-semibold text-sm">Fiado a Receber</h3>
                <span className="bg-orange-500 text-white text-xs font-black px-1.5 py-0.5 rounded-full">{allPending.length}</span>
              </div>
              <button onClick={() => onNavigate('clientes')} className="text-gray-600 hover:text-orange-400 transition-colors">
                <ArrowRight size={15} />
              </button>
            </div>
            <div className="px-5 py-4">
              <p className="text-orange-400 text-3xl font-black">{formatCurrency(totalDebt)}</p>
              <p className="text-gray-500 text-sm mt-1">{allPending.length} venda(s) pendente(s)</p>
              <button onClick={() => onNavigate('clientes')} className="mt-3 text-orange-400 text-sm hover:text-orange-300 transition-colors">
                Ver clientes e cobranças →
              </button>
            </div>
          </div>
        )}

        {/* Recent sales */}
        <div className="bg-dark-700 border border-dark-400 rounded-2xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-dark-400">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-gold-400" />
              <h3 className="text-white font-semibold text-sm">Vendas Recentes</h3>
            </div>
            <button onClick={() => onNavigate('relatorios')} className="text-gray-600 hover:text-gold-400 transition-colors">
              <ArrowRight size={15} />
            </button>
          </div>
          <div className="p-4">
            {recentSales.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag size={36} className="text-gray-800 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Nenhuma venda registrada</p>
                <button onClick={() => onNavigate('pdv')} className="mt-2 text-gold-400 text-sm hover:text-gold-300 transition-colors">
                  Ir para o PDV →
                </button>
              </div>
            ) : (
              recentSales.map(sale => (
                <div key={sale.id} className="flex items-center justify-between py-2.5 border-b border-dark-400 last:border-0">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-white text-sm font-medium">{sale.items.length} item(s)</p>
                      {sale.status === 'pendente' && (
                        <span className="text-xs bg-orange-500/15 text-orange-400 px-1.5 py-0.5 rounded-full font-semibold">Fiado</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-xs">{formatDateTime(sale.date)}</p>
                  </div>
                  <p className={`font-bold text-sm ${sale.status === 'pendente' ? 'text-orange-400' : 'text-gold-400'}`}>
                    {formatCurrency(sale.total)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Nova Venda', icon: ShoppingBag, tab: 'pdv', color: 'from-gold-600 to-gold-500' },
          { label: 'Ver Estoque', icon: Package, tab: 'estoque', color: 'from-blue-700 to-blue-600' },
          { label: 'Relatórios', icon: TrendingUp, tab: 'relatorios', color: 'from-emerald-700 to-emerald-600' },
          { label: 'Cobranças', icon: Wallet, tab: 'clientes', color: 'from-orange-700 to-orange-600' },
        ].map(({ label, icon: Icon, tab, color }) => (
          <button
            key={tab}
            onClick={() => onNavigate(tab)}
            className={`bg-gradient-to-br ${color} rounded-2xl p-4 text-white text-left hover:opacity-90 transition-opacity`}
          >
            <Icon size={22} className="mb-2 opacity-80" />
            <p className="font-semibold text-sm">{label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
