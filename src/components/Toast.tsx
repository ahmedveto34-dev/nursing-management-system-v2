import React, { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

export const Toast = () => {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleToast = (e: any) => {
      setMessage(e.detail);
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    };
    window.addEventListener('show-toast', handleToast);
    return () => window.removeEventListener('show-toast', handleToast);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-4 rounded-lg shadow-lg flex items-start space-x-3 space-x-reverse max-w-sm">
        <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 text-sm font-medium leading-relaxed">
          {message}
        </div>
        <button onClick={() => setVisible(false)} className="text-emerald-500 hover:text-emerald-700">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const showToast = (msg: string) => {
  window.dispatchEvent(new CustomEvent('show-toast', { detail: msg }));
};
