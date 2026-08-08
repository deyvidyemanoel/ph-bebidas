import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Plus, Search, Edit2, Trash2, ArrowUp, ArrowDown,
  AlertTriangle, Package, X, History
} from 'lucide-react';
import {
  formatCurrency, formatDateTime,
  CATEGORIES, UNITS, getCategoryLabel
} from '../utils/helpers';
import { Toast } from './Toast';

function ProductModal({ product, onSave, onClose }) {
  const [form, setForm] = useState(product || {
    name: '', category: 'cerveja', brand: '',
    costPrice: '', sellPrice: '', quantity: '', minStock: '10', unit: 'unidade',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nome obrigatório';
    if (!form.brand.trim()) e.brand = 'Marca obrigatória';
    if (isNaN(form.costPrice) || form.costPrice === '' || parseFloat(form.costPrice) < 0) e.costPrice = 'Valor inválido';
    if (isNaN(form.sellPrice) || form.sellPrice === '' || parseFloat(form.sellPrice) < 0) e.sellPrice = 'Valor inválido';
    if (isNaN(form.quantity) || form.quantity === '' || parseInt(form.quantity) < 0) e.quantity = 'Quantidade inválida';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await onSave({
        ...form,
        costPrice: parseFloat(form.costPrice),
        sellPrice: parseFloat(form.sellPrice),
        quantity: parseInt(form.quantity),
        minStock: parseInt(form.minStock) || 10,
      });
    } finally {
      setSaving(false);
    }
  };

  const ic = 'w-full bg-dark-600 border border-dark-300 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500 transition-colors text-sm';
  const lc = 'block text-gray-500 text-xs mb-1.5 font-medium uppercase tracking-wide';

  const margin = form.costPrice && form.sellPrice && parseFloat(form.sellPrice) > 0
    ? ((parseFloat(form.sellPrice) - parseFloat(form.costPrice)) / parseFloat(form.sellPrice) * 100).toFixed(1)
    : null;

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-700 border border-dark-400 rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-400 sticky top-0 bg-dark-700">
          <h3 className="text-white font-bold text-lg">{product ? 'Editar Produto' : 'Novo Produto'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={lc}>Nome do produto *</label>
              <input className={ic} placeholder="Ex: Skol 350ml Lata" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className={lc}>Categoria</label>
              <select className={ic} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className={lc}>Marca *</label>
              <input className={ic} placeholder="Ex: Skol" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
              {errors.brand && <p className="text-red-400 text-xs mt-1">{errors.brand}</p>}
            </div>
            <div>
              <label className={lc}>Preço de Custo (R$) *</label>
              <input className={ic} type="number" step="0.01" min="0" placeholder="0,00" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })} />
              {errors.costPrice && <p className="text-red-400 text-xs mt-1">{errors.costPrice}</p>}
            </div>
            <div>
              <label className={lc}>Preço de Venda (R$) *</label>
              <input className={ic} type="number" step="0.01" min="0" placeholder="0,00" value={form.sellPrice} onChange={e => setForm({ ...form, sellPrice: e.target.value })} />
              {errors.sellPrice && <p className="text-red-400 text-xs mt-1">{errors.sellPrice}</p>}
            </div>
            <div>
              <label className={lc}>Quantidade *</label>
              <input className={ic} type="number" min="0" placeholder="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
              {errors.quantity && <p className="text-red-400 text-xs mt-1">{errors.quantity}</p>}
            </div>
            <div>
              <label className={lc}>Unidade</label>
              <select className={ic} value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                {UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className={lc}>Estoque Mínimo (alerta)</label>
              <input className={ic} type="number" min="0" placeholder="10" value={form.minStock} onChange={e => setForm({ ...form, minStock: e.target.value })} />
            </div>
          </div>

          {margin !== null && (
            <div className={`rounded-xl p-3 ${parseFloat(margin) > 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              <p className={`text-sm font-medium ${parseFloat(margin) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                Margem: {margin}% &nbsp;|&nbsp; Lucro por item: {formatCurrency(parseFloat(form.sellPrice || 0) - parseFloat(form.costPrice || 0))}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={saving} className="flex-1 py-2.5 bg-dark-500 text-gray-400 rounded-xl hover:text-white transition-colors disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-gold-500 text-black font-bold rounded-xl hover:bg-gold-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {saving ? 'Salvando...' : (product ? 'Salvar' : 'Cadastrar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MovementModal({ product, type, onSave, onClose }) {
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const isOut = type === 'saida';
  const qty = parseInt(quantity);
  const invalid = isOut && qty > product.quantity;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!qty || qty <= 0 || invalid) return;
    setSaving(true);
    try {
      await onSave({ quantity: qty, reason: reason.trim() || (isOut ? 'Saída manual' : 'Entrada/Reposição') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-700 border border-dark-400 rounded-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-400">
          <h3 className={`font-bold text-lg ${isOut ? 'text-red-400' : 'text-emerald-400'}`}>
            {isOut ? 'Saída de Estoque' : 'Entrada de Estoque'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-dark-600 rounded-xl p-4">
            <p className="text-white font-semibold">{product.name}</p>
            <p className="text-gray-500 text-sm mt-1">
              Estoque atual: <span className="text-gold-400 font-bold">{product.quantity}</span> {product.unit}(s)
            </p>
          </div>
          <div>
            <label className="block text-gray-500 text-xs mb-2 font-medium uppercase tracking-wide">Quantidade *</label>
            <input
              className="w-full bg-dark-600 border border-dark-300 rounded-xl px-4 py-4 text-white text-center text-3xl font-black focus:outline-none focus:border-gold-500 transition-colors"
              type="number" min="1" max={isOut ? product.quantity : undefined}
              value={quantity} onChange={e => setQuantity(e.target.value)} autoFocus
            />
            {invalid && <p className="text-red-400 text-xs mt-1.5 text-center">Maior que o estoque disponível ({product.quantity})</p>}
          </div>
          <div>
            <label className="block text-gray-500 text-xs mb-2 font-medium uppercase tracking-wide">Motivo</label>
            <input
              className="w-full bg-dark-600 border border-dark-300 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500 text-sm"
              placeholder={isOut ? 'Ex: Ajuste de estoque' : 'Ex: Compra fornecedor'}
              value={reason} onChange={e => setReason(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={saving} className="flex-1 py-2.5 bg-dark-500 text-gray-400 rounded-xl hover:text-white disabled:opacity-50">Cancelar</button>
            <button
              type="submit"
              disabled={!qty || qty <= 0 || invalid || saving}
              className={`flex-1 py-2.5 font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                ${isOut ? 'bg-red-500 text-white hover:bg-red-400' : 'bg-emerald-500 text-white hover:bg-emerald-400'}`}
            >
              {saving ? 'Confirmando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ title = 'Excluir Produto', message = 'Tem certeza? Esta ação não pode ser desfeita.', onConfirm, onClose }) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-700 border border-dark-400 rounded-2xl p-6 max-w-sm w-full">
        <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={deleting} className="flex-1 py-2.5 bg-dark-500 text-gray-400 rounded-xl hover:text-white disabled:opacity-50">Cancelar</button>
          <button onClick={handleConfirm} disabled={deleting} className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-400 disabled:opacity-60 disabled:cursor-not-allowed">
            {deleting ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Stock({ products, movements, addProduct, updateProduct, deleteProduct, adjustStock, addMovement, deleteMovement }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [tab, setTab] = useState('produtos');
  const [showProduct, setShowProduct] = useState(false);
  const [editing, setEditing] = useState(null);
  const [movModal, setMovModal] = useState(null);
  const [delConfirm, setDelConfirm] = useState(null);
  const [delMovConfirm, setDelMovConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  const showError = (message) => setToast({ type: 'error', message });

  const isNewRoute = location.pathname === '/estoque/novo';

  // "/estoque/novo" abre o formulário de cadastro automaticamente.
  useEffect(() => {
    if (isNewRoute) { setEditing(null); setShowProduct(true); }
  }, [isNewRoute]);

  const closeProductModal = () => {
    setShowProduct(false);
    setEditing(null);
    if (isNewRoute) navigate('/estoque');
  };

  const filtered = products.filter(p => {
    const matchQ = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
    const matchC = catFilter === 'all' || p.category === catFilter;
    return matchQ && matchC;
  });

  const handleSave = async (data) => {
    try {
      if (editing) await updateProduct({ ...editing, ...data });
      else await addProduct(data);
      closeProductModal();
    } catch (err) {
      showError('Não foi possível salvar o produto: ' + err.message);
    }
  };

  const handleMovement = async (product, type, { quantity, reason }) => {
    try {
      await adjustStock(product, type, quantity);
      await addMovement({
        date: new Date().toISOString(),
        productId: product.id, productName: product.name,
        type, quantity, reason,
      });
      setMovModal(null);
    } catch (err) {
      showError('Não foi possível registrar a movimentação: ' + err.message);
    }
  };

  // NOTA: se o `reason` contiver "Fiado #...", esta movimentação está vinculada a uma
  // venda fiado pendente do cliente. Excluir aqui remove só o registro de estoque —
  // a pendência do fiado em si (tabela de vendas/cliente) não é afetada.
  const handleDeleteMovement = async (id) => {
    try {
      await deleteMovement(id);
    } catch (err) {
      showError('Não foi possível excluir a movimentação: ' + err.message);
    } finally {
      setDelMovConfirm(null);
    }
  };

  const lowCount = products.filter(p => p.quantity <= p.minStock).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Estoque</h2>
          <p className="text-gray-500 text-sm">{products.length} produto(s) cadastrado(s)</p>
        </div>
        <button
          onClick={() => navigate('/estoque/novo')}
          className="flex items-center gap-2 bg-gold-500 text-black font-bold px-4 py-2.5 rounded-xl hover:bg-gold-400 transition-colors"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Novo Produto</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-700 border border-dark-400 rounded-xl p-1 w-fit">
        {[
          { id: 'produtos', label: 'Produtos' },
          { id: 'historico', label: 'Histórico' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${tab === t.id ? 'bg-gold-500 text-black' : 'text-gray-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'produtos' ? (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                className="w-full bg-dark-700 border border-dark-400 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500 text-sm"
                placeholder="Buscar produto ou marca..."
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="bg-dark-700 border border-dark-400 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-gold-500 text-sm"
              value={catFilter} onChange={e => setCatFilter(e.target.value)}
            >
              <option value="all">Todas as categorias</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {lowCount > 0 && (
            <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
              <AlertTriangle size={15} className="text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">
                <strong>{lowCount}</strong> produto(s) com estoque baixo ou zerado
              </p>
            </div>
          )}

          <div className="bg-dark-700 border border-dark-400 rounded-2xl overflow-hidden">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Package size={44} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum produto encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-400">
                      {['Produto', 'Categoria', 'Custo', 'Venda', 'Margem', 'Qtd', 'Ações'].map((h, i) => (
                        <th key={h} className={`text-gray-600 text-xs px-4 py-3 font-medium uppercase tracking-wide
                          ${i < 2 ? 'text-left' : i >= 5 ? 'text-center' : 'text-right'}
                          ${i === 1 || i === 4 ? 'hidden md:table-cell' : ''}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => {
                      const isLow = p.quantity <= p.minStock;
                      const margin = p.sellPrice > 0 ? ((p.sellPrice - p.costPrice) / p.sellPrice * 100).toFixed(0) : 0;
                      return (
                        <tr key={p.id} className="border-b border-dark-400 last:border-0 hover:bg-dark-600/40 transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-white font-medium text-sm">{p.name}</p>
                            <p className="text-gray-600 text-xs">{p.brand} · {p.unit}</p>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-xs bg-dark-500 text-gray-400 px-2 py-1 rounded-lg">{getCategoryLabel(p.category)}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-400 text-sm">{formatCurrency(p.costPrice)}</td>
                          <td className="px-4 py-3 text-right text-emerald-400 text-sm font-medium">{formatCurrency(p.sellPrice)}</td>
                          <td className="px-4 py-3 text-right text-gray-400 text-sm hidden md:table-cell">{margin}%</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${isLow ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                              {p.quantity}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-0.5">
                              <button onClick={() => setMovModal({ product: p, type: 'entrada' })} title="Entrada" className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-colors"><ArrowUp size={14} /></button>
                              <button onClick={() => setMovModal({ product: p, type: 'saida' })} title="Saída" className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"><ArrowDown size={14} /></button>
                              <button onClick={() => { setEditing(p); setShowProduct(true); }} title="Editar" className="p-1.5 rounded-lg text-gray-500 hover:text-gold-400 hover:bg-gold-400/10 transition-colors"><Edit2 size={14} /></button>
                              <button onClick={() => setDelConfirm(p.id)} title="Excluir" className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-dark-700 border border-dark-400 rounded-2xl overflow-hidden">
          {movements.length === 0 ? (
            <div className="text-center py-16">
              <History size={44} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">Nenhuma movimentação registrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-400">
                    {['Data/Hora', 'Produto', 'Tipo', 'Qtd', 'Motivo', 'Ações'].map((h, i) => (
                      <th key={h} className={`text-gray-600 text-xs px-4 py-3 font-medium uppercase tracking-wide
                        ${i < 2 ? 'text-left' : i === 2 || i === 3 || i === 5 ? 'text-center' : 'text-left'}
                        ${i === 4 ? 'hidden md:table-cell' : ''}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...movements].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 100).map(m => (
                    <tr key={m.id} className="border-b border-dark-400 last:border-0 hover:bg-dark-600/40">
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDateTime(m.date)}</td>
                      <td className="px-4 py-3 text-white text-sm">{m.productName}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold
                          ${m.type === 'entrada' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                          {m.type === 'entrada' ? '▲ Entrada' : '▼ Saída'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-white font-bold">{m.quantity}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm hidden md:table-cell">{m.reason}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => setDelMovConfirm(m.id)} title="Excluir" className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showProduct && <ProductModal product={editing} onSave={handleSave} onClose={closeProductModal} />}
      {movModal && <MovementModal product={movModal.product} type={movModal.type} onSave={d => handleMovement(movModal.product, movModal.type, d)} onClose={() => setMovModal(null)} />}
      {delConfirm && (
        <DeleteModal
          onConfirm={async () => {
            try {
              await deleteProduct(delConfirm);
            } catch (err) {
              showError('Não foi possível excluir o produto: ' + err.message);
            } finally {
              setDelConfirm(null);
            }
          }}
          onClose={() => setDelConfirm(null)}
        />
      )}
      {delMovConfirm && (
        <DeleteModal
          title="Excluir Movimentação"
          message="Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita."
          onConfirm={() => handleDeleteMovement(delMovConfirm)}
          onClose={() => setDelMovConfirm(null)}
        />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
