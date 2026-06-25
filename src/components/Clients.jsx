import React, { useState } from 'react';
import {
  UserPlus, Search, Phone, Mail, Edit2, Trash2, X,
  Users, ArrowLeft, ShoppingBag, Check, Clock, Wallet
} from 'lucide-react';
import { generateId, formatCurrency, formatDate, formatDateTime } from '../utils/helpers';

function ClientModal({ client, onSave, onClose }) {
  const [form, setForm] = useState(client || { name: '', phone: '', email: '' });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setErrors({ name: 'Nome obrigatório' }); return; }
    onSave({ ...form, id: form.id || generateId(), createdAt: form.createdAt || new Date().toISOString() });
  };

  const ic = 'w-full bg-dark-600 border border-dark-300 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500 text-sm transition-colors';

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-700 border border-dark-400 rounded-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-400">
          <h3 className="text-white font-bold">{client ? 'Editar Cliente' : 'Novo Cliente'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-gray-500 text-xs mb-1.5 font-medium uppercase tracking-wide">Nome *</label>
            <input className={ic} placeholder="Nome completo" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-gray-500 text-xs mb-1.5 font-medium uppercase tracking-wide">Telefone</label>
            <input className={ic} placeholder="(86) 9 9999-9999" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} type="tel" />
          </div>
          <div>
            <label className="block text-gray-500 text-xs mb-1.5 font-medium uppercase tracking-wide">E-mail</label>
            <input className={ic} placeholder="email@exemplo.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-dark-500 text-gray-400 rounded-xl hover:text-white transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 bg-gold-500 text-black font-bold rounded-xl hover:bg-gold-400 transition-colors">
              {client ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MarkPaidModal({ sale, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-700 border border-dark-400 rounded-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-400">
          <h3 className="text-white font-bold">Marcar como Pago</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-dark-600 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">Valor do fiado</p>
            <p className="text-orange-400 text-3xl font-black">{formatCurrency(sale.total)}</p>
            <p className="text-gray-500 text-xs mt-1">{formatDateTime(sale.date)}</p>
            <p className="text-gray-500 text-xs">{sale.items.length} item(s): {sale.items.map(i => i.name).join(', ')}</p>
          </div>
          <p className="text-gray-400 text-sm">Confirmar que este fiado foi quitado?</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 bg-dark-500 text-gray-400 rounded-xl hover:text-white transition-colors">Cancelar</button>
            <button onClick={onConfirm} className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2">
              <Check size={16} /> Marcar Pago
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientProfile({ client, sales, setSales, onBack }) {
  const [markingPaid, setMarkingPaid] = useState(null);

  const allClientSales = sales
    .filter(s => s.customerId === client.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const pendingSales = allClientSales.filter(s => s.status === 'pendente');
  const paidSales = allClientSales.filter(s => s.status !== 'pendente');

  const totalDebt = pendingSales.reduce((sum, s) => sum + s.total, 0);
  const totalSpent = paidSales.reduce((sum, s) => sum + s.total, 0);
  const avgTicket = paidSales.length > 0 ? totalSpent / paidSales.length : 0;

  const handleMarkPaid = (saleId) => {
    setSales(prev => prev.map(s => s.id === saleId ? { ...s, status: 'pago' } : s));
    setMarkingPaid(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft size={16} /> Voltar
        </button>
      </div>

      {/* Client header */}
      <div className="bg-dark-700 border border-dark-400 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gold-500/20 text-gold-400 flex items-center justify-center text-3xl font-black flex-shrink-0">
          {client.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white text-xl font-bold">{client.name}</h3>
          <div className="flex flex-wrap gap-3 mt-1">
            {client.phone && <span className="text-gray-500 text-sm flex items-center gap-1"><Phone size={13} />{client.phone}</span>}
            {client.email && <span className="text-gray-500 text-sm hidden sm:flex items-center gap-1"><Mail size={13} />{client.email}</span>}
          </div>
          <p className="text-gray-600 text-xs mt-1">Cliente desde {formatDate(client.createdAt)}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Fiado Pendente', value: formatCurrency(totalDebt), color: totalDebt > 0 ? 'text-orange-400' : 'text-gray-500' },
          { label: 'Fiados', value: pendingSales.length, color: pendingSales.length > 0 ? 'text-orange-400' : 'text-gray-500' },
          { label: 'Total Pago', value: formatCurrency(totalSpent), color: 'text-emerald-400' },
          { label: 'Ticket Médio', value: formatCurrency(avgTicket), color: 'text-white' },
        ].map((s, i) => (
          <div key={i} className="bg-dark-700 border border-dark-400 rounded-2xl p-4 text-center">
            <p className="text-gray-500 text-xs mb-1">{s.label}</p>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Pending fiado */}
      {pendingSales.length > 0 && (
        <div className="bg-orange-500/8 border border-orange-500/30 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-orange-500/20">
            <Clock size={15} className="text-orange-400" />
            <h4 className="text-orange-400 font-semibold text-sm">Fiado Pendente</h4>
            <span className="bg-orange-500 text-white text-xs font-black px-1.5 py-0.5 rounded-full">{pendingSales.length}</span>
            <span className="ml-auto text-orange-400 font-black">{formatCurrency(totalDebt)}</span>
          </div>
          <div>
            {pendingSales.map(sale => (
              <div key={sale.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-orange-500/10 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{sale.items.length} item(s)</p>
                  <p className="text-gray-500 text-xs mt-0.5">{formatDateTime(sale.date)}</p>
                  <p className="text-gray-600 text-xs truncate">{sale.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-orange-400 font-black">{formatCurrency(sale.total)}</p>
                  <button
                    onClick={() => setMarkingPaid(sale)}
                    className="mt-1.5 flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium border border-emerald-500/30 px-2 py-1 rounded-lg hover:bg-emerald-500/10"
                  >
                    <Check size={11} /> Marcar Pago
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Purchase history */}
      <div className="bg-dark-700 border border-dark-400 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-dark-400 flex items-center gap-2">
          <ShoppingBag size={15} className="text-gold-400" />
          <h4 className="text-white font-semibold text-sm">Histórico de Compras Pagas</h4>
        </div>
        {paidSales.length === 0 ? (
          <div className="text-center py-10">
            <ShoppingBag size={36} className="text-gray-700 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Nenhuma compra paga registrada</p>
          </div>
        ) : (
          paidSales.map(sale => (
            <div key={sale.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-dark-400 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{sale.items.length} item(s)</p>
                <p className="text-gray-500 text-xs mt-0.5">{formatDateTime(sale.date)}</p>
                <p className="text-gray-600 text-xs truncate">{sale.items.map(i => i.name).join(', ')}</p>
              </div>
              <p className="text-gold-400 font-bold flex-shrink-0">{formatCurrency(sale.total)}</p>
            </div>
          ))
        )}
      </div>

      {markingPaid && (
        <MarkPaidModal
          sale={markingPaid}
          onConfirm={() => handleMarkPaid(markingPaid.id)}
          onClose={() => setMarkingPaid(null)}
        />
      )}
    </div>
  );
}

export default function Clients({ clients, setClients, sales, setSales }) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [delConfirm, setDelConfirm] = useState(null);

  const getClientData = (clientId) => {
    const clientSales = sales.filter(s => s.customerId === clientId);
    const debt = clientSales.filter(s => s.status === 'pendente').reduce((sum, s) => sum + s.total, 0);
    const paid = clientSales.filter(s => s.status !== 'pendente').reduce((sum, s) => sum + s.total, 0);
    return { count: clientSales.length, debt, paid };
  };

  const filtered = clients
    .filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search)) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      // Sort: clients with debt first
      const da = getClientData(a.id).debt;
      const db = getClientData(b.id).debt;
      return db - da;
    });

  const handleSave = (data) => {
    if (editing) setClients(prev => prev.map(c => c.id === data.id ? data : c));
    else setClients(prev => [...prev, data]);
    setShowModal(false);
    setEditing(null);
  };

  const totalDebtAll = clients.reduce((sum, c) => sum + getClientData(c.id).debt, 0);

  if (selected) {
    const client = clients.find(c => c.id === selected);
    if (!client) { setSelected(null); return null; }
    return <ClientProfile client={client} sales={sales} setSales={setSales} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Clientes</h2>
          <p className="text-gray-500 text-sm">{clients.length} cliente(s) cadastrado(s)</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-gold-500 text-black font-bold px-4 py-2.5 rounded-xl hover:bg-gold-400 transition-colors"
        >
          <UserPlus size={18} />
          <span className="hidden sm:inline">Novo Cliente</span>
        </button>
      </div>

      {/* Total debt banner */}
      {totalDebtAll > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl px-5 py-4 flex items-center gap-3">
          <Wallet size={20} className="text-orange-400 flex-shrink-0" />
          <div>
            <p className="text-orange-400 font-bold text-lg">{formatCurrency(totalDebtAll)}</p>
            <p className="text-gray-500 text-xs">total de fiado a receber de todos os clientes</p>
          </div>
        </div>
      )}

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          className="w-full bg-dark-700 border border-dark-400 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500 text-sm"
          placeholder="Buscar por nome, telefone ou e-mail..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-dark-700 border border-dark-400 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users size={44} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">{search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}</p>
            {!search && (
              <button onClick={() => setShowModal(true)} className="mt-3 text-gold-400 text-sm hover:text-gold-300 transition-colors">
                Cadastrar primeiro cliente →
              </button>
            )}
          </div>
        ) : (
          filtered.map(client => {
            const data = getClientData(client.id);
            return (
              <div key={client.id} className={`flex items-center gap-4 px-5 py-4 border-b border-dark-400 last:border-0 transition-colors
                ${data.debt > 0 ? 'hover:bg-orange-500/5' : 'hover:bg-dark-600/30'}`}
              >
                <button
                  onClick={() => setSelected(client.id)}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-xl flex-shrink-0 transition-colors
                    ${data.debt > 0 ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' : 'bg-gold-500/15 text-gold-400 hover:bg-gold-500/25'}`}
                >
                  {client.name.charAt(0).toUpperCase()}
                </button>

                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelected(client.id)}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-medium">{client.name}</p>
                    {data.debt > 0 && (
                      <span className="text-xs bg-orange-500/15 text-orange-400 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <Clock size={10} /> Fiado
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-3 mt-0.5">
                    {client.phone && <span className="text-gray-500 text-xs flex items-center gap-1"><Phone size={10} />{client.phone}</span>}
                    {client.email && <span className="text-gray-500 text-xs hidden sm:flex items-center gap-1"><Mail size={10} />{client.email}</span>}
                  </div>
                </div>

                <div className="text-right hidden sm:block flex-shrink-0">
                  {data.debt > 0 ? (
                    <>
                      <p className="text-orange-400 text-sm font-black">{formatCurrency(data.debt)}</p>
                      <p className="text-gray-600 text-xs">a receber</p>
                    </>
                  ) : (
                    <>
                      <p className="text-emerald-400 text-sm font-bold">{formatCurrency(data.paid)}</p>
                      <p className="text-gray-600 text-xs">{data.count} compra(s)</p>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button onClick={() => { setEditing(client); setShowModal(true); }} className="p-1.5 text-gray-500 hover:text-gold-400 hover:bg-gold-400/10 rounded-lg transition-colors"><Edit2 size={15} /></button>
                  <button onClick={() => setDelConfirm(client.id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={15} /></button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <ClientModal client={editing} onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null); }} />
      )}

      {delConfirm && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-700 border border-dark-400 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-white font-bold text-lg mb-2">Excluir Cliente</h3>
            <p className="text-gray-400 text-sm mb-6">Tem certeza? O histórico de compras será mantido.</p>
            <div className="flex gap-3">
              <button onClick={() => setDelConfirm(null)} className="flex-1 py-2.5 bg-dark-500 text-gray-400 rounded-xl hover:text-white">Cancelar</button>
              <button onClick={() => { setClients(prev => prev.filter(c => c.id !== delConfirm)); setDelConfirm(null); }} className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-400">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
