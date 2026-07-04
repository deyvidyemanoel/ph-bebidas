import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ClipboardList, Plus, Search, Minus, X, Check, Printer,
  CreditCard, Banknote, Smartphone, ArrowLeft, Trash2, Clock
} from 'lucide-react';
import {
  generateId, formatCurrency, PAYMENT_METHODS, getPaymentLabel
} from '../utils/helpers';

function timeOpen(dateStr) {
  const mins = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

// Estilos inline para o recibo impresso (independente de Tailwind)
const rs = {
  center: { textAlign: 'center' },
  row: { display: 'flex', justifyContent: 'space-between', width: '100%' },
  divider: { borderTop: '1px dashed #000', margin: '5px 0' },
  bold: { fontWeight: '700' },
  xbold: { fontWeight: '900' },
  gray: { color: '#555' },
  small: { fontSize: '10px' },
  big: { fontSize: '14px' },
  logo: { fontSize: '28px', fontWeight: '900', letterSpacing: '-1px', lineHeight: '1' },
  mb1: { marginBottom: '3px' },
  mb2: { marginBottom: '6px' },
  mt1: { marginTop: '3px' },
  mt2: { marginTop: '6px' },
};

function ComandaPrintPortal({ data }) {
  const { customerName, openedAt, closedAt, items, total, paymentMethod, amountPaid, change } = data;
  return createPortal(
    <div id="comanda-receipt-print">
      {/* Cabeçalho */}
      <div style={{ ...rs.center, ...rs.mb2 }}>
        <div style={rs.logo}>PH</div>
        <div style={{ ...rs.bold, ...rs.big }}>PH BEBIDAS</div>
        <div style={{ ...rs.gray, ...rs.small, ...rs.mt1 }}>Sao Miguel do Tapuio - PI</div>
        <div style={{ ...rs.gray, ...rs.small }}>WhatsApp: (86) 98195-5717</div>
      </div>

      <div style={rs.divider} />

      {/* Identificação */}
      <div style={{ ...rs.center, ...rs.mb1 }}>
        <div style={{ ...rs.xbold, ...rs.big }}>COMANDA</div>
        <div style={{ ...rs.bold, ...rs.mt1 }}>Cliente: {customerName}</div>
        <div style={{ ...rs.gray, ...rs.small, ...rs.mt1 }}>
          Aberta: {new Date(openedAt).toLocaleString('pt-BR')}
        </div>
        <div style={{ ...rs.gray, ...rs.small }}>
          Fechada: {new Date(closedAt).toLocaleString('pt-BR')}
        </div>
      </div>

      <div style={rs.divider} />

      {/* Tabela de itens */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #000', paddingBottom: '3px', fontWeight: '700' }}>
              Produto
            </th>
            <th style={{ textAlign: 'center', borderBottom: '1px solid #000', paddingBottom: '3px', fontWeight: '700', width: '26px' }}>
              Qtd
            </th>
            <th style={{ textAlign: 'right', borderBottom: '1px solid #000', paddingBottom: '3px', fontWeight: '700', width: '54px' }}>
              V.Unit
            </th>
            <th style={{ textAlign: 'right', borderBottom: '1px solid #000', paddingBottom: '3px', fontWeight: '700', width: '54px' }}>
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td style={{ padding: '3px 2px 3px 0', wordBreak: 'break-word', borderBottom: '1px dashed #ddd' }}>
                {item.name}
              </td>
              <td style={{ textAlign: 'center', padding: '3px 2px', borderBottom: '1px dashed #ddd' }}>
                {item.quantity}
              </td>
              <td style={{ textAlign: 'right', padding: '3px 2px', borderBottom: '1px dashed #ddd', color: '#555' }}>
                {formatCurrency(item.unitPrice)}
              </td>
              <td style={{ textAlign: 'right', padding: '3px 0', borderBottom: '1px dashed #ddd', fontWeight: '600' }}>
                {formatCurrency(item.subtotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderTop: '1px solid #000', marginTop: '2px' }} />

      {/* Totais */}
      <div style={{ ...rs.row, ...rs.xbold, ...rs.big, marginTop: '4px' }}>
        <span>TOTAL</span>
        <span>{formatCurrency(total)}</span>
      </div>
      <div style={{ ...rs.row, ...rs.gray, ...rs.mt1 }}>
        <span>{getPaymentLabel(paymentMethod)}</span>
        {paymentMethod === 'dinheiro' && <span>Pago: {formatCurrency(amountPaid)}</span>}
      </div>
      {paymentMethod === 'dinheiro' && change > 0 && (
        <div style={{ ...rs.row, ...rs.bold, ...rs.mt1 }}>
          <span>TROCO</span>
          <span>{formatCurrency(change)}</span>
        </div>
      )}

      <div style={{ ...rs.divider, ...rs.mt2 }} />

      {/* Contato */}
      <div style={{ ...rs.center, ...rs.mb2 }}>
        <div style={{ ...rs.gray, ...rs.small, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
          Contato &amp; Pagamento
        </div>
        <div style={rs.mb1}>
          <div style={{ ...rs.gray, ...rs.small }}>WhatsApp</div>
          <div style={rs.bold}>(86) 98195-5717</div>
        </div>
        <div>
          <div style={{ ...rs.gray, ...rs.small }}>Pix CPF</div>
          <div style={rs.bold}>049.836.913-75</div>
        </div>
      </div>

      <div style={rs.divider} />

      <div style={rs.center}>
        <div style={rs.bold}>Obrigado pela preferencia!</div>
        <div style={rs.gray}>Volte sempre!</div>
      </div>
    </div>,
    document.body
  );
}

function PaymentModal({ total, onConfirm, onClose }) {
  const [method, setMethod] = useState('dinheiro');
  const [amountPaid, setAmountPaid] = useState('');

  const isCash = method === 'dinheiro';
  const paid = parseFloat(amountPaid) || 0;
  const change = isCash && paid >= total ? paid - total : 0;
  const canConfirm = isCash ? paid >= total : true;

  const quickAmounts = [...new Set([
    total,
    Math.ceil(total / 5) * 5,
    Math.ceil(total / 10) * 10,
    Math.ceil(total / 50) * 50,
  ])].filter(v => v >= total).slice(0, 4);

  const payIcons = { dinheiro: Banknote, pix: Smartphone, credito: CreditCard, debito: CreditCard };
  const methods = PAYMENT_METHODS.filter(m => m.value !== 'fiado');

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-700 border border-dark-400 rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-400">
          <h3 className="text-white font-bold text-lg">Fechar Comanda</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-5">
          <div className="bg-gold-500/10 border border-gold-500/25 rounded-2xl p-5 text-center">
            <p className="text-gray-500 text-sm mb-1">Total a Pagar</p>
            <p className="text-gold-400 text-5xl font-black">{formatCurrency(total)}</p>
          </div>

          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-2">Forma de Pagamento</p>
            <div className="grid grid-cols-2 gap-2">
              {methods.map(({ value, label }) => {
                const Icon = payIcons[value] || CreditCard;
                return (
                  <button
                    key={value}
                    onClick={() => setMethod(value)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all
                      ${method === value
                        ? 'border-gold-500 bg-gold-500/12 text-gold-400'
                        : 'border-dark-300 text-gray-500 hover:border-dark-200 hover:text-white'}`}
                  >
                    <Icon size={17} />{label}
                  </button>
                );
              })}
            </div>
          </div>

          {isCash && (
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-2">Valor Recebido</p>
              <input
                className="w-full bg-dark-600 border border-dark-300 rounded-xl px-4 py-4 text-white text-center text-3xl font-black focus:outline-none focus:border-gold-500 transition-colors"
                type="number" step="0.01" min={total}
                placeholder="0,00" value={amountPaid}
                onChange={e => setAmountPaid(e.target.value)} autoFocus
              />
              <div className="grid grid-cols-4 gap-2 mt-2">
                {quickAmounts.map(v => (
                  <button key={v} onClick={() => setAmountPaid(v.toFixed(2))}
                    className="py-2 rounded-xl bg-dark-500 text-gray-300 text-sm hover:bg-dark-400 hover:text-white transition-colors font-medium">
                    {formatCurrency(v)}
                  </button>
                ))}
              </div>
              {paid >= total && paid > 0 && (
                <div className="mt-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-4 text-center">
                  <p className="text-gray-500 text-sm mb-1">Troco</p>
                  <p className="text-emerald-400 text-4xl font-black">{formatCurrency(change)}</p>
                </div>
              )}
            </div>
          )}

          {method === 'pix' && (
            <div className="bg-dark-600 border border-dark-300 rounded-xl p-4 text-center">
              <Smartphone size={30} className="text-gold-400 mx-auto mb-2" />
              <p className="text-white font-medium text-sm">Chave Pix</p>
              <p className="text-gold-400 font-bold mt-1">049.836.913-75</p>
            </div>
          )}

          <button
            onClick={() => canConfirm && onConfirm({ method, amountPaid: isCash ? (paid || total) : total, change })}
            disabled={!canConfirm}
            className="w-full py-4 bg-gold-500 text-black font-black text-xl rounded-xl hover:bg-gold-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Check size={22} />
            Fechar e Registrar
          </button>
        </div>
      </div>
    </div>
  );
}

function ReceiptModal({ data, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl max-h-[90vh] flex flex-col">
        <div className="overflow-y-auto flex-1 p-5 font-mono text-black text-xs">
          {/* Cabeçalho */}
          <div className="text-center mb-3">
            <div className="text-4xl font-black tracking-tighter leading-none mb-1">PH</div>
            <div className="font-bold text-sm">PH BEBIDAS</div>
            <div className="text-gray-500">São Miguel do Tapuio - PI</div>
          </div>
          <div className="border-t border-dashed border-gray-300 my-2" />

          {/* Identificação */}
          <div className="text-center mb-2">
            <div className="font-black text-base">COMANDA</div>
            <div className="font-bold mt-1">Cliente: {data.customerName}</div>
            <div className="text-gray-500 text-xs mt-1">
              {new Date(data.closedAt).toLocaleString('pt-BR')}
            </div>
          </div>
          <div className="border-t border-dashed border-gray-300 my-2" />

          {/* Tabela */}
          <div className="grid text-xs font-bold border-b border-gray-300 pb-1 mb-1" style={{ gridTemplateColumns: '1fr 32px 64px 64px' }}>
            <span>Produto</span>
            <span className="text-center">Qtd</span>
            <span className="text-right">V.Unit</span>
            <span className="text-right">Total</span>
          </div>
          <div className="space-y-0.5">
            {data.items.map((item, i) => (
              <div key={i} className="grid text-xs border-b border-dashed border-gray-100 py-1" style={{ gridTemplateColumns: '1fr 32px 64px 64px' }}>
                <span className="pr-1 break-words">{item.name}</span>
                <span className="text-center">{item.quantity}</span>
                <span className="text-right text-gray-500">{formatCurrency(item.unitPrice)}</span>
                <span className="text-right font-semibold">{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-300 mt-2" />
          <div className="flex justify-between font-black text-sm mt-2">
            <span>TOTAL</span>
            <span>{formatCurrency(data.total)}</span>
          </div>
          <div className="flex justify-between text-gray-600 text-xs mt-1">
            <span>{getPaymentLabel(data.paymentMethod)}</span>
            {data.paymentMethod === 'dinheiro' && <span>Pago: {formatCurrency(data.amountPaid)}</span>}
          </div>
          {data.paymentMethod === 'dinheiro' && data.change > 0 && (
            <div className="flex justify-between font-bold text-xs mt-1">
              <span>TROCO</span>
              <span>{formatCurrency(data.change)}</span>
            </div>
          )}

          <div className="border-t border-dashed border-gray-300 my-2" />
          <div className="text-center text-gray-500">
            <p className="font-medium text-black">Obrigado pela preferência!</p>
            <p>Volte sempre!</p>
          </div>
        </div>

        <div className="px-4 pb-4 pt-3 flex gap-2 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-xl font-medium text-sm"
          >
            <Printer size={16} /> Imprimir
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Comanda({
  products, setProducts,
  sales, setSales,
  movements, setMovements,
  comandas, setComandas,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [search, setSearch] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [printData, setPrintData] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const searchRef = useRef(null);
  const newNameRef = useRef(null);

  const selected = comandas.find(c => c.id === selectedId) ?? null;
  const selectedTotal = selected
    ? selected.items.reduce((s, i) => s + i.subtotal, 0)
    : 0;

  const searchResults = search.trim().length >= 1
    ? products
        .filter(p =>
          (p.name.toLowerCase().includes(search.toLowerCase()) ||
           p.brand.toLowerCase().includes(search.toLowerCase())) &&
          p.quantity > 0
        )
        .slice(0, 8)
    : [];

  const createComanda = () => {
    if (!newName.trim()) return;
    const c = {
      id: generateId(),
      customerName: newName.trim(),
      openedAt: new Date().toISOString(),
      items: [],
    };
    setComandas(prev => [...prev, c]);
    setSelectedId(c.id);
    setNewName('');
    setShowNewModal(false);
  };

  const addItem = (product) => {
    setComandas(prev => prev.map(c => {
      if (c.id !== selectedId) return c;
      const existing = c.items.find(i => i.productId === product.id);
      if (existing) {
        return {
          ...c,
          items: c.items.map(i =>
            i.productId === product.id
              ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unitPrice }
              : i
          ),
        };
      }
      return {
        ...c,
        items: [...c.items, {
          productId: product.id,
          name: product.name,
          brand: product.brand,
          unitPrice: product.sellPrice,
          quantity: 1,
          subtotal: product.sellPrice,
        }],
      };
    }));
    setSearch('');
    setTimeout(() => searchRef.current?.focus(), 50);
  };

  const setItemQty = (productId, qty) => {
    setComandas(prev => prev.map(c => {
      if (c.id !== selectedId) return c;
      if (qty <= 0) return { ...c, items: c.items.filter(i => i.productId !== productId) };
      return {
        ...c,
        items: c.items.map(i =>
          i.productId === productId
            ? { ...i, quantity: qty, subtotal: qty * i.unitPrice }
            : i
        ),
      };
    }));
  };

  const deleteComanda = (id) => {
    setComandas(prev => prev.filter(c => c.id !== id));
    if (selectedId === id) setSelectedId(null);
    setDeleteConfirmId(null);
  };

  const closeComanda = ({ method, amountPaid, change }) => {
    if (!selected || selected.items.length === 0) return;
    const now = new Date().toISOString();

    const sale = {
      id: generateId(),
      date: now,
      items: selected.items,
      total: selectedTotal,
      paymentMethod: method,
      amountPaid,
      change,
      customerId: null,
      status: 'pago',
    };

    setSales(prev => [sale, ...prev]);

    const newMovs = selected.items.map(item => ({
      id: generateId(), date: now,
      productId: item.productId,
      productName: item.name,
      type: 'saida',
      quantity: item.quantity,
      reason: `Comanda - ${selected.customerName}`,
    }));
    setMovements(prev => [...newMovs, ...prev]);

    setProducts(prev => prev.map(p => {
      const ci = selected.items.find(i => i.productId === p.id);
      return ci ? { ...p, quantity: p.quantity - ci.quantity } : p;
    }));

    const pd = {
      ...selected,
      total: selectedTotal,
      paymentMethod: method,
      amountPaid,
      change,
      closedAt: now,
    };
    setComandas(prev => prev.filter(c => c.id !== selectedId));
    setSelectedId(null);
    setShowPayment(false);
    setPrintData(pd);
  };

  // ── Vista: Lista de comandas ──────────────────────────────────────────
  if (!selected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white">Comanda</h2>
            <p className="text-gray-500 text-sm">
              {comandas.length > 0
                ? `${comandas.length} comanda(s) aberta(s)`
                : 'Nenhuma comanda aberta'}
            </p>
          </div>
          <button
            onClick={() => {
              setShowNewModal(true);
              setTimeout(() => newNameRef.current?.focus(), 50);
            }}
            className="flex items-center gap-2 bg-gold-500 text-black font-bold px-4 py-2.5 rounded-xl hover:bg-gold-400 transition-colors text-sm"
          >
            <Plus size={16} /> Nova Comanda
          </button>
        </div>

        {comandas.length === 0 ? (
          <div className="bg-dark-700 border border-dark-400 rounded-2xl p-16 text-center">
            <ClipboardList size={52} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhuma comanda aberta</p>
            <p className="text-gray-700 text-sm mt-1">Clique em "Nova Comanda" para começar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {comandas.map(c => {
              const tot = c.items.reduce((s, i) => s + i.subtotal, 0);
              const itemCount = c.items.reduce((s, i) => s + i.quantity, 0);
              return (
                <div
                  key={c.id}
                  className="bg-dark-700 border border-dark-400 rounded-2xl p-5 hover:border-gold-500/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gold-500/15 flex items-center justify-center">
                      <ClipboardList size={18} className="text-gold-400" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-xs flex items-center gap-1">
                        <Clock size={11} /> {timeOpen(c.openedAt)}
                      </span>
                      <button
                        onClick={() => setDeleteConfirmId(c.id)}
                        className="text-gray-700 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-400/10"
                        title="Cancelar comanda"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <p className="text-white font-bold text-base leading-tight">{c.customerName}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {itemCount > 0 ? `${itemCount} item(s)` : 'Sem itens ainda'}
                  </p>
                  <p className="text-gold-400 font-black text-2xl mt-2">{formatCurrency(tot)}</p>
                  <button
                    onClick={() => setSelectedId(c.id)}
                    className="mt-3 w-full py-2 rounded-xl bg-dark-600 border border-dark-300 hover:border-gold-500/50 hover:bg-gold-500/8 text-gray-400 hover:text-gold-400 text-sm font-medium transition-colors"
                  >
                    Abrir comanda →
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: nova comanda */}
        {showNewModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-dark-700 border border-dark-400 rounded-2xl w-full max-w-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">Nova Comanda</h3>
                <button onClick={() => { setShowNewModal(false); setNewName(''); }} className="text-gray-500 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <label className="block text-gray-500 text-xs font-medium uppercase tracking-wide mb-2">
                Nome do Cliente / Mesa
              </label>
              <input
                ref={newNameRef}
                className="w-full bg-dark-600 border border-dark-300 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500 text-sm transition-colors"
                placeholder="Ex: João Silva, Mesa 3..."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createComanda()}
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => { setShowNewModal(false); setNewName(''); }}
                  className="flex-1 py-2.5 rounded-xl border border-dark-300 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={createComanda}
                  disabled={!newName.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-gold-500 text-black font-bold hover:bg-gold-400 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Criar Comanda
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: confirmar exclusão */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-dark-700 border border-dark-400 rounded-2xl p-6 w-full max-w-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center">
                  <Trash2 size={16} className="text-red-400" />
                </div>
                <p className="text-white font-semibold">Cancelar comanda?</p>
              </div>
              <p className="text-gray-500 text-sm mb-5">
                Os itens adicionados serão perdidos. Nenhuma venda será registrada.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-dark-300 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Manter
                </button>
                <button
                  onClick={() => deleteComanda(deleteConfirmId)}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold transition-colors text-sm"
                >
                  Cancelar comanda
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recibo após fechar comanda */}
        {printData && (
          <>
            <ComandaPrintPortal data={printData} />
            <ReceiptModal data={printData} onClose={() => setPrintData(null)} />
          </>
        )}
      </div>
    );
  }

  // ── Vista: Detalhe da comanda ─────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => { setSelectedId(null); setSearch(''); }}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        <div className="h-5 w-px bg-dark-400" />
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-white truncate">{selected.customerName}</h2>
          <p className="text-gray-600 text-xs">
            Aberta às {new Date(selected.openedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · {timeOpen(selected.openedAt)}
          </p>
        </div>
        <button
          onClick={() => setDeleteConfirmId(selected.id)}
          className="flex items-center gap-1.5 text-gray-600 hover:text-red-400 text-xs transition-colors ml-auto"
        >
          <Trash2 size={13} /> Cancelar comanda
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:items-start">
        {/* Busca de produtos */}
        <div className="space-y-3">
          <div className="relative">
            <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-400" />
            <input
              ref={searchRef}
              className="w-full bg-dark-700 border border-dark-400 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500 text-lg transition-colors"
              placeholder="Buscar produto para adicionar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button
                onClick={() => { setSearch(''); searchRef.current?.focus(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X size={17} />
              </button>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="bg-dark-700 border border-dark-400 rounded-2xl overflow-hidden">
              {searchResults.map(p => (
                <button
                  key={p.id}
                  onClick={() => addItem(p)}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-dark-600 border-b border-dark-400 last:border-0 transition-colors text-left"
                >
                  <div>
                    <p className="text-white font-medium text-sm">{p.name}</p>
                    <p className="text-gray-600 text-xs">{p.brand} · {p.quantity} em estoque</p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="text-gold-400 font-bold text-base">{formatCurrency(p.sellPrice)}</p>
                    <p className="text-gray-600 text-xs">toque para add</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {search.trim().length >= 1 && searchResults.length === 0 && (
            <div className="bg-dark-700 border border-dark-400 rounded-2xl p-5 text-center">
              <p className="text-gray-500 text-sm">Nenhum produto encontrado</p>
            </div>
          )}
        </div>

        {/* Itens da comanda */}
        <div className="bg-dark-700 border border-dark-400 rounded-2xl flex flex-col" style={{ minHeight: 400 }}>
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-dark-400">
            <div className="flex items-center gap-2">
              <ClipboardList size={17} className="text-gold-400" />
              <span className="text-white font-semibold text-sm">Itens da Comanda</span>
              {selected.items.length > 0 && (
                <span className="bg-gold-500 text-black text-xs font-black px-1.5 py-0.5 rounded-full">
                  {selected.items.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </div>
            {selected.items.length > 0 && (
              <button
                onClick={() => setComandas(prev => prev.map(c =>
                  c.id === selectedId ? { ...c, items: [] } : c
                ))}
                className="text-gray-600 hover:text-red-400 text-xs transition-colors flex items-center gap-1"
              >
                <Trash2 size={13} /> Limpar
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {selected.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <ClipboardList size={44} className="text-gray-800 mb-3" />
                <p className="text-gray-600 text-sm">Nenhum item ainda</p>
                <p className="text-gray-700 text-xs mt-1">Busque um produto ao lado</p>
              </div>
            ) : (
              <div className="p-2 space-y-0.5">
                {selected.items.map(item => (
                  <div key={item.productId} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-dark-600/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium leading-tight">{item.name}</p>
                      <p className="text-gray-600 text-xs">{formatCurrency(item.unitPrice)}/un</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => setItemQty(item.productId, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-dark-500 text-gray-400 hover:text-white hover:bg-dark-400 flex items-center justify-center transition-colors"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="text-white font-bold w-7 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => setItemQty(item.productId, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-dark-500 text-gray-400 hover:text-white hover:bg-dark-400 flex items-center justify-center transition-colors"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <div className="text-right w-16 flex-shrink-0">
                      <p className="text-gold-400 font-bold text-sm">{formatCurrency(item.subtotal)}</p>
                    </div>
                    <button
                      onClick={() => setItemQty(item.productId, 0)}
                      className="text-gray-700 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-dark-400 p-4">
            {selected.items.length > 0 && (
              <div className="mb-3 flex justify-between items-center">
                <span className="text-gray-400 font-medium">Total da comanda</span>
                <span className="text-gold-400 text-2xl font-black">{formatCurrency(selectedTotal)}</span>
              </div>
            )}
            <button
              onClick={() => setShowPayment(true)}
              disabled={selected.items.length === 0}
              className="w-full py-4 bg-gold-500 text-black font-black text-lg rounded-xl hover:bg-gold-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check size={22} />
              Fechar Comanda
            </button>
          </div>
        </div>
      </div>

      {/* Modal confirmar exclusão (no detalhe) */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-700 border border-dark-400 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center">
                <Trash2 size={16} className="text-red-400" />
              </div>
              <p className="text-white font-semibold">Cancelar comanda?</p>
            </div>
            <p className="text-gray-500 text-sm mb-5">
              Os itens adicionados serão perdidos. Nenhuma venda será registrada.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-dark-300 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Manter
              </button>
              <button
                onClick={() => deleteComanda(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold transition-colors text-sm"
              >
                Cancelar comanda
              </button>
            </div>
          </div>
        </div>
      )}

      {showPayment && (
        <PaymentModal
          total={selectedTotal}
          onConfirm={closeComanda}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}
