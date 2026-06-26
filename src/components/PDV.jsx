import React, { useState, useRef } from 'react';
import {
  Search, ShoppingCart, Trash2, Plus, Minus, X,
  Check, Printer, CreditCard, Banknote, Smartphone,
  User, AlertTriangle, Clock
} from 'lucide-react';
import { generateId, formatCurrency, PAYMENT_METHODS, getPaymentLabel } from '../utils/helpers';

function Receipt({ sale, clients, onClose }) {
  const client = clients.find(c => c.id === sale.customerId);
  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xs shadow-2xl">
        <div id="receipt-print" className="p-5 font-mono text-black text-xs">
          {/* Cabeçalho */}
          <div className="text-center mb-3">
            <div className="text-4xl font-black tracking-tighter leading-none mb-1">PH</div>
            <div className="font-bold text-sm">PH BEBIDAS</div>
            <div className="text-gray-500 mt-0.5">São Miguel do Tapuio - PI</div>
            <div className="text-gray-400 mt-0.5">WhatsApp: (86) 98195-5717</div>
          </div>

          <div className="border-t-2 border-dashed border-gray-300 my-2" />

          <div className="text-center text-gray-500 mb-1">
            {sale.status === 'pendente' ? '*** VENDA FIADO — PENDENTE ***' : '*** CUPOM NÃO FISCAL ***'}
          </div>
          <div className="text-gray-500 text-center">{new Date(sale.date).toLocaleString('pt-BR')}</div>
          {client && <div className="text-center mt-1 font-bold">Cliente: {client.name}</div>}

          <div className="border-t-2 border-dashed border-gray-300 my-2" />

          {/* Itens */}
          <div className="space-y-1.5">
            {sale.items.map((item, i) => (
              <div key={i}>
                <div className="font-medium leading-tight">{item.name}</div>
                <div className="flex justify-between text-gray-600">
                  <span>{item.quantity}x {formatCurrency(item.unitPrice)}</span>
                  <span className="font-semibold">{formatCurrency(item.subtotal)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-dashed border-gray-300 my-2" />

          {/* Total */}
          <div className="space-y-1">
            <div className="flex justify-between font-black text-sm">
              <span>TOTAL</span>
              <span>{formatCurrency(sale.total)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{getPaymentLabel(sale.paymentMethod)}</span>
              {sale.paymentMethod === 'dinheiro' && <span>Pago: {formatCurrency(sale.amountPaid)}</span>}
            </div>
            {sale.paymentMethod === 'dinheiro' && sale.change > 0 && (
              <div className="flex justify-between font-bold">
                <span>TROCO</span>
                <span>{formatCurrency(sale.change)}</span>
              </div>
            )}
            {sale.status === 'pendente' && (
              <div className="mt-2 p-2 border-2 border-gray-400 rounded text-center font-bold">
                PENDENTE — A RECEBER
              </div>
            )}
          </div>

          <div className="border-t-2 border-dashed border-gray-300 my-2" />

          {/* Contato e pagamento */}
          <div className="text-center space-y-1.5">
            <p className="text-gray-500 font-semibold uppercase tracking-wide" style={{ fontSize: '9px' }}>
              Contato &amp; Pagamento
            </p>
            <div>
              <div className="text-gray-500">📱 WhatsApp</div>
              <div className="font-bold">(86) 98195-5717</div>
            </div>
            <div>
              <div className="text-gray-500">💳 Pix CPF</div>
              <div className="font-bold">049.836.913-75</div>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-gray-300 my-2" />

          {/* Rodapé */}
          <div className="text-center text-gray-500 space-y-0.5">
            <p className="font-medium text-black">Obrigado pela preferência!</p>
            <p>Volte sempre!</p>
            <p className="mt-1 text-gray-400" style={{ fontSize: '9px' }}>#{sale.id.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        <div className="px-4 pb-4 flex gap-2 print:hidden">
          <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-xl font-medium text-sm">
            <Printer size={16} /> Imprimir
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentModal({ total, clients, onConfirm, onClose }) {
  const [method, setMethod] = useState('dinheiro');
  const [amountPaid, setAmountPaid] = useState('');
  const [clientId, setClientId] = useState('');

  const isFiado = method === 'fiado';
  const isCash = method === 'dinheiro';
  const paid = parseFloat(amountPaid) || 0;
  const change = isCash && paid >= total ? paid - total : 0;

  const canPay = isFiado
    ? !!clientId
    : isCash
    ? paid >= total
    : true;

  const quickAmounts = [...new Set([
    total,
    Math.ceil(total / 5) * 5,
    Math.ceil(total / 10) * 10,
    Math.ceil(total / 50) * 50,
  ])].filter(v => v >= total).slice(0, 4);

  const payIcons = { dinheiro: Banknote, pix: Smartphone, credito: CreditCard, debito: CreditCard };
  const regularMethods = PAYMENT_METHODS.filter(m => m.value !== 'fiado');

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-700 border border-dark-400 rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-400">
          <h3 className="text-white font-bold text-lg">Finalizar Venda</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Total */}
          <div className="bg-gold-500/10 border border-gold-500/25 rounded-2xl p-5 text-center">
            <p className="text-gray-500 text-sm mb-1">Total a Pagar</p>
            <p className="text-gold-400 text-5xl font-black">{formatCurrency(total)}</p>
          </div>

          {/* Regular payment methods */}
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-2">Forma de Pagamento</p>
            <div className="grid grid-cols-2 gap-2">
              {regularMethods.map(({ value, label }) => {
                const Icon = payIcons[value] || CreditCard;
                return (
                  <button
                    key={value}
                    onClick={() => setMethod(value)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all
                      ${method === value && !isFiado
                        ? 'border-gold-500 bg-gold-500/12 text-gold-400'
                        : 'border-dark-300 text-gray-500 hover:border-dark-200 hover:text-white'}`}
                  >
                    <Icon size={17} />{label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash change */}
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

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-dark-300" />
            <p className="text-gray-600 text-xs uppercase tracking-wide">ou</p>
            <div className="flex-1 h-px bg-dark-300" />
          </div>

          {/* Fiado option */}
          <div>
            <button
              onClick={() => setMethod(isFiado ? 'dinheiro' : 'fiado')}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all font-medium
                ${isFiado
                  ? 'border-orange-500 bg-orange-500/12 text-orange-400'
                  : 'border-dark-300 text-gray-500 hover:border-orange-500/40 hover:text-orange-400'}`}
            >
              <Clock size={18} className={isFiado ? 'text-orange-400' : 'text-gray-600'} />
              <div className="flex-1">
                <p className="font-semibold">Venda Fiado</p>
                <p className={`text-xs mt-0.5 ${isFiado ? 'text-orange-400/70' : 'text-gray-600'}`}>
                  Registra a dívida no nome do cliente
                </p>
              </div>
              {isFiado && <Check size={16} className="text-orange-400" />}
            </button>

            {isFiado && (
              <div className="mt-3 space-y-3">
                <div className="flex items-start gap-2 bg-orange-500/10 border border-orange-500/25 rounded-xl px-4 py-3">
                  <AlertTriangle size={14} className="text-orange-400 flex-shrink-0 mt-0.5" />
                  <p className="text-orange-300 text-xs leading-relaxed">
                    O produto sairá do estoque. O valor ficará como pendente até o cliente pagar.
                  </p>
                </div>

                {clients.length === 0 ? (
                  <div className="bg-dark-600 border border-dark-300 rounded-xl p-4 text-center">
                    <User size={22} className="text-gray-600 mx-auto mb-1.5" />
                    <p className="text-gray-400 text-sm font-medium">Nenhum cliente cadastrado</p>
                    <p className="text-gray-600 text-xs mt-1">Cadastre um cliente primeiro na aba Clientes</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-2">
                      <User size={11} className="inline mr-1" />Cliente *
                    </p>
                    <select
                      className="w-full bg-dark-600 border border-dark-300 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                      value={clientId} onChange={e => setClientId(e.target.value)}
                    >
                      <option value="">Selecione o cliente...</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {!clientId && (
                      <p className="text-orange-400 text-xs mt-1">Selecione o cliente para registrar o fiado</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Client (optional for non-fiado) */}
          {!isFiado && clients.length > 0 && (
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-2">
                <User size={11} className="inline mr-1" />Cliente (opcional)
              </p>
              <select
                className="w-full bg-dark-600 border border-dark-300 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold-500"
                value={clientId} onChange={e => setClientId(e.target.value)}
              >
                <option value="">Sem cliente</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}

          <button
            onClick={() => onConfirm({
              method,
              amountPaid: isCash ? (paid || total) : total,
              change,
              clientId: clientId || null,
              status: isFiado ? 'pendente' : 'pago',
            })}
            disabled={!canPay}
            className={`w-full py-4 font-black text-xl rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2
              ${isFiado
                ? 'bg-orange-500 text-white hover:bg-orange-400'
                : 'bg-gold-500 text-black hover:bg-gold-400'}`}
          >
            <Check size={22} />
            {isFiado ? 'Registrar Fiado' : 'Confirmar Venda'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PDV({ products, setProducts, sales, setSales, clients, movements, setMovements }) {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const searchRef = useRef(null);

  const searchResults = search.trim().length >= 1
    ? products.filter(p =>
        (p.name.toLowerCase().includes(search.toLowerCase()) ||
         p.brand.toLowerCase().includes(search.toLowerCase())) &&
        p.quantity > 0
      ).slice(0, 8)
    : [];

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) return prev;
        return prev.map(i => i.productId === product.id
          ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unitPrice }
          : i
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        brand: product.brand,
        unitPrice: product.sellPrice,
        quantity: 1,
        subtotal: product.sellPrice,
        maxQty: product.quantity,
      }];
    });
    setSearch('');
    setTimeout(() => searchRef.current?.focus(), 50);
  };

  const setQty = (productId, qty) => {
    if (qty <= 0) { setCart(prev => prev.filter(i => i.productId !== productId)); return; }
    setCart(prev => prev.map(i => {
      if (i.productId !== productId) return i;
      const newQty = Math.min(qty, i.maxQty);
      return { ...i, quantity: newQty, subtotal: newQty * i.unitPrice };
    }));
  };

  const cartTotal = cart.reduce((s, i) => s + i.subtotal, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const handleConfirm = ({ method, amountPaid, change, clientId, status }) => {
    const now = new Date().toISOString();
    const sale = {
      id: generateId(), date: now,
      items: cart, total: cartTotal,
      paymentMethod: method, amountPaid, change,
      customerId: clientId,
      status,
    };

    setSales(prev => [sale, ...prev]);

    const newMovs = cart.map(item => ({
      id: generateId(), date: now,
      productId: item.productId, productName: item.name,
      type: 'saida', quantity: item.quantity,
      reason: status === 'pendente'
        ? `Fiado #${sale.id.slice(-6).toUpperCase()}`
        : `Venda #${sale.id.slice(-6).toUpperCase()}`,
    }));
    setMovements(prev => [...newMovs, ...prev]);

    setProducts(prev => prev.map(p => {
      const ci = cart.find(i => i.productId === p.id);
      return ci ? { ...p, quantity: p.quantity - ci.quantity } : p;
    }));

    setLastSale(sale);
    setCart([]);
    setSearch('');
    setShowPayment(false);
  };

  const todaySales = sales.filter(s => {
    const d = new Date(s.date);
    return d.toDateString() === new Date().toDateString() && s.status !== 'pendente';
  });
  const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white">PDV — Ponto de Venda</h2>
        <p className="text-gray-500 text-sm">Venda rápida e fácil</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:items-start">
        {/* Search */}
        <div className="space-y-3">
          <div className="relative">
            <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-400" />
            <input
              ref={searchRef}
              className="w-full bg-dark-700 border border-dark-400 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500 text-lg transition-colors"
              placeholder="Buscar produto..."
              value={search} onChange={e => setSearch(e.target.value)} autoFocus
            />
            {search && (
              <button onClick={() => { setSearch(''); searchRef.current?.focus(); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <X size={17} />
              </button>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="bg-dark-700 border border-dark-400 rounded-2xl overflow-hidden">
              {searchResults.map(p => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-dark-600 border-b border-dark-400 last:border-0 transition-colors text-left"
                >
                  <div>
                    <p className="text-white font-medium text-sm">{p.name}</p>
                    <p className="text-gray-600 text-xs">{p.brand} · {p.quantity} em estoque · {p.unit}</p>
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

          {todaySales.length > 0 && (
            <div className="bg-dark-700 border border-dark-400 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">Vendas pagas hoje</p>
                <p className="text-gold-400 font-bold">{formatCurrency(todayTotal)}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-xs">Transações</p>
                <p className="text-white font-bold">{todaySales.length}</p>
              </div>
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="bg-dark-700 border border-dark-400 rounded-2xl flex flex-col" style={{ minHeight: 420 }}>
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-dark-400">
            <div className="flex items-center gap-2">
              <ShoppingCart size={17} className="text-gold-400" />
              <span className="text-white font-semibold text-sm">Carrinho</span>
              {cartCount > 0 && (
                <span className="bg-gold-500 text-black text-xs font-black px-1.5 py-0.5 rounded-full min-w-5 text-center">
                  {cartCount}
                </span>
              )}
            </div>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} className="text-gray-600 hover:text-red-400 text-xs transition-colors flex items-center gap-1">
                <Trash2 size={13} /> Limpar
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <ShoppingCart size={44} className="text-gray-800 mb-3" />
                <p className="text-gray-600 text-sm">Carrinho vazio</p>
                <p className="text-gray-700 text-xs mt-1">Busque um produto acima</p>
              </div>
            ) : (
              <div className="p-2 space-y-0.5">
                {cart.map(item => (
                  <div key={item.productId} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-dark-600/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium leading-tight">{item.name}</p>
                      <p className="text-gray-600 text-xs">{formatCurrency(item.unitPrice)}/un</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => setQty(item.productId, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-dark-500 text-gray-400 hover:text-white hover:bg-dark-400 flex items-center justify-center transition-colors">
                        <Minus size={13} />
                      </button>
                      <span className="text-white font-bold w-7 text-center text-sm">{item.quantity}</span>
                      <button onClick={() => setQty(item.productId, item.quantity + 1)} disabled={item.quantity >= item.maxQty}
                        className="w-7 h-7 rounded-lg bg-dark-500 text-gray-400 hover:text-white hover:bg-dark-400 flex items-center justify-center transition-colors disabled:opacity-30">
                        <Plus size={13} />
                      </button>
                    </div>
                    <div className="text-right w-16 flex-shrink-0">
                      <p className="text-gold-400 font-bold text-sm">{formatCurrency(item.subtotal)}</p>
                    </div>
                    <button onClick={() => setCart(prev => prev.filter(i => i.productId !== item.productId))} className="text-gray-700 hover:text-red-400 transition-colors flex-shrink-0">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-dark-400 p-4">
            {cart.length > 0 && (
              <div className="mb-3 flex justify-between">
                <span className="text-gray-400 font-medium">Total</span>
                <span className="text-gold-400 text-2xl font-black">{formatCurrency(cartTotal)}</span>
              </div>
            )}
            <button
              onClick={() => setShowPayment(true)}
              disabled={cart.length === 0}
              className="w-full py-4 bg-gold-500 text-black font-black text-lg rounded-xl hover:bg-gold-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check size={22} />
              Finalizar Venda
            </button>
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          total={cartTotal}
          clients={clients}
          onConfirm={handleConfirm}
          onClose={() => setShowPayment(false)}
        />
      )}

      {lastSale && (
        <Receipt
          sale={lastSale}
          clients={clients}
          onClose={() => setLastSale(null)}
        />
      )}
    </div>
  );
}
