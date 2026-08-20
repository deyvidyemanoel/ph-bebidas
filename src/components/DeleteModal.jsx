import React, { useState } from 'react';

export function DeleteModal({ title = 'Excluir Produto', message = 'Tem certeza? Esta ação não pode ser desfeita.', onConfirm, onClose }) {
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
