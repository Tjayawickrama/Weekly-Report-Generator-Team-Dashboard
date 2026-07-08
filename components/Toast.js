'use client';

import { useState } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

let toastId = 0;
let addToastFn = null;

export function toast(message, type = 'success') {
  if (addToastFn) {
    addToastFn({ id: ++toastId, message, type });
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  addToastFn = (newToast) => {
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const icons = {
    success: <CheckCircle size={18} style={{ color: 'var(--success)' }} />,
    error: <AlertTriangle size={18} style={{ color: 'var(--error)' }} />,
    warning: <Info size={18} style={{ color: 'var(--warning)' }} />,
  };

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          {icons[t.type]}
          <span className="toast-message">{t.message}</span>
          <button className="toast-close" onClick={() => removeToast(t.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
