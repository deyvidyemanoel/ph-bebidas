import React, { useState } from 'react';
import {
  TrendingUp, DollarSign, ShoppingBag, BarChart2,
  Award, CreditCard, Calendar, Clock, ChevronDown, ChevronUp
} from 'lucide-react';
import {
  formatCurrency, formatDateTime, isToday,
  isThisWeek, isThisMonth, getPaymentLabel
} from '../utils/helpers';

function SaleRow({ sale, products }) {
  const [expanded, setExpanded] = useState(false);
  const isPending = sale.status === 'pendente';

  const saleProfit = sale.items.reduce((p, item) => {
    const prod = products.find(pr => pr.id === item.productId);
    return prod ? p + (item.unitPrice - prod.costPrice) * item.quantity : p;
  }, 0);

  return (
    <>
      <tr
        className={`border-b border-dark-400 last:border-0 cursor-pointer transition-colors
          ${expanded ? 'bg-dark-600/60' : isPending ? 'hover:bg-orange-500/5' : 'hover:bg-dark-600/30'}`}
        onClick={() => setExpanded(e => !e)}
      >
        <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDateTime(sale.date)}</td>
        <td className="px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">{sale.items.length} item(s)</span>
            {isPending ? (
              <span className="text-xs bg-orange-500/15 text-orange-400 px-1.5 py-0.5 rounded-full font-semibold">Fiado</span>
            ) : (
              <span className="text-xs bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-full font-semibold hidden sm:inline">Pago</span>
            )}
          </div>
          <p className="text-gray-600 text-xs truncate max-w-40 mt-0.5">{sale.items.map(i => i.name).join(', ')}</p>
        </td>
        <td className="px-5 py-3 text-gray-400 text-sm hidden md:table-cell">{getPaymentLabel(sale.paymentMethod)}</td>
        <td className="px-5 py-3 text-right whitespace-nowrap">
          <span className={`font-bold text-sm ${isPending ? 'text-orange-400' : 'text-gold-400'}`}>
            {formatCurrency(sale.total)}
          </span>
        </td>
        <td className="px-5 py-3 text-right text-emerald-400 text-sm hidden lg:table-cell">
          {isPending ? <span className="text-gray-600">—</span> : formatCurrency(saleProfit)}
        </td>
        <td className="px-5 py-3 text-center">
          <span className="text-gray-500">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </td>
      </tr>

      {expanded && (
        <tr className="border-b border-dark-400 bg-dark-600/40">
          <td colSpan={6} className="px-5 py-3">
            <div className="space-y-1.5">
              {sale.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">{item.quantity}x {item.name}</span>
                  <span className="text-gray-400">{formatCurrency(item.unitPrice)}/un = <span className="text-white font-medium">{formatCurrency(item.subtotal)}</span></span>
                </div>
              ))}
              {sale.paymentMethod === 'dinheiro' && sale.change > 0 && (
                <div className="flex justify-between text-xs pt-1 border-t border-dark-300 mt-1">
                  <span className="text-gray-500">Troco</span>
                  <span className="text-gray-400">{formatCurrency(sale.change)}</span>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function Reports({ products, sales }) {
  const [period, setPeriod] = useState('today');

  const filterSales = () => {
    switch (period) {
      case 'today': return sales.filter(s => isToday(s.date));
      case 'week': return sales.filter(s => isThisWeek(s.date));
      case 'month': return sales.filter(s => isThisMonth(s.date));
      default: return sales;
    }
  };

  const filtered = filterSales();
  const paidSales = filtered.filter(s => s.status !== 'pendente');
  const pendingSales = filtered.filter(s => s.status === 'pendente');

  const revenue = paidSales.reduce((s, sale) => s + sale.total, 0);
  const pendingRevenue = pendingSales.reduce((s, sale) => s + sale.total, 0);

  const cost = paidSales.reduce((s, sale) =>
    s + sale.items.reduce((p, item) => {
      const prod = products.find(pr => pr.id === item.productId);
      return prod ? p + prod.costPrice * item.quantity : p;
    }, 0), 0);

  const profit = revenue - cost;
  const margin = revenue > 0 ? (profit / revenue * 100) : 0;
  const avgTicket = paidSales.length > 0 ? revenue / paidSales.length : 0;

  // Best sellers (paid only)
  const prodMap = {};
  paidSales.forEach(sale => {
    sale.items.forEach(item => {
      if (!prodMap[item.productId]) prodMap[item.productId] = { name: item.name, qty: 0, rev: 0 };
      prodMap[item.productId].qty += item.quantity;
      prodMap[item.productId].rev += item.subtotal;
    });
  });
  const bestSellers = Object.values(prodMap).sort((a, b) => b.qty - a.qty).slice(0, 8);
  const maxQty = bestSellers[0]?.qty || 1;

  // Payment breakdown (paid only)
  const payMap = {};
  paidSales.forEach(sale => {
    const k = sale.paymentMethod;
    if (!payMap[k]) payMap[k] = { count: 0, total: 0 };
    payMap[k].count++;
    payMap[k].total += sale.total;
  });

  const periods = [
    { id: 'today', label: 'Hoje' },
    { id: 'week', label: 'Semana' },
    { id: 'month', label: 'Mês' },
    { id: 'all', label: 'Tudo' },
  ];

  const stats = [
    { label: 'Faturamento', value: formatCurrency(revenue), sub: `${paidSales.length} pago(s)`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Lucro Bruto', value: formatCurrency(profit), sub: `Margem ${margin.toFixed(0)}%`, icon: DollarSign, color: 'text-gold-400', bg: 'bg-gold-400/10' },
    { label: 'Fiado Pendente', value: formatCurrency(pendingRevenue), sub: `${pendingSales.length} a receber`, icon: Clock, color: pendingRevenue > 0 ? 'text-orange-400' : 'text-gray-500', bg: pendingRevenue > 0 ? 'bg-orange-400/10' : 'bg-gray-400/10' },
    { label: 'Ticket Médio', value: formatCurrency(avgTicket), sub: `${filtered.length} total`, icon: BarChart2, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  const sortedSales = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Relatórios</h2>
          <p className="text-gray-500 text-sm">{filtered.length} venda(s) no período</p>
        </div>
        <div className="flex gap-1 bg-dark-700 border border-dark-400 rounded-xl p-1">
          {periods.map(p => (
            <button key={p.id} onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${period === p.id ? 'bg-gold-500 text-black' : 'text-gray-400 hover:text-white'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-dark-700 border border-dark-400 rounded-2xl p-4">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={19} className={s.color} />
            </div>
            <p className="text-gray-500 text-xs mb-0.5">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-gray-600 text-xs mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Margin bar */}
      {revenue > 0 && (
        <div className="bg-dark-700 border border-dark-400 rounded-2xl p-5">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">Margem de Lucro</span>
            <span className={`text-sm font-bold ${margin >= 20 ? 'text-emerald-400' : margin >= 10 ? 'text-gold-400' : 'text-red-400'}`}>
              {margin.toFixed(1)}%
            </span>
          </div>
          <div className="bg-dark-500 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${margin >= 20 ? 'bg-emerald-500' : margin >= 10 ? 'bg-gold-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(margin, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-xs text-gray-600">
            <span>Custo: {formatCurrency(cost)}</span>
            <span>Lucro: {formatCurrency(profit)}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Best sellers */}
        <div className="bg-dark-700 border border-dark-400 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
            <Award size={15} className="text-gold-400" /> Mais Vendidos (vendas pagas)
          </h3>
          {bestSellers.length === 0 ? (
            <div className="text-center py-8"><ShoppingBag size={36} className="text-gray-700 mx-auto mb-2" /><p className="text-gray-500 text-sm">Sem dados</p></div>
          ) : (
            <div className="space-y-3">
              {bestSellers.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0
                    ${i === 0 ? 'bg-gold-500 text-black' : i === 1 ? 'bg-gray-300 text-black' : i === 2 ? 'bg-amber-700 text-white' : 'bg-dark-500 text-gray-500'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.name}</p>
                    <div className="mt-1 bg-dark-500 rounded-full h-1.5">
                      <div className="bg-gold-500 h-1.5 rounded-full" style={{ width: `${(item.qty / maxQty) * 100}%` }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white text-sm font-bold">{item.qty} un</p>
                    <p className="text-gold-400 text-xs">{formatCurrency(item.rev)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment methods */}
        <div className="bg-dark-700 border border-dark-400 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
            <CreditCard size={15} className="text-gold-400" /> Formas de Pagamento
          </h3>
          {Object.keys(payMap).length === 0 ? (
            <div className="text-center py-8"><CreditCard size={36} className="text-gray-700 mx-auto mb-2" /><p className="text-gray-500 text-sm">Sem dados</p></div>
          ) : (
            <div className="space-y-4">
              {Object.entries(payMap).sort((a, b) => b[1].total - a[1].total).map(([method, data]) => (
                <div key={method}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400 text-sm">{getPaymentLabel(method)}</span>
                    <span className="text-white text-sm font-bold">{formatCurrency(data.total)}</span>
                  </div>
                  <div className="bg-dark-500 rounded-full h-2">
                    <div className="bg-gold-500 h-2 rounded-full" style={{ width: revenue > 0 ? `${(data.total / revenue) * 100}%` : '0%' }} />
                  </div>
                  <p className="text-gray-600 text-xs mt-1">{data.count} transação(ões) · {revenue > 0 ? ((data.total / revenue) * 100).toFixed(0) : 0}%</p>
                </div>
              ))}
              {pendingSales.length > 0 && (
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-orange-400 text-sm flex items-center gap-1"><Clock size={12} /> Fiado (pendente)</span>
                    <span className="text-orange-400 text-sm font-bold">{formatCurrency(pendingRevenue)}</span>
                  </div>
                  <div className="bg-dark-500 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: (revenue + pendingRevenue) > 0 ? `${(pendingRevenue / (revenue + pendingRevenue)) * 100}%` : '0%' }} />
                  </div>
                  <p className="text-gray-600 text-xs mt-1">{pendingSales.length} venda(s) · a receber</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sales history table */}
      <div className="bg-dark-700 border border-dark-400 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-dark-400 flex items-center gap-2">
          <Calendar size={15} className="text-gold-400" />
          <h3 className="text-white font-semibold text-sm">Histórico de Vendas</h3>
          <span className="text-gray-600 text-xs ml-1">— clique em uma linha para ver os itens</span>
        </div>
        {sortedSales.length === 0 ? (
          <div className="text-center py-14">
            <ShoppingBag size={44} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">Nenhuma venda no período</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-400">
                  <th className="text-left text-gray-600 text-xs px-5 py-3 font-medium uppercase tracking-wide">Data/Hora</th>
                  <th className="text-left text-gray-600 text-xs px-5 py-3 font-medium uppercase tracking-wide">Itens / Status</th>
                  <th className="text-left text-gray-600 text-xs px-5 py-3 font-medium uppercase tracking-wide hidden md:table-cell">Pagamento</th>
                  <th className="text-right text-gray-600 text-xs px-5 py-3 font-medium uppercase tracking-wide">Total</th>
                  <th className="text-right text-gray-600 text-xs px-5 py-3 font-medium uppercase tracking-wide hidden lg:table-cell">Lucro</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {sortedSales.map(sale => (
                  <SaleRow key={sale.id} sale={sale} products={products} />
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-dark-300 bg-dark-600/30">
                  <td colSpan={2} className="px-5 py-3 text-gray-400 text-sm font-semibold">Total do Período</td>
                  <td className="hidden md:table-cell" />
                  <td className="px-5 py-3 text-right font-black">
                    <span className="text-gold-400">{formatCurrency(revenue)}</span>
                    {pendingRevenue > 0 && (
                      <span className="text-orange-400 text-xs block">+ {formatCurrency(pendingRevenue)} fiado</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right text-emerald-400 font-black hidden lg:table-cell">{formatCurrency(profit)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
