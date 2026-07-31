import React, { useEffect } from 'react';
import { Check, AlertTriangle } from 'lucide-react';

export function SuccessToast({ message, onClose }) {
  useEffect(() => {
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

export function ErrorToast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-medium">
      <AlertTriangle size={16} />
      {message}
    </div>
  );
}

export function Toast({ toast, onClose }) {
  if (!toast) return null;
  return toast.type === 'error'
    ? <ErrorToast message={toast.message} onClose={onClose} />
    : <SuccessToast message={toast.message} onClose={onClose} />;
}
