import React, { useState } from 'react';
import { Wallet, Unlock, Lock, X, History, CreditCard, Trash2 } from 'lucide-react';
import { formatCurrency, formatDateTime, getPaymentLabel } from '../utils/helpers';
import { Toast } from './Toast';
import { DeleteModal } from './DeleteModal';

// Agrupa vendas de um caixa por forma de pagamento, igual ao card
// "Formas de Pagamento" do Reports.jsx: vendas pagas usam settledPaymentMethod
// (ou paymentMethod), vendas pendentes entram no balde "fiado".
function paymentBreakdown(salesDoCaixa) {
  const payMap = {};
  salesDoCaixa.forEach(sale => {
    const k = sale.status === 'pendente' ? 'fiado' : (sale.settledPaymentMethod || sale.paymentMethod);
    if (!payMap[k]) payMap[k] = { count: 0, total: 0 };
    payMap[k].count++;
    payMap[k].total += sale.total;
  });
  const total = salesDoCaixa.reduce((s, sale) => s + sale.total, 0);
  const dinheiro = payMap.dinheiro?.total || 0;
  return { payMap, total, dinheiro };
}

function PaymentSummary({ payMap, total }) {
  const entries = Object.entries(payMap).sort((a, b) => b[1].total - a[1].total);
  if (entries.length === 0) {
    return <p className="text-gray-500 text-sm text-center py-4">Nenhuma venda registrada neste caixa ainda</p>;
  }
  return (
    <div className="space-y-3">
      {entries.map(([method, data]) => (
        <div key={method}>
          <div className="flex justify-between mb-1">
            <span className={`text-sm ${method === 'fiado' ? 'text-orange-400' : 'text-gray-400'}`}>{getPaymentLabel(method)}</span>
            <span className="text-white text-sm font-bold">{formatCurrency(data.total)}</span>
          </div>
          <div className="bg-dark-500 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${method === 'fiado' ? 'bg-orange-500' : 'bg-gold-500'}`}
              style={{ width: total > 0 ? `${(data.total / total) * 100}%` : '0%' }}
            />
          </div>
          <p className="text-gray-600 text-xs mt-1">{data.count} venda(s)</p>
        </div>
      ))}
    </div>
  );
}

