import React, { useState } from 'react';
import { Trash2, AlertTriangle, ShieldAlert, Package, ShoppingBag, Users, X, Check } from 'lucide-react';
import { INITIAL_PRODUCTS } from '../utils/helpers';

function ConfirmModal({ title, description, warning, onConfirm, onClose }) {
  const [typed, setTyped] = useState('');
  const required = 'CONFIRMAR';

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-700 border border-red-500/40 rounded-2xl w-full max-w-md">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-dark-400">
          <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
            <ShieldAlert size={18} className="text-red-400" />
          </div>
          <h3 className="text-white font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="ml-auto text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-gray-300 text-sm leading-relaxed">{description}</p>

          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex gap-2">
              <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{warning}</p>
            </div>
          </div>

          <div>
            <label className="block text-gray-500 text-xs font-medium uppercase tracking-wide mb-2">
              Digite <span className="text-red-400 font-bold">{required}</span> para continuar
            </label>
            <input
              className="w-full bg-dark-600 border border-dark-300 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 text-sm font-mono tracking-widest transition-colors"
              placeholder={required}
              value={typed}
              onChange={e => setTyped(e.target.value.toUpperCase())}
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-dark-500 text-gray-400 rounded-xl hover:text-white transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={typed !== required}
              className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              Apagar Tudo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuccessToast({ message, onClose }) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-medium">
      <Check size={16} />
      {message}
    </div>
  );
}

export default function Settings({ products, sales, clients, movements, onReset }) {
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => setToast(msg);

  const actions = [
    {
      id: 'all',
      icon: Trash2,
      label: 'Limpar todos os dados',
      description: 'Remove vendas, clientes, movimentações e restaura o estoque para os produtos padrão.',
      buttonLabel: 'Limpar todos os dados',
      danger: true,
      modal: {
        title: 'Limpar todos os dados',
        description: 'Esta ação irá apagar permanentemente todas as vendas, clientes, histórico de movimentações e redefinir o estoque para os produtos padrão do sistema.',
        warning: 'Esta operação é irreversível. Todos os dados do sistema serão perdidos.',
      },
      onConfirm: () => {
        onReset('all');
        setModal(null);
        showToast('Todos os dados foram apagados.');
      },
    },
    {
      id: 'sales',
      icon: ShoppingBag,
      label: 'Limpar vendas',
      description: 'Remove todas as vendas registradas. O estoque e os clientes são mantidos.',
      buttonLabel: 'Limpar vendas',
      danger: false,
      modal: {
        title: 'Limpar todas as vendas',
        description: 'Todas as vendas e o histórico financeiro serão apagados. O estoque e os clientes cadastrados não serão afetados.',
        warning: 'Esta operação é irreversível.',
      },
      onConfirm: () => {
        onReset('sales');
        setModal(null);
        showToast('Vendas apagadas com sucesso.');
      },
    },
    {
      id: 'stock',
      icon: Package,
      label: 'Resetar estoque',
      description: 'Restaura os produtos para o catálogo padrão e zera o histórico de movimentações.',
      buttonLabel: 'Resetar estoque',
      danger: false,
      modal: {
        title: 'Resetar estoque',
        description: 'Os produtos serão redefinidos para o catálogo padrão e todo o histórico de movimentações será apagado. Vendas e clientes não são afetados.',
        warning: 'Produtos personalizados e movimentações serão perdidos.',
      },
      onConfirm: () => {
        onReset('stock');
        setModal(null);
        showToast('Estoque restaurado ao padrão.');
      },
    },
    {
      id: 'clients',
      icon: Users,
      label: 'Limpar clientes',
      description: 'Remove todos os clientes cadastrados. As vendas vinculadas a eles são mantidas.',
      buttonLabel: 'Limpar clientes',
      danger: false,
      modal: {
        title: 'Limpar todos os clientes',
        description: 'Todos os clientes cadastrados serão removidos. As vendas associadas a eles continuarão existindo, mas sem vínculo com um cliente.',
        warning: 'Esta operação é irreversível.',
      },
      onConfirm: () => {
        onReset('clients');
        setModal(null);
        showToast('Clientes apagados com sucesso.');
      },
    },
  ];

  const activeAction = actions.find(a => a.id === modal);

  const stats = [
    { label: 'Produtos', value: products.length, icon: Package, color: 'text-blue-400' },
    { label: 'Vendas', value: sales.length, icon: ShoppingBag, color: 'text-gold-400' },
    { label: 'Clientes', value: clients.length, icon: Users, color: 'text-purple-400' },
    { label: 'Movimentações', value: movements.length, icon: Trash2, color: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Configurações</h2>
        <p className="text-gray-500 text-sm mt-0.5">Gerenciamento e manutenção do sistema</p>
      </div>

      {/* Current data summary */}
      <div className="bg-dark-700 border border-dark-400 rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Dados armazenados</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <div key={i} className="bg-dark-600 rounded-xl p-3 text-center">
              <s.icon size={18} className={`${s.color} mx-auto mb-1.5`} />
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-gray-600 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="text-gray-600 text-xs mt-3 text-center">
          Dados salvos no armazenamento local do navegador (localStorage)
        </p>
      </div>

      {/* Danger zone */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={15} className="text-red-400" />
          <h3 className="text-red-400 font-semibold text-sm uppercase tracking-wide">Zona de Perigo</h3>
        </div>

        {/* Main clear all button */}
        <div className="bg-red-500/8 border border-red-500/30 rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <div>
                <p className="text-white font-semibold">Limpar todos os dados</p>
                <p className="text-gray-500 text-sm mt-0.5">
                  Remove vendas, clientes, movimentações e restaura o estoque para os produtos padrão.
                </p>
              </div>
            </div>
            <button
              onClick={() => setModal('all')}
              className="flex-shrink-0 flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Trash2 size={15} />
              <span className="hidden sm:inline">Limpar tudo</span>
              <span className="sm:hidden">Limpar</span>
            </button>
          </div>
        </div>

        {/* Individual actions */}
        <div className="bg-dark-700 border border-dark-400 rounded-2xl overflow-hidden">
          {actions.slice(1).map((action, i) => (
            <div
              key={action.id}
              className={`flex items-center justify-between gap-4 px-5 py-4 ${i < actions.length - 2 ? 'border-b border-dark-400' : ''}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <action.icon size={17} className="text-gray-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium">{action.label}</p>
                  <p className="text-gray-600 text-xs mt-0.5 leading-relaxed">{action.description}</p>
                </div>
              </div>
              <button
                onClick={() => setModal(action.id)}
                className="flex-shrink-0 px-3 py-2 border border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-xl text-xs font-medium transition-colors whitespace-nowrap"
              >
                {action.buttonLabel}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-dark-700 border border-dark-400 rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-3">Sobre o sistema</h3>
        <div className="space-y-1.5 text-sm text-gray-500">
          <p>Sistema de Gestão <span className="text-gold-400 font-medium">PH Bebidas</span></p>
          <p>Versão 1.0.0</p>
          <p>São Miguel do Tapuio — PI</p>
          <p className="text-gray-600 text-xs mt-2">
            Os dados são salvos localmente no seu navegador. Para backup, exporte os dados antes de limpar.
          </p>
        </div>
      </div>

      {activeAction && (
        <ConfirmModal
          {...activeAction.modal}
          onConfirm={activeAction.onConfirm}
          onClose={() => setModal(null)}
        />
      )}

      {toast && <SuccessToast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
