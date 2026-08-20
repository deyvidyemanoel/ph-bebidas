import React, { useState } from 'react';
import { X, Check, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { formatCurrency, formatDateTime, PAYMENT_METHODS } from '../utils/helpers';

const payIcons = { dinheiro: Banknote, pix: Smartphone, credito: CreditCard, debito: CreditCard };
const settleMethods = PAYMENT_METHODS.filter(m => m.value !== 'fiado');

export function MarkPaidModal({ sale, onConfirm, onClose }) {
  const [method, setMethod] = useState('dinheiro');
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await onConfirm(method);
    } finally {
      setSaving(false);
    }
  };

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

          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-2">Forma de Recebimento</p>
            <div className="grid grid-cols-2 gap-2">
              {settleMethods.map(({ value, label }) => {
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

          <div className="flex gap-3">
            <button onClick={onClose} disabled={saving} className="flex-1 py-2.5 bg-dark-500 text-gray-400 rounded-xl hover:text-white transition-colors disabled:opacity-50">Cancelar</button>
            <button onClick={handleConfirm} disabled={saving} className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              <Check size={16} /> {saving ? 'Confirmando...' : 'Marcar Pago'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