function AbrirCaixaModal({ onConfirm, onClose }) {
  const [valor, setValor] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (valor === '' || isNaN(valor) || parseFloat(valor) < 0) { setError('Valor inválido'); return; }
    setSaving(true);
    try {
      await onConfirm(parseFloat(valor));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-700 border border-dark-400 rounded-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-400">
          <h3 className="text-white font-bold">Abrir Caixa</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-gray-500 text-xs mb-1.5 font-medium uppercase tracking-wide">Valor inicial (fundo de troco)</label>
            <input
              type="number" step="0.01" min="0" autoFocus
              className="w-full bg-dark-600 border border-dark-300 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500 transition-colors text-lg"
              placeholder="0,00"
              value={valor}
              onChange={e => { setValor(e.target.value); setError(''); }}
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} disabled={saving} className="flex-1 py-2.5 bg-dark-500 text-gray-400 rounded-xl hover:text-white transition-colors disabled:opacity-50">Cancelar</button>
            <button onClick={handleConfirm} disabled={saving} className="flex-1 py-2.5 bg-gold-500 text-black font-bold rounded-xl hover:bg-gold-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              <Unlock size={16} /> {saving ? 'Abrindo...' : 'Abrir Caixa'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FecharCaixaModal({ payMap, total, valorEsperado, onConfirm, onClose }) {
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await onConfirm();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-700 border border-dark-400 rounded-2xl w-full max-w-sm max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-400 sticky top-0 bg-dark-700">
          <h3 className="text-white font-bold">Fechar Caixa</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-dark-600 rounded-xl p-4">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <CreditCard size={13} className="text-gold-400" /> Resumo do período
            </p>
            <PaymentSummary payMap={payMap} total={total} />
          </div>

          <div className="bg-dark-600 rounded-xl p-4">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-gray-300">Valor esperado em caixa (Dinheiro)</span>
              <span className="text-gold-400">{formatCurrency(valorEsperado)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} disabled={saving} className="flex-1 py-2.5 bg-dark-500 text-gray-400 rounded-xl hover:text-white transition-colors disabled:opacity-50">Cancelar</button>
            <button onClick={handleConfirm} disabled={saving} className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              <Lock size={16} /> {saving ? 'Fechando...' : 'Fechar Caixa'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Caixa({ caixaAberto, historico, abrirCaixa, fecharCaixa, deleteCaixa, employee, sales }) {
  const [showAbrir, setShowAbrir] = useState(false);
  const [showFechar, setShowFechar] = useState(false);
  const [delConfirm, setDelConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  const showError = (message) => setToast({ type: 'error', message });

  const handleDelete = async (id) => {
    try {
      await deleteCaixa(id);
    } catch (err) {
      showError('Não foi possível excluir o registro de caixa: ' + err.message);
    } finally {
      setDelConfirm(null);
    }
  };

  const salesDoCaixaAberto = caixaAberto ? sales.filter(s => s.caixaId === caixaAberto.id) : [];
  const { payMap, total, dinheiro } = paymentBreakdown(salesDoCaixaAberto);
  const valorEsperado = (caixaAberto?.valorInicial || 0) + dinheiro;

  const handleAbrir = async (valorInicial) => {
    try {
      await abrirCaixa(valorInicial, employee.id);
      setShowAbrir(false);
    } catch (err) {
      showError('Não foi possível abrir o caixa: ' + err.message);
    }
  };

  const handleFechar = async () => {
    try {
      await fecharCaixa(caixaAberto.id, valorEsperado, employee.id);
      setShowFechar(false);
    } catch (err) {
      showError('Não foi possível fechar o caixa: ' + err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white">Caixa</h2>
        <p className="text-gray-500 text-sm">Controle de abertura e fechamento</p>
      </div>

      <div className="bg-dark-700 border border-dark-400 rounded-2xl p-6">
        {caixaAberto ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
              <Unlock size={26} className="text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-emerald-400 font-bold text-lg">Caixa aberto às {formatDateTime(caixaAberto.abertoEm).split(' ')[1]}</p>
              <p className="text-gray-400 text-sm">Valor inicial: <span className="text-white font-semibold">{formatCurrency(caixaAberto.valorInicial)}</span></p>
              {caixaAberto.abertoPorNome && <p className="text-gray-600 text-xs mt-0.5">Aberto por {caixaAberto.abertoPorNome}</p>}
            </div>
            <button
              onClick={() => setShowFechar(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-400 transition-colors"
            >
              <Lock size={17} /> Fechar Caixa
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-dark-500 flex items-center justify-center flex-shrink-0">
              <Wallet size={26} className="text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-lg">Caixa fechado</p>
              <p className="text-gray-500 text-sm">Nenhum caixa aberto no momento</p>
            </div>
            <button
              onClick={() => setShowAbrir(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-gold-500 text-black font-bold rounded-xl hover:bg-gold-400 transition-colors"
            >
              <Unlock size={17} /> Abrir Caixa
            </button>
          </div>
        )}
      </div>

      {caixaAberto && (
        <div className="bg-dark-700 border border-dark-400 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
            <CreditCard size={15} className="text-gold-400" /> Formas de Pagamento — Caixa Atual
          </h3>
          <PaymentSummary payMap={payMap} total={total} />
          {total > 0 && (
            <div className="flex justify-between mt-4 pt-3 border-t border-dark-400 text-sm">
              <span className="text-gray-400 font-medium">Total vendido</span>
              <span className="text-gold-400 font-bold">{formatCurrency(total)}</span>
            </div>
          )}
        </div>
      )}

      <div>
        <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-2">Histórico</h3>
        <div className="bg-dark-700 border border-dark-400 rounded-2xl overflow-hidden">
          {historico.length === 0 ? (
            <div className="text-center py-16">
              <History size={44} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum caixa fechado ainda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-400">
                    {['Abertura', 'Fechamento', 'Valor Inicial', 'Total Vendido', 'Ações'].map((h, i, arr) => (
                      <th key={h} className={`text-gray-600 text-xs px-4 py-3 font-medium uppercase tracking-wide ${i === arr.length - 1 ? 'text-center' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historico.map(c => {
                    const totalVendido = sales.filter(s => s.caixaId === c.id).reduce((s, sale) => s + sale.total, 0);
                    return (
                      <tr key={c.id} className="border-b border-dark-400 last:border-0 hover:bg-dark-600/40">
                        <td className="px-4 py-3 text-gray-400 text-sm whitespace-nowrap">{formatDateTime(c.abertoEm)}</td>
                        <td className="px-4 py-3 text-gray-400 text-sm whitespace-nowrap">{c.fechadoEm ? formatDateTime(c.fechadoEm) : '—'}</td>
                        <td className="px-4 py-3 text-white text-sm">{formatCurrency(c.valorInicial)}</td>
                        <td className="px-4 py-3 text-gold-400 text-sm font-semibold">{formatCurrency(totalVendido)}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => setDelConfirm(c.id)} title="Excluir" className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAbrir && (
        <AbrirCaixaModal
          onConfirm={handleAbrir}
          onClose={() => setShowAbrir(false)}
        />
      )}

      {showFechar && (
        <FecharCaixaModal
          payMap={payMap}
          total={total}
          valorEsperado={valorEsperado}
          onConfirm={handleFechar}
          onClose={() => setShowFechar(false)}
        />
      )}

      {delConfirm && (
        <DeleteModal
          title="Excluir Registro de Caixa"
          message="Tem certeza que deseja excluir este registro de caixa? Esta ação não pode ser desfeita."
          onConfirm={() => handleDelete(delConfirm)}
          onClose={() => setDelConfirm(null)}
        />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
